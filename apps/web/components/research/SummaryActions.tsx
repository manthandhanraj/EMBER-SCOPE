"use client";
import {useState} from "react";
import s from "./InvestigationSummary.module.css";
export function SummaryActions({markdown}:{markdown:string}){
 const [status,setStatus]=useState("");
 async function copy(){try{await navigator.clipboard.writeText(markdown);setStatus("Brief copied.");}catch{setStatus("Copy unavailable; use the Markdown download.");}}
 return <><button type="button" onClick={copy}>Copy brief</button><button type="button" onClick={()=>window.print()}>Print / save PDF</button><span className={s.copyStatus} role="status">{status}</span></>;
}
