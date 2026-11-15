import {psiCatalog,psiSummary,psiTable,psiCsv,psiKey,psiHarmonized} from "@/lib/psi-data";
import {harmonizedCsv} from "@/lib/psi-harmonized";
const FORMATS=["json","csv","harmonized","harmonized-csv"];
export async function GET(request:Request){
 const url=new URL(request.url),id=url.searchParams.get("accession"),format=url.searchParams.get("format")??"json";
 if(!FORMATS.includes(format))return Response.json({error:"Choose json, csv, harmonized or harmonized-csv"},{status:400});
 const headers=(type:"csv"|"json",name:string)=>({"Content-Type":type==="csv"?"text/csv; charset=utf-8":"application/json; charset=utf-8","Content-Disposition":`attachment; filename="${name}.${type}"`,"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
 if(format.startsWith("harmonized")){
  const rows=id?psiHarmonized.rows.filter(r=>r.accession===id):psiHarmonized.rows;
  if(id&&!rows.length)return Response.json({error:"No imported experimental table for this accession."},{status:404});
  const onlyReady=url.searchParams.get("ready")==="1",selected=onlyReady?rows.filter(r=>r.modelReady):rows;
  const name=`emberscope-psi-harmonized${id?`-${id}`:""}${onlyReady?"-model-ready":""}`;
  if(format==="harmonized-csv")return new Response(harmonizedCsv(selected),{headers:headers("csv",name)});
  const {rows:_all,...meta}=psiHarmonized;void _all;
  return new Response(JSON.stringify({...meta,rows:selected},null,2),{headers:headers("json",name)});
 }
 const table=id?psiTable(id):null;
 if(id&&!table)return Response.json({error:"No imported experimental table for this accession. Open its PSI landing page for the full file inventory."},{status:404});
 if(format==="csv"&&!table)return Response.json({error:"Choose an imported experimental-table accession for CSV."},{status:400});
 const body=table?(format==="csv"?psiCsv(table):JSON.stringify(table,null,2)):JSON.stringify({schemaVersion:psiCatalog.schemaVersion,builtAt:psiCatalog.builtAt,sourceUrl:psiCatalog.sourceUrl,scope:psiCatalog.scope,investigations:psiSummary},null,2);
 return new Response(body,{headers:headers(format==="csv"?"csv":"json",`emberscope-${table?psiKey(table).replace(":","-"):"psi-catalog"}`)});
}
