export default function StatCard({ label, value, sub, tone = '' }) {
  return (
    <div className="stat">
      <span className="eyebrow">{label}</span>
      <span className={`stat-v ${tone}`}>{value}</span>
      {sub && <span className="stat-sm">{sub}</span>}
    </div>
  )
}
