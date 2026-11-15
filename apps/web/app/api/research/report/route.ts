import {evidenceRecords,findings,sources} from "@/lib/data";
import investigationJson from "@/data/investigations.json";
import {type Investigation,researchInput,researchReport,reportMarkdown} from "@/lib/research";
import {semanticRanking} from "@/lib/local-ai";
export async function GET(request:Request){
  try{
    const url=new URL(request.url);
    const input=researchInput(Object.fromEntries(url.searchParams));
    const report=researchReport(investigationJson as Investigation[],evidenceRecords,findings,input,await semanticRanking(investigationJson as Investigation[],input));
    const markdown=url.searchParams.get("format")==="markdown";
    const referencedFindings=report.rankedFindings.map(result=>({
      ...result,finding:findings.find(f=>f.id===result.findingId),
      source:sources.find(s=>s.source_id===findings.find(f=>f.id===result.findingId)?.source_id),
    }));
    return new Response(markdown?reportMarkdown(report,findings,sources):JSON.stringify({...report,referencedFindings},null,2),{headers:{
      "Content-Type":markdown?"text/markdown; charset=utf-8":"application/json; charset=utf-8",
      "Content-Disposition":`attachment; filename="emberscope-research-brief.${markdown?"md":"json"}"`,"Cache-Control":"no-store"}});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Invalid question"},{status:400});}
}
