import {investigationSummary} from "@/lib/investigation-data";
import {investigationMarkdown} from "@/lib/investigation-summary";

export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const summary=investigationSummary(id);
 if(!summary)return Response.json({error:"Investigation not found"},{status:404});
 const url=new URL(request.url),format=url.searchParams.get("format")??"json",mode=url.searchParams.get("mode")==="concise"?"concise":"detailed";
 if(!["json","markdown"].includes(format))return Response.json({error:"Choose json or markdown"},{status:400});
 return new Response(format==="markdown"?investigationMarkdown(summary,mode):JSON.stringify(summary,null,2),{headers:{
  "Content-Type":format==="markdown"?"text/markdown; charset=utf-8":"application/json; charset=utf-8",
  "Content-Disposition":`attachment; filename="emberscope-${summary.id}-summary.${format==="markdown"?"md":"json"}"`,
  "Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
}
