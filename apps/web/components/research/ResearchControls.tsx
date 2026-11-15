"use client";
import { useState } from "react";
import type { ResearchInput } from "@/lib/research";
import styles from "./Research.module.css";
import {Glyph} from "./Glyph";

export function ResearchForm({input}:{input:ResearchInput}){
  return <form action="/research" method="get" className={styles.questionForm}>
    <label className={styles.questionLabel}><span><Glyph name="search"/> Research query</span><textarea name="q" defaultValue={input.question} maxLength={400} placeholder="What can NASA studies tell us about smoke detection in a lunar habitat?"/></label>
    <div className={styles.formActions}><fieldset className={styles.goalSwitch}><legend className="sr-only">Research goal</legend>{(["prevention","detection","suppression"] as const).map(goal=><label key={goal}><input type="radio" name="goal" value={goal} defaultChecked={input.goal===goal}/><span><Glyph name={goal==="prevention"?"shield":goal==="detection"?"target":"flame"}/>{goal}</span></label>)}</fieldset><button type="submit" className={styles.primary}><Glyph name="search"/> Explore research</button></div>
    <details className={styles.advanced}><summary>Mission context & experimental conditions <span>+</span></summary><div className={styles.fields}>
      <label>Environment<select name="environment" defaultValue={input.environment}><option value="spacecraft">Spacecraft</option><option value="station">Space station</option><option value="lunar-habitat">Lunar habitat</option><option value="martian-habitat">Martian habitat</option><option value="rover">Pressurized rover</option></select></label>
      <label>Material / fuel<input name="material" defaultValue={input.material??""} placeholder="e.g. PMMA, SIBAL fabric"/></label>
      <label>Gravity<select name="gravity" defaultValue={input.gravity??""}><option value="">From question / environment</option><option value="microgravity">Microgravity</option><option value="lunar">Lunar</option><option value="martian">Martian</option></select></label>
      <label>Oxygen (vol %)<input name="oxygen" type="number" min="0" max="100" step="any" defaultValue={input.oxygen??""}/></label>
      <label>Pressure (kPa)<input name="pressureKpa" type="number" min=".01" max="1000" step="any" defaultValue={input.pressureKpa??""}/></label>
      <label>Airflow (cm/s)<input name="flow" type="number" min="0" max="1000" step="any" defaultValue={input.flow??""}/></label>
    </div><p>Unknowns can stay blank. Lunar and Martian scenarios do not turn orbital data into surface measurements.</p></details>
  </form>;
}

type Claim={text:string;type:string;cites:string[];verified:boolean;issues:string[]};
type Evidence={key:string;title:string;text:string;href:string;rung?:string};
type Answer={mode?:string;provider?:string;summary?:string;reason?:string;error?:string;claims?:Claim[];evidence?:Evidence[]};
export function ResearchAnswer({input,investigationId}:{input:ResearchInput;investigationId?:string}){
  const [busy,setBusy]=useState(false),[answer,setAnswer]=useState<Answer|null>(null);
  async function ask(evidenceOnly=false){
    setBusy(true);setAnswer(null);
    const question=[input.question||`Find ${input.goal} investigations`,`${input.goal} research for ${input.environment}`,
      input.material, input.gravity, input.oxygen!=null?`${input.oxygen} % oxygen`:"",input.pressureKpa!=null?`${input.pressureKpa} kPa`:"",input.flow!=null?`${input.flow} cm/s`:""].filter(Boolean).join("; ").slice(0,400);
    try{
      const response=await fetch("/api/ask",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question,research:true,goal:input.goal,input,investigationId,evidenceOnly})});
      const result=await response.json();setAnswer(result);
    }catch{setAnswer({error:"Unable to contact the answer service. The source-based research report remains available."});}
    finally{setBusy(false);}
  }
  const byKey=new Map((answer?.evidence??[]).map(e=>[e.key,e]));
  return <section className={styles.aiPanel} aria-labelledby="research-ai-title"><div><p className={styles.kicker}>GROUNDED AI SYNTHESIS</p><h2 id="research-ai-title">Explain the retrieved evidence.</h2><p>The local or configured hosted model receives selected NASA records, publication quotes and labelled investigation overviews. Automatic checks flag citation, number, unit and gravity-context problems; they do not prove scientific correctness. Local generation may take up to two minutes.</p><a href="/readiness">Check AI and data readiness →</a></div>
    <div className={styles.actions}><button className={styles.secondary} disabled={busy} onClick={()=>ask(true)}>Retrieve source evidence</button><button className={styles.primary} disabled={busy} onClick={()=>ask()}>{busy?"Retrieving and checking…":"Generate source-linked explanation"}</button></div>
    <div role="status" aria-live="polite">{answer?.error&&<p className={styles.warning}>{answer.error}</p>}{answer?.reason&&<p className={styles.warning}>{answer.reason}</p>}</div>
    {answer?.provider&&<p className={styles.note}>Generated by {answer.provider}. Check each claim and its source before reuse.</p>}
    {answer?.summary&&<p className={styles.answerSummary}>{answer.summary}</p>}
    {answer?.claims?.map((claim,index)=><article key={index} className={styles.claim}><div className={styles.tags}><span>{claim.type}</span><span>{claim.verified?"Automatic checks passed":"Requires review"}</span></div><p>{claim.text}</p><div className={styles.sourceLinks}>{claim.cites.map(key=>{const source=byKey.get(key);return source?<a key={key} href={source.href} target={source.href.startsWith("https:")?"_blank":undefined} rel="noreferrer">{source.title} ↗</a>:null;})}</div>{claim.issues.length>0&&<ul>{claim.issues.map(issue=><li key={issue}>{issue}</li>)}</ul>}</article>)}
    {!!answer?.evidence?.length&&<div className={styles.retrieved}><h3>Retrieved source evidence</h3>{[...answer.evidence].sort((a,b)=>Number(answer.claims?.some(c=>c.cites.includes(b.key))??false)-Number(answer.claims?.some(c=>c.cites.includes(a.key))??false)).slice(0,10).map(item=><details key={item.key}><summary>{item.title}</summary><p>{item.text}</p><a href={item.href}>Open source / record ↗</a></details>)}</div>}
  </section>;
}

export function PrintResearch(){return <button className={styles.secondary} onClick={()=>window.print()}>Print / save PDF</button>;}
