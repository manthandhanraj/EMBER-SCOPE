import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {investigationMap} from "./investigation-map.ts";
import {fromBass,fromSaffire,fromLuci,SOURCE_FAMILY} from "./ontology.ts";
import type {Investigation} from "./research.ts";
import type {Experiment,SaffireRun,LuciRun,Finding,Source} from "./types.ts";
const read=(name:string)=>JSON.parse(readFileSync(new URL(`../data/${name}.json`,import.meta.url),"utf8"));
const studies=read("investigations") as Investigation[], findings=read("findings") as Finding[], sources=read("sources") as Source[];
const records=[...(read("experiments") as Experiment[]).map(fromBass),...(read("saffire") as SaffireRun[]).map(fromSaffire),...(read("luci") as LuciRun[]).map(fromLuci)];
test("map preserves SAME's overview without inventing detector evidence",()=>{
  const same=investigationMap(studies,records,findings,sources).find(s=>s.id==="same")!;
  assert.equal(same.testCount,0);assert.equal(same.findingCount,0);assert.deepEqual(same.excerpts,[]);
  assert.equal(same.references.length,1);assert.equal(same.references[0].kind,"overview");
});
test("map counts use actual test family membership",()=>{
  const map=investigationMap(studies,records,findings,sources);
  assert.equal(map.reduce((sum,s)=>sum+s.testCount,0),records.length);
  assert.equal(map.find(s=>s.id==="bass2")?.testCount,56);
  assert.equal(map.find(s=>s.id==="luci")?.testCount,2);
});
test("map excerpts preserve source quotes, pages and investigation boundaries",()=>{
  for(const study of investigationMap(studies,records,findings,sources))for(const excerpt of study.excerpts){
    const original=findings.find(f=>f.id===excerpt.id)!;
    assert.equal(excerpt.quote,original.quote);
    assert.ok(study.familyIds.includes(SOURCE_FAMILY[original.source_id]));
    assert.match(excerpt.href,/^https:\/\//);
    if(original.pdf_page&&sources.find(s=>s.source_id===original.source_id)?.pdf_url)assert.ok(excerpt.href.endsWith(`#page=${original.pdf_page}`));
  }
});
