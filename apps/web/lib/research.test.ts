import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {researchInput,researchReport,reportMarkdown,investigationEvidence,type Investigation} from "./research.ts";
import {fromBass,fromLuci,fromSaffire} from "./ontology.ts";
import {checkAnswer} from "./ask-core.ts";
import type {Experiment,Finding,LuciRun,SaffireRun} from "./types.ts";
const read=(name:string)=>JSON.parse(readFileSync(new URL(`../data/${name}.json`,import.meta.url),"utf8"));
const studies=read("investigations") as Investigation[];
const findings=read("findings") as Finding[];
const records=[...(read("experiments") as Experiment[]).map(fromBass),...(read("saffire") as SaffireRun[]).map(fromSaffire),...(read("luci") as LuciRun[]).map(fromLuci)];

test("detection research ranks SAME objectives while preserving missing results",()=>{
  const report=researchReport(studies,records,findings,researchInput({q:"smoke detector response",goal:"detection",environment:"lunar-habitat"}));
  assert.equal(report.ranked[0].study.id,"same");
  assert.equal(report.ranked[0].testCount,0);
  assert.equal(report.ranked[0].evidenceStatus,"overview only");
  assert.match(report.ranked[0].study.limitation,/No numerical SAME/);
  assert.ok(report.ranked[0].limits.some(l=>/lunar/.test(l)));
});
test("no unsupported material or partial-gravity query gains direct material evidence",()=>{
  const report=researchReport(studies,records,findings,researchInput({q:"PMMA lunar habitat",goal:"prevention",oxygen:34,pressureKpa:56.5,flow:20,material:"PMMA",gravity:"lunar"}));
  assert.equal(report.coverage.direct.length,0);
  assert.ok(report.coverage.gaps.length>0);
  assert.ok(report.ranked.find(r=>r.study.id==="luci")?.limits.some(l=>/simulated/i.test(l)));
  assert.ok(report.ranked.filter(r=>["gas","liquid"].includes(r.study.phase)).every(r=>r.relation==="mechanistic context"));
});
test("report is deterministic, keeps references, and exports limitations",()=>{
  const input=researchInput({q:"oxygen and airflow limits",goal:"suppression"});
  const a=researchReport(studies,records,findings,input),b=researchReport([...studies].reverse(),records,findings,input);
  assert.deepEqual(a.ranked.map(r=>r.study.id),b.ranked.map(r=>r.study.id));
  const md=reportMarkdown(a,findings);
  assert.match(md,/https:\/\//);assert.match(md,/not a NASA rating/);assert.match(md,/## Limitations/);
});
test("explicit invalid conditions are rejected rather than silently replaced",()=>{
  for(const raw of [{oxygen:101},{pressureKpa:0},{flow:"NaN"}])assert.throws(()=>researchInput(raw));
  assert.equal(researchInput({environment:"martian-habitat"}).gravity,"martian");
  assert.equal(researchInput({environment:"lunar-habitat",gravity:""}).gravity,"lunar");
});
test("broad overview does not manufacture matched-test coverage",()=>{
  const report=researchReport(studies,records,findings,researchInput({}));
  assert.equal(report.conditionsSpecified,false);
  assert.equal(report.coverage.direct.length,0);
  assert.match(reportMarkdown(report,findings),/No conditions specified/);
});
test("overview-only citations cannot verify invented measurements",()=>{
  const evidence=investigationEvidence(studies,"SAME smoke detectors","detection");
  assert.ok(evidence.some(e=>e.key==="I:same"));
  const checked=checkAnswer({summary:"",claims:[{type:"OBSERVED",text:"SAME achieved 99% detection accuracy.",cites:["I:same"]}]},evidence);
  assert.equal(checked[0].verified,false);
  assert.ok(checked[0].issues.some(x=>/objectives and scope/.test(x)));
});
