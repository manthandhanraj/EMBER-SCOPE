"use client";
import {useState} from "react";
import Link from "next/link";
import type {MapInvestigation} from "@/lib/investigation-map";
import type {ResearchGoal} from "@/lib/research";
import {Glyph} from "./Glyph";
import s from "./EvidenceMap.module.css";

const short=(name:string)=>name.startsWith("BASS /")?"BASS / BASS-II":name.split(" — ")[0];
const preferred:Record<ResearchGoal,string>={prevention:"bass2",detection:"same",suppression:"flex"};
const detailTabs=["overview","sources","findings"];
const PAGE_SIZE=6;
const slots:[number,number][]=[[150,100],[750,100],[150,325],[750,325],[150,550],[750,550]];
const curve=(b:[number,number])=>`M 450 325 Q 450 ${b[1]} ${b[0]} ${b[1]}`;

export function EvidenceMap({studies,goal:initialGoal,initialStudy}:{studies:MapInvestigation[];goal:ResearchGoal;initialStudy:string}){
 const [selected,setSelected]=useState(initialStudy),[goal,setGoal]=useState<ResearchGoal>(initialGoal);
 const [detail,setDetail]=useState("overview"),[view,setView]=useState("map");
 const study=studies.find(s=>s.id===selected)??studies[0];
 if(!study)return <section className={s.workspace}><p>No investigation profiles are available.</p></section>;
 const selectedIndex=studies.findIndex(s=>s.id===study.id),page=Math.floor(selectedIndex/PAGE_SIZE);
 const pages=Math.ceil(studies.length/PAGE_SIZE);
 const displayed=view==="list"?studies:studies.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
 const choose=(id:string)=>{setSelected(id);setDetail("overview");};
 function highlight(next:ResearchGoal){setGoal(next);if(!study.goals.includes(next))choose(studies.find(s=>s.id===preferred[next])?.id??studies.find(s=>s.goals.includes(next))?.id??study.id);}
 function changePage(next:number){const first=studies[next*PAGE_SIZE];if(first)choose(first.id);}
 return <section className={s.workspace} aria-label="Interactive evidence constellation">
  <div className={s.mapPanel}>
   <header className={s.mapHeader}><div><span className={s.eyebrow}><i/> CHOOSE A STUDY</span><h3>Explore the evidence</h3></div><div className={s.viewSwitch} role="group" aria-label="Evidence map layout">{["map","list"].map(mode=><button key={mode} type="button" aria-pressed={view===mode} onClick={()=>setView(mode)}><Glyph name={mode==="map"?"network":"book"}/>{mode==="map"?"Map":"All studies"}</button>)}</div></header>
   <p className={s.intro}>Select an investigation to see what it studied, what was found and where the source is.</p>
   <div className={s.goalBar} role="group" aria-label="Highlight a fire-safety research goal">{(["prevention","detection","suppression"] as ResearchGoal[]).map(g=><button type="button" key={g} aria-pressed={goal===g} onClick={()=>highlight(g)}><Glyph name={g==="prevention"?"shield":g==="detection"?"target":"flame"}/>{g}</button>)}</div>
   {view==="map"&&<nav className={s.paging} aria-label="Browse investigation groups"><button type="button" disabled={page===0} onClick={()=>changePage(page-1)} aria-label="Previous investigations">← Previous</button><p role="status">Studies {page*PAGE_SIZE+1}–{Math.min((page+1)*PAGE_SIZE,studies.length)} <span>of {studies.length}</span></p><button type="button" disabled={page===pages-1} onClick={()=>changePage(page+1)} aria-label="Next investigations">Next →</button></nav>}
   <div className={s.canvas} data-view={view}>
    {view==="map"&&<svg className={s.connections} viewBox="0 0 900 650" preserveAspectRatio="none" aria-hidden="true"><ellipse className={s.orbit} cx="450" cy="325" rx="300" ry="225"/>{displayed.map((node,index)=><path key={node.id} d={curve(slots[index])} className={node.id===study.id?s.activeEdge:node.goals.includes(goal)?s.edge:s.dimEdge}/>)}</svg>}
    {view==="map"&&<div className={s.hub} aria-hidden="true"><Glyph name="flame"/><strong>Combustion<br/>evidence</strong><span>NASA RESEARCH</span></div>}
    {displayed.map((node,index)=><button key={node.id} type="button" className={s.studyNode} data-slot={index} data-highlight={node.goals.includes(goal)} aria-pressed={node.id===study.id} aria-label={`Explore ${node.name}`} onClick={()=>choose(node.id)}><span className={s.nodeOrb}><Glyph name={node.phase==="smoke"?"target":"flame"}/></span><strong>{short(node.name)}</strong><small>{node.testCount?`${node.testCount} curated test rows`:"Profile + source evidence"}</small></button>)}
   </div>
   <footer className={s.mapFoot}><span><i/> Selected investigation</span><p>Links show study membership. They do not imply cause and effect.</p></footer>
  </div>
  <aside className={s.detail} aria-label="Selected investigation details">
   <div className={s.detailEyebrow}><span>STUDY {String(selectedIndex+1).padStart(2,"0")} / {studies.length}</span><Glyph name="spark"/></div>
   <div className={s.detailTitle}><span className={s.detailIcon}><Glyph name={study.phase==="smoke"?"target":"flame"}/></span><div><h3>{study.name}</h3><p>{study.gravity.replaceAll("-"," ")} · {study.phase} research</p></div></div>
   <div className={s.evidenceLabel}><i/>{study.findingScope==="related-program"?(study.id==="sofie"?"Parent-program context · no GEL results":"Precursor / program context · no Moon-surface results"):study.testCount?"Curated test records available":study.findingCount?"Publication evidence · no curated outcome rows":"Research objectives · results not curated"}</div>
   <div className={s.counts}><div><b>{study.testCount}</b><span>test rows</span></div><div><b>{study.findingCount}</b><span>findings</span></div><div><b>{study.references.length}</b><span>sources</span></div></div>
   <div className={s.detailTabs} role="tablist" aria-label="Investigation details">{detailTabs.map((tab,index)=><button key={tab} type="button" id={`evidence-tab-${tab}`} role="tab" tabIndex={detail===tab?0:-1} aria-selected={detail===tab} aria-controls="evidence-detail-panel" onClick={()=>setDetail(tab)} onKeyDown={event=>{
    if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
    event.preventDefault();const next=event.key==="Home"?0:event.key==="End"?2:(index+(event.key==="ArrowRight"?1:2))%3;
    setDetail(detailTabs[next]);event.currentTarget.parentElement?.querySelectorAll("button")[next]?.focus();
   }}>{tab}</button>)}</div>
   <div id="evidence-detail-panel" role="tabpanel" aria-labelledby={`evidence-tab-${detail}`} className={s.detailContent} key={`${study.id}:${detail}`}>
    {detail==="overview"&&<><h4>What it investigates</h4><p>{study.objective}</p><details className={s.hardware}><summary>Apparatus and variables</summary><p>{study.hardware}</p><div className={s.variables}>{study.variables.map(v=><span key={v}>{v}</span>)}</div></details></>}
    {detail==="sources"&&<><h4>Read the original evidence</h4><div className={s.references}>{study.references.map(ref=><a key={ref.id} href={ref.href} target="_blank" rel="noreferrer"><Glyph name="file"/><span><small>{ref.kind}</small>{ref.title}</span><Glyph name="external"/></a>)}</div></>}
    {detail==="findings"&&<><h4>What the publications say</h4>{study.excerpts.length?study.excerpts.map(f=><blockquote key={f.id}><span>{f.kind}</span><p>{f.quote}</p><a href={f.href} target="_blank" rel="noreferrer">{f.citation}<Glyph name="external"/></a></blockquote>):<p>No publication finding is curated here yet. The research objective does not substitute for a measured result.</p>}</>}
   </div>
   <details className={s.limitation}><summary>What this cannot establish</summary><p>{study.limitation}</p></details>
   <Link className={s.briefAction} href={`/investigations/${study.id}`}>Read full investigation brief <Glyph name="arrow"/></Link>
   <a className={s.sourceAction} href={study.source} target="_blank" rel="noreferrer">Open original source <Glyph name="external"/></a>
  </aside>
 </section>;
}
