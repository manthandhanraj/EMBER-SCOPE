import { GRAVITY_LEVELS, type GravityPanel } from "@/lib/flammability";
import { pdfLink } from "@/lib/data";
import s from "./Flammability.module.css";

/**
 * Lowest oxygen with burning at each gravity level for one material. The shaded band between the microgravity and
 * Earth-gravity observations is the "bounding" assumption; points outside it show where that assumption fails.
 */
const W = 760, H = 430, PAD = { l: 56, r: 20, t: 24, b: 56 };
const Y_MIN = 13, Y_MAX = 33, Y_TICKS = [14, 16, 18, 20, 22, 25, 28, 31];
const colW = (W - PAD.l - PAD.r) / GRAVITY_LEVELS.length;
const cxOf = (i: number) => PAD.l + colW * (i + 0.5);
const y = (v: number) => H - PAD.b - ((Math.min(Y_MAX, Math.max(Y_MIN, v)) - Y_MIN) / (Y_MAX - Y_MIN)) * (H - PAD.t - PAD.b);

export function GravityBounds({ panel }: { panel: GravityPanel }) {
  const lo = panel.lowestBurning.microgravity, hi = panel.lowestBurning.earth;
  const placed = GRAVITY_LEVELS.flatMap((lv, i) => {
    const pts = panel.points.filter((p) => p.level === lv.id);
    return pts.map((p, k) => ({ p, cx: cxOf(i) + (pts.length > 1 ? (k - (pts.length - 1) / 2) * Math.min(9, (colW - 40) / pts.length) : 0) }));
  });
  return (
    <figure className={s.figure}>
      <svg viewBox={`0 0 ${W} ${H}`} className={s.svg} role="group" aria-label={`${panel.material}: oxygen at which burning was observed in microgravity, simulated lunar gravity, Martian gravity and Earth gravity`}>
        <rect x={PAD.l} y={PAD.t} width={W - PAD.l - PAD.r} height={H - PAD.t - PAD.b} fill="var(--panel)" />
        {lo != null && hi != null && <g><rect x={cxOf(0)} y={y(Math.max(lo, hi))} width={cxOf(3) - cxOf(0)} height={Math.abs(y(lo) - y(hi))} fill="var(--signal)" opacity={0.16} /><text x={cxOf(1.5)} y={PAD.t + 16} textAnchor="middle" fontSize="11" fill="var(--signal)">Shaded: bounding assumption between microgravity ({lo} %) and Earth ({hi} %)</text></g>}
        {Y_TICKS.map((t) => <g key={t}><line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--rule)" strokeWidth={0.5} /><text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--faint)">{t}</text></g>)}
        {GRAVITY_LEVELS.map((lv, i) => <g key={lv.id}><line x1={PAD.l + colW * (i + 1)} x2={PAD.l + colW * (i + 1)} y1={PAD.t} y2={H - PAD.b} stroke="var(--rule-strong)" strokeWidth={i < 3 ? 0.6 : 0} /><text x={cxOf(i)} y={H - PAD.b + 18} textAnchor="middle" fontSize="12" fill="var(--ink)">{lv.label}</text><text x={cxOf(i)} y={H - PAD.b + 34} textAnchor="middle" fontSize="11" fill="var(--faint)">{lv.g}</text>{!panel.points.some((p) => p.level === lv.id) && <text x={cxOf(i)} y={H - PAD.b - 12} textAnchor="middle" fontSize="12" fill="var(--blowoff)">No burn data in corpus</text>}</g>)}
        <text transform={`translate(15 ${(PAD.t + H - PAD.b) / 2}) rotate(-90)`} textAnchor="middle" fontSize="12" fill="var(--muted)">Oxygen (% by volume)</text>
        {placed.map(({ p, cx }, i) => {
          const cy = y(p.o2), href = p.href ?? pdfLink(p.cite.source_id, p.cite.pdf_page ?? undefined);
          const title = `${p.label}. ${p.setup}. Source ${p.cite.source_id}, page ${p.cite.pdf_page ?? "n/a"}.`;
          if (p.o2End != null) {
            const ey = y(p.o2End);
            return <a key={i} href={href} target={p.href ? undefined : "_blank"} rel="noreferrer"><title>{title}</title><line x1={cx} x2={cx} y1={cy} y2={ey} stroke="var(--flame)" strokeWidth={4} /><circle cx={cx} cy={cy} r={4} fill="var(--flame)" />{p.wentOutAtEnd ? <path d={`M${cx - 6} ${ey - 6} L${cx + 6} ${ey + 6} M${cx + 6} ${ey - 6} L${cx - 6} ${ey + 6}`} stroke="var(--quench)" strokeWidth={2.5} /> : <circle cx={cx} cy={ey} r={6} fill="var(--flame)" stroke="var(--ink)" strokeWidth={1.2} />}</a>;
          }
          return <a key={i} href={href} target={p.href ? undefined : "_blank"} rel="noreferrer"><title>{title}</title><circle cx={cx} cy={cy} r={5} fill={p.burned ? "var(--flame)" : "var(--void)"} stroke={p.burned ? "var(--void)" : "var(--inert)"} strokeWidth={p.burned ? 1 : 2} /><circle cx={cx} cy={cy} r={8} fill="transparent" /></a>;
        })}
      </svg>
      <figcaption className={s.legend}>
        <span><svg viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="var(--flame)" /></svg>Burned</span>
        <span><svg viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="var(--void)" stroke="var(--inert)" strokeWidth="2" /></svg>Did not burn / no flame</span>
        <span><svg viewBox="0 0 14 14" aria-hidden="true"><line x1="7" x2="7" y1="1" y2="13" stroke="var(--flame)" strokeWidth="4" /></svg>Oxygen fell during the burn (LUCI)</span>
        <span><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2 L12 12 M12 2 L2 12" stroke="var(--quench)" strokeWidth="2.5" /></svg>Went out at that oxygen</span>
      </figcaption>
    </figure>
  );
}
