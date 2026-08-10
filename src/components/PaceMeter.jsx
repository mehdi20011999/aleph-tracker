import { GATES } from '../lib/plan'
import { fmt, planToDate } from '../lib/calc'

/**
 * The signature element: cumulative collected revenue as a filled bar,
 * with a vertical rule marking where the plan says you should be today.
 * Ahead or behind is readable at a glance without reading any number.
 */
export default function PaceMeter({ collected, target }) {
  const expected = planToDate(target)
  const pct = Math.min(100, (collected / target) * 100)
  const planPct = Math.min(100, (expected / target) * 100)
  const diff = collected - expected

  let verdict = 'Awaiting first entry'
  let color = 'var(--ink-faint)'
  if (collected > 0) {
    if (diff >= 0) {
      verdict = `Ahead by ${fmt(diff)} MAD`
      color = 'var(--good)'
    } else {
      verdict = `Behind by ${fmt(-diff)} MAD`
      color = 'var(--warn)'
    }
  }

  return (
    <div className="pace">
      <div className="pace-head">
        <div className="eyebrow">Cumulative collected vs. plan</div>
        <div className="pace-verdict" style={{ color }}>
          {verdict}
        </div>
      </div>
      <div className="pace-track">
        <div className="pace-fill" style={{ width: `${pct}%` }} />
        {GATES.slice(0, 3).map((g) => (
          <div key={g.date} className="pace-gate" style={{ left: `${(g.amount / target) * 100}%` }}>
            <span>{g.label.split(' ')[1].slice(0, 3)} {Math.round(g.amount / 1000)}k</span>
          </div>
        ))}
        <div className="pace-plan" style={{ left: `${planPct}%` }} />
      </div>
      <div className="pace-scale">
        <span>0</span>
        <span>{fmt(target / 2)} MAD</span>
        <span>{fmt(target)}</span>
      </div>
    </div>
  )
}
