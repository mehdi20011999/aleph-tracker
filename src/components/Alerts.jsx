export default function Alerts({ items }) {
  if (!items.length) return null
  return (
    <div className="alerts">
      {items.map((a, i) => (
        <div key={i} className={`alert ${a.level}`}>
          {a.text}
        </div>
      ))}
    </div>
  )
}
