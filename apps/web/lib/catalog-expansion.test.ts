import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {FAMILIES,SOURCE_FAMILY,fromBass,fromLuci,fromSaffire} from "./ontology.ts";
import {summarizeInvestigation,investigationMarkdown,investigationCorpus} from "./investigation-summary.ts";
import {buildEvidence,checkAnswer} from "./ask-core.ts";
import {investigationEvidence,researchInput,researchReport,reportMarkdown,type Investigation} from "./research.ts";
import type {Experiment,Finding,Source,SaffireRun,LuciRun} from "./types.ts";

const read=<T>(name:string):T=>JSON.parse(readFileSync(new URL(`../data/${name}.json`,import.meta.url),"utf8"));
const studies=read<Investigation[]>("investigations");
const expandedFindings=read<Finding[]>("expanded-findings");
const expandedSources=read<Source[]>("expanded-sources");
const findings=[...read<Finding[]>("findings"),...expandedFindings];
const sources=[...read<Source[]>("sources"),...expandedSources];
const experiments=read<Experiment[]>("experiments"),saffire=read<SaffireRun[]>("saffire"),luci=read<LuciRun[]>("luci");
const records=[...experiments.map(fromBass),...saffire.map(fromSaffire),...luci.map(fromLuci)];
const study=(id:string)=>{const value=studies.find(s=>s.id===id);assert.ok(value,`Missing study ${id}`);return value;};
const brief=(id:string)=>summarizeInvestigation(study(id),records,findings,sources);
const addedIds=["spice","slice","cfi","cfi-g","efield","flex2","same-r","fm2"];

test("expanded catalog keeps distinct IDs and a defined source-to-family path",()=>{
 assert.equal(studies.length,15);
 for(const [label,ids] of [["profiles",studies.map(s=>s.id)],["findings",findings.map(f=>f.id)],["sources",sources.map(s=>s.source_id)]] as const){
  assert.equal(new Set(ids).size,ids.length,`Duplicate ${label} ID`);
 }
 for(const id of ["bass2","saffire","same","flex","acme","sofie","luci",...addedIds])assert.ok(study(id));
 for(const s of expandedSources){
  const family=SOURCE_FAMILY[s.source_id];
  assert.ok(family,`No family mapping for ${s.source_id}`);
  assert.ok(FAMILIES[family],`No family definition for ${family}`);
  assert.equal(new URL(s.url).protocol,"https:");
 }
 for(const f of expandedFindings)assert.ok(sources.find(s=>s.source_id===f.source_id),`Unresolved source ${f.id}`);
});

test("expanded excerpts retain their exact text and source/page links in summary exports",()=>{
 for(const f of expandedFindings){
  const family=SOURCE_FAMILY[f.source_id];
  const target=studies.find(s=>s.familyIds.includes(family));
  // Equipment context has no invented investigation profile or test family.
  const scoped=target??{...study("bass2"),id:"equipment-context",familyIds:["context"]};
  const packet=summarizeInvestigation(scoped,records,findings,sources);
  const result=[...packet.findings.observed,...packet.findings.interpretations,...packet.findings.context].find(x=>x.id===f.id);
  assert.ok(result,`Missing excerpt ${f.id}`);
  assert.equal(result.quote,f.quote);
  const source=sources.find(s=>s.source_id===f.source_id)!;
  const expected=f.in==="pdf"?`${source.pdf_url}#page=${f.pdf_page}`:source.url;
  assert.ok(f.in!=="pdf"||(source.pdf_url&&Number.isInteger(f.pdf_page)&&f.pdf_page!>0),`Missing PDF locator ${f.id}`);
  assert.equal(result.href,expected,`Wrong page URL for ${f.id}`);
  const markdown=investigationMarkdown(packet);
  assert.ok(markdown.includes(f.quote),`Export rewrote ${f.id}`);
  assert.ok(markdown.includes(expected),`Export dropped citation ${f.id}`);
 }
});

test("all expanded briefs preserve source-linked fields without manufacturing outcome rows",()=>{
 for(const id of addedIds){
  const packet=brief(id);
  assert.equal(packet.status.summaryAvailable,true,`${id}: ${packet.reviewIssues.join(", ")}`);
  assert.equal(packet.status.expertReviewed,false);
  assert.equal(packet.testCoverage.total,0,`${id}: catalog statements became curated outcome records`);
  assert.equal(packet.testCoverage.records.length,0);
  assert.ok(packet.conditions.every(c=>c.min===null&&c.max===null&&c.known===0));
  assert.ok(packet.fields.every(f=>f.available&&f.citations.length>0));
  const corpus=investigationCorpus(study(id),experiments,findings,saffire,luci);
  const evidence=buildEvidence("Summarize this investigation",corpus.experiments,corpus.findings,corpus.saffireRuns,corpus.luciRuns,{investigationSummary:true});
  assert.ok(evidence.items.every(item=>item.kind==="finding"),`${id}: unrelated outcome rows entered study retrieval`);
 }
});

test("SAME smoke-size publication evidence survives without becoming detector accuracy",()=>{
 const packet=brief("same");
 const smoke=packet.findings.observed.find(f=>f.id==="same-smoke-size-mass");
 assert.ok(smoke);
 assert.equal(smoke.quote,"Consequently, although the AMD for silicone rubber is 227 nm, almost half the particle mass is larger than 1000 nm.");
 assert.equal(packet.testCoverage.total,0);
 assert.ok(packet.conditions.every(c=>c.min===null&&c.max===null));
 assert.match(packet.study.limitation,/detector-performance|alarm sensitivity/i);
 const corpus=investigationCorpus(study("same"),experiments,findings,saffire,luci);
 const evidence=buildEvidence("SAME smoke detector research",corpus.experiments,corpus.findings,corpus.saffireRuns,corpus.luciRuns,{investigationSummary:true});
 assert.ok(evidence.items.some(item=>item.key==="F:same-smoke-size-mass"));
 assert.ok(evidence.items.every(item=>item.family==="same"));
 const checked=checkAnswer({summary:"",claims:[{text:"SAME detectors achieved 99% accuracy.",type:"OBSERVED",cites:["F:same-smoke-size-mass"]}]},evidence.items);
 assert.equal(checked[0].verified,false,"A particle-size excerpt cannot supply an invented accuracy percentage");
});

test("FM2 planning and precursor findings do not become completed Moon-surface results",()=>{
 const packet=brief("fm2");
 assert.equal(packet.testCoverage.total,0);
 assert.equal(packet.findings.observed.length,0,"Precursor centrifuge/aircraft observations must remain context for the planned lunar experiment");
 assert.ok(packet.findings.context.some(f=>f.id==="fm2-lunar-objective"));
 assert.match(packet.study.limitation,/do not establish completed lunar|No Moon-surface/i);
 const corpus=investigationCorpus(study("fm2"),experiments,findings,saffire,luci);
 const evidence=buildEvidence("Summarize FM2 lunar research",corpus.experiments,corpus.findings,corpus.saffireRuns,corpus.luciRuns,{investigationSummary:true});
 assert.ok(evidence.items.length>0);
 assert.ok(evidence.items.every(item=>item.rung==="context"));
});

test("research reports and scoped retrieval retain E-FIELD terrestrial scope",()=>{
 const report=researchReport(studies,records,findings,researchInput({question:"electric field flame control for spacecraft",goal:"prevention",environment:"spacecraft"}));
 const efield=report.ranked.find(row=>row.study.id==="efield")!;
 assert.ok(efield);
 assert.equal(efield.testCount,0);
 assert.ok(efield.limits.some(limit=>/not intended for space|not conducted for a space|not.*spacecraft.*suppression/i.test(limit)));
 const markdown=reportMarkdown(report,findings,sources);
 assert.match(markdown,/not.*space.*application|not.*spacecraft.*suppression/i);
 const corpus=investigationCorpus(study("efield"),experiments,findings,saffire,luci);
 const evidence=buildEvidence("Summarize E-FIELD Flames",corpus.experiments,corpus.findings,corpus.saffireRuns,corpus.luciRuns,{investigationSummary:true});
 assert.ok(evidence.items.every(item=>item.rung==="context"));
 assert.ok(evidence.items.some(item=>/not being conducted to serve any space applications/.test(item.text)));
 const overview=investigationEvidence([study("efield")],"E-FIELD Flames","prevention");
 assert.equal(overview[0].rung,"context");
 assert.match(overview[0].text,/not demonstrated spacecraft fire-suppression|not.*spacecraft fire-suppression/i);
});

test("application cards keep original references and distinguish technology from research",()=>{
 const cards=read<{id:string;application:string;evidenceType:string;investigationIds:string[];limitations:string[];sources:{url:string;locator:string}[]}[]>("research-applications");
 assert.equal(cards.length,8);
 assert.equal(new Set(cards.map(c=>c.id)).size,cards.length);
 for(const card of cards){
  assert.ok(card.sources.length&&card.limitations.length,`Missing source/limits: ${card.id}`);
  assert.ok(["spacecraft","earth","both"].includes(card.application));
  assert.ok(["reported-technology","research-objective","publication-finding"].includes(card.evidenceType));
  for(const id of card.investigationIds)assert.ok(study(id));
  for(const ref of card.sources){assert.equal(new URL(ref.url).protocol,"https:");assert.ok(ref.locator.trim());}
 }
 const watermist=cards.find(c=>c.id==="fine-water-mist")!;
 assert.equal(watermist.evidenceType,"reported-technology");
 assert.deepEqual(watermist.investigationIds,[],"Equipment proof-of-concept is not attributed to an invented PSI campaign");
 const electrical=cards.find(c=>c.id==="electric-flame-control")!;
 assert.equal(electrical.application,"earth");
 assert.equal(electrical.evidenceType,"research-objective");
 const protective=cards.find(c=>c.id==="firefighter-protection")!;
 assert.deepEqual(protective.investigationIds,[],"Broader NASA heritage is not a BASS/FLEX/SAME outcome");
});
