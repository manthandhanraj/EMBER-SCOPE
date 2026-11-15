"use client";
import {useMemo,useState} from "react";
import {gate,predict,type Snapshot,type Query,STATUS_LABEL,PRESSURE_DOMAIN} from "@/lib/model-lab";
import s from "./ModelWorkspace.module.css";

export function PredictionPanel({fitted}:{fitted:Snapshot}){
 const [query,setQuery]=useState<Query>({material:"SIBAL fabric",gravity:"microgravity",o2:17,kpa:101.3,flow:5});
 const [values,setValues]=useState({o2:"17",kpa:"101.3",flow:"5"});
 const invalid=Object.entries(values).some(([key,value])=>value.trim()===""||!Number.isFinite(Number(value))||Number(value)<(key==="kpa"?.01:0)||Number(value)>(key==="o2"?100:1000));
 const checkedQuery=useMemo(()=>({...query,o2:Number(values.o2),flow:Number(values.flow),kpa:Number(values.kpa)}),[query,values]);
 const checks=useMemo(()=>gate(fitted,checkedQuery),[fitted,checkedQuery]),result=useMemo(()=>invalid?null:predict(fitted,checkedQuery),[fitted,checkedQuery,invalid]);
 const numberChange=(key:"o2"|"kpa"|"flow",value:string)=>setValues(v=>({...v,[key]:value}));
 return <div className={s.modelPanel}><div className={s.predictionControls}>
  <label>Model material<select value={query.material} onChange={e=>setQuery(q=>({...q,material:e.target.value}))}><option>SIBAL fabric</option><option>PMMA</option><option>Nomex</option><option>Silicone</option></select></label>
  <label>Query gravity<select value={query.gravity} onChange={e=>setQuery(q=>({...q,gravity:e.target.value as Query["gravity"]}))}><option value="microgravity">Microgravity</option><option value="lunar">Lunar</option><option value="martian">Martian</option><option value="earth">Earth</option></select></label>
  <label>Query oxygen (vol %)<input type="number" min="0" max="100" step="0.1" value={values.o2} onChange={e=>numberChange("o2",e.target.value)}/></label>
  <label>Query airflow (cm/s)<input type="number" min="0" max="1000" step="0.1" value={values.flow} onChange={e=>numberChange("flow",e.target.value)}/></label>
  <label>Query pressure (kPa)<input type="number" min="0.01" max="1000" step="0.1" value={values.kpa} onChange={e=>numberChange("kpa",e.target.value)}/></label>
 </div><div className={s.predictionResult} aria-live="polite"><p className={s.kicker}>FITTED RESEARCH ESTIMATE</p><h3>{invalid?"Enter all numerical conditions":result?`${(result.p*100).toFixed(1)}%`:"Prediction withheld"}</h3>{!invalid&&<p>{result?"Model probability of the coded flame-establishment label; this is not a fire probability or accuracy score.":"The query has insufficient support or falls outside the training context."}</p>}{!invalid&&result&&<p className={s.small}>Stratified refit range: {(result.lo*100).toFixed(1)}–{(result.hi*100).toFixed(1)}% (central 90% of 200 same-corpus bootstrap fits). This is model-resampling spread, not a calibrated predictive interval or independent confidence in safety.</p>}<span className={s.status}>{invalid?"Incomplete inputs":STATUS_LABEL[checks.status]}</span></div>
 {!invalid&&<div className={s.checks}><h4>Applicability checks</h4><ul>{checks.checks.map(c=><li key={c.dim}><b>{c.dim} · {STATUS_LABEL[c.status]}</b><span>{c.dim==="Pressure"?`Project context gate: ${checkedQuery.kpa} kPa is ${c.status==="in"?"inside":"outside"} ${PRESSURE_DOMAIN[0]}–${PRESSURE_DOMAIN[1]} kPa. This is a research guardrail, not a learned pressure response or a certified pressure range; source pressure metadata varies.`:c.text}</span></li>)}</ul></div>}
 <details className={s.details}><summary>Inspect nearby training records and feature contributions</summary><p className={s.small}>Nearby rows are selected by oxygen/airflow distance with material priority. Their presence does not establish a new tested combination.</p><ul>{checks.neighbors.map(n=><li key={n.row.id}><b>{n.row.test} · {n.row.material}</b><span>{n.row.o2} vol % O₂ · {n.row.flow} cm/s · {n.row.y?"flame established":"no flame established"} · {n.row.cite.source_id}, PDF p. {n.row.cite.pdf_page}</span></li>)}</ul>{!invalid&&result&&<ul>{result.contributions.map(c=><li key={c.feature}><b>{c.feature}: {c.value}</b><span>{c.logOdds.toFixed(3)} log-odds contribution relative to the training mean</span></li>)}</ul>}</details>
 </div>;
}
