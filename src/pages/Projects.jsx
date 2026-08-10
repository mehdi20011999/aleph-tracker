import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import ProjectForm from '../components/ProjectForm'
import ProjectCard from '../components/ProjectCard'
import StatCard from '../components/StatCard'
import Alerts from '../components/Alerts'
import {
  fmt, toMad, isOpen, isWon, isActive, isLead, isLost,
  collectedOf, outstandingOf, buildAlerts, conversionStats,
} from '../lib/calc'

const FILTERS = [
  ['live', 'Live work'],
  ['leads', 'Leads'],
  ['active', 'In progress'],
  ['unpaid', 'Unpaid'],
  ['all', 'All'],
]

export default function Projects() {
  const { data, addProject, updateProject, removeProject } = useData()
  const { projects, settings } = data
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('live')
  const [q, setQ] = useState('')

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase()
    const f = projects.filter((p) => {
      if (term && !`${p.client} ${p.deliverable}`.toLowerCase().includes(term)) return false
      if (filter === 'live') return isWon(p)
      if (filter === 'leads') return isLead(p)
      if (filter === 'active') return isActive(p)
      if (filter === 'unpaid') return !isLost(p) && outstandingOf(p, settings) > 0
      return true
    })
    return f.sort((a, b) => {
      if (isOpen(a) !== isOpen(b)) return isOpen(a) ? -1 : 1
      return (a.deadline || '9999-12-31') < (b.deadline || '9999-12-31') ? -1 : 1
    })
  }, [projects, filter, q, settings])

  const committed = projects.filter(isWon).reduce((a, p) => a + toMad(p, settings), 0)
  const collected = projects.reduce((a, p) => a + collectedOf(p, settings), 0)
  const unsecured = projects
    .filter((p) => isActive(p) && p.deposit === 'none')
    .reduce((a, p) => a + toMad(p, settings), 0)
  const conv = conversionStats(projects)
  const pipeline = projects.filter(isLead).reduce((a, p) => a + toMad(p, settings), 0)

  return (
    <div className="page">
      <header className="page-head">
        <div className="eyebrow">Pipeline</div>
        <h1>
          Seven projects, <em>one screen</em>
        </h1>
        <p>
          Sorted by what is due soonest. Log export bids as <b>Lead</b>; the ones you do not win
          become <b>Lost</b>, and the conversion rate tells you whether the problem is your pricing
          or your proposal.
        </p>
      </header>

      <div className="stats">
        <StatCard label="Committed" value={fmt(committed)} sub="MAD, work won" />
        <StatCard
          label="In pipeline"
          value={fmt(pipeline)}
          sub={`${conv.leads} open lead${conv.leads === 1 ? '' : 's'}`}
        />
        <StatCard label="Collected" value={fmt(collected)} sub="MAD, in hand" tone="good" />
        <StatCard
          label="Unsecured"
          value={fmt(unsecured)}
          sub="MAD, no deposit taken"
          tone={unsecured > 0 ? 'hot' : ''}
        />
      </div>

      {conv.decided >= 3 && (
        <div className="alerts">
          <div className={`alert ${conv.rate < 0.2 ? 'warn' : 'ok'}`}>
            Conversion: {conv.won} won, {conv.lost} lost — {Math.round(conv.rate * 100)}% of decided
            bids.{' '}
            {conv.rate < 0.2
              ? 'Below 20% is usually the proposal rather than the price. Check the portfolio artifacts are attached and the scope is concrete.'
              : 'The export plan assumes roughly two wins in ten bids, so anything above that is working.'}
          </div>
        </div>
      )}

      <Alerts items={buildAlerts(projects, settings)} />

      <section className="section">
        <div className="section-head">
          <div className="nav-links" style={{ marginLeft: 0 }}>
            {FILTERS.map(([k, label]) => (
              <button
                key={k}
                className={`btn ${filter === k ? '' : 'ghost'}`}
                onClick={() => setFilter(k)}
              >
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              className="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              aria-label="Search projects"
            />
            <button
              className="btn"
              onClick={() => {
                setEditing(null)
                setAdding((s) => !s)
              }}
            >
              {adding ? 'Close form' : 'Add project'}
            </button>
          </div>
        </div>

        {adding && (
          <ProjectForm
            onSubmit={(p) => {
              addProject(p)
              setAdding(false)
            }}
            onCancel={() => setAdding(false)}
          />
        )}

        {editing && (
          <ProjectForm
            initial={editing}
            onSubmit={(p) => {
              updateProject(editing.id, p)
              setEditing(null)
            }}
            onCancel={() => setEditing(null)}
          />
        )}

        {visible.length === 0 ? (
          <div className="empty">
            <p>
              {projects.length === 0
                ? 'Nothing tracked yet. Add the projects you are carrying right now, including the ones you have only quoted.'
                : 'No projects match this filter.'}
            </p>
            {projects.length === 0 && (
              <button className="btn" onClick={() => setAdding(true)}>
                Add the first one
              </button>
            )}
          </div>
        ) : (
          visible.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              settings={settings}
              onUpdate={updateProject}
              onRemove={removeProject}
              onEdit={(proj) => {
                setAdding(false)
                setEditing(proj)
              }}
            />
          ))
        )}
      </section>
    </div>
  )
}
