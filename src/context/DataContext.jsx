import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_SETTINGS } from '../lib/plan'
import { sampleData } from '../lib/seed'

const KEY = 'aleph-tracker-v1'
const DataContext = createContext(null)

const EMPTY = {
  projects: [],
  clients: [],
  reviews: [],
  manualRevenue: {},
  steps: {},
  settings: DEFAULT_SETTINGS,
  notes: '',
  invoiceSeq: 1,
}

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)

function read() {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw)
    return {
      ...EMPTY,
      ...parsed,
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
    }
  } catch (err) {
    console.warn('Could not read saved data, starting fresh.', err)
    return EMPTY
  }
}

export function DataProvider({ children }) {
  const [data, setData] = useState(read)
  const [saveState, setSaveState] = useState('idle')

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(KEY, JSON.stringify(data))
        setSaveState('saved')
      } catch (err) {
        console.error('Save failed', err)
        setSaveState('error')
      }
    }, 300)
    return () => clearTimeout(t)
  }, [data])

  const api = useMemo(
    () => ({
      data,
      saveState,

      /* ---------- projects ---------- */
      addProject(p) {
        setData((d) => ({
          ...d,
          projects: [...d.projects, { ...p, id: uid(), created: Date.now() }],
        }))
      },
      updateProject(id, patch) {
        setData((d) => ({
          ...d,
          projects: d.projects.map((p) => {
            if (p.id !== id) return p
            const next = { ...p, ...patch }
            // Marking a project paid implies the balance cleared.
            if (patch.stage === 'Paid') next.deposit = 'full'
            return next
          }),
        }))
      },
      removeProject(id) {
        setData((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) }))
      },

      /* ---------- clients ---------- */
      addClient(c) {
        const id = uid()
        setData((d) => ({ ...d, clients: [...d.clients, { ...c, id, created: Date.now() }] }))
        return id
      },
      updateClient(id, patch) {
        setData((d) => ({
          ...d,
          clients: d.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }))
      },
      removeClient(id) {
        setData((d) => ({
          ...d,
          clients: d.clients.filter((c) => c.id !== id),
          // Projects survive; they simply lose the link.
          projects: d.projects.map((p) => (p.clientId === id ? { ...p, clientId: null } : p)),
        }))
      },

      /* ---------- weekly review ---------- */
      addReview(r) {
        setData((d) => ({ ...d, reviews: [...d.reviews, { ...r, id: uid() }] }))
      },
      removeReview(id) {
        setData((d) => ({ ...d, reviews: d.reviews.filter((r) => r.id !== id) }))
      },

      /* ---------- invoices ---------- */
      bumpInvoiceSeq() {
        setData((d) => ({ ...d, invoiceSeq: (d.invoiceSeq || 1) + 1 }))
      },

      /* ---------- misc ---------- */
      setManualRevenue(monthKey, amount) {
        setData((d) => ({
          ...d,
          manualRevenue: { ...d.manualRevenue, [monthKey]: Math.max(0, Number(amount) || 0) },
        }))
      },
      toggleStep(id) {
        setData((d) => ({ ...d, steps: { ...d.steps, [id]: !d.steps[id] } }))
      },
      updateSettings(patch) {
        setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
      },
      setNotes(notes) {
        setData((d) => ({ ...d, notes }))
      },

      exportJson() {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `aleph-tracker-${new Date().toISOString().slice(0, 10)}.json`
        a.click()
        URL.revokeObjectURL(url)
      },
      async importJson(file) {
        const text = await file.text()
        const parsed = JSON.parse(text)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('Not a valid backup file.')
        }
        // Accept partial files, but never let a bad shape through:
        // a string where an array belongs would crash every page that maps it.
        const arr = (v) => (Array.isArray(v) ? v : [])
        const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {})
        setData({
          ...EMPTY,
          projects: arr(parsed.projects),
          clients: arr(parsed.clients),
          reviews: arr(parsed.reviews),
          manualRevenue: obj(parsed.manualRevenue),
          steps: obj(parsed.steps),
          notes: typeof parsed.notes === 'string' ? parsed.notes : '',
          invoiceSeq: Number(parsed.invoiceSeq) || 1,
          settings: { ...DEFAULT_SETTINGS, ...obj(parsed.settings) },
        })
      },
      loadSample() {
        setData((d) => ({ ...EMPTY, ...sampleData(), settings: d.settings }))
      },
      resetAll() {
        setData(EMPTY)
      },
    }),
    [data, saveState],
  )

  return <DataContext.Provider value={api}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
