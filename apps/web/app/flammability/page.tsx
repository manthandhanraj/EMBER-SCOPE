import Link from "next/link";
import { findings, pdfLink } from "@/lib/data";
import { flammabilityData } from "@/lib/flammability-data";
import { FlammabilityMap } from "@/components/flammability/FlammabilityMap";
import { GravityBounds } from "@/components/flammability/GravityBounds";
import s from "@/components/research/ResearchExtensions.module.css";
import f from "@/components/flammability/Flammability.module.css";

export const metadata = { title: "Flammability map" };
const n3 = (v: number | null) => (v == null ? "—" : v.toFixed(3));
const FLOW_LABEL: Record<string, string> = { "SIBAL fabric": "Concurrent airflow over thin SIBAL fabric", PMMA: "Opposed airflow over thin PMMA film" };

export default function FlammabilityPage() {
  const { map, gravity } = flammabilityData();
  const v = map.validation, base = v.rows.find((r) => r.id === "baseline")!, chosen = v.rows.find((r) => r.id === v.chosen);
  const sibal = map.limits["SIBAL fabric"], pmma = map.limits.PMMA, ea = map.atmospheres.find((a) => a.id === "ea-a");
  const quote = (id: string) => findings.find((x) => x.id === id);
  return (
    <div className={s.page}>
      <Link href="/research">← Research dashboard</Link>
      <p className={s.kicker}>PREDICTIVE MODELING / FLAMMABILITY BOUNDARIES</p>
      <h1>Where does it burn?<br />Where does the evidence stop?</h1>
      <p className={s.lead}>Every NASA BASS-II test is placed by its oxygen level and airflow. The map shows where flames started, where they went out at low airflow and where they blew off. Habitat atmospheres are drawn on top so you can see how far they sit from tested conditions. Every point links to its test record or source page.</p>

      <div className={f.insights}>
        <div className={f.insight}><b>{sibal.noFlameMax}–{sibal.flameMin} %</b>SIBAL fabric ignition transition: no flame established at {sibal.noFlameMax} % O₂ or below, flames from {sibal.flameMin} %.</div>
        <div className={f.insight}><b>{map.quench["SIBAL fabric"]?.min}–{map.quench["SIBAL fabric"]?.max} cm/s</b>Low-flow quench: {map.quench["SIBAL fabric"]?.n} SIBAL flames went out when the concurrent airflow was lowered into this range.</div>
        <div className={f.insight}><b>{ea ? `+${ea.aboveLimits[0].margin} points` : "—"}</b>Exploration atmosphere A ({ea?.o2} % O₂, {ea?.kpa} kPa) sits this far above the lowest oxygen where SIBAL burned. No test in this corpus reached {ea?.o2} % O₂.</div>
      </div>

      <h2>Flammability map</h2>
      <div className={f.panels}>
        {(["SIBAL fabric", "PMMA"] as const).map((m) => (
          <section key={m}>
            <h3 className={f.panelTitle}>{m}</h3>
            <FlammabilityMap material={m} flowLabel={FLOW_LABEL[m]} points={map.points[m]} limit={map.limits[m]} quench={map.quench[m]} saffire={map.saffire.filter((r) => r.material === m)} atmospheres={map.atmospheres} />
          </section>
        ))}
      </div>
      <p className={s.note}>{map.scope} The shaded bands are observations, not model output. PMMA: no flame at {pmma.noFlameMax} % O₂, flames from {pmma.flameMin} %; its low-flow quench speeds were recorded as fan settings rather than cm/s, so they are not placed. {map.excludedCount} BASS-II records are excluded from the map (reused samples, suspect oxygen readings, Nomex or missing conditions); see the model workspace for the list. Above {Math.max(...map.points["SIBAL fabric"].map((p) => p.o2), ...map.points.PMMA.map((p) => p.o2))} % O₂ only the larger Saffire burns exist, all at 20–25 cm/s.</p>

      <h2>Does the model predict ignition out of sample?</h2>
      <section className={s.card}>
        <p>Grouped cross-validation: tests from the same crew session are always held out together, so the score is not inflated by near-duplicate runs. {v.n} usable tests, of which only {v.negatives} did not establish a flame. With so few negatives, the intervals are wide.</p>
        <div className={s.table}><table><thead><tr><th>Model</th><th>AUC (95% bootstrap interval)</th><th>Brier score (lower is better)</th><th>Log loss (lower is better)</th></tr></thead><tbody>
          {v.rows.map((r) => <tr key={r.id}><td>{r.name}{r.id === v.chosen ? " · selected by the pre-registered rule" : ""}</td><td>{r.auc == null ? "not defined" : `${r.auc.toFixed(2)} (${r.aucLo?.toFixed(2)}–${r.aucHi?.toFixed(2)})`}</td><td>{n3(r.brier)}</td><td>{n3(r.logLoss)}</td></tr>)}
        </tbody></table></div>
        <p className={s.status}>Result: oxygen predicts whether a flame is established better than the no-feature baseline (Brier {n3(chosen?.brier ?? null)} vs {n3(base.brier)}). Adding airflow does {map.flowEffect.improves ? "" : "not "}improve it (Brier {n3(map.flowEffect.withFlow)} with airflow vs {n3(map.flowEffect.withoutFlow)} without). Within 2–19 cm/s these tests do not identify an airflow effect on ignition. Airflow does matter for extinction: the quench and blowoff points above.</p>
        <p className={s.status}>The model is fitted only to BASS-II-style tests near sea-level pressure in microgravity. It gives no prediction for other pressures, gravity levels or oxygen above the tested range. <Link href="/model-lab">Try it in the model workspace →</Link></p>
      </section>

      <h2>Candidate habitat atmospheres</h2>
      <section className={s.card}>
        <div className={s.table}><table><thead><tr><th>Atmosphere</th><th>O₂ %</th><th>Total pressure</th><th>O₂ partial pressure</th><th>Above lowest burning O₂ (SIBAL / PMMA)</th><th>Tested in this corpus?</th></tr></thead><tbody>
          {map.atmospheres.map((a) => <tr key={a.id}><td>{a.name}</td><td>{a.o2}</td><td>{a.kpa} kPa</td><td>{a.o2PartialKpa} kPa</td><td>{a.aboveLimits.map((x) => (x.margin == null ? "—" : `+${x.margin}`)).join(" / ")} points</td><td>{a.tested ? `Yes, up to ${map.maxTestedO2} % O₂ (at sea-level pressure)` : `No: highest tested is ${map.maxTestedO2} % O₂`}</td></tr>)}
        </tbody></table></div>
        <p className={s.status}>Partial pressure is plain arithmetic (O₂ fraction × total pressure). Exploration atmosphere A has a lower O₂ partial pressure than sea-level air but a much higher O₂ concentration. NASA still describes it as a fire concern: {(() => { const q = quote("enriched-o2-flammability"); return q ? <>&ldquo;…{q.quote.replace(/^.*however, /, "")}&rdquo; (<a href={pdfLink(q.source_id)} target="_blank" rel="noreferrer">{q.source_id} ↗</a>)</> : null; })()} Reduced total pressure was not tested in this corpus; that combination is a data gap.</p>
      </section>

      <h2>Partial gravity: do microgravity and Earth results bound the Moon and Mars?</h2>
      <p className={s.lead}>The challenge suggests microgravity and normal-gravity results could bound intermediate gravity. Each chart places the oxygen at which a material burned (or did not) at each gravity level, with the shaded band showing that assumption.</p>
      <div className={f.panels}>
        {gravity.map((g) => (
          <section key={g.material}>
            <h3 className={f.panelTitle}>{g.material}</h3>
            <GravityBounds panel={g} />
            <p className={f.verdict}>{g.verdict}</p>
            <ul>{g.caveats.map((c) => <li key={c}>{c}</li>)}</ul>
          </section>
        ))}
      </div>
      <section className={s.card}>
        <h3>What NASA reports about reduced gravity</h3>
        {["sibal-lunar-downward", "lunar-goldilocks", "low-g-burns-lower-o2", "sofie-lower-o2-reduced-g"].map((id) => { const q = quote(id); return q ? <p key={id} className={f.quote}>&ldquo;{q.quote}&rdquo; <a href={pdfLink(q.source_id, q.pdf_page)} target="_blank" rel="noreferrer">{q.source_id}{q.pdf_page ? `, p. ${q.pdf_page}` : ", abstract"} ↗</a></p> : null; })}
        <p className={s.status}>Martian gravity has no extended-duration burn in this corpus. NASA&apos;s Martian-gravity flammability data came from short drop-tower tests. FM² (Flammability of Materials on the Moon) is planned to provide the first true lunar-surface data.</p>
      </section>

      <div className={s.actions}><a href="/api/flammability">Download map, validation and gravity data (JSON) ↓</a><a href="/api/psi?format=harmonized-csv&ready=1">PSI model-ready rows (CSV) ↓</a><Link href="/model-lab">Model workspace →</Link><Link href="/psi#harmonized">Harmonized PSI view →</Link></div>
    </div>
  );
}
