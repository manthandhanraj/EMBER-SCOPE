import {experiments,saffireRuns,luciRuns,sources} from "@/lib/data";
import psiJson from "@/data/psi-numerical.json";
import {modelDataCsv,prepareModelData,workspaceInput,psiModelPacket,psiModelCsv,type PsiExperimentalTable} from "@/lib/model-workspace";

export async function GET(request:Request){
 const params=new URL(request.url).searchParams,format=params.get("format")??"json",part=params.get("part")??"rows";
 if(!["json","csv"].includes(format)||!["rows","excluded"].includes(part))return Response.json({error:"Choose format=json|csv and part=rows|excluded."},{status:400});
 try{
  if(params.get("source")==="psi"){
   const packet=psiModelPacket(psiJson.tables as PsiExperimentalTable[],params.get("accession")??"");
   return new Response(format==="csv"?psiModelCsv(packet):JSON.stringify(packet,null,2),{headers:{"Content-Type":format==="csv"?"text/csv; charset=utf-8":"application/json; charset=utf-8","Content-Disposition":`attachment; filename="emberscope-${packet.table.accession}-model-source.${format}"`,"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
  }
  if(params.has("source")&&params.get("source")!=="curated")return Response.json({error:"Choose source=curated|psi."},{status:400});
  const input=workspaceInput(Object.fromEntries(params)),packet=prepareModelData({experiments,saffireRuns,luciRuns,sources},input);
  return new Response(format==="csv"?modelDataCsv(packet,part as "rows"|"excluded"):JSON.stringify(packet,null,2),{headers:{"Content-Type":format==="csv"?"text/csv; charset=utf-8":"application/json; charset=utf-8","Content-Disposition":`attachment; filename="emberscope-${input.target}-${format==="csv"?part:"packet"}.${format}"`,"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
 }catch(error){return Response.json({error:error instanceof Error?error.message:"Invalid extraction filters."},{status:400});}
}
