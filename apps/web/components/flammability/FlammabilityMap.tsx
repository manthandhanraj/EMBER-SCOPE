import type { Limit, MapPoint, SaffireRef } from "@/lib/flammability";
import { pdfLink } from "@/lib/data";
import s from "./Flammability.module.css";

/**
 * Oxygen (vol %) against airflow (cm/s, log scale) for one material. Server-rendered SVG with linked, titled points.
 * Shaded bands are observations (the ignition bracket and the observed low-flow quench speeds), not model output.
 */
type Atmosphere = { id: string; name: string; o2: number; kpa: number; o2PartialKpa: number; tested: boolean };
type Props = { material: string; flowLabel: string; points: MapPoint[]; limit: Limit; quench: { min: number; max: number; n: number } | null; saffire: SaffireRef[]; atmospheres: Atmosphere[] };

const W = 760, H = 470, PAD = { l: 56, r: 150, t: 20, b: 48 };
const X_MIN = 1, X_MAX = 70, Y_MIN = 13, Y_MAX = 36;
const X_TICKS = [1, 2, 5, 10, 20, 50], Y_TICKS = [14, 16, 18, 20, 22, 25, 28, 31, 34];
const x = (v: number) => PAD.l + ((Math.log10(Math.min(X_MAX, Math.max(X_MIN, v))) - Math.log10(X_MIN)) / (Math.log10(X_MAX) - Math.log10(X_MIN))) * (W - PAD.l - PAD.r);
const y = (v: number) => H - PAD.b - ((Math.min(Y_MAX, Math.max(Y_MIN, v)) - Y_MIN) / (Y_MAX - Y_MIN)) * (H - PAD.t - PAD.b);
const plotRight = W - PAD.r;

function Marker({ p, cx, cy }: { p: MapPoint; cx: number; cy: number }) {
  if (p.kind === "established") return <circle cx={cx} cy={cy} r={5.5} fill="var(--flame)" stroke="var(--void)" strokeWidth={1} />;
  if (p.kind === "not-established") return <rect x={cx - 5} y={cy - 5} width={10} height={10} fill="var(--inert)" stroke="var(--ink)" strokeWidth={1} />;
  if (p.kind === "quench") return <path d={`M${cx - 6} ${cy} L${cx + 5} ${cy - 6} L${cx + 5} ${cy + 6} Z`} fill="var(--quench)" stroke="var(--void)" strokeWidth={1} />;
  if (p.kind === "blowoff") return <path d={`M${cx + 6} ${cy} L${cx - 5} ${cy - 6} L${cx - 5} ${cy + 6} Z`} fill="var(--blowoff)" stroke="var(--void)" strokeWidth={1} />;
  return <circle cx={cx} cy={cy} r={5.5} fill="var(--void)" stroke="var(--flame)" strokeWidth={2} />;
}

export function FlammabilityMap({ material, flowLabel, points, limit, quench, saffire, atmospheres }: Props) {
  const seen = new Map<string, number>();
  const placed = points.map((p) => { const k = `${p.flow}|${p.o2}`, n = seen.get(k) ?? 0; seen.set(k, n + 1); return { p, cx: x(p.flow) + n * 7, cy: y(p.o2) }; });
  const bandLo = limit.overlap ? limit.flameMin : limit.noFlameMax, bandHi = limit.overlap ? limit.noFlameMax : limit.flameMin;
  return (
    <figure className={s.figure}>
      <svg viewBox={`0 0 ${W} ${H}`} className={s.svg} role="group" aria-label={`${material}: oxygen against airflow for every BASS-II test, with the observed ignition bracket, low-flow quench speeds, Saffire reference burns and candidate habitat atmospheres`}>
        <rect x={PAD.l} y={PAD.t} width={plotRight - PAD.l} height={H - PAD.t - PAD.b} fill="var(--panel)" />
        {bandLo != null && bandHi != null && <g><rect x={PAD.l} y={y(bandHi)} width={plotRight - PAD.l} height={Math.max(3, y(bandLo) - y(bandHi))} fill="var(--signal)" opacity={0.28} /><text x={PAD.l + 6} y={H - PAD.b - 7} fontSize="11" fill="var(--signal)">Blue band: ignition transition observed between {bandLo} and {bandHi} % O₂</text></g>}
        {limit.noFlameMax != null && <rect x={PAD.l} y={y(limit.noFlameMax)} width={plotRight - PAD.l} height={Math.max(0, y(Y_MIN) - y(limit.noFlameMax))} fill="var(--inert)" opacity={0.08} />}
        {quench && <g><rect x={x(quench.min)} y={PAD.t} width={Math.max(3, x(quench.max) - x(quench.min))} height={H - PAD.t - PAD.b} fill="var(--quench)" opacity={0.14} /><text x={x(quench.min) + 3} y={PAD.t + 14} fontSize="11" fill="var(--quench)">Went out when airflow was lowered to {quench.min}–{quench.max} cm/s</text></g>}
        {Y_TICKS.map((t) => <g key={t}><line x1={PAD.l} x2={plotRight} y1={y(t)} y2={y(t)} stroke="var(--rule)" strokeWidth={0.5} /><text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--faint)">{t}</text></g>)}
        {X_TICKS.map((t) => <g key={t}><line x1={x(t)} x2={x(t)} y1={PAD.t} y2={H - PAD.b} stroke="var(--rule)" strokeWidth={0.5} /><text x={x(t)} y={H - PAD.b + 17} textAnchor="middle" fontSize="11" fill="var(--faint)">{t}</text></g>)}
        <text x={(PAD.l + plotRight) / 2} y={H - 8} textAnchor="middle" fontSize="12" fill="var(--muted)">{flowLabel} (cm/s, log scale)</text>
        <text transform={`translate(15 ${(PAD.t + H - PAD.b) / 2}) rotate(-90)`} textAnchor="middle" fontSize="12" fill="var(--muted)">Oxygen (% by volume)</text>
        {atmospheres.map((a) => <g key={a.id}><line x1={PAD.l} x2={plotRight} y1={y(a.o2)} y2={y(a.o2)} stroke={a.tested ? "var(--muted)" : "var(--blowoff)"} strokeWidth={1.4} strokeDasharray="6 5" /><text x={plotRight + 6} y={y(a.o2) - 2} fontSize="10.5" fill="var(--ink)">{a.o2} % · {a.kpa} kPa</text><text x={plotRight + 6} y={y(a.o2) + 11} fontSize="10" fill="var(--faint)">{a.name.replace(/ atmosphere/i, "")}{a.tested ? "" : " · untested"}</text></g>)}
        {saffire.map((r, i) => { const cx = x(r.flow) + (i % 3) * 7, cy = y(r.o2); return <a key={r.id} href={pdfLink(r.cite.source_id, r.cite.pdf_page ?? undefined)} target="_blank" rel="noreferrer"><title>{`${r.flight} ${r.id.split("-").slice(-1)[0]}: ${r.label}. ${r.o2} % O₂, ${r.flow} cm/s. Large-scale Saffire burn; reference only. Source ${r.cite.source_id}, page ${r.cite.pdf_page ?? "n/a"}.`}</title><path d={`M${cx} ${cy - 7} L${cx + 7} ${cy} L${cx} ${cy + 7} L${cx - 7} ${cy} Z`} fill={r.burned ? "var(--signal)" : "var(--void)"} stroke="var(--signal)" strokeWidth={1.5} /></a>; })}
        {placed.map(({ p, cx, cy }) => <a key={p.id} href={p.href}><title>{`${p.test}: ${p.label}. ${p.o2} % O₂, ${p.flow} cm/s. ${p.detail}. Source ${p.cite.source_id}, page ${p.cite.pdf_page ?? "n/a"}.`}</title><Marker p={p} cx={cx} cy={cy} /><circle cx={cx} cy={cy} r={9} fill="transparent" /></a>)}
      </svg>
      <figcaption className={s.legend}>
        <span><svg viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="var(--flame)" /></svg>Flame established</span>
        <span><svg viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="2" width="10" height="10" fill="var(--inert)" /></svg>No flame established</span>
        <span><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M1 7 L12 1 L12 13 Z" fill="var(--quench)" /></svg>Went out at low airflow (final speed)</span>
        <span><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M13 7 L2 1 L2 13 Z" fill="var(--blowoff)" /></svg>Blown out at high airflow</span>
        <span><svg viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="var(--void)" stroke="var(--flame)" strokeWidth="2" /></svg>Still burning at highest airflow</span>
        <span><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M7 1 L13 7 L7 13 L1 7 Z" fill="var(--signal)" /></svg>Saffire large-scale burn (reference)</span>
      </figcaption>
    </figure>
  );
}
