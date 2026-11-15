import { flammabilityData } from "@/lib/flammability-data";

export async function GET() {
  const { map, gravity } = flammabilityData();
  const body = {
    version: map.version,
    scope: map.scope,
    method: "Observed ignition bracket per material (highest oxygen without a flame, lowest with one); low-flow quench and blowoff speeds as reported; grouped (session) cross-validation of oxygen and airflow as ignition predictors; Saffire burns and candidate atmospheres as references only. Nothing is extrapolated beyond the tested oxygen range.",
    flammabilityMap: map,
    partialGravity: gravity,
  };
  return new Response(JSON.stringify(body, null, 2), { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": 'attachment; filename="emberscope-flammability.json"', "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
