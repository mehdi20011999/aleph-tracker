import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from 'recharts'
import { useData } from '../context/DataContext'
import { MONTHS } from '../lib/plan'
import {
  fmt, cumulativeSeries, monthlyCollected, collectedOf, totalCollected,
  effectiveRateByService, overallRate,
} from '../lib/calc'

export default function Revenue() {
  const { data, setManualRevenue } = useData()
  const { projects, manualRevenue, settings } = data

  const series = cumulativeSeries(projects, manualRevenue, settings)
  const collectedByMonth = monthlyCollected(projects, manualRevenue, settings)
  const total = totalCollected(projects, manualRevenue, settings)
  const rates = effectiveRateByService(projects, settings)
  const overall = overallRate(projects, settings)
  const planTotal = MONTHS.reduce((a, m) => a + m.plan, 0)

  // How much of each month came from tracked projects rather than manual entry.
  const fromProjects = {}
  MONTHS.forEach((m) => { fromProjects[m.key] = 0 })
  projects.forEach((p) => {
    if (!p.deadline) return
    const k = p.deadline.slice(0, 7)
    if (k in fromProjects) fromProjects[k] += collectedOf(p, settings)
  })

  return (
    <div className="page">
      <header className="page-head">
        <div className="eyebrow">Ledger</div>
        <h1>What you <em>actually collected</em></h1>
        <p>
          Cash from tracked projects is counted automatically in the month of its deadline. Use the
          manual column for anything not on the board — cohort seats, workshop sales, retainers.
        </p>
      </header>

      <div className="chart-box">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={series} margin={{ top: 6, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid stroke="#e2e7ee" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8b96ac', fontFamily: 'IBM Plex Mono' }}
              axisLine={{ stroke: '#cdd4e0' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#8b96ac', fontFamily: 'IBM Plex Mono' }}
              axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip formatter={(v) => `${fmt(v)} MAD`}
              contentStyle={{ fontFamily: 'IBM Plex Mono', fontSize: 12, border: '1px solid #cdd4e0', borderRadius: 3 }} />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Inter' }} />
            <Bar dataKey="plan" name="Plan" fill="#cdd4e0" radius={[2, 2, 0, 0]} />
            <Bar dataKey="actual" name="Collected" radius={[2, 2, 0, 0]}>
              {series.map((row, i) => (
                <Cell key={i} fill={row.actual >= row.plan ? '#0f6e5f' : '#2b3a94'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <section className="section">
        <div className="section-head">
          <div><div className="eyebrow">Month by month</div><h2>Plan against actual</h2></div>
        </div>
        <div className="tablewrap">
          <table className="data">
            <thead>
              <tr>
                <th>Month</th>
                <th className="num">Plan</th>
                <th className="num">From projects</th>
                <th className="num">Manual entry</th>
                <th className="num">Collected</th>
                <th className="num">Cumulative delta</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((m, i) => {
                const row = series[i]
                return (
                  <tr key={m.key}>
                    <td>{m.label}</td>
                    <td className="num">{fmt(m.plan)}</td>
                    <td className="num" style={{ color: '#8b96ac' }}>{fmt(fromProjects[m.key])}</td>
                    <td className="num">
                      <input
                        type="number" min="0" step="500" placeholder="0"
                        aria-label={`Manual revenue for ${m.label}`}
                        value={manualRevenue[m.key] || ''}
                        onChange={(e) => setManualRevenue(m.key, e.target.value)}
                      />
                    </td>
                    <td className="num">{fmt(collectedByMonth[m.key])}</td>
                    <td className="num">
                      {row.cumActual > 0
                        ? <span className={row.delta >= 0 ? 'pos' : 'neg'}>{row.delta >= 0 ? '+' : ''}{fmt(row.delta)}</span>
                        : <span style={{ color: '#b8c0cd' }}>—</span>}
                    </td>
                  </tr>
                )
              })}
              <tr className="row-total">
                <td>Total</td>
                <td className="num">{fmt(planTotal)}</td>
                <td className="num">{fmt(Object.values(fromProjects).reduce((a, b) => a + b, 0))}</td>
                <td className="num" style={{ paddingRight: 24 }}>
                  {fmt(Object.values(manualRevenue).reduce((a, b) => a + (Number(b) || 0), 0))}
                </td>
                <td className="num">{fmt(total)}</td>
                <td className="num">
                  <span className={total - planTotal >= 0 ? 'pos' : 'neg'}>
                    {total - planTotal >= 0 ? '+' : ''}{fmt(total - planTotal)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Effective rate</div>
            <h2>What each service actually returns</h2>
          </div>
          {overall.rate && (
            <span className="mono" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
              overall {fmt(overall.rate)} MAD/h across {fmt(overall.hours)}h
            </span>
          )}
        </div>

        {rates.length === 0 ? (
          <div className="empty">
            <p>
              No hours logged yet. Add hours when editing a project and this table will show which
              fixed prices are generous and which are traps — two services at the same price can
              differ threefold in real return.
            </p>
          </div>
        ) : (
          <>
            <div className="tablewrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th className="num">Projects</th>
                    <th className="num">Hours</th>
                    <th className="num">Value (MAD)</th>
                    <th className="num">MAD / hour</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((r) => (
                    <tr key={r.service}>
                      <td style={{ fontFamily: 'Inter, sans-serif' }}>{r.service}</td>
                      <td className="num">{r.n}</td>
                      <td className="num">{fmt(r.hours)}</td>
                      <td className="num">{fmt(r.value)}</td>
                      <td className="num">
                        <span
                          className={
                            overall.rate && r.rate < overall.rate * 0.7
                              ? 'neg'
                              : overall.rate && r.rate > overall.rate * 1.3
                                ? 'pos'
                                : ''
                          }
                        >
                          {fmt(r.rate)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="foot">
              Anything well below your overall rate is either underpriced or taking longer than it
              should — the template library in Phase 1 is aimed squarely at the second case. Repricing
              the worst performer is usually easier than winning another client.
            </p>
          </>
        )}
      </section>
    </div>
  )
}
