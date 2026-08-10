import { Link } from 'react-router-dom'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { useData } from '../context/DataContext'
import PaceMeter from '../components/PaceMeter'
import StatCard from '../components/StatCard'
import Alerts from '../components/Alerts'
import { GATES, TOTAL_STEPS, REVIEW_METRICS } from '../lib/plan'
import {
  fmt, totalCollected, cumulativeSeries, buildAlerts, daysRemaining,
  isActive, toMad, workloadByWeek, peakWeek,
} from '../lib/calc'

export default function Dashboard() {
  const { data } = useData()
  const { projects, manualRevenue, settings, steps, reviews } = data

  const collected = totalCollected(projects, manualRevenue, settings)
  const series = cumulativeSeries(projects, manualRevenue, settings)
  const alerts = buildAlerts(projects, settings)
  const gap = Math.max(0, settings.target - collected)
  const days = daysRemaining()
  const load = projects.filter(isActive).length
  const unsecured = projects
    .filter((p) => isActive(p) && p.deposit === 'none')
    .reduce((a, p) => a + toMad(p, settings), 0)
  const stepsDone = Object.values(steps).filter(Boolean).length
  const peak = peakWeek(workloadByWeek(projects))
  const perDay = days > 0 ? gap / days : 0

  return (
    <div className="page">
      <header className="page-head">
        <div className="eyebrow">Aleph Training · Dashboard</div>
        <h1>
          {fmt(settings.target)} MAD by <em>31 December 2026</em>
        </h1>
        <p>
          Collected, not invoiced. Work delivered in December and paid in January does not count
          toward this target.
        </p>
      </header>

      <PaceMeter collected={collected} target={settings.target} />

      <div className="stats">
        <StatCard
          label="Collected"
          value={fmt(collected)}
          sub="MAD in hand"
          tone={collected > 0 ? 'good' : ''}
        />
        <StatCard label="Still to earn" value={fmt(gap)} sub={`${fmt(perDay)} MAD per day`} />
        <StatCard label="Days remaining" value={days} sub="until 31 December" />
        <StatCard
          label="Active load"
          value={`${load} / ${settings.capacityCap}`}
          sub="projects in progress"
          tone={load > settings.capacityCap ? 'hot' : load === settings.capacityCap ? 'warn' : ''}
        />
      </div>

      <Alerts items={alerts} />

      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Trajectory</div>
            <h2>Cumulative revenue against plan</h2>
          </div>
          <Link className="btn ghost" to="/revenue">
            Edit revenue
          </Link>
        </div>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={series} margin={{ top: 6, right: 12, left: 4, bottom: 4 }}>
              <CartesianGrid stroke="#e2e7ee" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#8b96ac', fontFamily: 'IBM Plex Mono' }}
                axisLine={{ stroke: '#cdd4e0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#8b96ac', fontFamily: 'IBM Plex Mono' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v / 1000}k`}
              />
              <Tooltip
                formatter={(v) => `${fmt(v)} MAD`}
                contentStyle={{
                  fontFamily: 'IBM Plex Mono', fontSize: 12,
                  border: '1px solid #cdd4e0', borderRadius: 3,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Inter' }} />
              <Line
                type="monotone" dataKey="cumPlan" name="Plan"
                stroke="#8b96ac" strokeWidth={2} strokeDasharray="5 4" dot={false}
              />
              <Line
                type="monotone" dataKey="cumActual" name="Collected"
                stroke="#2b3a94" strokeWidth={2.5} dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Gates</div>
            <h2>Checkpoints that change the plan</h2>
          </div>
        </div>
        <div className="grid-cards">
          {GATES.map((g) => {
            const met = collected >= g.amount
            return (
              <div key={g.date} className={`gate-card ${met ? 'met' : ''}`}>
                <div className="d">
                  {g.label} {met && '· cleared'}
                </div>
                <div className="amt">{fmt(g.amount)} MAD</div>
                <div className="act">{g.action}</div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Cadence</div>
            <h2>Sunday review, 45 minutes</h2>
          </div>
          <Link className="btn ghost" to="/workload">
            {reviews.length ? `${reviews.length} logged` : 'Log this week'}
          </Link>
        </div>
        <div className="panel" style={{ padding: 0 }}>
          {REVIEW_METRICS.map(([k, v]) => (
            <div className="review-row" key={k}>
              <span>{k}</span>
              <b>{v}</b>
            </div>
          ))}
        </div>
        {peak && peak.count > settings.capacityCap && (
          <div className="alerts">
            <div className="alert hot">
              The week of {peak.label} has {peak.count} deadlines against a cap of{' '}
              {settings.capacityCap}. Move a date or subcontract now, while there is still room to
              do either.
            </div>
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Execution</div>
            <h2>Plan progress</h2>
          </div>
          <Link className="btn ghost" to="/plan">
            {stepsDone} / {TOTAL_STEPS} steps done
          </Link>
        </div>
        <div className="panel">
          <div
            style={{
              height: 8,
              background: 'var(--paper)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(stepsDone / TOTAL_STEPS) * 100}%`,
                background: 'var(--good)',
              }}
            />
          </div>
          <p style={{ margin: '12px 0 0', fontSize: 13.5, color: 'var(--ink-soft)' }}>
            {stepsDone === 0
              ? 'Nothing started. Phase 0 takes about two weeks and unblocks everything downstream.'
              : stepsDone < 10
                ? 'Foundation work underway. The payment account and the first export bids are the two blockers.'
                : 'Good progress. Capacity work in Phase 1 is what makes the November numbers survivable.'}
          </p>
        </div>
      </section>

      <p className="foot">
        Unsecured work in progress currently stands at <b>{fmt(unsecured)} MAD</b> — work underway
        with no deposit received. That figure is what turns into unpaid January invoices.
        <br />
        <br />
        Figures are projections. The auto-entrepreneur revenue ceiling for service activities sits
        close to this target; confirm your position with a comptable. This is a planning tool, not
        tax or legal advice.
      </p>
    </div>
  )
}
