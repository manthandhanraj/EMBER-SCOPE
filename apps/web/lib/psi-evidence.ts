import type {EvidenceItem} from "./ask-core.ts";
import {psiTables,psiKey} from "./psi-data";
/** Investigation profile -> its PSI experimental table (first table for accessions with several). */
const accession:Record<string,string>={bass2:"PSI-25",same:"PSI-102","same-r":"PSI-101",flex:"PSI-69",flex2:"PSI-68",saffire:"PSI-99",spice:"PSI-107",slice:"PSI-106",cfi:"PSI-39","cfi-g":"PSI-159",efield:"PSI-22",acme:"PSI-10"};
const QUESTION_ROUTES:[RegExp,string][]=[
 [/same[- ]?r|reflight/i,"PSI-101"],[/same|smoke|detector/i,"PSI-102"],[/flex[- ]?2/i,"PSI-68"],[/flex|droplet|heptane|methanol/i,"PSI-69"],
 [/cfi[- ]?g|cool flames? .*gas|butane|propane|ethane/i,"PSI-159"],[/cool flame|cfi|dodecane/i,"PSI-39"],[/e[- ]?field|electric/i,"PSI-22"],
 [/spice|smoke point|soot/i,"PSI-107"],[/slice|lift[- ]?off/i,"PSI-106"],[/saffire|large[- ]scale|cygnus/i,"PSI-99"],[/bass|solid|pmma|sibal/i,"PSI-25"],
];
/** Preserve original PSI table cells as source evidence without synthesizing outcome labels. */
export function psiEvidence(question:string,studyId?:string):EvidenceItem[]{
 const selected=studyId?accession[studyId]:QUESTION_ROUTES.find(([re])=>re.test(question))?.[1]??null;
 const table=psiTables.find(t=>t.accession===selected);if(!table)return [];
 const href=`https://psi.nasa.gov/physci/repo/data/investigations/${table.accession}`;
 return [{key:`P:${psiKey(table)}:table`,kind:"finding",title:`${table.accession} — imported PSI source table`,href,rung:"context",text:`IMPORTED SOURCE TABLE, NOT A VALIDATED PERFORMANCE DATASET. ${table.title}; ${table.fileName}; DOI ${table.doi}; ${table.rowCount} source rows. Row count is not a count of independent tests or detector-performance labels. Original column headers: ${table.columns.join("; ")}. Original cells, including unknowns and censored values, remain in the downloadable table. No missing physical values or outcome labels have been inferred. Source: ${href}.`}];
}
