import type {Investigation,ResearchInput} from "./research.ts";

const localOrigin=()=>{
 const url=new URL(process.env.OLLAMA_BASE_URL??"http://127.0.0.1:11434");
 if(!["127.0.0.1","localhost","[::1]"].includes(url.hostname)||url.protocol!=="http:"||url.username||url.password)throw new Error("Local AI requires a loopback HTTP address.");
 return url.origin;
};
export const localChatModel=()=>process.env.OLLAMA_MODEL??"qwen2.5:7b-instruct";
export const localEmbedModel=()=>process.env.OLLAMA_EMBED_MODEL??"all-minilm";
export async function localModels(){
 if(process.env.OLLAMA_DISABLED==="1")return [];
 const response=await fetch(`${localOrigin()}/api/tags`,{signal:AbortSignal.timeout(1800),cache:"no-store"});
 if(!response.ok)throw new Error("Local model service unavailable");
 const data=await response.json();return (data.models??[]) as {name:string;digest?:string}[];
}
export async function localChat(system:string,user:string,schema:unknown){
 const response=await fetch(`${localOrigin()}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:localChatModel(),messages:[{role:"system",content:system},{role:"user",content:user}],format:schema,stream:false,options:{temperature:0,num_predict:1500,num_ctx:8192},keep_alive:"10m"}),signal:AbortSignal.timeout(150_000),cache:"no-store"});
 if(!response.ok)throw new Error(`Local model returned ${response.status}`);
 const data=await response.json();return {parsed:JSON.parse(data.message?.content??""),provider:`ollama:${localChatModel()}`,durationMs:Math.round((data.total_duration??0)/1e6)};
}
const vectors=new Map<string,number[]>();
async function embeddings(texts:string[]){
 const model=localEmbedModel(),missing=[...new Set(texts)].filter(t=>!vectors.has(`${model}:${t}`));
 if(missing.length){const response=await fetch(`${localOrigin()}/api/embed`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model,input:missing,truncate:true,keep_alive:"10m"}),signal:AbortSignal.timeout(25_000),cache:"no-store"});
  if(!response.ok)throw new Error("Embedding model unavailable");const data=await response.json();
  if(!Array.isArray(data.embeddings)||data.embeddings.length!==missing.length)throw new Error("Invalid embedding response");
  data.embeddings.forEach((v:unknown,i:number)=>{if(!Array.isArray(v)||!v.length||!v.every(n=>typeof n==="number"&&Number.isFinite(n)))throw new Error("Invalid embedding vector");vectors.set(`${model}:${missing[i]}`,v);});
 }
 const requested=texts.map(t=>vectors.get(`${model}:${t}`)!);
 if(vectors.size>500)for(const key of [...vectors.keys()].filter(k=>!texts.some(t=>k===`${model}:${t}`)).slice(0,vectors.size-400))vectors.delete(key);
 return requested;
}
export function cosine(a:number[],b:number[]){if(!a.length||a.length!==b.length)return 0;const norm=Math.sqrt(a.reduce((n,x)=>n+x*x,0)*b.reduce((n,x)=>n+x*x,0));return norm?a.reduce((n,x,i)=>n+x*b[i],0)/norm:0;}
export type SemanticResult={available:boolean;model:string;similarities:Record<string,number>;reason:string};
export async function semanticRanking(studies:Investigation[],input:ResearchInput):Promise<SemanticResult>{
 const model=localEmbedModel();
 if(!input.question)return {available:false,model,similarities:{},reason:"Enter a research question to use neural semantic ranking."};
 if(process.env.OLLAMA_DISABLED==="1")return {available:false,model,similarities:{},reason:"Local AI is disabled; transparent lexical/condition ranking is active."};
 try{
  const texts=[input.question,...studies.map(s=>`${s.name}. ${s.objective} ${s.summary} ${s.fuels} ${s.measurements} ${s.variables.join(" ")}`)];
  const result=await embeddings(texts);return {available:true,model,similarities:Object.fromEntries(studies.map((s,i)=>[s.id,cosine(result[0],result[i+1])])),reason:"Neural sentence-embedding similarity plus disclosed habitat, condition and evidence factors. Similarity is not scientific confidence."};
 }catch{return {available:false,model,similarities:{},reason:"Local embedding model is unavailable; disclosed lexical/condition ranking is active. Start the local AI engine or configure the model."};}
}
