"use client";
import Link from "next/link";
import {useMemo,useState} from "react";
import type {ResearchGoal} from "@/lib/research";
import {Glyph} from "./Glyph";
import s from "./InvestigationSummary.module.css";

export type LibraryStudy={id:string;name:string;summary:string;objective:string;fuels:string;phase:string;goals:ResearchGoal[];testCount:number;observationCount:number;contextCount:number;ready:boolean;searchText:string};
export function SummaryLibrary({studies}:{studies:LibraryStudy[]}){
 const [search,setSearch]=useState(""),[goal,setGoal]=useState("all"),[phase,setPhase]=useState("all");
 const shown=useMemo(()=>studies.filter(study=>(goal==="all"||study.goals.includes(goal as ResearchGoal))&&(phase==="all"||study.phase===phase)&&`${study.name} ${study.summary} ${study.objective} ${study.fuels} ${study.searchText}`.toLowerCase().includes(search.toLowerCase().trim())),[studies,search,goal,phase]);
 return <section className={s.library} aria-labelledby="summary-library-title"><div className={s.libraryHead}><div><p className={s.kicker}>SOURCE-LINKED INVESTIGATION BRIEFS</p><h2 id="summary-library-title">Understand the whole investigation.</h2></div><span>{studies.filter(x=>x.ready).length} / {studies.length} briefs available</span></div>
  <div className={s.filters}><label>Find an investigation<div><Glyph name="search"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, material or research topic"/></div></label><label>Research goal<select value={goal} onChange={e=>setGoal(e.target.value)}><option value="all">All goals</option><option value="prevention">Prevention</option><option value="detection">Detection</option><option value="suppression">Suppression</option></select></label><label>Fuel / phase<select value={phase} onChange={e=>setPhase(e.target.value)}><option value="all">All phases</option>{[...new Set(studies.map(s=>s.phase))].sort().map(p=><option key={p} value={p}>{p}</option>)}</select></label></div>
  <p className={s.resultCount} role="status">{shown.length} of {studies.length} investigations · availability describes the briefs, not completeness of NASA research or expert validation.</p>
  <div className={s.libraryCards}>{shown.map(study=><article key={study.id}><div className={s.badges}><span>{study.phase}</span><span>{study.goals.join(" · ")}</span></div><h3>{study.name}</h3><p>{study.summary}</p><dl><div><dt>Test rows</dt><dd>{study.testCount}</dd></div><div><dt>Result quotes</dt><dd>{study.observationCount}</dd></div><div><dt>Context quotes</dt><dd>{study.contextCount}</dd></div></dl><Link href={`/investigations/${study.id}`}>Read investigation brief <Glyph name="arrow"/></Link></article>)}</div>
  {!shown.length&&<div className={s.empty}><p>No investigation matches these filters.</p><button type="button" onClick={()=>{setSearch("");setGoal("all");setPhase("all");}}>Clear filters</button></div>}
 </section>;
}
