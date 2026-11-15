/**
 * Harmonized, model-ready view of the original NASA PSI experimental tables.
 *
 * Every source table keeps its original cells (psi-numerical.json). This module maps each table's columns,
 * reviewed one by one, onto a shared schema: fuel, fuel phase, oxygen, pressure, airflow, diluents and any
 * explicitly reported outcome. Rules:
 * - Only a single number is converted. Ranges ("1.5 - 5"), lists ("21; 26.5; 40"), censored values ("<1"),
 *   text and spreadsheet artifacts ("3400%") stay null and are flagged with the original text.
 * - "~" values are kept and flagged as approximate.
 * - Unit conversions are explicit: mole fraction x 100 -> %, atm x 101.325, bar x 100, mmHg x 0.133322 -> kPa.
 * - No outcome is inferred. A row is "model-ready" only when oxygen, pressure and a reported outcome are all present.
 */
import type { PsiExperimentalTable } from "./model-workspace.ts";

export type FieldFlag = "approximate" | "range" | "list" | "censored" | "non-numeric" | "display-units";
export type Field = { value: number | null; raw: string | null; column: string | null; flag?: FieldFlag; note?: string };
export type FuelPhase = "solid" | "liquid droplet" | "gas" | "smoke source (solid)" | "dust aerosol";
export type Outcome = { kind: string; value: string | number; column: string };
export type HarmonizedRow = {
  key: string; accession: string; tableFile: string; sourceRow: number; testId: string | null;
  investigation: string; fuel: string | null; fuelPhase: FuelPhase; platform: string;
  oxygenPct: Field; pressureKpa: Field; flowCmS: Field;
  diluents: Record<string, number>; outcomes: Outcome[]; modelReady: boolean; notes: string[];
};

const NUM = String.raw`[+-]?(?:\d+(?:\.\d*)?|\.\d+)`;
const UNIT_FACTORS: Record<string, number> = { atm: 101.325, bar: 100, mmhg: 0.133322, kpa: 1, "cm/s": 1, cm: 1, mm: 1, s: 1, "%": 1 };

/** Parse one source cell into a single number, or null with a flag. `unit` is the unit the header states, if any. */
export function parseCell(raw: string | null | undefined, column: string | null, scale = 1, cellUnits: string[] = []): Field {
  const text = raw == null ? null : String(raw).trim();
  if (text == null || text === "" || text === "-" || /^n\/?a$/i.test(text)) return { value: null, raw: text || null, column };
  const unitPattern = cellUnits.length ? `(?:\\s*(${cellUnits.map((u) => u.replace(/[/]/g, "\\/")).join("|")}))?` : "";
  const single = new RegExp(`^(~\\s*)?(${NUM})${unitPattern}$`, "i").exec(text);
  if (single) {
    const unit = single[3]?.toLowerCase();
    const factor = unit ? UNIT_FACTORS[unit] ?? 1 : 1;
    const value = Number(single[2]) * scale * factor;
    return { value: Math.round(value * 1e6) / 1e6, raw: text, column, ...(single[1] ? { flag: "approximate" as const } : {}) };
  }
  if (/^[<>≤≥]/.test(text)) return { value: null, raw: text, column, flag: "censored" };
  if (new RegExp(`${NUM}\\s*[;,]\\s*${NUM}`).test(text)) return { value: null, raw: text, column, flag: "list", note: "Several values in one cell; not a single test condition." };
  if (new RegExp(`${NUM}\\s*(?:-|–|to)\\s*${NUM}`, "i").test(text)) return { value: null, raw: text, column, flag: "range", note: "A range, not a single test condition." };
  if (/^\d+%$/.test(text)) return { value: null, raw: text, column, flag: "non-numeric", note: "Spreadsheet percent-format artifact in the source; not converted." };
  return { value: null, raw: text, column, flag: "non-numeric" };
}

const empty = (column: string | null = null): Field => ({ value: null, raw: null, column });
const yesNo = (v: string | null | undefined) => (v == null ? null : /^yes/i.test(v.trim()) ? "yes" : /^no/i.test(v.trim()) ? "no" : v.trim() === "-" ? null : v.trim());

type Row = Record<string, string | null>;
type Spec = {
  investigation: string; phase: FuelPhase; platform: string; note?: string;
  testId?: (r: Row) => string | null; fuel?: (r: Row) => string | null;
  oxygen?: (r: Row) => Field; pressure?: (r: Row) => Field; flow?: (r: Row) => Field;
  diluents?: (r: Row) => Record<string, number>; outcomes?: (r: Row) => Outcome[]; rowNotes?: (r: Row) => string[];
};
const ISS = "ISS (orbital microgravity)";
const CYGNUS = "Uncrewed Cygnus cargo vehicle (orbital microgravity); the PSI platform field lists ISS";
const col = (c: string) => (r: Row) => r[c] ?? null;
const frac = (c: string, note?: string) => (r: Row) => ({ ...parseCell(r[c], c, 100), ...(note ? { note } : {}) });
const counted = (c: string, kind: string) => (r: Row): Outcome[] => { const f = parseCell(r[c], c); return f.value != null ? [{ kind, value: f.value, column: c }] : []; };

/** Reviewed column mappings, keyed by the original PSI file name. */
export const TABLE_SPECS: Record<string, Spec> = {
  "PSI-10_Experimental table_Flame Design_Inverse Flame.csv": {
    investigation: "ACME Flame Design", phase: "gas", platform: ISS, note: "Inverse flames: the burner supplies the oxidizer into an ethylene-containing ambient, so XO2 is the burner-stream oxygen fraction.",
    testId: col("Test"), fuel: () => "C2H4 (ambient)", oxygen: frac("XO2", "Burner (oxidizer-stream) O2 mole fraction, not ambient oxygen."), pressure: (r) => parseCell(r["pmean (atm)"], "pmean (atm)", 101.325),
  },
  "PSI-10_Experimental table_Flame Design_Normal Flame.csv": {
    investigation: "ACME Flame Design", phase: "gas", platform: ISS,
    testId: col("Test"), fuel: col("Fuel"), oxygen: frac("XO2 (init)", "Ambient O2 mole fraction before the test."), pressure: (r) => parseCell(r["pmean (atm)"], "pmean (atm)", 101.325),
  },
  "PSI-100_Experimental table_SAFFIRE-3.csv": {
    investigation: "Saffire-III", phase: "solid", platform: CYGNUS, testId: col("Sample Number"), fuel: col("Material"),
    flow: (r) => parseCell(r["Air Flow"], "Air Flow", 1, ["cm/s"]),
  },
  "PSI-101_Experimental table_SAME-R.csv": {
    investigation: "SAME-R", phase: "smoke source (solid)", platform: ISS, note: "Smoke-generation and aging settings. Rt/R0 is an instrument ratio, not a detector alarm result.",
    testId: col("SAME Test #"), fuel: col("Sample Type"), flow: (r) => parseCell(r["Inlet velocity (cm/s)"], "Inlet velocity (cm/s)"),
  },
  "PSI-102_Experimental table_SAME.csv": {
    investigation: "SAME", phase: "smoke source (solid)", platform: ISS, note: "Smoke-generation settings; no detector performance is reported in this table.",
    testId: col("Sample #"), fuel: col("Sample Material"), flow: (r) => parseCell(r["Air Flow (cm/s)"], "Air Flow (cm/s)"),
  },
  "PSI-106_Experimental table_Slice.csv": { investigation: "SLICE", phase: "gas", platform: ISS, fuel: col("Fuel Type"), note: "Test dates and fuels only." },
  "PSI-107_Experimental table_Spice.csv": {
    investigation: "SPICE", phase: "gas", platform: ISS, note: "Coflow air speed and fuel rate; the smoke-point result is not in this table.",
    fuel: col("Fuel"), flow: (r) => parseCell(r["Air Rate (cm/s)"], "Air Rate (cm/s)"),
  },
  "PSI-142_Experimental table_Data Summary Table.csv": { investigation: "Cool-flame transitions (PSI-142)", phase: "liquid droplet", platform: "Reference list", note: "A list of published figures, not experimental runs." },
  "PSI-159_Experimental table_CFI-G_Inverse Flames.csv": {
    investigation: "CFI-G", phase: "gas", platform: ISS, note: "Inverse flames: XO2 is the oxidizer supplied through the burner.",
    testId: col("Test"), fuel: col("Fuel"), oxygen: frac("XO2", "Burner (oxidizer-stream) O2 mole fraction."), pressure: (r) => parseCell(r["approx p (bar)"], "approx p (bar)", 100),
    outcomes: (r) => [
      ...(yesNo(r["Hot ignition"]) ? [{ kind: "hot ignition", value: yesNo(r["Hot ignition"])!, column: "Hot ignition" }] : []),
      ...counted("burn time (sec)", "burn time (s)")(r),
      ...(r["Self -ext or flow term"] && r["Self -ext or flow term"] !== "-" ? [{ kind: "end of burn", value: r["Self -ext or flow term"] === "SE" ? "self-extinguished" : r["Self -ext or flow term"] === "FT" ? "flow terminated" : r["Self -ext or flow term"]!, column: "Self -ext or flow term" }] : []),
    ],
  },
  "PSI-159_Experimental table_CFI-G_Normal Flames.csv": {
    investigation: "CFI-G", phase: "gas", platform: ISS,
    testId: col("Test"), fuel: col("Fuel"), oxygen: frac("XO2 before test", "Ambient O2 mole fraction before the test."), pressure: (r) => parseCell(r["approx p (bar)"], "approx p (bar)", 100),
    outcomes: (r) => [
      ...(yesNo(r["Hot ignition"]) ? [{ kind: "hot ignition", value: yesNo(r["Hot ignition"])!, column: "Hot ignition" }] : []),
      ...counted("burn time (sec)", "burn time (s)")(r),
      ...(r["Self-ext or flow term"] && r["Self-ext or flow term"] !== "-" ? [{ kind: "end of burn", value: r["Self-ext or flow term"] === "SE" ? "self-extinguished" : r["Self-ext or flow term"] === "FT" ? "flow terminated" : r["Self-ext or flow term"]!, column: "Self-ext or flow term" }] : []),
      ...(r["Cool flame?"] ? [{ kind: "cool flame", value: r["Cool flame?"]!, column: "Cool flame?" }] : []),
    ],
  },
  "PSI-20_Experimental table_ACME BRE.csv": {
    investigation: "ACME BRE", phase: "gas", platform: ISS, note: "Session summaries: one row covers several flames.",
    fuel: col("Fuel Bottle"), oxygen: (r) => parseCell(r["Oxygen Conc (percent)"], "Oxygen Conc (percent)"), outcomes: counted("Flames Ignited", "flames ignited in session (count)"),
  },
  "PSI-21_Experimental table_CLD Flame.csv": {
    investigation: "ACME CLD Flame", phase: "gas", platform: ISS, note: "Session summaries: one row covers several flames.",
    fuel: col("Fuel Bottle"), outcomes: counted("Flames ignited", "flames ignited in session (count)"),
  },
  "PSI-22_Experimental table_ACME E-FIELD Flames.csv": {
    investigation: "ACME E-FIELD Flames", phase: "gas", platform: ISS, note: "Session summaries: one row covers several flames.",
    fuel: col("Fuel Bottle"), outcomes: counted("Flames Ignited", "flames ignited in session (count)"),
  },
  "PSI-23_Experimental table_ACME s-Flame.csv": {
    investigation: "ACME s-Flame", phase: "gas", platform: ISS, note: "Session summaries: one row covers several flames.",
    fuel: col("Fuel Bottle"),
    oxygen: (r) => { const a = r["Atmosphere*"]; const m = a ? /^~(\d+(?:\.\d+)?)% O2 with/i.exec(a) : null; return m ? { value: Number(m[1]), raw: a, column: "Atmosphere*", flag: "approximate" } : parseCell(a, "Atmosphere*"); },
    outcomes: counted("Flames Ignited*", "flames ignited in session (count)"),
    rowNotes: (r) => (/with N[3-9]/.test(r["Atmosphere*"] ?? "") ? ["The source reads 'N3'–'N9', a likely spreadsheet fill error for N2; verify in the source."] : []),
  },
  "PSI-25_Experimental table_BASS-II.csv": {
    investigation: "BASS-II", phase: "solid", platform: ISS, note: "Airflow is a fan/air display setting, not a velocity in cm/s; outcomes are not in this table (see the curated BASS-II records).",
    testId: col("Test #"), fuel: col("Fuel Sample Material"), oxygen: (r) => parseCell(r["Calibrated  initial O2 % by vol"], "Calibrated  initial O2 % by vol"),
    flow: (r) => ({ value: null, raw: r["Air display"] ?? null, column: "Air display", flag: "display-units", note: "Display setting, not cm/s." }),
    diluents: (r): Record<string, number> => { const f = parseCell(r["Initial CO2 % by vol"], "Initial CO2 % by vol"); return f.value != null ? { CO2: f.value } : {}; },
  },
  "PSI-26_Experimental table_BASS.csv": { investigation: "BASS", phase: "solid", platform: ISS, testId: col("Test #"), fuel: col("Fuel Sample Material"), note: "Test list and materials only." },
  "PSI-39_Experimental table_CFI.csv": {
    investigation: "CFI", phase: "liquid droplet", platform: ISS, testId: col("Flex Number"), fuel: col("Fuel"),
    oxygen: frac("Oxygen", "O2 mole fraction."), pressure: (r) => parseCell(r["Pressure"], "Pressure", 1, ["atm"]),
    diluents: (r) => { const he = parseCell(r["Helium"], "Helium", 100), n2 = parseCell(r["Nitrogen"], "Nitrogen", 100); return { ...(he.value ? { He: he.value } : {}), ...(n2.value != null ? { N2: n2.value } : {}) }; },
  },
  "PSI-47_Experimental table_DAFT.csv": { investigation: "DAFT", phase: "dust aerosol", platform: ISS, fuel: col("Sample Material"), note: "Aerosol feasibility sessions; no combustion." },
  "PSI-68_Experimental table_Flex2.csv": {
    investigation: "FLEX-2", phase: "liquid droplet", platform: ISS, note: "Campaign parameter ranges, not individual runs.",
    fuel: col("Sample (Fuel Type)"), oxygen: frac("Oxygen Mole Fraction"), pressure: (r) => parseCell(r["Ambient Pressure (atm)"], "Ambient Pressure (atm)", 101.325), flow: (r) => parseCell(r["Flow Velocity (cm/s)"], "Flow Velocity (cm/s)"),
  },
  "PSI-69_Experimental table_FLEX.csv": {
    investigation: "FLEX", phase: "liquid droplet", platform: ISS, note: "The source headers read 'O', 'N' and 'CO'; the values are O2, N2 and CO2 mole fractions (CO2 reaches 0.7).",
    testId: col("FLEX Identifier"), fuel: col("Fuel"),
    oxygen: frac("O initial ambient composition; mole fraction", "Initial ambient O2 mole fraction."), pressure: (r) => parseCell(r["Ambient pressure; mmHg"], "Ambient pressure; mmHg", 0.133322),
    diluents: (r) => { const out: Record<string, number> = {}; for (const [k, c] of [["CO2", "CO initial ambient composition; mole fraction"], ["He", "He initial ambient composition; mole fraction"], ["N2", "N initial ambient composition; mole fraction"]] as const) { const f = parseCell(r[c], c, 100); if (f.value) out[k] = f.value; } return out; },
    outcomes: (r) => [
      ...(r["Test end"] ? [{ kind: "test end", value: r["Test end"]!.toLowerCase(), column: "Test end" }] : []),
      ...counted("Visible flame extinction diameter; mm", "visible flame extinction diameter (mm)")(r),
      ...counted("Burn time; s", "burn time (s)")(r),
    ],
  },
  "PSI-98_Experimental table_SAFFIRE-1.csv": {
    investigation: "Saffire-I", phase: "solid", platform: CYGNUS, testId: col("Sample Number"), fuel: col("Material"),
    oxygen: (r) => parseCell(r["Percent O2"], "Percent O2"), flow: (r) => parseCell(r["Air Flow (cm/s)"], "Air Flow (cm/s)"), outcomes: counted("Burn Time (s)", "burn time (s)"),
  },
  "PSI-99_Experimental table_SAFFIRE-2.csv": {
    investigation: "Saffire-II", phase: "solid", platform: CYGNUS, testId: col("Sample Number"), fuel: col("Material"),
    oxygen: (r) => parseCell(r["Percent O2 (Note 1)"], "Percent O2 (Note 1)"), flow: (r) => parseCell(r["Air Flow (cm/s)"], "Air Flow (cm/s)", 1, ["cm/s"]),
    outcomes: (r) => { const f = parseCell(r["Burn Time (s)"], "Burn Time (s)", 1, ["s"]); return f.value != null ? [{ kind: "burn time (s)", value: f.value, column: "Burn Time (s)" }] : r["Burn Time (s)"] ? [{ kind: "burn time (text)", value: r["Burn Time (s)"]!, column: "Burn Time (s)" }] : []; },
  },
};

export function harmonizeTable(table: PsiExperimentalTable): HarmonizedRow[] {
  const spec = TABLE_SPECS[table.fileName];
  if (!spec) return [];
  return table.rows.map((r, i) => {
    const oxygenPct = spec.oxygen?.(r) ?? empty(), pressureKpa = spec.pressure?.(r) ?? empty(), flowCmS = spec.flow?.(r) ?? empty();
    const outcomes = spec.outcomes?.(r) ?? [];
    const notes = [...(spec.note ? [spec.note] : []), ...(spec.rowNotes?.(r) ?? [])];
    return {
      key: `${table.accession}:${table.fileName}:${i + 1}`, accession: table.accession, tableFile: table.fileName, sourceRow: i + 1,
      testId: spec.testId?.(r) ?? null, investigation: spec.investigation, fuel: spec.fuel?.(r) ?? null, fuelPhase: spec.phase, platform: spec.platform,
      oxygenPct, pressureKpa, flowCmS, diluents: spec.diluents?.(r) ?? {}, outcomes,
      modelReady: oxygenPct.value != null && pressureKpa.value != null && outcomes.length > 0, notes,
    };
  });
}

export type TableCoverage = { accession: string; tableFile: string; investigation: string; fuelPhase: FuelPhase; rows: number; oxygen: number; pressure: number; flow: number; outcome: number; modelReady: number; flagged: number; mapped: boolean; note: string | null };
export function harmonizeAll(tables: PsiExperimentalTable[]) {
  const rows = tables.flatMap(harmonizeTable);
  const coverage: TableCoverage[] = tables.map((t) => {
    const r = rows.filter((x) => x.tableFile === t.fileName), spec = TABLE_SPECS[t.fileName];
    const flagged = r.filter((x) => [x.oxygenPct, x.pressureKpa, x.flowCmS].some((f) => f.flag && f.flag !== "approximate")).length;
    return { accession: t.accession, tableFile: t.fileName, investigation: spec?.investigation ?? t.title, fuelPhase: spec?.phase ?? "gas", rows: t.rowCount,
      oxygen: r.filter((x) => x.oxygenPct.value != null).length, pressure: r.filter((x) => x.pressureKpa.value != null).length, flow: r.filter((x) => x.flowCmS.value != null).length,
      outcome: r.filter((x) => x.outcomes.length).length, modelReady: r.filter((x) => x.modelReady).length, flagged, mapped: !!spec, note: spec?.note ?? null };
  });
  return {
    version: "emberscope-psi-harmonized-1",
    scope: "Reviewed column mapping of original PSI experimental tables onto shared fields. Single numbers only; ranges, lists, censored values and display settings stay null with the original text. No outcome is inferred.",
    conversions: { oxygen: "mole fraction x 100 = mole % (≈ volume % for ideal gases); percent columns unchanged", pressure: "atm x 101.325, bar x 100, mmHg x 0.133322 -> kPa", flow: "cm/s only; fan/air display settings are not converted" },
    rows, coverage,
    totals: { rows: rows.length, modelReady: rows.filter((x) => x.modelReady).length, oxygen: rows.filter((x) => x.oxygenPct.value != null).length, unmappedTables: coverage.filter((c) => !c.mapped).map((c) => c.tableFile) },
  };
}

const CSV_COLUMNS = ["accession", "table_file", "source_row", "test_id", "investigation", "fuel", "fuel_phase", "platform", "oxygen_pct", "oxygen_flag", "oxygen_source_text", "pressure_kpa", "pressure_flag", "pressure_source_text", "flow_cm_s", "flow_flag", "flow_source_text", "diluents", "outcomes", "model_ready", "notes"];
const csvCell = (v: unknown) => { const t = v == null ? "" : String(v); const safe = /^[=+\-@\t\r]/.test(t) && !/^-?\d/.test(t) ? `'${t}` : t; return `"${safe.replaceAll('"', '""')}"`; };
export function harmonizedCsv(rows: HarmonizedRow[]) {
  return "﻿" + [CSV_COLUMNS.join(","), ...rows.map((r) => [r.accession, r.tableFile, r.sourceRow, r.testId, r.investigation, r.fuel, r.fuelPhase, r.platform,
    r.oxygenPct.value, r.oxygenPct.flag, r.oxygenPct.raw, r.pressureKpa.value, r.pressureKpa.flag, r.pressureKpa.raw, r.flowCmS.value, r.flowCmS.flag, r.flowCmS.raw,
    Object.entries(r.diluents).map(([k, v]) => `${k}=${v}%`).join("; "), r.outcomes.map((o) => `${o.kind}=${o.value}`).join("; "), r.modelReady ? "yes" : "no", r.notes.join(" ")].map(csvCell).join(","))].join("\r\n");
}
