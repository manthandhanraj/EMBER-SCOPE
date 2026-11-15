import type {Investigation} from "./research.ts";
import type {EvidenceRecord} from "./ontology.ts";
import {SOURCE_FAMILY} from "./ontology.ts";
import type {Experiment,Finding,Source,SaffireRun,LuciRun} from "./types.ts";

export const SUMMARY_FIELDS=[
 ["objective","Research objective"],["fuels","Fuels and materials"],["geometry","Geometry and scale"],
 ["hardware","Experimental hardware"],["measurements","Measurements and sensors"],["variables","Controlled / studied variables"],
 ["gravity","Gravity regime"],["limitation","Transfer limitations"],
] as const;
const safeUrl=(value:string)=>{try{return new URL(value).protocol==="https:";}catch{return false;}};
const unique=(values:string[])=>[...new Set(values)].sort();
const planningStatement=(quote:string)=>/\b(planned to launch|planned for launch|proposed experiment|planned experiment)\b/i.test(quote);
/** Restrict optional AI retrieval to this investigation; parent-program statements remain context. */
export function investigationCorpus(study:Investigation,experiments:Experiment[],findings:Finding[],saffireRuns:SaffireRun[],luciRuns:LuciRun[]){
 return {experiments:study.familyIds.includes("bass2")?experiments:[],
  saffireRuns:study.familyIds.includes("saffire")?saffireRuns:[],luciRuns:study.familyIds.includes("luci")?luciRuns:[],
  findings:findings.filter(f=>study.familyIds.includes(SOURCE_FAMILY[f.source_id]??"context")).map(f=>({...f,kind:study.findingScope==="related-program"||planningStatement(f.quote)?"context" as const:f.kind}))};
}
export function summarizeInvestigation(study:Investigation,records:EvidenceRecord[],findings:Finding[],sources:Source[]){
 const rows=records.filter(r=>study.familyIds.includes(r.family));
 const linked=findings.filter(f=>study.familyIds.includes(SOURCE_FAMILY[f.source_id]??"context"));
 const parentOnly=study.findingScope==="related-program";
 const overview={id:`overview:${study.id}`,title:study.sourceLabel,url:study.source,kind:study.sourceId?"primary publication":"investigation overview"};
 const references=[overview,...sources.filter(s=>study.familyIds.includes(SOURCE_FAMILY[s.source_id]??"context")).map(s=>({id:s.source_id,title:s.title,url:s.url,kind:"publication"}))].filter((r,i,all)=>all.findIndex(x=>x.url===r.url)===i);
 const fields=SUMMARY_FIELDS.map(([key,label])=>{
  const value=key==="variables"?study.variables.join(", "):study[key];
  const citations=study.fieldReferences?.[key]??[{url:study.source,label:study.sourceLabel,locator:"Investigation overview; source-specific details require review"}];
  return {key,label,value,available:typeof value==="string"&&value.trim().length>0,citations};
 });
 const extracts=linked.map(f=>{
  const source=sources.find(s=>s.source_id===f.source_id);
  const planning=planningStatement(f.quote);
  return {...f,originalKind:f.kind,kind:planning?"context" as const:f.kind,
   classificationNote:planning?"Historical planning statement in the cited publication; this is not a measured result or a current mission-status check.":null,
   scope:parentOnly?"related parent-program context":"investigation-group publication",
   sourceTitle:source?.title??f.source_id,
   sourceUrl:source?.url??null,
   href:source?(f.in==="pdf"&&f.pdf_page&&source.pdf_url?`${source.pdf_url}#page=${f.pdf_page}`:source.url):null};
 });
 const observed=extracts.filter(f=>f.kind==="observed"&&!parentOnly);
 const interpretations=extracts.filter(f=>f.kind==="interpretation"&&!parentOnly);
 const context=extracts.filter(f=>f.kind==="context"||parentOnly);
 function range(key:"oxygen"|"pressureKpa"|"flowCmS",label:string,unit:string,basis:string){
  const eligible=rows.filter(r=>key==="pressureKpa"?r.pressureKpa?.every(Number.isFinite):typeof r[key]==="number"&&Number.isFinite(r[key]));
  const values=eligible.flatMap(r=>key==="pressureKpa"?r.pressureKpa!:[r[key]!]);
  return {key,label,unit,basis,known:eligible.length,missing:rows.length-eligible.length,
   min:values.length?Math.min(...values):null,max:values.length?Math.max(...values):null,
   recordIds:eligible.map(r=>r.id)};
 }
 const conditions=[range("oxygen","Oxygen","vol %","Initial / condition value represented in each curated record; changing burn histories are not represented by this span."),
  range("pressureKpa","Pressure","kPa","Curated record values and source-assigned intervals, not a continuous tested envelope or a sensor uncertainty interval."),
  range("flowCmS","Airflow","cm/s","Initial / reported airflow values; flow direction and changing flow histories must be checked per test.")];
 const missing=[...fields.filter(f=>!f.available).map(f=>`${f.label} is not curated.`),
  ...(!rows.length?["No individual test rows are curated for this investigation; no numerical condition envelope or outcome counts are inferred from its objectives."]:[]),
  ...(!observed.length?["No investigation-specific measured-result quotation is available in the selected corpus."]:[]),
  ...conditions.filter(c=>c.missing>0).map(c=>`${c.label} is unknown for ${c.missing} of ${rows.length} curated rows.`),
  ...(parentOnly?["Linked publication findings concern the parent program and are not treated as this investigation's measured results."]:[]),
  "Complete sensor calibration, uncertainty and time histories are not encoded by this summary; consult original reports.",
  "Independent expert/source-transcription review has not been completed for this generated brief."];
 const reviewIssues=[...fields.filter(f=>!f.available).map(f=>`Missing metadata: ${f.key}`),
  ...references.filter(r=>!safeUrl(r.url)).map(r=>`Invalid source URL: ${r.id}`),
  ...fields.flatMap(f=>f.citations.filter(c=>!safeUrl(c.url)).map(()=>`Invalid field citation: ${f.key}`)),
  ...extracts.filter(f=>!f.href).map(f=>`Missing publication source: ${f.source_id}`)];
 const concise=[study.summary,`${rows.length} curated test records; ${observed.length} investigation-group reported observations, ${interpretations.length} authors' interpretations and ${context.length} background / related-program findings.`,
  study.interpretation,study.limitation];
 return {schemaVersion:"emberscope-investigation-summary-1",id:study.id,name:study.name,study,
  concise,fields,references,findings:{observed,interpretations,context},conditions,
  testCoverage:{total:rows.length,materials:unique(rows.map(r=>r.material)),geometries:unique(rows.map(r=>r.geometry)),
   gravity:unique(rows.map(r=>r.gravity)),outcomes:unique(rows.map(r=>r.outcome)).map(outcome=>({outcome,count:rows.filter(r=>r.outcome===outcome).length})),
   records:rows.map(r=>{const source=sources.find(s=>s.source_id===r.cite?.source_id);return {...r,sourceHref:source?(r.cite?.pdf_page&&source.pdf_url?`${source.pdf_url}#page=${r.cite.pdf_page}`:source.url):null};})},missing,scopeNotes:study.scopeNotes??[],reviewIssues,
  status:{summaryAvailable:reviewIssues.length===0,evidence:rows.length?"test records and linked publications":observed.length?"publication findings without test rows":"overview / context only",expertReviewed:false},
  scope:"Summary of this project's curated investigation group, not the complete NASA PSI archive. Numerical spans summarize available rows only; they are not tested-safe ranges, continuous envelopes or fire-risk estimates.",
  method:"Overview text and labelled project interpretation are combined with exact publication excerpts and deterministic counts/ranges from linked records. No AI provider call is required."};
}
export type InvestigationSummary=ReturnType<typeof summarizeInvestigation>;

export function investigationMarkdown(summary:InvestigationSummary,mode:"concise"|"detailed"="detailed"){
 const s=summary;
 const lines=[`# ${s.name} — investigation brief`,"",s.scope,"","## At a glance",...s.concise.map((p,i)=>`${["Overview","Available evidence","Project interpretation","Transfer limit"][i]}: ${p}`)];
 if(mode==="detailed"){
  lines.push("","## Investigation design");
  for(const field of s.fields){lines.push(`### ${field.label}`,field.available?field.value:"Not curated",...field.citations.map(c=>`Source: ${c.url} — ${c.label}; ${c.locator}`),"");}
  lines.push("## Curated test-condition coverage",`${s.testCoverage.total} rows. These are available record spans, not complete experimental envelopes.`);
  for(const c of s.conditions)lines.push(`- ${c.label}: ${c.known?`${c.min}–${c.max} ${c.unit}`:"Not curated"}; ${c.known} known, ${c.missing} unknown. ${c.basis}`);
  for(const [key,label] of [["observed","Reported observations"],["interpretations","Authors' interpretations"],["context","Background / related-program context"]] as const){
   lines.push("",`## ${label}`);
   if(!s.findings[key].length)lines.push("None curated for this evidence category.");
   for(const f of s.findings[key])lines.push(`- ${f.quote}`,`  Source: ${f.href??"Source missing — requires review"}; ${f.in==="pdf"?`PDF page ${f.pdf_page??"not curated"}`:"abstract"}; ${f.scope}`, ...(f.classificationNote?[`  Context note: ${f.classificationNote}`]:[]));
  }
  lines.push("","## Linked test records",...s.testCoverage.records.map(r=>`- ${r.id}: ${r.material}; ${r.geometry}; ${r.outcomeLabel}. ${r.caveat??""} Source ${r.cite?.source_id??"not curated"}, PDF page ${r.cite?.pdf_page??"not curated"}.`));
 }
 lines.push("","## Source-scope notes",...(s.scopeNotes.length?s.scopeNotes:["Keep investigation-group membership distinct from individual campaign/test conditions."]).map(x=>`- ${x}`),"","## Missing data and review",...s.missing.map(x=>`- ${x}`),"","## Original references",...s.references.map(r=>`- ${r.title}: ${r.url}`),"","Independent expert review: pending.",`Summary method: ${s.method}`);
 return lines.join("\n\n");
}
