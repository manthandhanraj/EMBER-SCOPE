import {ResearchDashboard} from "@/components/research/ResearchDashboard";
import {researchInput} from "@/lib/research";
export const metadata={title:"Research dashboard"};
export default async function ResearchPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const raw=await searchParams;
  const values=Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,Array.isArray(v)?v[0]:v]));
  try{return <ResearchDashboard input={researchInput(values)} view={values.view}/>;}
  catch(error){return <section className="mx-auto max-w-4xl p-10"><h1 className="text-2xl">Check the research conditions</h1><p className="mt-4">{error instanceof Error?error.message:"Invalid conditions"}</p><a href="/research" className="link mt-6 inline-block">Reset research question →</a></section>;}
}
