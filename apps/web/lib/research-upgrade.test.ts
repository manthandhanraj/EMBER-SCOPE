import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {researchInput,researchReport,type Investigation} from "./research.ts";
import {fromBass,fromLuci,fromSaffire} from "./ontology.ts";
import {cosine} from "./local-ai.ts";
import {parseQuestion,buildEvidence,checkAnswer} from "./ask-core.ts";
import type {Experiment,Finding,LuciRun,SaffireRun} from "./types.ts";
const read=(name:string)=>JSON.parse(readFileSync(new URL(`../data/${name}.json`,import.meta.url),"utf8"));
const studies=read("investigations") as Investigation[],findings=read("findings") as Finding[];
const records=[...(read("experiments") as Experiment[]).map(fromBass),...(read("saffire") as SaffireRun[]).map(fromSaffire),...(read("luci") as LuciRun[]).map(fromLuci)];
test("habitat selection changes research priorities beyond gravity",()=>{
 const run=(environment:string)=>researchReport(studies,records,findings,researchInput({environment,goal:"prevention",q:"material fire safety"}));
 const ship=run("spacecraft"),station=run("station"),rover=run("rover");
 const points=(r:ReturnType<typeof run>)=>r.ranked.find(x=>x.study.id==="saffire")!.componentScores.habitat;
 assert.notEqual(points(ship),points(station));assert.notEqual(points(ship),points(rover));
 assert.match(rover.habitat.focus,/Compact/);assert.match(station.habitat.focus,/Long-duration/);
});
test("joint-condition scoring cannot combine oxygen from one row and flow from another",()=>{
 const base=records.find(r=>r.family==="bass2")!;
 const rows=[{...base,id:"a",oxygen:21,flowCmS:20},{...base,id:"b",oxygen:30,flowCmS:1}];
 const report=researchReport(studies,rows,[],researchInput({oxygen:21,flow:1}));
 const result=report.ranked.find(r=>r.study.id==="bass2")!;
 assert.ok(result.componentScores.conditions<20);assert.equal(report.coverage.direct.length,0);
});
test("neural similarity is bounded, disclosed and cannot create numerical evidence",()=>{
 const input=researchInput({q:"smoke detector",goal:"detection"});
 const report=researchReport(studies,records,findings,input,{available:true,model:"test-model",similarities:{same:1.5},reason:"test embedding"});
 const same=report.ranked.find(r=>r.study.id==="same")!;
 assert.equal(same.componentScores.question,25);assert.equal(same.testCount,0);assert.equal(same.componentScores.conditions,0);assert.equal(report.rankingMethod.neural,true);
 assert.equal(Object.values(report.rankingMethod.weights).reduce((a,b)=>a+b,0),100);
});
test("cosine handles zero/invalid dimensions without manufacturing similarity",()=>{
 assert.equal(cosine([1,0],[0,1]),0);assert.equal(cosine([0,0],[1,2]),0);assert.equal(cosine([1],[1,2]),0);assert.equal(cosine([1,2],[1,2]),1);
});
test("full numbers are preserved and other gas concentrations are not oxygen",()=>{
 assert.equal(parseQuestion("100% oxygen EVA suit").scenario.oxygen,100);
 assert.equal(parseQuestion("150 cm/s at 1000 kPa").scenario.flow,150);
 assert.equal(parseQuestion("150 cm/s at 1000 kPa").scenario.pressureKpa,1000);
 assert.equal(parseQuestion("carbon dioxide at 5%").scenario.oxygen,undefined);
 assert.equal(parseQuestion("5% CO2 in 21% oxygen").scenario.oxygen,21);
 assert.throws(()=>parseQuestion("101% oxygen"));
});
test("material aliases preserve identical coverage and ranking",()=>{
 const run=(material:string)=>researchReport(studies,records,findings,researchInput({material,gravity:"microgravity"}));
 assert.deepEqual(run("pmma").coverage.direct,run("PMMA").coverage.direct);
 assert.equal(researchInput({material:"acrylic"}).material,"PMMA");
});
test("AMD cannot become a median or a different campaign in an AI paraphrase",()=>{
 const expanded=read("expanded-findings") as Finding[];
 const evidence=buildEvidence("SAME smoke detector research",[],expanded,[],[],{investigationSummary:true}).items;
 for(const type of ["OBSERVED","INTERPRETATION"] as const){
  const claim=checkAnswer({summary:"",claims:[{text:"SAME-R reported a median diameter of 227 nm.",type,cites:["F:same-smoke-size-mass"]}]},evidence)[0];
  assert.equal(claim.verified,false);assert.ok(claim.issues.some(i=>i.includes("Statistic changed")));assert.ok(claim.issues.some(i=>i.includes("Campaign attribution")));
 }
 const valid=checkAnswer({summary:"",claims:[{text:"SAME reported an AMD of 227 nm for silicone rubber.",type:"OBSERVED",cites:["F:same-smoke-size-mass"]}]},evidence)[0];assert.equal(valid.verified,true);
 const rounded=checkAnswer({summary:"",claims:[{text:"Half the particle mass is larger than 1000 nm.",type:"OBSERVED",cites:["F:same-smoke-size-mass"]}]},evidence)[0];assert.equal(rounded.verified,false);assert.ok(rounded.issues.some(i=>i.includes("Qualifier lost")));
});
test("original BASS publications cannot silently become BASS-II measurements",()=>{
 const evidence=buildEvidence("low airflow BASS",[],findings).items;
 const invalid=checkAnswer({summary:"",claims:[{text:"BASS-II flames were sensitive between 0 and 5 cm/s.",type:"OBSERVED",cites:["F:low-flow-sensitivity"]}]},evidence)[0];
 assert.equal(invalid.verified,false);assert.ok(invalid.issues.some(i=>i.includes("original BASS publication")));
});
