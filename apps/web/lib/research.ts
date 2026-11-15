import type { Finding, Source } from "./types.ts";
import type { EvidenceRecord, MissionQuestion } from "./ontology.ts";
import { ladder, SOURCE_FAMILY,TOLERANCE } from "./ontology.ts";
import { parseQuestion, type EvidenceItem } from "./ask-core.ts";
import { rankFindings, fireInsight } from "./finding-relevance.ts";
import {habitatContext,habitatPreference} from "./habitat-context.ts";
import type {SemanticResult} from "./local-ai.ts";

export type ResearchGoal = "prevention" | "detection" | "suppression";
export type Investigation = {
  id:string;name:string;phase:string;goals:ResearchGoal[];objective:string;fuels:string;geometry:string;
  hardware:string;measurements:string;variables:string[];gravity:string;familyIds:string[];summary:string;
  limitation:string;interpretation:string;source:string;sourceLabel:string;sourceId:string|null;evidenceLevel:string;checked:string;
  findingScope?:"investigation-group"|"related-program";
  scopeNotes?:string[];
  fieldReferences?:Record<string,{url:string;label:string;locator:string}[]>;
};
export type ResearchInput = {question:string;goal:ResearchGoal;environment:string;material?:string;gravity?:string;oxygen?:number;pressureKpa?:number;flow?:number};
export const GOAL_TOPICS:Record<ResearchGoal,string[]> = {
  prevention:["materials-screening","oxygen","airflow","geometry"],
  detection:["detection","smoke"],
  suppression:["suppression","quench","blowoff"],
};
const STOP=new Set(["what","which","that","with","from","have","does","this","about","research","studies","study","fire","safety","evidence","relevant","space","for","the","and"]);
const words=(text:string)=>new Set((text.toLowerCase().match(/[a-z]{3,}/g)??[]).filter(w=>!STOP.has(w)));

export function researchInput(raw:Record<string,unknown>):ResearchInput {
  const question=String(raw.question??raw.q??"").trim().slice(0,400);
  parseQuestion(question); // Reject invalid numeric conditions before rendering or invoking an AI model.
  const goal=["prevention","detection","suppression"].includes(String(raw.goal))?raw.goal as ResearchGoal:"prevention";
  const environment=["spacecraft","station","lunar-habitat","martian-habitat","rover"].includes(String(raw.environment))?String(raw.environment):"spacecraft";
  const input:ResearchInput={question,goal,environment};
  if(raw.material){const material=String(raw.material).trim().slice(0,80);const aliases:Record<string,string>={pmma:"PMMA",acrylic:"PMMA",plexiglas:"PMMA",sibal:"SIBAL fabric","sibal fabric":"SIBAL fabric",nomex:"Nomex",silicone:"Silicone"};input.material=aliases[material.toLowerCase()]??material;}
  const gravity=String(raw.gravity||(environment==="lunar-habitat"?"lunar":environment==="martian-habitat"?"martian":""));
  if(["microgravity","lunar","martian"].includes(gravity))input.gravity=gravity;
  for(const [key,min,max] of [["oxygen",0,100],["pressureKpa",.01,1000],["flow",0,1000]] as const){
    if(raw[key]==null||raw[key]==="")continue;
    const value=Number(raw[key]);
    if(!Number.isFinite(value)||value<min||value>max)throw new Error(`Invalid ${key}: expected ${min}–${max}`);
    input[key]=value;
  }
  return input;
}

export function researchReport(investigations:Investigation[],records:EvidenceRecord[],findings:Finding[],input:ResearchInput,semantic?:SemanticResult){
  const parsed=parseQuestion(input.question);
  const scenario:MissionQuestion={...parsed.scenario};
  if(input.material)scenario.material=input.material;
  if(input.gravity)scenario.gravity=input.gravity as MissionQuestion["gravity"];
  for(const key of ["oxygen","pressureKpa","flow"] as const)if(input[key]!=null)scenario[key]=input[key];
  const terms=words(input.question);
  const numericRequested=["oxygen","pressureKpa","flow"].filter(k=>scenario[k as keyof MissionQuestion]!=null);
  const habitat=habitatContext(input.environment);
  const ranked=investigations.map(study=>{
    const goalMatch=study.goals.includes(input.goal);
    const text=words([study.name,study.objective,study.fuels,study.summary,...study.variables].join(" "));
    const matchedWords=[...terms].filter(w=>text.has(w));
    const related=records.filter(r=>study.familyIds.includes(r.family));
    const linkedFindings=findings.filter(f=>study.familyIds.includes(SOURCE_FAMILY[f.source_id]??"context"));
    const materialMatches=scenario.material?related.filter(r=>r.material.toLowerCase()===scenario.material!.toLowerCase()):[];
    const mechanism=!!scenario.material&&["liquid","gas"].includes(study.phase);
    const gravityMatch=!!scenario.gravity&&(study.gravity===scenario.gravity||(study.gravity==="lunar-simulated"&&scenario.gravity==="lunar"));
    // Condition fit is evaluated per record, never by combining separately tested dimensions.
    const dimensions=(["material","gravity","oxygen","pressureKpa","flow"] as const).filter(k=>scenario[k]!=null);
    const conditionRows=related.map(r=>{
      const differences:string[]=[];
      const values=dimensions.map(key=>{
        const wanted=scenario[key];
        if(key==="material"){const ok=r.material.toLowerCase()===String(wanted).toLowerCase();if(!ok)differences.push("material differs");return ok?1:0;}
        if(key==="gravity"){const ok=r.gravity===wanted;if(!ok)differences.push("gravity differs");return ok?1:0;}
        const actual=key==="oxygen"?r.oxygen:key==="flow"?r.flowCmS:r.pressureKpa;
        if(actual==null){differences.push(`${key} unknown`);return 0;}
        const n=Number(wanted),low=Array.isArray(actual)?actual[0]:actual,high=Array.isArray(actual)?actual[1]:actual;
        const distance=n<low?low-n:n>high?n-high:0;
        const tolerance=key==="oxygen"?2:key==="flow"?5:10;
        if(distance>0)differences.push(`${key} differs by ${Number(distance.toFixed(2))}`);
        return Math.max(0,1-distance/tolerance);
      });
      return {id:r.id,value:values.length?values.reduce((a,b)=>a+b,0)/values.length:0,differences};
    }).sort((a,b)=>b.value-a.value||a.id.localeCompare(b.id));
    const preference=habitatPreference(study,input.environment);
    const semanticValue=semantic?.available?Math.max(0,Math.min(1,semantic.similarities[study.id]??0)):Math.min(1,matchedWords.length/Math.max(1,terms.size));
    const componentScores={goal:goalMatch?30:0,question:25*semanticValue,conditions:20*(conditionRows[0]?.value??0),habitat:15*preference.value,evidence:related.length?10:linkedFindings.some(f=>f.kind==="observed")&&study.findingScope!=="related-program"?6:linkedFindings.length?3:1};
    const points=Number(Object.values(componentScores).reduce((a,b)=>a+b,0).toFixed(1));
    const reasons=[goalMatch?`Addresses the ${input.goal} research goal.`:`Not tagged primarily for ${input.goal}.`,
      ...(matchedWords.length?[`Question terms in the study overview: ${matchedWords.join(", ")}.`]:[]),
      ...(materialMatches.length?[`${materialMatches.length} curated records match ${scenario.material}.`]:[]),
      ...(gravityMatch?[study.gravity==="lunar-simulated"?"A simulated lunar-gravity analogy; not Moon-surface evidence.":"Investigation gravity overlaps the requested regime."]:[]),
      `Habitat research priority: ${preference.label}; ${Math.round(preference.value*100)}% of the project's habitat-priority weight.`,
      ...(semantic?.available?[`Neural question similarity: ${semanticValue.toFixed(3)} (${semantic.model}); similarity is not evidence validity.`]:[]),
      ...(dimensions.length&&conditionRows.length?[`Closest joint condition record: ${conditionRows[0].id}; ${conditionRows[0].differences.join(", ")||"no difference on specified dimensions"}.`]:[])];
    const limits=[study.limitation,
      ...(scenario.material&&!materialMatches.length?[`No curated individual test row in this investigation matches ${scenario.material}.`]:[]),
      ...(scenario.gravity&&!gravityMatch?[`No matched ${scenario.gravity} result is established by this overview.`]:[]),
      ...(numericRequested.length&&!related.length?["Numerical condition matching is unavailable: no individual test rows are curated for this investigation."]:[]),
      ...(mechanism?["Different fuel phase: use as mechanistic context, not as a solid-material outcome."]:[]),preference.limits,
      ...(study.id==="efield"?["The NASA E-FIELD investigation was not intended for space applications; relevance here is mechanism/terrestrial context, not demonstrated spacecraft suppression."]:[])];
    return {study,points,reasons,limits,testCount:related.length,findingCount:linkedFindings.length,
      evidenceStatus:related.length?"test records available":linkedFindings.length?"publication findings only":"overview only",
      relation:mechanism?"mechanistic context":materialMatches.length?"material-linked research":"research context",goalMatch,componentScores,closestConditionRecord:dimensions.length?conditionRows[0]??null:null};
  }).sort((a,b)=>Number(b.goalMatch)-Number(a.goalMatch)||b.points-a.points||a.study.id.localeCompare(b.study.id));
  const topics=[...new Set([...GOAL_TOPICS[input.goal],...parsed.topics])];
  const rankedFindings=rankFindings(findings,records,{scenario,topics});
  const conditionsSpecified=Object.keys(scenario).length>0;
  const coverage=ladder(records,findings,scenario);
  if(!conditionsSpecified){
    coverage.direct=[];
    coverage.gaps=[{dim:"combination",text:"Specify experimental conditions before evaluating matched-test coverage."}];
  }
  return {version:"emberscope-research-2",input,scenario,conditionsSpecified,ranked,rankedFindings,coverage,habitat,
    rankingMethod:{neural:semantic?.available??false,model:semantic?.available?semantic.model:null,reason:semantic?.reason??"Disclosed lexical/condition ranking; neural similarity was not requested.",weights:{goal:30,question:25,conditions:20,habitat:15,evidence:10},conditionDistanceScales:{oxygenVolPct:2,flowCmS:5,pressureKpa:10},coverageTolerances:TOLERANCE,note:"Goal-matching investigations are ordered first. Ranking similarity decays to zero at 2 oxygen percentage points, 5 cm/s airflow or 10 kPa pressure distance. Matched-test coverage is a separate rule: oxygen ±1.5 points, pressure ±10 kPa and airflow ±50% (minimum ±1 cm/s). Condition scores use the closest individual row; partial overlaps and missing values never establish an exact tested combination. All weights are project choices, not calibrated confidence."},
    insight:fireInsight(rankedFindings,findings),
    scope:"Investigation ranking combines question similarity, joint record conditions, habitat research priorities and evidence availability. Weights are a transparent project heuristic, not a NASA rating or a prediction of fire risk.",
    limitations:["The curated corpus is a subset of NASA research, not the complete PSI archive.",
      "Overview relevance does not imply that the requested combination of conditions was tested.",
      ...(input.goal==="detection"?["Solid-fuel condition coverage is not detector-performance evidence. SAME smoke-property findings and PSI setup tables are available, but a validated run-level detector-performance dataset is not imported here."]:[]),
      "Hardware, sensor calibration, geometry and full condition histories require source-specific review.",
      "A research gap is a gap in this corpus; it is not proof that no relevant experiment exists anywhere."]};
}

export function investigationEvidence(studies:Investigation[],question:string,goal?:ResearchGoal):EvidenceItem[]{
  const query=words(question);
  return studies.filter(s=>s.goals.includes(goal??"prevention")||[...words(`${s.name} ${s.objective}`)].some(w=>query.has(w)))
    .slice(0,7).map(s=>({key:`I:${s.id}`,kind:"finding",title:`${s.name} — investigation overview (not test results)`,
      text:`OVERVIEW / OBJECTIVES ONLY. ${s.objective} Materials: ${s.fuels} Hardware: ${s.hardware} Measurements: ${s.measurements} Limits: ${s.limitation} Source: ${s.sourceLabel}.`,
      href:s.source,rung:"context"}));
}

export function reportMarkdown(report:ReturnType<typeof researchReport>,findings:Finding[],sources:Source[]=[]){
  const lines=["# EmberScope research brief","",`Question: ${report.input.question||"Broad investigation overview"}`,`Goal: ${report.input.goal}`,`Environment: ${report.input.environment}`,`Conditions: ${JSON.stringify(report.scenario)}`,"",report.scope,`Ranking engine: ${report.rankingMethod.neural?report.rankingMethod.model:"lexical/condition fallback"}. ${report.rankingMethod.reason}`,`Weights: ${JSON.stringify(report.rankingMethod.weights)}. ${report.rankingMethod.note}`,`Habitat focus: ${report.habitat.focus}`,`Habitat limits: ${report.habitat.limits}`,"","## Ranked investigations"];
  for(const [index,row] of report.ranked.entries())lines.push(`### ${index+1}. ${row.study.name}`,row.study.summary,
    `Relevance: ${row.points}/100 (heuristic); ${row.evidenceStatus}; ${row.testCount} curated records.`,
    `Score components: ${JSON.stringify(row.componentScores)}`,
    `Why: ${row.reasons.join(" ")}`,`Interpretation (project, not measured): ${row.study.interpretation}`,
    `Limits: ${row.limits.join(" ")}`,`Source: ${row.study.source} — ${row.study.sourceLabel}`,"");
  lines.push("## Relevant published findings");
  for(const result of report.rankedFindings.slice(0,8)){
    const f=findings.find(f=>f.id===result.findingId)!;
    const source=sources.find(s=>s.source_id===f.source_id);
    const href=f.pdf_page&&source?.pdf_url?`${source.pdf_url}#page=${f.pdf_page}`:source?.url;
    lines.push(`- ${f.quote}`,`  Source: ${f.source_id}, ${f.in==="abstract"?"abstract":`PDF page ${f.pdf_page??"not curated"}`}; ${result.rung}.`,
      ...(href?[`  Original document: ${href}`]:[]),
      `  Limits: ${result.limitations.join(" ")}`);
  }
  lines.push("","## Test-condition coverage",report.conditionsSpecified?`${report.coverage.direct.length} curated solid-fuel records meet the selected project tolerances; ${report.coverage.analogous.length} are analogous. This does not establish performance of a smoke detector or mission safety.`:"No conditions specified: no matched-test applicability claim is made.","","## Corpus gaps",...report.coverage.gaps.map(g=>`- ${g.text}`),"","## Limitations",...report.limitations.map(l=>`- ${l}`));
  return lines.join("\n\n");
}
