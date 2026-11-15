import { experiments, findings, luciRuns, saffireRuns } from "./data";
import { flammabilityMap, gravityBounds } from "./flammability";

/** Computed once per server process: the map runs grouped cross-validation (about half a second). */
let cache: { map: ReturnType<typeof flammabilityMap>; gravity: ReturnType<typeof gravityBounds> } | null = null;
export function flammabilityData() {
  cache ??= { map: flammabilityMap(experiments, saffireRuns), gravity: gravityBounds(experiments, saffireRuns, luciRuns, findings) };
  return cache;
}
