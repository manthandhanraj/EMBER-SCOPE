import type {EvidenceRecord} from "@/lib/ontology";
import type {researchReport} from "@/lib/research";
import {recordOverview,type CountBar} from "@/lib/research-visuals";
import s from "./ResearchVisuals.module.css";
type Report=ReturnType<typeof researchReport>;

function Bars({rows,max,valueLabel="records",tone="warm"}:{rows:CountBar[];max:number;valueLabel?:string;tone?:string}){
 return <div className={s.bars} data-tone={tone}>{rows.length?rows.map((row,i)=><div className={s.barRow} key={`${row.label}:${i}`}><span>{row.label}</span><svg viewBox="0 0 1000 24" preserveAspectRatio="none" aria-hidden="true"><rect className={s.track} width="1000" height="24" rx="12"/><rect className={s.fill} width={max?Math.max(0,Math.min(1000,row.value/max*1000)):0} height="24" rx="12"/></svg><b>{Number(row.value.toFixed(1))}<span className="sr-only"> {valueLabel}</span></b></div>):<p>No records available.</p>}</div>;
}

export function RankingChart({report}:{report:Report}){
 const rows=report.ranked.slice(0,5).map(r=>({label:r.study.name,value:r.points}));
 return <section className={s.card} aria-labelledby="rank-chart-title"><header><div><p className={s.eyebrow}>YOUR QUESTION → STARTING POINTS</p><h3 id="rank-chart-title">Research relevance, at a glance.</h3></div><span className={s.badge}>Top {rows.length} profiles</span></header><Bars rows={rows} max={100} valueLabel="out of 100 relevance points"/><p className={s.caption}>Points show how the project prioritizes research for this question. They are not confidence, accuracy or fire-risk percentages. Goal-matching studies are ordered first.</p><details className={s.data}><summary>Read chart values as a table</summary><table><thead><tr><th>Investigation</th><th>Relevance / 100</th><th>Available evidence</th></tr></thead><tbody>{report.ranked.slice(0,5).map(r=><tr key={r.study.id}><th scope="row">{r.study.name}</th><td>{r.points}</td><td>{r.evidenceStatus}</td></tr>)}</tbody></table></details></section>;
}

export function CorpusCharts({records,showMaterials=true}:{records:EvidenceRecord[];showMaterials?:boolean}){
 const overview=recordOverview(records);
 return <div className={s.grid}><section className={s.card} aria-labelledby="outcome-chart-title"><p className={s.eyebrow}>WHAT WAS RECORDED</p><h3 id="outcome-chart-title">Curated outcomes.</h3><Bars rows={overview.outcomes} max={Math.max(1,...overview.outcomes.map(x=>x.value))}/><p className={s.caption}>{overview.total} curated records across different materials, protocols and gravity contexts. These counts are not fire probabilities; some flames were deliberately extinguished.</p></section>{showMaterials?<section className={s.card} aria-labelledby="material-chart-title"><p className={s.eyebrow}>WHAT WAS TESTED</p><h3 id="material-chart-title">Materials in this corpus.</h3><Bars rows={overview.materials} max={Math.max(1,...overview.materials.map(x=>x.value))} tone="cool"/><p className={s.caption}>Counts are source-linked records, not independent replications. Original PSI table rows are kept separately.</p></section>:<ConditionChart records={records}/>}</div>;
}

export function ConditionChart({records}:{records:EvidenceRecord[]}){
 const overview=recordOverview(records);
 return <section className={s.card} aria-labelledby="condition-chart-title"><p className={s.eyebrow}>KNOWN VALUES / MISSING VALUES</p><h3 id="condition-chart-title">How much condition data is available?</h3><Bars rows={overview.conditions} max={overview.total} tone="cool"/><div className={s.legend}>{overview.conditions.map(c=><p key={c.label}><b>{c.label}</b><span>{c.value} known · {c.unknown} unknown / {overview.total}</span></p>)}</div><p className={s.caption}>Bars count available fields. They do not mean the requested condition combination was tested or that a measurement was calibrated.</p></section>;
}

export function EvidenceCountChart({observed,interpretations,context}:{observed:number;interpretations:number;context:number}){
 const rows=[{label:"Reported observations",value:observed},{label:"Authors' interpretations",value:interpretations},{label:"Background / program context",value:context}];
 return <section className={s.card} aria-labelledby="brief-evidence-chart-title"><p className={s.eyebrow}>KEEP EVIDENCE TYPES SEPARATE</p><h3 id="brief-evidence-chart-title">What evidence is available?</h3><Bars rows={rows} max={Math.max(1,...rows.map(x=>x.value))} valueLabel="publication excerpts"/><p className={s.caption}>Counts describe curated publication excerpts. An objective, related-program statement or interpretation does not become a measured result.</p></section>;
}

export function ApplicabilitySnapshot({report}:{report:Report}){
 return <div className={s.snapshot} aria-label="Selected question evidence summary"><div><span>Matched solid-fuel rows</span><b>{report.conditionsSpecified?report.coverage.direct.length:"—"}</b><p>{report.conditionsSpecified?"Within the selected ladder tolerances":"Add conditions to check applicability"}</p></div><div><span>Analogous solid-fuel rows</span><b>{report.conditionsSpecified?report.coverage.analogous.length:"—"}</b><p>Differences must be reviewed before transfer</p></div><div><span>Research context</span><b className={s.habitat}>{report.habitat.label}</b><p>{report.input.goal} · {report.rankingMethod.neural?"Neural question matching":"Disclosed fallback matching"}</p></div></div>;
}
