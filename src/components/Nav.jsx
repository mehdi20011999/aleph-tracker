import { NavLink } from 'react-router-dom'

const LINKS = [
  ['/', 'Dashboard'],
  ['/projects', 'Projects'],
  ['/clients', 'Clients'],
  ['/workload', 'Workload'],
  ['/revenue', 'Revenue'],
  ['/invoices', 'Invoices'],
  ['/plan', 'Plan'],
  ['/settings', 'Settings'],
]

export default function Nav() {
  return (
    <nav className="nav no-print">
      <div className="nav-inner">
        <NavLink to="/" className="brand">
          Aleph <span>Tracker</span>
        </NavLink>
        <div className="nav-links">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
