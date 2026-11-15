import Anthropic from "@anthropic-ai/sdk";
import { experiments, findings, saffireRuns, luciRuns,sources } from "@/lib/data";
import { ANSWER_SCHEMA, buildEvidence, checkAnswer, checkedSummary, isRawAnswer, SYSTEM_PROMPT, userMessage } from "@/lib/ask-core";
import investigationJson from "@/data/investigations.json";
import {type Investigation,type ResearchGoal,investigationEvidence,researchInput} from "@/lib/research";
import {investigationCorpus} from "@/lib/investigation-summary";
import {localChat,localChatModel,localModels} from "@/lib/local-ai";
import {psiEvidence} from "@/lib/psi-evidence";

export const maxDuration=180;

const MAX_QUESTION = 400;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = Number(process.env.ASK_RATE_LIMIT ?? 8); // raised only for security scans
const CACHE_MS = 6 * 60 * 60_000;
const CACHE_MAX = 200;

// ponytail: per-instance memory, resets on cold start; use a shared store (KV) if abuse appears.
const hits = new Map<string, number[]>();
// Same question, same evidence, same answer: a short cache keeps a busy demo inside its API quota.
const answers = new Map<string, { at: number; body: Record<string, unknown> }>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

type Synthesis = { ok: true; parsed: unknown; provider: string } | { ok: false; reason: string };

/** OpenAI Chat Completions with a strict JSON schema. Model is configurable; the default is a small, fast model. */
async function viaOpenAI(user: string): Promise<Synthesis> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: user },
      ],
      response_format: { type: "json_schema", json_schema: { name: "evidence_answer", strict: true, schema: ANSWER_SCHEMA } },
      max_completion_tokens: 4000,
    }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) {
    console.error("ask: openai", res.status);
    return { ok: false, reason: res.status === 429 ? "The AI service is busy." : res.status === 401 ? "The AI service key is not valid." : `The AI service returned an error (${res.status}).` };
  }
  const data = await res.json();
  const choice = data?.choices?.[0];
  if (choice?.message?.refusal) return { ok: false, reason: "The model declined this question." };
  try {
    return { ok: true, parsed: JSON.parse(choice?.message?.content ?? ""), provider: "openai" };
  } catch {
    return { ok: false, reason: "The AI answer could not be read." };
  }
}

async function viaAnthropic(user: string): Promise<Synthesis> {
  const client = new Anthropic({ timeout: 45_000, maxRetries: 1 });
  const response = await client.beta.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5",
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: { type: "json_schema", schema: ANSWER_SCHEMA } },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: user }],
  });
  if (response.stop_reason === "refusal") return { ok: false, reason: "The model declined this question." };
  const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
  try {
    return { ok: true, parsed: JSON.parse(text), provider: "anthropic" };
  } catch {
    return { ok: false, reason: "The AI answer could not be read." };
  }
}

async function viaLocal(user:string):Promise<Synthesis>{
 try{return {ok:true,...await localChat(`${SYSTEM_PROMPT}\nReturn at most four short claims. For OBSERVED, copy a complete source quotation verbatim rather than paraphrasing it. Use DERIVED only for an actual comparison/count/arithmetic from cited items; use INTERPRETATION for qualitative explanations. Copy numerical values, qualifiers (such as almost) and statistic names exactly. AMD/arithmetic mean must never become median; mass fraction must never become particle-count fraction. Keep campaign names exactly as annotated: original BASS is not BASS-II, and original SAME is not SAME-R. Name the test when a conclusion rests on a single test; do not generalize a record to all flames. State missing data as 'not imported in this corpus', never as absent from NASA or the entire source. When evidence is an objective, use INTERPRETATION or DATA_GAP. Never treat an investigation overview as a measured outcome. Do not repeat claim-type labels inside the text field.`,user,ANSWER_SCHEMA)};}
 catch{return {ok:false,reason:"The local AI model did not finish a valid response. Check the AI status page and try a shorter question."};}
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(ip)) return json({ error: "Too many questions. Wait a minute and try again." }, 429);

  // Cross-site HTML forms cannot send application/json without a CORS preflight, so this blocks CSRF-style posts.
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
    return json({ error: "Send the question as application/json." }, 415);

  let question: unknown;
  let research = false;
  let goal:ResearchGoal="prevention";
  let researchScenario:Record<string,unknown>={};
  let selectedStudy:Investigation|undefined;
  let evidenceOnly=false;
  try {
    const body = await request.json();
    question = body?.question;
    evidenceOnly=body?.evidenceOnly===true;
    research = body?.research === true;
    if(body?.investigationId!==undefined){
      if(typeof body.investigationId!=="string")return json({error:"Invalid investigation ID."},400);
      selectedStudy=(investigationJson as Investigation[]).find(s=>s.id===body.investigationId);
      if(!selectedStudy)return json({error:"Investigation not found."},404);
      research=true;
    }
    if(research){
      const input=researchInput({...body.input,goal:body.goal});
      goal=input.goal;
      researchScenario=input as unknown as Record<string,unknown>;
    }
  } catch {
    return json({ error: "Send JSON like {\"question\": \"...\"}." }, 400);
  }
  if (typeof question !== "string" || question.trim().length < 3 || question.length > MAX_QUESTION)
    return json({ error: `Ask a question between 3 and ${MAX_QUESTION} characters.` }, 400);

  const q = research ? [question.trim().slice(0,240),goal,
    researchScenario.material,researchScenario.gravity,
    researchScenario.oxygen!=null?`${researchScenario.oxygen} % oxygen`:"",
    researchScenario.pressureKpa!=null?`${researchScenario.pressureKpa} kPa`:"",
    researchScenario.flow!=null?`${researchScenario.flow} cm/s`:""].filter(Boolean).join("; ").slice(0,600) : question.trim();
  const corpus=selectedStudy?investigationCorpus(selectedStudy,experiments,findings,saffireRuns,luciRuns):{experiments,findings,saffireRuns,luciRuns};
  let packet:ReturnType<typeof buildEvidence>;
  try{packet=buildEvidence(q, corpus.experiments, corpus.findings, corpus.saffireRuns, corpus.luciRuns,{investigationSummary:!!selectedStudy});}
  catch(error){return json({error:error instanceof Error?error.message:"Invalid research conditions."},400);}
  const {items,outside}=packet;
  if(research)items.push(...psiEvidence(q,selectedStudy?.id));
  for(const item of items){if(item.key.startsWith("F:")){const finding=findings.find(f=>f.id===item.key.slice(2)),source=sources.find(s=>s.source_id===finding?.source_id);if(source)item.href=finding?.pdf_page&&source.pdf_url?`${source.pdf_url}#page=${finding.pdf_page}`:source.url;}}
  if(research){
    items.push(...investigationEvidence(selectedStudy?[selectedStudy]:investigationJson as Investigation[],selectedStudy?`${selectedStudy.name}; ${q}`:q,selectedStudy?.goals[0]??goal));
    outside.push("Investigation overviews describe objectives and scope only. They are not measured test results or detector-performance data.");
    if(selectedStudy)outside.push(`Summarize only ${selectedStudy.name}. Retrieved items are a bounded subset, not the entire investigation. ${selectedStudy.scopeNotes?.join(" ")??""}`);
  }
  const base = { evidence: items, outside };

  if (items.length === 0)
    return json({ ...base, mode: "evidence-only", reason: "No test or finding in the atlas matches this question." });
  if(evidenceOnly)return json({...base,mode:"evidence-only",reason:"Retrieved source evidence only. No AI provider was called."});
  let localReady=false;
  if(!process.env.OPENAI_API_KEY&&!process.env.ANTHROPIC_API_KEY){try{localReady=(await localModels()).some(m=>m.name===localChatModel());}catch{/* availability is disclosed below */}}
  const provider = process.env.OPENAI_API_KEY ? viaOpenAI : process.env.ANTHROPIC_API_KEY ? viaAnthropic : localReady?viaLocal:null;
  if (!provider)
    return json({ ...base, mode: "evidence-only", aiStatus: "not-configured", reason: "No AI provider or running local model is available. Source retrieval still works. Start the local AI engine with the project runner, or configure a hosted provider for an online deployment." });

  const cacheKey = `${research?"research":"ask"}:${selectedStudy?.id??"all"}:${goal}:` + q.toLowerCase().replace(/\s+/g, " ");
  const cached = answers.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_MS) return json({ ...cached.body, cached: true });

  try {
    const localItems=[...items.filter(i=>i.key.startsWith("I:")).slice(0,2),...items.filter(i=>!i.key.startsWith("I:"))].slice(0,10);
    const out = await provider(userMessage(q,localReady?localItems:items,outside));
    if (!out.ok) return json({ ...base, mode: "evidence-only", reason: `${out.reason} The matching evidence is below.` });
    if (!isRawAnswer(out.parsed))
      return json({ ...base, mode: "evidence-only", reason: "The AI answer could not be read. The matching evidence is below." });
    const claims = checkAnswer(out.parsed, items, q);
    const body = { ...base, mode: "ai", provider: out.provider, summary: checkedSummary(claims), claims };
    if (answers.size >= CACHE_MAX) answers.delete(answers.keys().next().value!);
    answers.set(cacheKey, { at: Date.now(), body });
    return json(body);
  } catch (error) {
    const reason =
      error instanceof Anthropic.RateLimitError
        ? "The AI service is busy."
        : error instanceof Anthropic.AuthenticationError
          ? "The AI service key is not valid."
          : error instanceof Anthropic.APIConnectionError || (error instanceof Error && error.name === "TimeoutError")
            ? "The AI service could not be reached."
            : error instanceof Anthropic.APIError
              ? `The AI service returned an error (${error.status}).`
              : "The AI answer failed.";
    console.error("ask: model call failed", error instanceof Anthropic.APIError ? error.status : error);
    return json({ ...base, mode: "evidence-only", reason: `${reason} The matching evidence is below.` });
  }
}
