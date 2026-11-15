import {localModels,localChatModel,localEmbedModel} from "@/lib/local-ai";
export async function GET(){
 let models:{name:string;digest?:string}[]=[];try{models=await localModels();}catch{}
 const hosted=process.env.OPENAI_API_KEY?"openai":process.env.ANTHROPIC_API_KEY?"anthropic":null;
 return Response.json({schemaVersion:"emberscope-ai-status-1",hostedProvider:hosted,hostedCredentialsPresent:!!hosted,local:{reachable:models.length>0,chatModel:localChatModel(),chatAvailable:models.some(m=>m.name===localChatModel()),embeddingModel:localEmbedModel(),embeddingAvailable:models.some(m=>m.name===localEmbedModel()||m.name===`${localEmbedModel()}:latest`)},note:"Availability is not a quality evaluation. Hosted provider credentials are never returned. Local models run on this computer and are unavailable to a public Vercel server."},{headers:{"Cache-Control":"no-store"}});
}
