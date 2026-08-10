import { useRef, useState } from 'react'
import { useData } from '../context/DataContext'

export default function Settings() {
  const { data, updateSettings, setNotes, exportJson, importJson, resetAll, loadSample, saveState } =
    useData()
  const { settings, notes, projects } = data
  const fileRef = useRef(null)
  const [msg, setMsg] = useState('')

  const num = (k) => (e) => updateSettings({ [k]: Number(e.target.value) || 0 })

  async function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importJson(file)
      setMsg('Data replaced from file.')
    } catch (err) {
      setMsg(err.message || 'That file could not be read. Check it is a JSON export from this app.')
    }
    e.target.value = ''
  }

  function handleReset() {
    if (window.confirm('This clears all projects, revenue and progress. Continue?')) {
      resetAll()
      setMsg('Everything cleared.')
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <div className="eyebrow">Settings</div>
        <h1>
          Targets and <em>your data</em>
        </h1>
        <p>
          Everything lives in this browser only. Nothing is sent anywhere. Export regularly — clearing
          site data removes it permanently.
        </p>
      </header>

      <section className="section" style={{ marginTop: 0 }}>
        <div className="section-head">
          <div>
            <div className="eyebrow">Configuration</div>
            <h2>Targets and rates</h2>
          </div>
        </div>
        <div className="panel">
          <div className="fgrid">
            <div className="fld">
              <label htmlFor="target">Revenue target (MAD)</label>
              <input id="target" type="number" min="0" step="1000" value={settings.target} onChange={num('target')} />
            </div>
            <div className="fld">
              <label htmlFor="eur">EUR to MAD</label>
              <input id="eur" type="number" min="0" step="0.1" value={settings.eurRate} onChange={num('eurRate')} />
            </div>
            <div className="fld">
              <label htmlFor="usd">USD to MAD</label>
              <input id="usd" type="number" min="0" step="0.1" value={settings.usdRate} onChange={num('usdRate')} />
            </div>
            <div className="fld">
              <label htmlFor="cap">Capacity cap</label>
              <input id="cap" type="number" min="1" step="1" value={settings.capacityCap} onChange={num('capacityCap')} />
            </div>
          </div>
          <p className="foot" style={{ marginTop: 18 }}>
            Exchange rates move. Check them before quoting in EUR — the rate card converts at
            whatever is set here.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Working notes</div>
            <h2>Anything worth remembering</h2>
          </div>
        </div>
        <textarea
          className="notes"
          value={notes}
          placeholder="Comptable appointment, contacts to follow up, cohort venue…"
          onChange={(e) => setNotes(e.target.value)}
        />
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Data</div>
            <h2>Backup and restore</h2>
          </div>
          <span className="savetag" style={{ color: saveState === 'error' ? 'var(--hot)' : 'var(--ink-faint)' }}>
            {saveState === 'error' ? 'Save failed' : 'Saved locally'}
          </span>
        </div>
        <div className="panel">
          <div className="form-foot" style={{ marginTop: 0 }}>
            <button className="btn" onClick={exportJson}>
              Export JSON
            </button>
            <button className="btn ghost" onClick={() => fileRef.current?.click()}>
              Import JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={handleImport}
            />
            <button
              className="btn ghost"
              onClick={() => {
                if (
                  projects.length === 0 ||
                  window.confirm('This replaces everything currently on the board. Continue?')
                ) {
                  loadSample()
                  setMsg('Sample data loaded. Clear it before entering anything real.')
                }
              }}
            >
              Load sample data
            </button>
            <button className="btn danger" onClick={handleReset}>
              Clear everything
            </button>
            {msg && <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{msg}</span>}
          </div>
          <p className="foot" style={{ marginTop: 16 }}>
            Currently tracking {projects.length} project{projects.length === 1 ? '' : 's'}. Export
            before switching machines or clearing your browser — there is no server-side copy.
          </p>
        </div>
      </section>
    </div>
  )
}
