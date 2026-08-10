import { useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  LineChart, Line, Legend,
} from 'recharts'
import { useData } from '../context/DataContext'
import StatCard from '../components/StatCard'
import { REVIEW_METRICS } from '../lib/plan'
import { fmt, workloadByWeek, peakWeek, reviewTrend, isActive } from '../lib/calc'

const BLANK = {
  date: new Date().toISOString().slice(0, 10),
  collected: '',
  active: '',
  leads: '',
  receivables: '',
  hours: '',
  note: '',
}

export default function Workload() {
  const { data, addReview, removeReview } = useData()
  const { projects, reviews, settings } = data
  const [form, setForm] = useState(null)

  const weeks = workloadByWeek(projects)
  const peak = peakWeek(weeks)
  const trend = reviewTrend(reviews)
  const load = projects.filter(isActive).length
  const cap = settings.capacityCap
  const overloadedWeeks = weeks.filter((w) => w.count > cap).length

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  function submit() {
    addReview({
      ...form,
      collected: Number(form.collected) || 0,
      active: Number(form.active) || 0,
      leads: Number(form.leads) || 0,
      receivables: Number(form.receivables) || 0,
      hours: Number(form.hours) || 0,
    })
    setForm(null)
  }

  const last = trend[trend.length - 1]

  return (
    <div className="page">
      <header className="page-head">
        <div className="eyebrow">Capacity</div>
        <h1>
          Where the deadlines <em>pile up</em>
        </h1>
        <p>
          Five deadlines landing in one week is a problem to solve in October, not to discover in
          November. Each bar is one week; anything above the capacity line needs a date moved or
          work subcontracted now.
        </p>
      </header>

      <div className="stats">
        <StatCard
          label="Active now"
          value={`${load} / ${cap}`}
          sub="projects in progress"
          tone={load > cap ? 'hot' : load === cap ? 'warn' : ''}
        />
        <StatCard
          label="Peak week"
          value={peak?.count ?? 0}
          sub={peak ? `week of ${peak.label}` : 'no deadlines set'}
          tone={peak && peak.count > cap ? 'hot' : ''}
        />
        <StatCard
          label="Overloaded weeks"
          value={overloadedWeeks}
          sub={`above the cap of ${cap}`}
          tone={overloadedWeeks ? 'hot' : 'good'}
        />
        <StatCard
          label="Reviews logged"
          value={reviews.length}
          sub={last ? `last: ${last.hours}h worked` : 'none yet'}
        />
      </div>

      {overloadedWeeks > 0 && (
        <div className="alerts">
          <div className="alert hot">
            {overloadedWeeks} week{overloadedWeeks > 1 ? 's exceed' : ' exceeds'} your capacity cap.
            Move a deadline, subcontract the formatting layer, or decline the next enquiry — quality
            degrades before throughput improves.
          </div>
        </div>
      )}

      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Runway</div>
            <h2>Deadlines by week</h2>
          </div>
        </div>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeks} margin={{ top: 6, right: 12, left: 4, bottom: 4 }}>
              <CartesianGrid stroke="#e2e7ee" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#8b96ac', fontFamily: 'IBM Plex Mono' }}
                axisLine={{ stroke: '#cdd4e0' }}
                tickLine={false}
                interval={0}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#8b96ac', fontFamily: 'IBM Plex Mono' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => `${v} due`}
                labelFormatter={(l) => `Week of ${l}`}
                contentStyle={{
                  fontFamily: 'IBM Plex Mono', fontSize: 12,
                  border: '1px solid #cdd4e0', borderRadius: 3,
                }}
              />
              <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                {weeks.map((w, i) => (
                  <Cell key={i} fill={w.count > cap ? '#9c2b2b' : w.count === cap ? '#a8560a' : '#2b3a94'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Cadence</div>
            <h2>Sunday review</h2>
          </div>
          <button className="btn" onClick={() => setForm(form ? null : BLANK)}>
            {form ? 'Close' : 'Log this week'}
          </button>
        </div>

        {form && (
          <div className="panel" style={{ marginBottom: 18 }}>
            <div className="fgrid">
              <div className="fld">
                <label htmlFor="rdate">Week ending</label>
                <input id="rdate" type="date" value={form.date} onChange={set('date')} />
              </div>
              <div className="fld">
                <label htmlFor="rcol">Collected (MAD)</label>
                <input id="rcol" type="number" min="0" value={form.collected} onChange={set('collected')} />
              </div>
              <div className="fld">
                <label htmlFor="ract">Active projects</label>
                <input id="ract" type="number" min="0" value={form.active} onChange={set('active')} />
              </div>
              <div className="fld">
                <label htmlFor="rlead">New leads</label>
                <input id="rlead" type="number" min="0" value={form.leads} onChange={set('leads')} />
              </div>
              <div className="fld">
                <label htmlFor="rrec">Receivables (MAD)</label>
                <input id="rrec" type="number" min="0" value={form.receivables} onChange={set('receivables')} />
              </div>
              <div className="fld">
                <label htmlFor="rhrs">Hours worked</label>
                <input id="rhrs" type="number" min="0" value={form.hours} onChange={set('hours')} />
              </div>
            </div>
            <div className="form-foot">
              <button className="btn" onClick={submit}>
                Save review
              </button>
              <button className="btn ghost" onClick={() => setForm(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <>
            <div className="panel" style={{ padding: 0 }}>
              {REVIEW_METRICS.map(([k, v]) => (
                <div className="review-row" key={k}>
                  <span>{k}</span>
                  <b>{v}</b>
                </div>
              ))}
            </div>
            <p className="foot">
              Six numbers, forty-five minutes, every Sunday. Logging them builds the trend that
              tells you whether hours are creeping up while revenue stays flat.
            </p>
          </>
        ) : (
          <>
            <div className="chart-box" style={{ marginBottom: 14 }}>
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={trend} margin={{ top: 6, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke="#e2e7ee" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8b96ac', fontFamily: 'IBM Plex Mono' }}
                    axisLine={{ stroke: '#cdd4e0' }} tickLine={false} />
                  <YAxis yAxisId="l" tick={{ fontSize: 11, fill: '#8b96ac', fontFamily: 'IBM Plex Mono' }}
                    axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11, fill: '#8b96ac', fontFamily: 'IBM Plex Mono' }}
                    axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontFamily: 'IBM Plex Mono', fontSize: 12, border: '1px solid #cdd4e0', borderRadius: 3 }} />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Inter' }} />
                  <Line yAxisId="l" type="monotone" dataKey="collected" name="Collected (MAD)" stroke="#2b3a94" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line yAxisId="r" type="monotone" dataKey="hours" name="Hours" stroke="#a8560a" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="tablewrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Week ending</th>
                    <th className="num">Collected</th>
                    <th className="num">Active</th>
                    <th className="num">Leads</th>
                    <th className="num">Receivables</th>
                    <th className="num">Hours</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {[...reviews]
                    .sort((a, b) => (a.date > b.date ? -1 : 1))
                    .map((r) => (
                      <tr key={r.id}>
                        <td>{r.date}</td>
                        <td className="num">{fmt(r.collected)}</td>
                        <td className="num">{r.active}</td>
                        <td className="num">{r.leads}</td>
                        <td className="num">{fmt(r.receivables)}</td>
                        <td className="num">
                          <span className={r.hours > 55 ? 'neg' : ''}>{r.hours}</span>
                        </td>
                        <td className="num">
                          <button className="del" onClick={() => removeReview(r.id)}>
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
