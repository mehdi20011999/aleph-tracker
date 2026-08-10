import { useState } from 'react'
import { useData } from '../context/DataContext'
import StatCard from '../components/StatCard'
import { CLIENT_SOURCES, INTRO_STATES, INSTITUTIONS } from '../lib/plan'
import { fmt, clientStats } from '../lib/calc'

const BLANK = {
  name: '',
  institution: INSTITUTIONS[0],
  contact: '',
  source: CLIENT_SOURCES[0],
  intro: 'not-asked',
  note: '',
}

export default function Clients() {
  const { data, addClient, updateClient, removeClient } = useData()
  const { clients, projects, settings } = data
  const [form, setForm] = useState(null)
  const [err, setErr] = useState('')

  const asked = clients.filter((c) => c.intro !== 'not-asked').length
  const given = clients.filter((c) => c.intro === 'given').length
  const lifetime = clients.reduce((a, c) => a + clientStats(c.id, projects, settings).lifetime, 0)

  function submit() {
    if (!form.name.trim()) return setErr('Add a name.')
    setErr('')
    addClient({ ...form, name: form.name.trim() })
    setForm(null)
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="page">
      <header className="page-head">
        <div className="eyebrow">Relationships</div>
        <h1>
          Every client sits in <em>a laboratory</em>
        </h1>
        <p>
          A past client is not a closed transaction. Each one shares a doctoral school with ten to
          forty candidates facing the same problems. This page tracks who you have asked for an
          introduction and who you have not.
        </p>
      </header>

      <div className="stats">
        <StatCard label="Clients" value={clients.length} sub="on record" />
        <StatCard
          label="Asked for intro"
          value={`${asked} / ${clients.length}`}
          sub="referral campaign"
          tone={clients.length && asked < clients.length ? 'warn' : ''}
        />
        <StatCard label="Introductions given" value={given} sub="warm leads generated" tone={given ? 'good' : ''} />
        <StatCard label="Lifetime value" value={fmt(lifetime)} sub="MAD, all projects" />
      </div>

      {clients.length > 0 && asked < clients.length && (
        <div className="alerts">
          <div className="alert warn">
            {clients.length - asked} client{clients.length - asked > 1 ? 's have' : ' has'} not been
            asked for an introduction. This is the cheapest revenue in the plan — a personal message
            referencing their own project, asking for two names.
          </div>
        </div>
      )}

      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Directory</div>
            <h2>Clients and referral status</h2>
          </div>
          <button className="btn" onClick={() => setForm(form ? null : BLANK)}>
            {form ? 'Close form' : 'Add client'}
          </button>
        </div>

        {form && (
          <div className="panel" style={{ marginBottom: 18 }}>
            <div className="fgrid">
              <div className="fld">
                <label htmlFor="cname">Name</label>
                <input id="cname" value={form.name} onChange={set('name')} placeholder="Dr. Rahali" />
              </div>
              <div className="fld">
                <label htmlFor="cinst">Institution</label>
                <select id="cinst" value={form.institution} onChange={set('institution')}>
                  {INSTITUTIONS.map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div className="fld">
                <label htmlFor="ccontact">Contact</label>
                <input id="ccontact" value={form.contact} onChange={set('contact')} placeholder="email or phone" />
              </div>
              <div className="fld">
                <label htmlFor="csource">Came from</label>
                <select id="csource" value={form.source} onChange={set('source')}>
                  {CLIENT_SOURCES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="fld">
                <label htmlFor="cnote">Note</label>
                <input id="cnote" value={form.note} onChange={set('note')} placeholder="thesis topic, defense date…" />
              </div>
            </div>
            <div className="form-foot">
              <button className="btn" onClick={submit}>
                Add client
              </button>
              <button className="btn ghost" onClick={() => setForm(null)}>
                Cancel
              </button>
              {err && <span className="form-err">{err}</span>}
            </div>
          </div>
        )}

        {clients.length === 0 ? (
          <div className="empty">
            <p>
              No clients yet. Add the people you have already worked with — they are the warmest
              pipeline you have.
            </p>
            <button className="btn" onClick={() => setForm(BLANK)}>
              Add the first one
            </button>
          </div>
        ) : (
          clients.map((c) => {
            const s = clientStats(c.id, projects, settings)
            const cls = c.intro === 'given' ? 'clear' : c.intro === 'not-asked' ? 'none' : 'soon'
            return (
              <article className={`proj ${cls}`} key={c.id}>
                <div className="p-top">
                  <span className="p-client">{c.name}</span>
                  <span className="p-runway">{c.source}</span>
                  <span className="p-val">
                    {fmt(s.lifetime)} MAD · {s.count} project{s.count === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="p-deliv">
                  {c.institution}
                  {c.contact && ` · ${c.contact}`}
                  {c.note && ` · ${c.note}`}
                </div>
                <div className="p-ctrl">
                  <select
                    aria-label={`Referral status for ${c.name}`}
                    value={c.intro}
                    onChange={(e) => updateClient(c.id, { intro: e.target.value })}
                  >
                    {INTRO_STATES.map((i) => (
                      <option key={i.value} value={i.value}>
                        {i.label}
                      </option>
                    ))}
                  </select>
                  {s.owed > 0 && <span className="flagbit">{fmt(s.owed)} MAD outstanding</span>}
                  <button className="del" onClick={() => removeClient(c.id)}>
                    Remove
                  </button>
                </div>
              </article>
            )
          })
        )}
      </section>
    </div>
  )
}
