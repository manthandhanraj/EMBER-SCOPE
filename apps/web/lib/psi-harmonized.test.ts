import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {parseCell,harmonizeAll,harmonizedCsv,TABLE_SPECS} from "./psi-harmonized.ts";
import {findPsiTable,psiTableKey,type PsiExperimentalTable} from "./model-workspace.ts";

const psi=JSON.parse(readFileSync(new URL("../data/psi-numerical.json",import.meta.url),"utf8")) as {tables:PsiExperimentalTable[]};
const catalog=JSON.parse(readFileSync(new URL("../data/psi-catalog.json",import.meta.url),"utf8")) as {investigations:{accession:string;files:{name:string;experimentalTable:boolean;restricted:boolean}[]}[]};
const h=harmonizeAll(psi.tables);

test("every public experimental table listed in the PSI catalog is imported and has a reviewed mapping", () => {
 const listed=catalog.investigations.flatMap(i=>i.files.filter(f=>f.experimentalTable&&!f.restricted&&f.name.toLowerCase().endsWith(".csv")).map(f=>f.name)).sort();
 assert.deepEqual(psi.tables.map(t=>t.fileName).sort(),listed);
 for(const t of psi.tables)assert.ok(TABLE_SPECS[t.fileName],`no mapping for ${t.fileName}`);
 assert.deepEqual(h.totals.unmappedTables,[]);
 assert.equal(h.totals.rows,psi.tables.reduce((n,t)=>n+t.rowCount,0));
});

test("only single numbers are converted; ranges, lists, censored values and artifacts stay null with their text", () => {
 assert.deepEqual(parseCell("0.21","XO2",100),{value:21,raw:"0.21",column:"XO2"});
 assert.equal(parseCell("~ 22.1","x").flag,"approximate");assert.equal(parseCell("~ 22.1","x").value,22.1);
 for(const [raw,flag] of [["21.5 - 21.7","range"],["22.1 to 22.0","range"],["0.17; 0.21;0.25; 0.3","list"],["<1","censored"],["3400%","non-numeric"],["5 down to ext","non-numeric"]] as const){
  const f=parseCell(raw,"x");assert.equal(f.value,null,raw);assert.equal(f.flag,flag,raw);assert.equal(f.raw,raw);
 }
 assert.equal(parseCell("","x").value,null);assert.equal(parseCell(null,"x").raw,null);
});

test("unit conversions are explicit and exact", () => {
 assert.equal(parseCell("1 atm","Pressure",1,["atm"]).value,101.325);
 assert.equal(parseCell("757.7","Ambient pressure; mmHg",0.133322).value,101.018079);
 assert.equal(parseCell("1.1033","approx p (bar)",100).value,110.33);
 assert.equal(parseCell("20 cm/s","Air Flow",1,["cm/s"]).value,20);
});

test("FLEX and CFI-G rows become model-ready with source text; BASS-II display airflow is never converted", () => {
 const flex=h.rows.find(r=>r.investigation==="FLEX"&&r.sourceRow===1)!;
 assert.equal(flex.oxygenPct.value,21);assert.equal(flex.oxygenPct.raw,"0.21");assert.ok(flex.modelReady);
 assert.ok(flex.outcomes.some(o=>o.kind==="test end"));assert.equal(flex.diluents.N2,79);
 assert.ok(h.rows.filter(r=>r.investigation==="CFI-G").every(r=>r.modelReady&&r.outcomes.some(o=>o.kind==="hot ignition")));
 const bass=h.rows.filter(r=>r.investigation==="BASS-II");
 assert.ok(bass.length>0&&bass.every(r=>r.flowCmS.value==null&&r.flowCmS.flag==="display-units"&&!r.modelReady));
 assert.equal(h.totals.modelReady,h.rows.filter(r=>r.oxygenPct.value!=null&&r.pressureKpa.value!=null&&r.outcomes.length>0).length);
});

test("no outcome is invented for setup-only tables", () => {
 for(const inv of ["SAME","SAME-R","SLICE","SPICE","BASS","DAFT","CFI"])assert.ok(h.rows.filter(r=>r.investigation===inv).every(r=>r.outcomes.length===0),inv);
});

test("multi-table accessions are addressable by key", () => {
 const tens=psi.tables.filter(t=>t.accession==="PSI-10");
 assert.equal(tens.length,2);
 assert.equal(psiTableKey(psi.tables,tens[0]),"PSI-10");assert.equal(psiTableKey(psi.tables,tens[1]),"PSI-10:2");
 assert.equal(findPsiTable(psi.tables,"PSI-10:2"),tens[1]);assert.equal(findPsiTable(psi.tables,"PSI-10"),tens[0]);
 assert.equal(findPsiTable(psi.tables,"PSI-10:3"),undefined);assert.equal(findPsiTable(psi.tables,"../x"),undefined);
});

test("harmonized CSV keeps one line per row plus a header and neutralizes formula-like text", () => {
 const csv=harmonizedCsv(h.rows.slice(0,5));
 assert.equal(csv.split("\r\n").length,6);
 assert.ok(!/(^|,)"=/.test(csv));
});
