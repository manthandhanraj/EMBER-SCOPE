import type {EvidenceRecord} from "./ontology.ts";

export type CountBar={label:string;value:number};
/** Counts describe the curated corpus, never independent trials or a fire probability. */
export function recordOverview(records:EvidenceRecord[]){
 const counts=(values:string[]):CountBar[]=>[...new Set(values)].map(label=>({label,value:values.filter(x=>x===label).length})).sort((a,b)=>b.value-a.value||a.label.localeCompare(b.label));
 const labels:Record<string,string>={sustained:"Sustained burning",extinguished:"Extinguished",not_ignited:"No ignition",unknown:"End state not stated"};
 const outcomes=counts(records.map(r=>r.outcome)).map(row=>({...row,label:labels[row.label]??row.label}));
 const known=(key:"oxygen"|"flowCmS"|"pressureKpa")=>records.filter(r=>key==="pressureKpa"?!!r.pressureKpa&&r.pressureKpa.length===2&&r.pressureKpa.every(Number.isFinite):typeof r[key]==="number"&&Number.isFinite(r[key])).length;
 return {total:records.length,outcomes,materials:counts(records.map(r=>r.material)),conditions:[{label:"Oxygen",value:known("oxygen")},{label:"Airflow",value:known("flowCmS")},{label:"Pressure",value:known("pressureKpa")}].map(row=>({...row,unknown:records.length-row.value}))};
}
