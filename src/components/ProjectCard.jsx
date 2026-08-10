import { STAGES, DEPOSITS } from '../lib/plan'
import { fmt, toMad, runwayClass, runwayLabel, projectFlags, isLead, isLost } from '../lib/calc'

export default function ProjectCard({ project, settings, onUpdate, onRemove, onEdit }) {
  const cls = isLost(project) ? 'closed' : runwayClass(project)
  const flags = projectFlags(project)
  const hours = Number(project.hours) || 0
  const rate = hours ? toMad(project, settings) / hours : null

  return (
    <article className={`proj ${cls}`}>
      <div className="p-top">
        <span className="p-client">{project.client}</span>
        {isLead(project) ? (
          <span className="p-runway">lead — not yet won</span>
        ) : isLost(project) ? (
          <span className="p-runway">lost</span>
        ) : (
          <span className={`p-runway ${cls}`}>{runwayLabel(project)}</span>
        )}
        <span className="p-val">
          {fmt(project.value)} {project.currency}
        </span>
      </div>

      <div className="p-deliv">
        {project.deliverable}
        {project.deadline && ` · due ${project.deadline}`}
        {rate && ` · ${hours}h at ${fmt(rate)} MAD/h`}
      </div>

      <div className="p-ctrl">
        <select
          aria-label={`Stage for ${project.client}`}
          value={project.stage}
          onChange={(e) => onUpdate(project.id, { stage: e.target.value })}
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          aria-label={`Deposit status for ${project.client}`}
          value={project.deposit}
          onChange={(e) => onUpdate(project.id, { deposit: e.target.value })}
        >
          {DEPOSITS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        {flags.map((f) => (
          <span key={f} className="flagbit">
            {f}
          </span>
        ))}

        <button className="del" style={{ marginLeft: 'auto' }} onClick={() => onEdit(project)}>
          Edit
        </button>
        <button className="del" style={{ marginLeft: 0 }} onClick={() => onRemove(project.id)}>
          Remove
        </button>
      </div>
    </article>
  )
}
