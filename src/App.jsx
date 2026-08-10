import { Routes, Route, Navigate } from 'react-router-dom'
import Nav from './components/Nav'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Clients from './pages/Clients'
import Revenue from './pages/Revenue'
import Workload from './pages/Workload'
import Invoices from './pages/Invoices'
import Plan from './pages/Plan'
import Settings from './pages/Settings'

export default function App() {
  return (
    <>
      <Nav />
      <main className="wrap">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/workload" element={<Workload />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}
