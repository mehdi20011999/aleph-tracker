import { useData } from '../context/DataContext'
import { PHASES, TOTAL_STEPS } from '../lib/plan'

export default function Plan() {
  const { data, toggleStep } = useData()
  const { steps } = data
  const done = Object.values(steps).filter(Boolean).length

  return (
    <div className="page">
      <header className="page-head">
        <div className="eyebrow">Execution · {done} of {TOTAL_STEPS} complete</div>
        <h1>The steps, <em>in order</em></h1>
        <p>
          Phases overlap, but the order inside each one is real: later steps depend on earlier ones.
          Two steps are marked as blockers — nothing downstream of them can start until they clear.
        </p>
      </header>

      {PHASES.map((phase) => {
        const count = phase.steps.filter((_, i) => steps[`${phase.id}-${i}`]).length
        const all = count === phase.steps.length
        return (
          <div className="phase" key={phase.id}>
            <div className="phase-bar">
              <span className="phase-n">{phase.name.toUpperCase()}</span>
              <h3>{phase.title}</h3>
              <span className="phase-when">{phase.when}</span>
              <span className={`phase-count ${all ? 'done' : ''}`}>
                {count}/{phase.steps.length}
              </span>
            </div>
            <div className="phase-note">{phase.note}</div>
            {phase.steps.map((s, i) => {
              const id = `${phase.id}-${i}`
              const on = !!steps[id]
              return (
                <div className={`step ${on ? 'checked' : ''}`} key={id}>
                  <input type="checkbox" id={id} checked={on} onChange={() => toggleStep(id)} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label className="step-t" htmlFor={id}>
                      {s.t}
                      {s.tag && <span className={`tag ${s.tag === 'Blocker' ? 'block' : ''}`}>{s.tag}</span>}
                    </label>
                    <div className="step-d">{s.d}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
