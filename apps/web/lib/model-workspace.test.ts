import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {prepareModelData,workspaceInput,groupedSplit,ignitionDiagnostics,modelDataCsv,modelGroup,psiModelPacket,psiModelCsv,type PreparedRow} from "./model-workspace.ts";
import type {Experiment,SaffireRun,LuciRun,Source} from "./types.ts";
const read=(name:string)=>JSON.parse(readFileSync(new URL(`../data/${name}.json`,import.meta.url),"utf8"));
const data={experiments:read("experiments") as Experiment[],saffireRuns:read("saffire") as SaffireRun[],luciRuns:read("luci") as LuciRun[],sources:read("sources") as Source[]};
const packet=(target:"catalog"|"ignition"|"spread",family:"all"|"bass2"|"saffire"|"luci"="all",material="")=>prepareModelData(data,{target,family,material});

test("model catalog preserves all 78 real records, unknowns, source links and distinct gravity",()=>{
 const p=packet("catalog");assert.equal(p.rows.length,78);assert.equal(p.excluded.length,0);
 assert.ok(p.rows.every(r=>r.target_value===null&&r.split==="unassigned"));assert.ok(p.rows.every(r=>r.source_url));
 const missingPressure=p.rows.find(r=>r.family==="bass2"&&r.pressure_min_kpa===null)!;
 assert.ok(missingPressure);assert.equal(missingPressure.pressure_max_kpa,null);assert.ok(p.rows.filter(r=>r.family==="luci").every(r=>r.gravity.includes("simulated lunar")&&r.airflow_cm_s===null));
});
test("ignition extraction retains 41 source-coded eligible rows and accounts for every exclusion",()=>{
 const p=packet("ignition");assert.equal(p.rows.length,41);assert.equal(p.rows.filter(r=>r.target_value===0).length,4);assert.equal(p.rows.length+p.excluded.length,p.selectedCount);
 assert.ok(p.rows.every(r=>r.family==="bass2"&&r.label_source_url&&[0,1].includes(r.target_value!)));
 assert.ok(p.excluded.some(r=>r.reasons.some(x=>x.includes("Reused"))));assert.ok(p.excluded.some(r=>r.reasons.some(x=>x.includes("oxygen"))));
 assert.ok(p.rows.filter(r=>r.reported_outcome.includes("final outcome not stated")).every(r=>r.target_value===1));
});
test("unknown outcome codes cannot silently become positive ignition labels",()=>{
 const clean=data.experiments.find(e=>e.material==="PMMA"&&!e.quality_flags.length)!;
 const p=prepareModelData({...data,experiments:[{...clean,outcome:"unreviewed_new_code"}]},{target:"ignition",family:"bass2",material:""});
 assert.equal(p.rows.length,0);assert.match(p.excluded[0].reasons.join(" "),/no reviewed ignition/);
});
test("only four explicit Saffire spread values enter the regression export",()=>{
 const p=packet("spread");assert.equal(p.rows.length,4);assert.ok(p.rows.every(r=>r.family==="saffire"&&Number.isFinite(r.target_value)&&r.label_source_url));
 assert.ok(p.excluded.filter(r=>r.family==="luci").every(r=>r.reasons.some(x=>x.includes("Saffire only"))));
 assert.equal(packet("spread","luci").rows.length,0);
});
test("zero remains a value, nonfinite conditions are excluded and missing values are not imputed",()=>{
 const clean=data.experiments.find(e=>e.material==="PMMA"&&!e.quality_flags.length)!;
 const p=prepareModelData({...data,experiments:[{...clean,id:"zero",oxygen_vol_pct:0,flow_initial_cm_s:0},{...clean,id:"nonfinite",oxygen_vol_pct:NaN}]},{target:"ignition",family:"bass2",material:""});
 assert.equal(p.rows.length,1);assert.equal(p.rows[0].oxygen_vol_pct,0);assert.equal(p.rows[0].airflow_cm_s,0);assert.ok(p.excluded[0].reasons.some(r=>r.includes("nonfinite")));
});
test("grouped split is deterministic, order-independent and never splits a known group",()=>{
 const rows=packet("ignition").rows,a=groupedSplit(rows),b=groupedSplit([...rows].reverse());
 assert.deepEqual(Object.fromEntries(a.map(r=>[r.id,r.split])),Object.fromEntries(b.map(r=>[r.id,r.split])));
 for(const group of new Set(a.map(r=>r.group)))assert.equal(new Set(a.filter(r=>r.group===group).map(r=>r.split)).size,1);
 assert.equal(new Set(a.filter(r=>r.material==="PMMA").map(r=>r.group)).size,1);
 assert.ok(a.some(r=>r.split==="train")&&a.some(r=>r.split==="test"));
 assert.equal(modelGroup("luci","a","PMMA"),modelGroup("luci","b","SIBAL fabric"));
 const one=groupedSplit([rows[0],{...rows[0],id:"copy"}]);assert.ok(one.every(r=>r.split==="unassigned"));
});
test("local grouped diagnostics are reproducible and insufficient data abstains",()=>{
 const p=packet("ignition"),a=ignitionDiagnostics(p),b=ignitionDiagnostics(p);assert.equal(a.available,true);assert.deepEqual(a,b);
 assert.ok(a.models.every(m=>Number.isFinite(m.brier)&&Number.isFinite(m.logLoss)));assert.equal(a.models[0].auc,null);
 assert.equal(ignitionDiagnostics(packet("spread")).available,false);assert.equal(ignitionDiagnostics(packet("ignition","bass2","Nomex")).available,false);
});
test("CSV separates clean rows from exclusions and escapes formulas, commas and quotes",()=>{
 const p=packet("ignition"),csv=modelDataCsv(p);assert.equal(csv.split("\r\n").length,p.rows.length+1);assert.match(csv,/source_sha256/);assert.match(csv,/target_value/);
 const changed={...p,rows:[{...p.rows[0],material:'=HYPERLINK("bad")',notes:['comma, quote"']} as PreparedRow]};
 assert.ok(modelDataCsv(changed).includes("'="));assert.ok(modelDataCsv(changed).includes('comma, quote""'));assert.match(modelDataCsv(p,"excluded"),/reasons/);
});
test("filter validation rejects unsupported schema selectors without manufacturing matches",()=>{
 assert.throws(()=>workspaceInput({target:"invented"}));assert.throws(()=>workspaceInput({family:"earth"}));
 assert.equal(packet("catalog","saffire","PMMA").rows.length,data.saffireRuns.filter(r=>r.material==="PMMA").length);assert.equal(packet("catalog","bass2","unknown material").rows.length,0);
});
test("PSI source exports preserve original cells, range strings and provenance without inferred labels",()=>{
 const psi=read("psi-numerical"),p=psiModelPacket(psi.tables,"PSI-69");assert.equal(p.table.rows.length,274);assert.ok(p.table.provenance.sha256);assert.ok(p.reviewRequired.length);
 assert.deepEqual(p.table.rows,psi.tables.find((t:{accession:string})=>t.accession==="PSI-69").rows);assert.throws(()=>psiModelPacket(psi.tables,"../secret"));
 const table={...p.table,rows:[{...p.table.rows[0],"Fuel":"test, \"quoted\"","Test end":">2.5"}]};
 const csv=psiModelCsv({...p,table});assert.match(csv,/_psi_sha256/);assert.ok(csv.includes('">2.5"'));assert.ok(csv.includes('test, ""quoted""'));
});

test("spreadsheet defense retains finite negative scalar literals in source CSV exports",()=>{
 const p=psiModelPacket(read("psi-numerical").tables,"PSI-69");
 const table={...p.table,rows:[{...p.table.rows[0],"Ambient pressure; mmHg":"-1","Fuel":"-formula(text)"}]};
 const csv=psiModelCsv({...p,table});assert.ok(csv.includes('"-1"'));assert.ok(!csv.includes("'-1"));assert.ok(csv.includes("'-formula(text)"));
});
