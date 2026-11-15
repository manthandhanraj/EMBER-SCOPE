"use client";

import Link from "next/link";
import { useState } from "react";
import { OutcomeTag } from "@/components/Outcome";
import type { Experiment } from "@/lib/types";
import styles from "./AtlasDetective.module.css";

type SortKey = "test_id" | "oxygen_vol_pct" | "flow_initial_cm_s" | "thickness_mm";

/** Sortable view of the retained NASA test records. */
export function AtlasDetective({ rows }: { rows: Experiment[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "test_id", dir: 1 });

  const sorted = [...rows].sort((a, b) => {
    const av = a[sort.key] ?? -Infinity, bv = b[sort.key] ?? -Infinity;
    return (av < bv ? -1 : av > bv ? 1 : a.id.localeCompare(b.id, "en", { numeric: true })) * sort.dir;
  });
  const maxO2 = 22, minO2 = 13;
  const flowPct = (v: number | null) => (v == null ? 0 : Math.round((Math.log(v / 0.5) / Math.log(60 / 0.5)) * 100));
  const o2Pct = (v: number | null) => (v == null ? 0 : Math.round(((v - minO2) / (maxO2 - minO2)) * 100));

  return (
    <div className={styles.detective} data-guide="table">
      <div className={styles.sorts} role="group" aria-label="Sort the rows">
        <span>Sort by</span>
        {([["test_id", "Test name"], ["oxygen_vol_pct", "Oxygen"], ["flow_initial_cm_s", "Airflow"], ["thickness_mm", "Thickness"]] as [SortKey, string][]).map(([k, label]) => (
          <button key={k} className={styles.sort} aria-pressed={sort.key === k} onClick={() => setSort((s) => ({ key: k, dir: s.key === k ? ((-s.dir) as 1 | -1) : k === "oxygen_vol_pct" ? -1 : 1 }))}>
            {label}{sort.key === k ? (sort.dir === 1 ? " ↑" : " ↓") : ""}
          </button>
        ))}
      </div>
      <ol className={styles.rows}>
        {sorted.map((e) => (
          <li key={e.id}>
            <div className={styles.row}>
              <span className={styles.id}>{e.test_id}<small>{e.material}{e.thickness_mm != null ? ` · ${e.thickness_mm} mm` : ""}</small></span>
              <span className={styles.meter} title={`Oxygen ${e.oxygen_vol_pct} %`}>
                <span className={styles.mLabel}>O₂ {e.oxygen_vol_pct ?? "?"}%{e.quality_flags.includes("o2_reading_suspect") && <b title="NASA marks this oxygen reading as possibly inaccurate"> ?</b>}</span>
                <span className={styles.track}><i data-o2 data-w={Math.round(o2Pct(e.oxygen_vol_pct) / 5) * 5} /></span>
              </span>
              <span className={styles.meter} title={`Airflow as recorded: ${e.flow_verbatim}`}>
                <span className={styles.mLabel}>Air {e.flow_verbatim}</span>
                <span className={styles.track}><i data-flow data-w={Math.round(flowPct(e.flow_initial_cm_s) / 5) * 5} /></span>
              </span>
              <span className={styles.out}><OutcomeTag outcome={e.outcome} label={e.outcome_label} /></span>
            </div>
            <Link href={`/experiments/${e.id}`} className={styles.open} aria-label={`Open the full record for ${e.test_id}`}>Open ↗</Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
