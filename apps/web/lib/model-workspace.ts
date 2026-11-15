import type {Experiment,LuciRun,SaffireRun,Source} from "./types.ts";
import {buildDataset,metrics,train,type Row} from "./model-lab.ts";

export type WorkspaceTarget="catalog"|"ignition"|"spread";
export type WorkspaceFamily="all"|"bass2"|"saffire"|"luci";
export type WorkspaceInput={target:WorkspaceTarget;family:WorkspaceFamily;material:string};
export const TARGETS={
 catalog:{name:"All-record feature catalog",label:"No common learning target",description:"Inspect the three source-specific schemas together. Null means unreported; records are not pooled into a shared outcome model."},
 ignition:{name:"BASS-II flame establishment",label:"Flame established after ignition attempt (0 / 1)",description:"A coded ignition-establishment target, not final flame survival, extinction threshold or fire risk. Reused samples, suspect oxygen and unsupported materials are excluded."},
 spread:{name:"Saffire reported spread rate",label:"Reported spread rate (mm/s)",description:"Only Saffire rows with an explicit reported rate and initial oxygen/airflow. Four available rows are suitable for extraction, not a validated general predictor."},
} as const;
export const WORKSPACE_VERSION="emberscope-model-data-1";
export const WORKSPACE_UNITS={oxygen_vol_pct:"volume percent",pressure_min_kpa:"kPa",pressure_max_kpa:"kPa",airflow_cm_s:"cm/s; initial/reported value",size_cm:"cm; largest reported dimension",thickness_mm:"mm",width_mm:"mm",length_mm:"mm",target_value:"0/1 for ignition; mm/s for spread; null for catalog"};
export const WORKSPACE_LIMITS=[
 "A source-coded label is not a directly measured probability or independent scientific validation.",
 "Final extinguishment may be caused by deliberate airflow changes. It is not used as the ignition-establishment target.",
 "Microgravity, simulated lunar gravity, material phases and different experimental scales must not be treated as interchangeable.",
 "The split keeps known campaigns/sessions together. Unresolved PMMA sessions are conservatively grouped together; unknown dependencies may remain.",
 "No missing value is imputed. Numerical envelopes and a low error on this small corpus do not establish safety or transfer to another habitat.",
 "There is no independent external test set. The reproducible split is a starting point for research; do not tune on its test rows.",
];
export type PreparedRow={id:string;family:Exclude<WorkspaceFamily,"all">;material:string;geometry:string;gravity:string;oxygen_vol_pct:number|null;pressure_min_kpa:number|null;pressure_max_kpa:number|null;airflow_cm_s:number|null;size_cm:number|null;thickness_mm:number|null;width_mm:number|null;length_mm:number|null;flow_direction:string|null;reported_outcome:string;target_name:string;target_value:number|null;target_label:string|null;group:string;split:"train"|"test"|"unassigned";source_id:string;pdf_page:number|null;source_url:string|null;source_sha256:string|null;label_source_url:string|null;label_pdf_page:number|null;quality_flags:string[];notes:string[]};
export type ExcludedRow={id:string;family:string;material:string;reasons:string[];source_url:string|null};
type Data={experiments:Experiment[];saffireRuns:SaffireRun[];luciRuns:LuciRun[];sources:Source[]};
const finite=(n:number|null|undefined)=>typeof n==="number"&&Number.isFinite(n)?n:null;
const largest=(...ns:(number|null|undefined)[])=>{const values=ns.filter((n):n is number=>finite(n)!==null);return values.length?Math.max(...values):null;};
const href=(sources:Source[],id:string|undefined,page:number|undefined|null)=>{
 const source=sources.find(s=>s.source_id===id);if(!source)return null;
 return page&&source.pdf_url?`${source.pdf_url}#page=${page}`:source.url;
};
export function workspaceInput(raw:Record<string,unknown>):WorkspaceInput{
 const target=String(raw.target??"ignition"),family=String(raw.family??"all"),material=String(raw.material??"").trim();
 if(!Object.hasOwn(TARGETS,target))throw new Error("Choose catalog, ignition or spread.");
 if(!["all","bass2","saffire","luci"].includes(family))throw new Error("Choose a supported experimental family.");
 if(material.length>100)throw new Error("Material filter is too long.");
 return {target:target as WorkspaceTarget,family:family as WorkspaceFamily,material};
}
/** Unknown session IDs are not silently treated as independent experiments. */
export function modelGroup(family:PreparedRow["family"],test:string,material:string){
 if(family==="saffire")return `saffire:flight:${test}`;
 if(family==="luci")return "luci:shared-flight";
 const day=test.match(/^GMT\d+/i)?.[0];
 return day?`bass2:session:${day.toUpperCase()}`:`bass2:unresolved-session:${material}`;
}
const hash=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;};
export function groupedSplit(rows:PreparedRow[],seed="emberscope-v1"){
 const groups=[...new Set(rows.map(r=>r.group))].sort((a,b)=>hash(`${seed}:${a}`)-hash(`${seed}:${b}`)||a.localeCompare(b));
 const count=groups.length<2?0:Math.max(1,Math.round(groups.length*.2));
 const test=new Set(groups.slice(0,count));
 return rows.map(r=>({...r,split:groups.length<2?"unassigned" as const:test.has(r.group)?"test" as const:"train" as const}));
}
const knownIgnition=new Set(["not_ignited","no_sustained_flame","sustained_no_blowoff","burned_entire_sample","burned_outcome_not_stated","quenched_low_flow","extinguished_flow_off","blowoff"]);

export function prepareModelData(data:Data,input:WorkspaceInput){
 const base:PreparedRow[]=[];
 const labelById=new Map(buildDataset(data.experiments).rows.map(r=>[r.id,r]));
 const excludedById=new Map(buildDataset(data.experiments).excluded.map(r=>[r.id,r.reason]));
 const citation=(id:string,page:number|null)=>({source_id:id,pdf_page:page,source_url:href(data.sources,id,page),source_sha256:data.sources.find(s=>s.source_id===id)?.sha256??null});
 for(const e of data.experiments){
  const c=e.provenance.record,p=e.pressure_kpa!=null?[e.pressure_kpa,e.pressure_kpa]:e.pressure_kpa_range;
  const sizeMm=largest(e.width_mm,e.length_mm);
  base.push({id:e.id,family:"bass2",material:e.material,geometry:e.geometry,gravity:e.gravity_regime,oxygen_vol_pct:finite(e.oxygen_vol_pct),pressure_min_kpa:finite(p?.[0]),pressure_max_kpa:finite(p?.[1]),airflow_cm_s:finite(e.flow_initial_cm_s),size_cm:sizeMm===null?null:sizeMm/10,thickness_mm:finite(e.thickness_mm),width_mm:finite(e.width_mm),length_mm:finite(e.length_mm),flow_direction:e.flow_direction,reported_outcome:e.outcome_label,target_name:"none",target_value:null,target_label:null,group:modelGroup("bass2",e.test_id,e.material),split:"unassigned",...citation(c.source_id,c.pdf_page),label_source_url:href(data.sources,c.source_id,c.pdf_page),label_pdf_page:c.pdf_page,quality_flags:[...e.quality_flags],notes:["Final outcome and ignition-establishment are different labels."]});
 }
 for(const r of data.saffireRuns){
  const c=r.provenance.conditions??r.provenance.results??r.provenance.outcome,l=r.provenance.results;
  base.push({id:r.id,family:"saffire",material:r.material,geometry:r.geometry,gravity:r.gravity_regime,oxygen_vol_pct:finite(r.o2_pct),pressure_min_kpa:finite(r.pressure_kpa),pressure_max_kpa:finite(r.pressure_kpa),airflow_cm_s:finite(r.flow_cm_s),size_cm:largest(r.width_cm,r.length_cm),thickness_mm:finite(r.thickness_mm),width_mm:r.width_cm==null?null:finite(r.width_cm*10),length_mm:r.length_cm==null?null:finite(r.length_cm*10),flow_direction:r.flow_direction,reported_outcome:r.outcome_label,target_name:"none",target_value:null,target_label:null,group:modelGroup("saffire",r.flight,r.material),split:"unassigned",...citation(c?.source_id??"",c?.pdf_page??null),label_source_url:href(data.sources,l?.source_id,l?.pdf_page),label_pdf_page:l?.pdf_page??null,quality_flags:[],notes:[...r.notes,...(r.o2_basis?[`Oxygen basis: ${r.o2_basis}`]:[])]});
 }
 for(const r of data.luciRuns){
  const c=r.provenance.outcome??r.provenance.o2_start_pct;
  base.push({id:r.id,family:"luci",material:r.material,geometry:r.material==="PMMA"?"rod":"sheet",gravity:`simulated lunar; ${r.gravity_note}`,oxygen_vol_pct:finite(r.o2_start_pct),pressure_min_kpa:finite(r.pressure_kpa),pressure_max_kpa:finite(r.pressure_kpa),airflow_cm_s:null,size_cm:r.material==="PMMA"?null:30,thickness_mm:null,width_mm:null,length_mm:null,flow_direction:r.direction,reported_outcome:r.outcome_label,target_name:"none",target_value:null,target_label:null,group:modelGroup("luci",r.id,r.material),split:"unassigned",...citation(c?.source_id??"",c?.pdf_page??null),label_source_url:null,label_pdf_page:null,quality_flags:["simulated_gravity","changing_oxygen"],notes:[r.gravity_note,`Oxygen changed from ${r.o2_start_pct} to ${r.o2_end_pct} vol %. LUCI base and tip spread rates are not pooled with Saffire's reported spread rate.`]});
 }
 const selected=base.filter(r=>(input.family==="all"||r.family===input.family)&&(!input.material||r.material.toLowerCase()===input.material.toLowerCase()));
 const rows:PreparedRow[]=[],excluded:ExcludedRow[]=[];
 for(const raw of selected){
  const r={...raw},reasons:string[]=[];
  if(input.target==="ignition"){
   r.target_name="flame_established_after_ignition_attempt";
   if(r.family!=="bass2")reasons.push("Different experiment/protocol; target is defined only for BASS-II test-table comments.");
   else{
    const e=data.experiments.find(e=>e.id===r.id)!,label=labelById.get(r.id);
    if(excludedById.has(r.id))reasons.push(excludedById.get(r.id)!);
    if(!knownIgnition.has(e.outcome))reasons.push("The original outcome code has no reviewed ignition-establishment mapping.");
    if(label){r.target_value=label.y;r.target_label=label.y?"Flame established":"No flame established";}
   }
  }
  if(input.target==="spread"){
   r.target_name="reported_spread_rate_mm_s";
   if(r.family!=="saffire")reasons.push("Different rate definition/protocol; this target includes Saffire only.");
   else {const value=finite(data.saffireRuns.find(s=>s.id===r.id)?.spread_rate_mm_s);if(value===null)reasons.push("No numerical spread rate is reported in the curated row.");else{r.target_value=value;r.target_label=`${value} mm/s`;}}
  }
  if(input.target!=="catalog"){
   if(r.oxygen_vol_pct===null)reasons.push("Initial/reported oxygen value is missing or nonfinite.");
   if(r.airflow_cm_s===null)reasons.push("Initial/reported airflow is missing or nonfinite.");
   if(!r.source_url||!r.label_source_url)reasons.push("Feature or target citation is unavailable.");
  }
  if(reasons.length)excluded.push({id:r.id,family:r.family,material:r.material,reasons,source_url:r.source_url});else rows.push(r);
 }
 const split=input.target==="catalog"?rows:groupedSplit(rows);
 return {version:WORKSPACE_VERSION,input,target:TARGETS[input.target],selectedCount:selected.length,rows:split,excluded,units:WORKSPACE_UNITS,
  split:{seed:"emberscope-v1",method:"Hash-ordered 80/20 group split; at least one group held out when two or more groups exist. Approximate proportions are by group, not by row.",groups:[...new Set(split.map(r=>r.group))].length,train:split.filter(r=>r.split==="train").length,test:split.filter(r=>r.split==="test").length,unassigned:split.filter(r=>r.split==="unassigned").length},
  featurePolicy:"Use only pre-test oxygen, initial airflow and material for the ignition model. ID, source/page, group, outcome text, final airflow and target-derived notes are audit columns and must never become input features.",
  limitations:WORKSPACE_LIMITS};
}
export type ModelDataPacket=ReturnType<typeof prepareModelData>;

/** Conservative leave-one-known-group-out diagnostics; no row from a held-out group is used for fitting. */
export function ignitionDiagnostics(packet:ModelDataPacket){
 const rows:Row[]=packet.input.target==="ignition"?packet.rows.map(r=>({id:r.id,test:r.id,material:r.material as Row["material"],o2:r.oxygen_vol_pct!,flow:r.airflow_cm_s!,y:r.target_value as 0|1,session:r.group,outcome:r.reported_outcome,cite:{source_id:r.source_id,pdf_page:r.pdf_page!,where:"source test table"}})):[];
 const groups=[...new Set(rows.map(r=>r.session))];
 if(rows.length<8||groups.length<3||new Set(rows.map(r=>r.y)).size<2)return {available:false as const,reason:"At least eight eligible rows, three independent grouping units and both target classes are needed for this diagnostic.",rows,models:[]};
 const models=(["baseline","logit-o2-material","logit-o2-flow-material"] as const).map(id=>{
  const predictions=new Array<number>(rows.length);
  for(const group of groups){const training=rows.filter(r=>r.session!==group),model=train(id,training);rows.forEach((r,i)=>{if(r.session===group)predictions[i]=model(r);});}
  const score=metrics(predictions,rows.map(r=>r.y));
  return {id,name:id==="baseline"?"Training-rate baseline":id==="logit-o2-material"?"Logistic: oxygen + material":"Logistic: oxygen + airflow + material",...score,auc:id==="baseline"?null:score.auc};
 });
 return {available:true as const,rows,groups:groups.length,models,reason:"Leave one known group out. All PMMA rows share one conservative unresolved-session group. A high score on this small source-coded corpus is not independent validation."};
}
const csvCell=(value:unknown)=>{const text=Array.isArray(value)?value.join(" | "):value==null?"":String(value);const numeric=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(text)&&Number.isFinite(Number(text));const safe=!numeric&&(/^[\t\r]/.test(text)||/^\s*[=+\-@]/.test(text))?`'${text}`:text;return `"${safe.replace(/"/g,'""')}"`;};
export function modelDataCsv(packet:ModelDataPacket,part:"rows"|"excluded"="rows"){
 const columns=part==="excluded"?["id","family","material","reasons","source_url"]:["id","family","material","geometry","gravity","oxygen_vol_pct","pressure_min_kpa","pressure_max_kpa","airflow_cm_s","size_cm","thickness_mm","width_mm","length_mm","flow_direction","reported_outcome","target_name","target_value","target_label","group","split","source_id","pdf_page","source_url","source_sha256","label_source_url","label_pdf_page","quality_flags","notes"];
 const records=part==="excluded"?packet.excluded:packet.rows;
 return [columns.map(csvCell).join(","),...records.map(r=>columns.map(c=>csvCell((r as unknown as Record<string,unknown>)[c])).join(","))].join("\r\n");
}

export type PsiExperimentalTable={accession:string;title:string;fileName:string;investigationVersion:number;fileVersion:number;doi:string;license:string;columns:string[];rows:Record<string,string|null>[];rowCount:number;valueEncoding:string;scope:string;provenance:{metadataUrl:string;landingUrl:string;downloadServiceUrl:string;sha256:string;retrievedAt:string}};
/** Original table strings retain ranges, censored values and source-specific units; no inferred target is added. */
/** Stable table key: the accession for its first table, "PSI-10:2" for an accession's second table, and so on. */
export function psiTableKey(tables:PsiExperimentalTable[],table:PsiExperimentalTable){
 const index=tables.filter(t=>t.accession===table.accession).indexOf(table);
 return index>0?`${table.accession}:${index+1}`:table.accession;
}
export function findPsiTable(tables:PsiExperimentalTable[],key:string){
 const m=/^(PSI-\d{1,6})(?::(\d{1,2}))?$/.exec(key);
 return m?tables.filter(t=>t.accession===m[1])[Number(m[2]??1)-1]:undefined;
}
export function psiModelPacket(tables:PsiExperimentalTable[],accession:string){
 const table=findPsiTable(tables,accession);
 if(!table)throw new Error("Choose an available imported PSI table accession.");
 return {version:"emberscope-psi-model-source-1",table,learningStatus:"Source table available; target/units/protocol review required before model training.",conversionPolicy:"Cell strings and nulls are retained. CSV adds audit columns; JSON preserves the source table values. No censored value, range or apparatus display is coerced into a scalar.",leakagePolicy:"Test end, measured extinction diameter, burn time and other post-test outcomes must not be used as pre-test predictors for the same target. Group repeat sessions, sample reuse and flights before any split.",reviewRequired:["Confirm each field's physical definition and units in the source documentation.","Define a measured outcome and document censored/aborted/missing observations.","Verify run identity and repeated-measurement grouping; do not merge with NTRS-curated rows without record-level deduplication.","SAME/SAME-R apparatus and smoke-generation parameters do not by themselves establish detector sensitivity, false alarms or certified alarm response."]};
}
export function psiModelCsv(packet:ReturnType<typeof psiModelPacket>){
 const {table}=packet,audit=["_psi_accession","_psi_row_1based","_psi_doi","_psi_license","_psi_investigation_version","_psi_file_version","_psi_sha256","_psi_landing_url"];
 return [[...audit,...table.columns].map(csvCell).join(","),...table.rows.map((row,i)=>[table.accession,i+1,table.doi,table.license,table.investigationVersion,table.fileVersion,table.provenance.sha256,table.provenance.landingUrl,...table.columns.map(c=>row[c])].map(csvCell).join(","))].join("\r\n");
}
