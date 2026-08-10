import { useState } from 'react'
import { useData } from '../context/DataContext'
import { SERVICES, INVOICE_TERMS } from '../lib/plan'
import { fmt, toMad, collectedOf, outstandingOf, isOpen } from '../lib/calc'

const today = () => new Date().toISOString().slice(0, 10)

export default function Invoices() {
  const { data, bumpInvoiceSeq } = useData()
  const { projects, clients, settings, invoiceSeq } = data

  const [sel, setSel] = useState('')
  const [kind, setKind] = useState('invoice')
  const [issuer, setIssuer] = useState({
    name: 'Aleph Training',
    line: 'Academic research & statistical support',
    contact: 'Meknès, Morocco',
  })

  const project = projects.find((p) => p.id === sel)
  const client = project && clients.find((c) => c.id === project.clientId)

  const total = project ? toMad(project, settings) : 0
  const paid = project ? collectedOf(project, settings) : 0
  const due = project ? outstandingOf(project, settings) : 0
  const deposit = total * 0.5

  function print() {
    if (kind === 'invoice') bumpInvoiceSeq()
    window.print()
  }

  return (
    <div className="page">
      <div className="no-print">
        <header className="page-head">
          <div className="eyebrow">Documents</div>
          <h1>
            Quotes and <em>invoices</em>
          </h1>
          <p>
            Pick a project, choose whether it is a quote or an invoice, then print. Use your
            browser's print dialogue and select "Save as PDF" — no other software needed.
          </p>
        </header>

        <div className="panel">
          <div className="fgrid">
            <div className="fld">
              <label htmlFor="proj">Project</label>
              <select id="proj" value={sel} onChange={(e) => setSel(e.target.value)}>
                <option value="">Select a project…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.client} — {p.deliverable}
                    {isOpen(p) ? '' : ' (paid)'}
                  </option>
                ))}
              </select>
            </div>
            <div className="fld">
              <label htmlFor="kind">Document</label>
              <select id="kind" value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="quote">Quote / Devis</option>
                <option value="invoice">Invoice / Facture</option>
              </select>
            </div>
            <div className="fld">
              <label htmlFor="iname">Your name</label>
              <input id="iname" value={issuer.name} onChange={(e) => setIssuer({ ...issuer, name: e.target.value })} />
            </div>
            <div className="fld">
              <label htmlFor="iline">Description</label>
              <input id="iline" value={issuer.line} onChange={(e) => setIssuer({ ...issuer, line: e.target.value })} />
            </div>
            <div className="fld">
              <label htmlFor="icontact">Contact</label>
              <input
                id="icontact"
                value={issuer.contact}
                onChange={(e) => setIssuer({ ...issuer, contact: e.target.value })}
              />
            </div>
          </div>
          <div className="form-foot">
            <button className="btn" onClick={print} disabled={!project}>
              Print / Save as PDF
            </button>
            {!project && <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Select a project first.</span>}
          </div>
        </div>
      </div>

      {project && (
        <section className="doc">
          <div className="doc-head">
            <div>
              <div className="doc-issuer">{issuer.name}</div>
              <div className="doc-sub">{issuer.line}</div>
              <div className="doc-sub">{issuer.contact}</div>
            </div>
            <div className="doc-meta">
              <div className="doc-kind">{kind === 'quote' ? 'Devis / Quote' : 'Facture / Invoice'}</div>
              <div className="doc-sub">
                {kind === 'invoice' && `No. ${String(invoiceSeq).padStart(4, '0')} · `}
                {today()}
              </div>
            </div>
          </div>

          <div className="doc-to">
            <div className="eyebrow">Billed to</div>
            <div className="doc-client">{project.client}</div>
            {client && (
              <div className="doc-sub">
                {client.institution}
                {client.contact && ` · ${client.contact}`}
              </div>
            )}
          </div>

          <table className="data doc-table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontFamily: 'Inter, sans-serif' }}>
                  {project.deliverable}
                  {project.deadline && (
                    <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
                      Delivery by {project.deadline}
                    </div>
                  )}
                </td>
                <td className="num">
                  {fmt(project.value)} {project.currency}
                </td>
              </tr>
              <tr className="row-total">
                <td>Total</td>
                <td className="num">
                  {fmt(project.value)} {project.currency}
                </td>
              </tr>
              {kind === 'invoice' && paid > 0 && (
                <>
                  <tr>
                    <td>Received to date</td>
                    <td className="num">{fmt(paid)} MAD</td>
                  </tr>
                  <tr className="row-total">
                    <td>Balance due</td>
                    <td className="num">{fmt(due)} MAD</td>
                  </tr>
                </>
              )}
              {kind === 'quote' && (
                <tr>
                  <td>Deposit payable to begin (50%)</td>
                  <td className="num">{fmt(deposit)} MAD</td>
                </tr>
              )}
            </tbody>
          </table>

          {project.currency !== 'MAD' && (
            <p className="doc-note">
              Converted at {project.currency === 'EUR' ? settings.eurRate : settings.usdRate} MAD per{' '}
              {project.currency}. Rate confirmed on issue date.
            </p>
          )}

          <div className="doc-terms">
            <div className="eyebrow">Terms</div>
            <ul>
              {INVOICE_TERMS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section no-print">
        <div className="section-head">
          <div>
            <div className="eyebrow">Rate card</div>
            <h2>Fixed prices, published</h2>
          </div>
        </div>
        <div className="tablewrap">
          <table className="data">
            <thead>
              <tr>
                <th>Service</th>
                <th className="num">Local (MAD)</th>
                <th className="num">Export (EUR)</th>
                <th className="num">EUR in MAD</th>
                <th className="num">Multiple</th>
                <th className="num">Days</th>
              </tr>
            </thead>
            <tbody>
              {SERVICES.map((s) => {
                const conv = s.eur * settings.eurRate
                return (
                  <tr key={s.name}>
                    <td style={{ fontFamily: 'Inter, sans-serif' }}>{s.name}</td>
                    <td className="num">{fmt(s.mad)}</td>
                    <td className="num">{fmt(s.eur)}</td>
                    <td className="num">{fmt(conv)}</td>
                    <td className="num">
                      <span className={conv / s.mad >= 1.5 ? 'pos' : ''}>{(conv / s.mad).toFixed(1)}×</span>
                    </td>
                    <td className="num">{s.days}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="foot">
          The deposit rule matters more than the prices. It is what prevents arriving at
          31 December having completed the work and not been paid.
        </p>
      </section>
    </div>
  )
}
