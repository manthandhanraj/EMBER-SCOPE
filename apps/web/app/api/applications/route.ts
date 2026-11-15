import applications from "@/data/research-applications.json";
export async function GET(){return Response.json({schemaVersion:"emberscope-research-applications-1",scope:"Source-linked research implications, not operational equipment prescriptions or certification.",applications},{headers:{"Content-Disposition":"attachment; filename=emberscope-applications.json","Cache-Control":"no-store"}});}
