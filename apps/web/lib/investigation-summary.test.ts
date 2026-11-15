import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {summarizeInvestigation,investigationMarkdown,SUMMARY_FIELDS,investigationCorpus} from "./investigation-summary.ts";
import {fromBass,fromLuci,fromSaffire} from "./ontology.ts";
import {buildEvidence} from "./ask-core.ts";
import type {Investigation} from "./research.ts";
import type {Experiment,Finding,Source,LuciRun,SaffireRun} from "./types.ts";
const read=(name:string)=>JSON.parse(readFileSync(new URL(`../data/${name}.json`,import.meta.url),"utf8"));
const studies=read("investigations") as Investigation[],findings=read("findings") as Finding[],sources=read("sources") as Source[];
const records=[...(read("experiments") as Experiment[]).map(fromBass),...(read("saffire") as SaffireRun[]).map(fromSaffire),...(read("luci") as LuciRun[]).map(fromLuci)];
const summary=(id:string)=>summarizeInvestigation(studies.find(s=>s.id===id)!,records,findings,sources);
test("every curated investigation has a source-linked summary packet",()=>{
 for(const study of studies){const s=summary(study.id);assert.equal(s.fields.length,SUMMARY_FIELDS.length);assert.equal(s.status.summaryAvailable,true,`${study.id}: ${s.reviewIssues}`);assert.ok(s.references.length);assert.equal(s.status.expertReviewed,false);}
});
test("SAME objectives do not generate measured results or numerical ranges",()=>{
 const s=summary("same");assert.equal(s.testCoverage.total,0);assert.equal(s.findings.observed.length,0);assert.equal(s.status.evidence,"overview / context only");assert.ok(s.conditions.every(c=>c.min===null&&c.max===null));assert.ok(s.missing.some(x=>x.includes("No individual test")));
});
test("SoFIE parent-program statements cannot become GEL results",()=>{
 const s=summary("sofie");assert.equal(s.testCoverage.total,0);assert.equal(s.findings.observed.length,0);assert.ok(s.findings.context.length>0);assert.ok(s.findings.context.every(f=>f.scope.includes("parent-program")));
});
test("historical launch plans are context, not measured lunar results",()=>{
 const s=summary("luci");assert.ok(!s.findings.observed.some(f=>f.id==="luci-fm2"));
 const plan=s.findings.context.find(f=>f.id==="luci-fm2")!;assert.ok(plan);assert.match(plan.classificationNote!,/Historical planning/);assert.equal(plan.originalKind,"observed");
});
test("condition summaries keep denominators, nulls, zero and units",()=>{
 const study=studies[0],base=records.find(r=>r.family==="bass2")!;
 const s=summarizeInvestigation(study,[{...base,id:"zero",oxygen:0,flowCmS:0,pressureKpa:[55,60]},{...base,id:"unknown",oxygen:null,flowCmS:null,pressureKpa:null}],[],sources);
 assert.deepEqual(s.conditions.map(c=>[c.known,c.missing]),[[1,1],[1,1],[1,1]]);
 assert.equal(s.conditions[0].min,0);assert.equal(s.conditions[1].max,60);assert.equal(s.conditions[2].unit,"cm/s");
});
test("published quotations and pages are preserved verbatim in exports",()=>{
 const s=summary("bass2"),md=investigationMarkdown(s);
 for(const f of s.findings.observed){assert.equal(f.quote,findings.find(x=>x.id===f.id)!.quote);assert.ok(md.includes(f.quote));assert.ok(md.includes(f.href!));}
 assert.match(md,/not tested-safe/);assert.match(md,/Independent expert review: pending/);
 const concise=investigationMarkdown(s,"concise");assert.ok(concise.length<md.length);assert.match(concise,/Missing data and review/);assert.match(concise,/Original references/);
});
test("broken source linkage produces a review issue rather than silent verification",()=>{
 const s=summarizeInvestigation(studies.find(s=>s.id==="bass2")!,records,findings,[]);
 assert.equal(s.status.summaryAvailable,false);assert.ok(s.reviewIssues.some(i=>i.includes("Missing publication source")));
});
test("investigation-specific AI retrieval never imports unrelated families or upgrades parent context",()=>{
 const exp=read("experiments") as Experiment[],saf=read("saffire") as SaffireRun[],luci=read("luci") as LuciRun[];
 for(const study of studies){const corpus=investigationCorpus(study,exp,findings,saf,luci);
  const packet=buildEvidence("Summarize this investigation",corpus.experiments,corpus.findings,corpus.saffireRuns,corpus.luciRuns,{investigationSummary:true});
  if(["bass2","saffire","luci"].includes(study.id))assert.ok(packet.items.some(item=>item.kind==="test"),`${study.id}: summary retrieval must include available test evidence even without scenario keywords`);
  if(study.id==="sofie")assert.ok(packet.items.every(item=>item.rung==="context"));
  assert.equal(corpus.experiments.length,study.id==="bass2"?56:0);assert.equal(corpus.saffireRuns.length,study.id==="saffire"?20:0);assert.equal(corpus.luciRuns.length,study.id==="luci"?2:0);
  if(study.id==="same")assert.equal(corpus.findings.length,0);
  if(study.id==="sofie")assert.ok(corpus.findings.every(f=>f.kind==="context"));
  if(study.id==="luci")assert.equal(corpus.findings.find(f=>f.id==="luci-fm2")?.kind,"context");
 }
});
