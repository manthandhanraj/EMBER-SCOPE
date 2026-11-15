"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useState} from "react";
import {useExplorer} from "@/components/guide/EmberGuide";
import {Glyph} from "./Glyph";
import {ThemeToggle} from "./ThemeToggle";
import s from "./ResearchNavigation.module.css";
const primary=[{href:"/research",label:"Overview",icon:"network"},{href:"/investigations",label:"Studies",icon:"book"},{href:"/research?view=report",label:"Reports",icon:"file"}];
const tools=[{href:"/psi",label:"NASA PSI data",description:"Original source tables and catalog",icon:"book"},{href:"/flammability",label:"Flammability charts",description:"Oxygen, airflow and measured outcomes",icon:"flame"},{href:"/model-lab",label:"Model workspace",description:"Prepare data and explore a bounded model",icon:"compare"},{href:"/applications",label:"Fire safety applications",description:"Equipment research and Earth benefits",icon:"shield"},{href:"/atlas",label:"Test library",description:"Inspect individual curated experiments",icon:"book"},{href:"/compare",label:"Compare tests",description:"See differences side by side",icon:"compare"},{href:"/gaps",label:"Research gaps",description:"See which conditions are missing",icon:"target"},{href:"/readiness",label:"Project checklist",description:"AI status and remaining review steps",icon:"target"},{href:"/sources",label:"Sources & methods",description:"Follow the evidence to its origin",icon:"file"}];
export function ResearchNavigation({initialTheme="dark"}:{initialTheme?:"dark"|"light"}){
 const path=usePathname(),[open,setOpen]=useState(false);const {gentle,setGentle,reducedMotion}=useExplorer();
 return <nav className={s.nav} aria-label="Research navigation" onKeyDown={e=>{if(e.key==="Escape")setOpen(false);}}>
  <div className={s.desktop}>{primary.map(link=><Link key={link.href} href={link.href} aria-current={path===link.href||(link.href==="/research"&&path==="/")?"page":undefined}><Glyph name={link.icon}/>{link.label}</Link>)}</div>
  <button type="button" className={s.toggle} aria-expanded={open} aria-controls="research-page-menu" onClick={()=>setOpen(!open)}><span className={s.desktopLabel}>Tools</span><span className={s.mobileLabel}>Menu</span><span aria-hidden="true">{open?"×":"☰"}</span></button>
  <ThemeToggle initialTheme={initialTheme}/>
  <button type="button" className={s.motion} disabled={reducedMotion} aria-pressed={gentle} aria-label={reducedMotion?"Motion reduced by system preference":gentle?"Resume animations":"Pause animations"} title={gentle?"Resume animations":"Pause animations"} onClick={()=>setGentle(!gentle)}><Glyph name={gentle?"play":"pause"}/><span>{gentle?"Motion off":"Motion on"}</span></button>
  {open&&<div id="research-page-menu" className={s.menu}><div className={s.mobilePrimary}>{primary.map(link=><Link key={link.href} href={link.href} onClick={()=>setOpen(false)}>{link.label}</Link>)}</div><p>Explore your workspace</p>{tools.map(link=><Link key={link.href} href={link.href} onClick={()=>setOpen(false)}><Glyph name={link.icon}/><span><b>{link.label}</b><small>{link.description}</small></span><Glyph name="arrow"/></Link>)}</div>}
 </nav>;
}
