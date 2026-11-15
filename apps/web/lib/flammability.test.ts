import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {flammabilityMap,gravityBounds,ignitionBracket,o2PartialKpa} from "./flammability.ts";
import {buildDataset} from "./model-lab.ts";
import type {Experiment,Finding,LuciRun,SaffireRun} from "./types.ts";

const read=<T>(n:string)=>JSON.parse(readFileSync(new URL(`../data/${n}.json`,import.meta.url),"utf8")) as T;
const exps=read<Experiment[]>("experiments"),saffire=read<SaffireRun[]>("saffire"),luci=read<LuciRun[]>("luci");
const findings=[...read<Finding[]>("findings"),...read<Finding[]>("expanded-findings")];
const map=flammabilityMap(exps,saffire);

test("ignition bracket comes from observations, never from a model below the observed failures", () => {
 const {rows}=buildDataset(exps);
 for(const m of ["SIBAL fabric","PMMA"] as const){
  const b=map.limits[m],own=rows.filter(r=>r.material===m);
  assert.equal(b.noFlameMax,Math.max(...own.filter(r=>!r.y).map(r=>r.o2)));
  assert.equal(b.flameMin,Math.min(...own.filter(r=>r.y).map(r=>r.o2)));
 }
 assert.deepEqual(ignitionBracket([],"PMMA"),{noFlameMax:null,flameMin:null,overlap:false});
});

test("quench and blowoff points use only final airflow speeds stated in cm/s", () => {
 for(const p of [...map.points["SIBAL fabric"],...map.points.PMMA].filter(p=>["quench","blowoff","no-blowoff"].includes(p.kind))){
  const e=exps.find(x=>x.id===p.id.replace(/-(quench|blowoff|noblow)$/,""))!;assert.equal(p.flow,e.flow_final_cm_s);
 }
 assert.equal(map.quench.PMMA,null,"PMMA quench speeds are fan settings, so none is placed");
 assert.ok(map.quench["SIBAL fabric"]!.n>=1);
});

test("every map point links to a cited source page", () => {
 for(const p of [...map.points["SIBAL fabric"],...map.points.PMMA]){assert.ok(p.cite.source_id);assert.ok(p.href.startsWith("/experiments/"));}
 for(const r of map.saffire)assert.ok(r.cite.source_id);
});

test("grouped validation reports the selection rule result and whether airflow helps", () => {
 assert.equal(map.validation.n,buildDataset(exps).rows.length);
 assert.ok(map.validation.rows.some(r=>r.id==="baseline"));
 assert.equal(typeof map.flowEffect.improves,"boolean");
 assert.ok(map.validation.chosen===null||map.validation.rows.some(r=>r.id===map.validation.chosen));
});

test("untested habitat atmospheres are labelled as untested, with arithmetic partial pressure", () => {
 const ea=map.atmospheres.find(a=>a.id==="ea-a")!;
 assert.equal(ea.o2PartialKpa,o2PartialKpa(34,56.5));assert.equal(ea.o2PartialKpa,19.2);
 assert.equal(ea.tested,ea.o2<=map.maxTestedO2);
});

test("partial-gravity bounds keep LUCI simulated, mark Mars as a gap and flag PMMA geometry", () => {
 const g=gravityBounds(exps,saffire,luci,findings);
 const sibal=g.find(x=>x.material==="SIBAL fabric")!,pmma=g.find(x=>x.material==="PMMA")!;
 for(const p of [sibal,pmma]){assert.ok(!p.points.some(x=>x.level==="martian"));assert.ok(p.caveats.some(c=>/simulated lunar/i.test(c)));}
 assert.equal(sibal.lowestBurning.lunar,18);
 assert.ok(sibal.points.some(p=>p.level==="earth"&&!p.burned&&/downward/i.test(p.label)),"1-g downward non-burn from the NASA finding");
 assert.match(sibal.verdict,/not a conservative bound/);
 assert.equal(pmma.lowestBurning.lunar,14.3);
 assert.ok(pmma.caveats.some(c=>/geometry/i.test(c)));assert.match(pmma.verdict,/geometr/i);
});
