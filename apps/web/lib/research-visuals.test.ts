import {test} from "node:test";
import assert from "node:assert/strict";
import {recordOverview} from "./research-visuals.ts";
import type {EvidenceRecord} from "./ontology.ts";
test("visual counts preserve zero, unknown conditions and distinct outcomes",()=>{
 const base={material:"PMMA",outcome:"unknown",oxygen:0,flowCmS:0,pressureKpa:null} as EvidenceRecord;
 const rows=[base,{...base,material:"Nomex",outcome:"not_ignited",oxygen:null,flowCmS:NaN,pressureKpa:[100,101]} as EvidenceRecord];
 const result=recordOverview(rows);
 assert.equal(result.total,2);assert.equal(result.outcomes.reduce((n,x)=>n+x.value,0),2);assert.equal(result.materials.reduce((n,x)=>n+x.value,0),2);
 assert.deepEqual(result.conditions.map(x=>[x.value,x.unknown]),[[1,1],[1,1],[1,1]]);
 assert.equal(base.oxygen,0);assert.equal(base.outcome,"unknown");
});
test("empty charts produce zero denominators without invented bars",()=>{
 const result=recordOverview([]);assert.equal(result.total,0);assert.deepEqual(result.outcomes,[]);assert.deepEqual(result.materials,[]);assert.ok(result.conditions.every(x=>x.value===0&&x.unknown===0));
});
