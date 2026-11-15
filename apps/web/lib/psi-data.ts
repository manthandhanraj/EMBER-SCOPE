import catalogJson from "@/data/psi-catalog.json";
import numericalJson from "@/data/psi-numerical.json";
import {findPsiTable,psiTableKey,type PsiExperimentalTable} from "./model-workspace.ts";
import {harmonizeAll} from "./psi-harmonized.ts";
export type PsiInvestigation={accession:string;title:string;acronym:string;doi:string;version:number;license:string;objectives:string;approach:string;hardware:string;researchImpacts:string;project:{platform:string;start:string;end:string;researchArea:string;subResearchArea:string};listedFileCount:number;files:{name:string;category:string;restricted:boolean;experimentalTable:boolean;sourceUrl:string}[];provenance:{metadataUrl:string;landingUrl:string;sha256:string;retrievedAt:string}};
export type PsiTable=PsiExperimentalTable;
export const psiCatalog=catalogJson as unknown as {schemaVersion:string;builtAt:string;scope:string;sourceUrl:string;repositoryResultCount:number;investigations:PsiInvestigation[]};
export const psiTables=(numericalJson as unknown as {tables:PsiTable[]}).tables;
export const psiRowCount=psiTables.reduce((n,t)=>n+t.rowCount,0);
/** Accepts an accession (its first table) or a table key such as "PSI-10:2". */
export const psiTable=(key:string)=>findPsiTable(psiTables,key);
export const psiKey=(table:PsiTable)=>psiTableKey(psiTables,table);
export const psiHarmonized=harmonizeAll(psiTables);
export const psiSummary=psiCatalog.investigations.map(({files,...study})=>{
 const tables=psiTables.filter(t=>t.accession===study.accession).map(t=>({key:psiKey(t),fileName:t.fileName,rowCount:t.rowCount}));
 return {...study,sourceWarnings:[...(["PSI-98","PSI-100"].includes(study.accession)?["Repository platform metadata lists ISS, but NASA's Saffire campaign reports describe burns in uncrewed Cygnus cargo spacecraft. Preserve the original field for audit; use the campaign report for physical interpretation."]:[]),...(study.accession==="PSI-39"?["Repository objective and approach list inconsistent pressure ranges. Check original run documentation before using either as a numerical envelope."]:[])],fileCategories:Object.fromEntries([...new Set(files.map(f=>f.category))].map(category=>[category,files.filter(f=>f.category===category).length])),tables,table:tables.length?{rowCount:tables.reduce((n,t)=>n+t.rowCount,0),fileName:tables.map(t=>t.fileName).join("; ")}:null};
});
export function psiCsv(table:PsiTable){
 const cell=(value:string|null|undefined)=>{const text=String(value??"");const numeric=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(text)&&Number.isFinite(Number(text));const safe=!numeric&&(/^[\t\r]/.test(text)||/^\s*[=+\-@]/.test(text))?`'${text}`:text;return `"${safe.replaceAll('"','""')}"`;};
 return '﻿'+[table.columns.map(cell).join(","),...table.rows.map(row=>table.columns.map(c=>cell(row[c])).join(","))].join("\r\n");
}
