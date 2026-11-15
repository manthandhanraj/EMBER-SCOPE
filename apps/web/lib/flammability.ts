/**
 * Flammability map and partial-gravity bounds, built only from curated, page-cited NASA records.
 *
 * Flammability map (per material, BASS-II glovebox duct): each test placed at its oxygen and airflow, the observed
 * low-flow quench and blowoff points, and the observed oxygen bracket for ignition (highest oxygen without a flame,
 * lowest oxygen with one). Grouped cross-validation (model-lab.ts) tests whether oxygen and airflow predict ignition
 * out of sample. Atmosphere candidates are drawn as reference lines; nothing is extrapolated.
 *
 * Partial-gravity bounds (per material): the lowest oxygen at which a flame burned in microgravity, simulated lunar
 * gravity and Earth gravity, so a reader can see whether intermediate-gravity results fall between the two ends.
 */
import type { Experiment, Finding, LuciRun, SaffireRun } from "./types.ts";
import { buildDataset, chooseModel, evaluate, type Evaluation, type Row } from "./model-lab.ts";
import { ATMOSPHERES } from "./atmospheres.ts";

export const MAP_MATERIALS = ["SIBAL fabric", "PMMA"] as const;
export type MapMaterial = (typeof MAP_MATERIALS)[number];
export type Cite = { source_id: string; pdf_page: number | null };
export type MapPoint = { id: string; test: string; o2: number; flow: number; kind: "established" | "not-established" | "quench" | "blowoff" | "no-blowoff"; label: string; href: string; cite: Cite; detail: string };
/** Observed ignition bracket: highest oxygen with no flame established and lowest oxygen with one. */
export type Limit = { noFlameMax: number | null; flameMin: number | null; overlap: boolean };

const round = (x: number, d = 2) => Math.round(x * 10 ** d) / 10 ** d;

export function ignitionBracket(rows: Row[], material: string): Limit {
  const m = rows.filter((r) => r.material === material);
  const no = m.filter((r) => !r.y).map((r) => r.o2), yes = m.filter((r) => r.y).map((r) => r.o2);
  const noFlameMax = no.length ? Math.max(...no) : null, flameMin = yes.length ? Math.min(...yes) : null;
  return { noFlameMax, flameMin, overlap: noFlameMax != null && flameMin != null && noFlameMax >= flameMin };
}

function citeOf(e: Experiment): Cite { return { source_id: e.provenance.record.source_id, pdf_page: e.provenance.record.pdf_page ?? null }; }

/** Every point the map draws, per material. Final flows are only used when the source states them in cm/s. */
export function mapPoints(exps: Experiment[], rows: Row[]): Record<MapMaterial, MapPoint[]> {
  const used = new Set(rows.map((r) => r.id));
  const out = { "SIBAL fabric": [] as MapPoint[], PMMA: [] as MapPoint[] };
  for (const e of exps) {
    if (!(MAP_MATERIALS as readonly string[]).includes(e.material) || e.oxygen_vol_pct == null || e.flow_initial_cm_s == null) continue;
    const m = e.material as MapMaterial, base = { id: e.id, test: e.test_id, o2: e.oxygen_vol_pct, href: `/experiments/${e.id}`, cite: citeOf(e) };
    const row = rows.find((r) => r.id === e.id);
    if (used.has(e.id)) out[m].push({ ...base, flow: e.flow_initial_cm_s, kind: row!.y ? "established" : "not-established", label: row!.y ? "Flame established" : "No flame established", detail: `${e.outcome_label}; starting airflow ${e.flow_initial_cm_s} cm/s` });
    if (e.flow_final_cm_s != null && e.outcome === "quenched_low_flow") out[m].push({ ...base, id: `${e.id}-quench`, flow: e.flow_final_cm_s, kind: "quench", label: "Went out when airflow was lowered", detail: `Airflow lowered from ${e.flow_initial_cm_s} to ${e.flow_final_cm_s} cm/s (${e.flow_verbatim})` });
    if (e.flow_final_cm_s != null && e.outcome === "blowoff") out[m].push({ ...base, id: `${e.id}-blowoff`, flow: e.flow_final_cm_s, kind: "blowoff", label: "Blown out when airflow was raised", detail: `Airflow raised from ${e.flow_initial_cm_s} to ${e.flow_final_cm_s} cm/s` });
    if (e.flow_final_cm_s != null && e.outcome === "sustained_no_blowoff") out[m].push({ ...base, id: `${e.id}-noblow`, flow: e.flow_final_cm_s, kind: "no-blowoff", label: "Still burning at the highest airflow", detail: `Airflow raised from ${e.flow_initial_cm_s} to ${e.flow_final_cm_s} cm/s without blowoff` });
  }
  return out;
}

export type SaffireRef = { id: string; flight: string; material: string; o2: number; flow: number; burned: boolean; label: string; cite: Cite };
export function saffireReferences(runs: SaffireRun[]): SaffireRef[] {
  return runs.filter((r) => (MAP_MATERIALS as readonly string[]).includes(r.material) && r.o2_pct != null && r.flow_cm_s != null && r.outcome_group !== "unknown").map((r) => ({
    id: r.id, flight: r.flight, material: r.material, o2: r.o2_pct!, flow: r.flow_cm_s!, burned: r.outcome_group === "sustained", label: r.outcome_label,
    cite: { source_id: (r.provenance.conditions ?? r.provenance.results)?.source_id ?? "saffire", pdf_page: (r.provenance.conditions ?? r.provenance.results)?.pdf_page ?? null },
  }));
}

export type MapValidation = { n: number; negatives: number; chosen: string | null; rows: { id: string; name: string; auc: number | null; aucLo: number | null; aucHi: number | null; brier: number; logLoss: number }[] };
function validationSummary(rows: Row[], evals: Evaluation[]): MapValidation {
  const pick = ["baseline", "logit-o2-material", "logit-o2-flow-material"];
  return {
    n: rows.length, negatives: rows.filter((r) => !r.y).length, chosen: chooseModel(evals),
    rows: evals.filter((e) => pick.includes(e.id)).map((e) => ({ id: e.id, name: e.name, auc: e.grouped.auc, aucLo: e.grouped.ci.auc?.lo ?? null, aucHi: e.grouped.ci.auc?.hi ?? null, brier: e.grouped.brier, logLoss: e.grouped.logLoss })),
  };
}

/** Oxygen partial pressure is plain arithmetic: fraction x total pressure. */
export const o2PartialKpa = (o2Pct: number, kpa: number) => round((o2Pct / 100) * kpa, 1);

export function flammabilityMap(exps: Experiment[], saffire: SaffireRun[]) {
  const { rows, excluded } = buildDataset(exps);
  const evals = evaluate(rows);
  const limits = Object.fromEntries(MAP_MATERIALS.map((m) => [m, ignitionBracket(rows, m)])) as Record<MapMaterial, Limit>;
  const points = mapPoints(exps, rows);
  const refs = saffireReferences(saffire);
  const maxTestedO2 = Math.max(...exps.map((e) => e.oxygen_vol_pct ?? 0), ...refs.map((r) => r.o2));
  const atmospheres = ATMOSPHERES.filter((a) => a.o2 != null && a.kpa != null).map((a) => ({
    id: a.id, name: a.name, o2: a.o2!, kpa: a.kpa!, o2PartialKpa: o2PartialKpa(a.o2!, a.kpa!),
    tested: a.o2! <= maxTestedO2, aboveLimits: MAP_MATERIALS.map((m) => ({ material: m, margin: limits[m].flameMin != null ? round(a.o2! - limits[m].flameMin!, 1) : null })),
  }));
  const quench = Object.fromEntries(MAP_MATERIALS.map((m) => { const q = points[m].filter((p) => p.kind === "quench").map((p) => p.flow); return [m, q.length ? { min: Math.min(...q), max: Math.max(...q), n: q.length } : null]; })) as Record<MapMaterial, { min: number; max: number; n: number } | null>;
  const flowEffect = (() => { const v = validationSummary(rows, evals).rows; const a = v.find((r) => r.id === "logit-o2-material")!, b = v.find((r) => r.id === "logit-o2-flow-material")!; return { withoutFlow: a.brier, withFlow: b.brier, improves: b.brier < a.brier && b.logLoss < a.logLoss }; })();
  return {
    version: "emberscope-flammability-map-1",
    scope: "BASS-II ISS glovebox duct tests (thin SIBAL fabric in concurrent flow, thin PMMA films in opposed flow), near sea-level pressure. Saffire large-scale burns are reference markers only.",
    points, limits, quench, saffire: refs, atmospheres, maxTestedO2,
    validation: validationSummary(rows, evals), flowEffect, excludedCount: excluded.length,
  };
}

/* ---------------------------------------------------------------- partial-gravity bounds */

export type GravityLevel = "microgravity" | "lunar" | "martian" | "earth";
export const GRAVITY_LEVELS: { id: GravityLevel; label: string; g: string }[] = [
  { id: "microgravity", label: "Microgravity (orbit)", g: "≈0 g" },
  { id: "lunar", label: "Lunar (simulated)", g: "0.17 g" },
  { id: "martian", label: "Martian", g: "0.38 g" },
  { id: "earth", label: "Earth", g: "1 g" },
];
export type GravityPoint = { level: GravityLevel; o2: number; o2End?: number; burned: boolean; wentOutAtEnd?: boolean; label: string; setup: string; cite: Cite; href?: string };
export type GravityPanel = { material: MapMaterial; points: GravityPoint[]; lowestBurning: Partial<Record<GravityLevel, number>>; verdict: string; caveats: string[]; findings: string[] };

export function gravityBounds(exps: Experiment[], saffire: SaffireRun[], luci: LuciRun[], findings: Finding[]): GravityPanel[] {
  const { rows } = buildDataset(exps);
  const has = (id: string) => findings.some((f) => f.id === id);
  return MAP_MATERIALS.map((material) => {
    const pts: GravityPoint[] = [];
    for (const r of rows.filter((x) => x.material === material)) {
      pts.push({ level: "microgravity", o2: r.o2, burned: !!r.y, label: r.y ? "Flame established" : "No flame established", setup: `BASS-II duct, ${material === "PMMA" ? "thin film, opposed flow" : "thin fabric, concurrent flow"}, ${r.flow} cm/s`, cite: r.cite, href: `/experiments/${r.id}` });
    }
    for (const s of saffire.filter((x) => x.material === material && x.o2_pct != null && x.outcome_group !== "unknown")) {
      const c = s.provenance.conditions ?? s.provenance.results;
      pts.push({ level: "microgravity", o2: s.o2_pct!, burned: s.outcome_group === "sustained", label: s.outcome_label, setup: `${s.flight} large sample in a Cygnus cargo vehicle, ${s.flow_cm_s ?? "?"} cm/s`, cite: { source_id: c?.source_id ?? "saffire", pdf_page: c?.pdf_page ?? null } });
      if (s.one_g) {
        const burned = /complete/i.test(s.one_g.burn_length);
        const noBurn = /^~\s*0/.test(s.one_g.burn_length.trim());
        if (burned || noBurn) pts.push({ level: "earth", o2: s.o2_pct!, burned, label: `1-g comparison burn: ${s.one_g.burn_length}${s.one_g.spread && s.one_g.spread !== "n/a" ? `, ${s.one_g.spread}` : ""}`, setup: `Same ${s.flight} sample lot burned in normal gravity (configuration per the source table)`, cite: { source_id: s.provenance.results?.source_id ?? "saffire", pdf_page: s.provenance.results?.pdf_page ?? null } });
      }
    }
    for (const l of luci.filter((x) => x.material === material)) {
      const c = l.provenance as unknown as Record<string, { source_id: string; pdf_page: number } | null>;
      pts.push({ level: "lunar", o2: l.o2_start_pct, o2End: l.o2_end_pct, burned: true, wentOutAtEnd: l.outcome_group !== "sustained", label: l.outcome_label, setup: `LUCI ${l.size_verbatim}, burning ${l.direction}; oxygen fell from ${l.o2_start_pct} to ${l.o2_end_pct} % during the burn`, cite: { source_id: c.outcome?.source_id ?? "luci", pdf_page: c.outcome?.pdf_page ?? null } });
    }
    const downward = material === "SIBAL fabric" ? findings.find((f) => f.id === "sibal-lunar-downward") : undefined;
    if (downward) pts.push({ level: "earth", o2: 20.9, burned: false, label: "Extinguishes immediately after ignition when burned downward in air (NASA statement)", setup: "Normal gravity, downward burning in air (20.9 % O₂)", cite: { source_id: downward.source_id, pdf_page: downward.pdf_page ?? null } });
    const lowestBurning: GravityPanel["lowestBurning"] = {};
    for (const lv of GRAVITY_LEVELS) {
      const b = pts.filter((p) => p.level === lv.id && p.burned).map((p) => p.o2End ?? p.o2);
      if (b.length) lowestBurning[lv.id] = Math.min(...b);
    }
    const caveats = [
      "Martian gravity: no extended-duration burn of this material is in the corpus.",
      "LUCI is simulated lunar gravity on a spinning sounding rocket (centrifugal acceleration, Coriolis forces), not the Moon's surface.",
      ...(material === "PMMA" ? ["Geometry differs across columns: BASS-II used thin PMMA films, LUCI a 4 mm rod, and Saffire thick slabs. These are not like-for-like limits."] : ["BASS-II used small fabric strips; Saffire burned 40 cm wide sheets. Scale changes flame behaviour."]),
      "Earth-gravity points are comparison burns reported in the Saffire tables, not oxygen limits.",
    ];
    const muG = lowestBurning.microgravity, lunar = lowestBurning.lunar;
    let verdict: string;
    if (material === "SIBAL fabric" && lunar != null && has("sibal-lunar-downward")) {
      verdict = `In simulated lunar gravity SIBAL kept burning downward while oxygen fell to ${lunar} %. NASA reports the same fabric extinguishes immediately when burned downward in air at 1 g. Earth-gravity tests are therefore not a conservative bound for this material; the lunar result sits on the microgravity side (lowest burning oxygen in microgravity here: ${muG} %).`;
    } else if (lunar != null && muG != null) {
      verdict = `The PMMA rod in simulated lunar gravity spread while oxygen fell to ${lunar} % and then went out. Thin PMMA films in microgravity established a flame down to ${muG} % and not at ${ignitionBracket(rows, material).noFlameMax} %. Rod and film geometries differ, so this does not establish a gravity trend: it shows the lunar result is not bounded by the film data alone.`;
    } else verdict = "Not enough matched evidence to compare gravity levels.";
    const ids = material === "SIBAL fabric" ? ["sibal-lunar-downward", "lunar-goldilocks", "low-g-burns-lower-o2"] : ["low-g-burns-lower-o2", "sofie-lower-o2-reduced-g"];
    return { material, points: pts, lowestBurning, verdict, caveats, findings: ids.filter(has) };
  });
}
