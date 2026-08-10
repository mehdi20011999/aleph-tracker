import { useState } from 'react'
import { SERVICES, STAGES, DEPOSITS } from '../lib/plan'
import { useData } from '../context/DataContext'

const BLANK = {
  client: '',
  clientId: '',
  deliverable: SERVICES[1].name,
  value: '',
  currency: 'MAD',
  deadline: '',
  stage: 'Quoted',
  deposit: 'none',
  hours: '',
}

/**
 * Used for both adding and editing. Pass `initial` to edit an existing project;
 * omit it to create a new one.
 */
export default function ProjectForm({ initial, onSubmit, onCancel }) {
  const { data } = useData()
  const { clients } = data
  const [f, setF] = useState({ ...BLANK, ...(initial || {}) })
  const [err, setErr] = useState('')
  const editing = Boolean(initial)

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  /** Prefill value from the rate card when a deliverable is picked (new projects only). */
  function pickDeliverable(e) {
    const name = e.target.value
    const svc = SERVICES.find((s) => s.name === name)
    setF((prev) => ({
      ...prev,
      deliverable: name,
      value: !editing && svc ? (prev.currency === 'EUR' ? svc.eur : svc.mad) : prev.value,
    }))
  }

  function submit() {
    if (!f.client.trim()) return setErr('Add a client name.')
    if (!Number(f.value) || Number(f.value) <= 0) return setErr('Add a project value.')
    setErr('')
    onSubmit({
      ...f,
      client: f.client.trim(),
      value: Number(f.value),
      hours: Number(f.hours) || 0,
    })
    if (!editing) setF(BLANK)
  }

  return (
    <div className="panel" style={{ marginBottom: 18 }}>
      <div className="fgrid">
        <div className="fld">
          <label htmlFor="client">Client</label>
          <input
            id="client"
            value={f.client}
            onChange={set('client')}
            placeholder="Dr. Rahali — trisomy 21"
          />
        </div>

        {clients.length > 0 && (
          <div className="fld">
            <label htmlFor="clientId">Link to client record</label>
            <select
              id="clientId"
              value={f.clientId || ''}
              onChange={(e) => {
                const c = clients.find((x) => x.id === e.target.value)
                setF((prev) => ({
                  ...prev,
                  clientId: e.target.value,
                  client: c ? c.name : prev.client,
                }))
              }}
            >
              <option value="">Not linked</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="fld">
          <label htmlFor="deliverable">Deliverable</label>
          <select id="deliverable" value={f.deliverable} onChange={pickDeliverable}>
            {SERVICES.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="fld">
          <label htmlFor="value">Value</label>
          <input id="value" type="number" min="0" step="100" value={f.value} onChange={set('value')} />
        </div>

        <div className="fld">
          <label htmlFor="currency">Currency</label>
          <select id="currency" value={f.currency} onChange={set('currency')}>
            <option value="MAD">MAD</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div className="fld">
          <label htmlFor="deadline">Deadline</label>
          <input id="deadline" type="date" value={f.deadline} onChange={set('deadline')} />
        </div>

        <div className="fld">
          <label htmlFor="stage">Stage</label>
          <select id="stage" value={f.stage} onChange={set('stage')}>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="fld">
          <label htmlFor="deposit">Deposit</label>
          <select id="deposit" value={f.deposit} onChange={set('deposit')}>
            {DEPOSITS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div className="fld">
          <label htmlFor="hours">Hours spent</label>
          <input
            id="hours"
            type="number"
            min="0"
            step="0.5"
            value={f.hours}
            onChange={set('hours')}
            placeholder="optional"
          />
        </div>
      </div>

      <div className="form-foot">
        <button className="btn" onClick={submit}>
          {editing ? 'Save changes' : 'Add to board'}
        </button>
        <button className="btn ghost" onClick={onCancel}>
          Cancel
        </button>
        {err && <span className="form-err">{err}</span>}
      </div>
    </div>
  )
}
