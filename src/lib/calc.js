import { MONTHS, PERIOD_END } from './plan'

/* ---------- currency ---------- */

export function toMad(project, settings) {
  const v = Number(project.value) || 0
  if (project.currency === 'EUR') return v * settings.eurRate
  if (project.currency === 'USD') return v * settings.usdRate
  return v
}

export const fmt = (n) => Math.round(Number(n) || 0).toLocaleString('en-US')

export function fmtCur(n, cur = 'MAD') {
  return `${fmt(n)} ${cur}`
}

/* ---------- project state ---------- */

export const isLead = (p) => p.stage === 'Lead'
export const isLost = (p) => p.stage === 'Lost'
/** Live work: neither settled nor abandoned. */
export const isOpen = (p) => p.stage !== 'Paid' && p.stage !== 'Lost'
/** Won work still to deliver — excludes unconverted leads. */
export const isWon = (p) => isOpen(p) && !isLead(p)
export const isActive = (p) => p.stage === 'In progress' || p.stage === 'In review'

/** Cash actually in hand for a project. */
export function collectedOf(p, settings) {
  const total = toMad(p, settings)
  if (p.stage === 'Paid' || p.deposit === 'full') return total
  if (p.deposit === 'half') return total * 0.5
  return 0
}

/** Money owed but not yet received. */
export function outstandingOf(p, settings) {
  return toMad(p, settings) - collectedOf(p, settings)
}

export function daysUntil(dateStr, from = new Date()) {
  if (!dateStr) return null
  const d = new Date(`${dateStr}T23:59:59`)
  return Math.ceil((d - from) / 86400000)
}

export function runwayClass(p) {
  if (p.stage === 'Paid') return 'closed'
  const d = daysUntil(p.deadline)
  if (d === null) return 'none'
  if (d < 0) return 'overdue'
  if (d <= 10) return 'soon'
  return 'clear'
}

export function runwayLabel(p) {
  if (p.stage === 'Paid') return 'closed'
  const d = daysUntil(p.deadline)
  if (d === null) return 'no deadline'
  if (d < 0) return `${-d} days overdue`
  if (d === 0) return 'due today'
  return `${d} days left`
}

/* ---------- revenue ---------- */

/**
 * Revenue collected per month.
 * Sources: cash from projects (attributed to the month of their deadline)
 * plus any manual entries recorded on the Revenue page.
 */
export function monthlyCollected(projects, manual, settings) {
  const out = {}
  MONTHS.forEach((m) => {
    out[m.key] = Number(manual?.[m.key]) || 0
  })
  projects.forEach((p) => {
    if (!p.deadline) return
    const key = p.deadline.slice(0, 7)
    if (!(key in out)) return
    out[key] += collectedOf(p, settings)
  })
  return out
}

export function cumulativeSeries(projects, manual, settings) {
  const collected = monthlyCollected(projects, manual, settings)
  let cp = 0
  let ca = 0
  return MONTHS.map((m) => {
    cp += m.plan
    ca += collected[m.key]
    return {
      month: m.label.slice(0, 3),
      key: m.key,
      plan: m.plan,
      actual: Math.round(collected[m.key]),
      cumPlan: cp,
      cumActual: Math.round(ca),
      delta: Math.round(ca - cp),
    }
  })
}

export function totalCollected(projects, manual, settings) {
  const c = monthlyCollected(projects, manual, settings)
  return Object.values(c).reduce((a, b) => a + b, 0)
}

/** Where the plan says cumulative revenue should stand today. */
export function planToDate(target, now = new Date()) {
  const start = new Date('2026-08-01T00:00:00')
  const end = new Date('2027-01-01T00:00:00')
  if (now <= start) return 0
  if (now >= end) return target
  let cum = 0
  for (let i = 0; i < MONTHS.length; i += 1) {
    const mStart = new Date(2026, 7 + i, 1)
    const mEnd = new Date(2026, 8 + i, 1)
    if (now >= mEnd) {
      cum += MONTHS[i].plan
    } else {
      cum += MONTHS[i].plan * ((now - mStart) / (mEnd - mStart))
      break
    }
  }
  return Math.round(cum)
}

export function daysRemaining() {
  return Math.max(0, daysUntil(PERIOD_END) ?? 0)
}

/* ---------- alerts ---------- */

export function buildAlerts(projects, settings) {
  const alerts = []
  const overdue = projects.filter((p) => isOpen(p) && (daysUntil(p.deadline) ?? 99) < 0)
  const load = projects.filter(isActive).length
  const unsecured = projects.filter((p) => isActive(p) && p.deposit === 'none')
  const unsecuredValue = unsecured.reduce((a, p) => a + toMad(p, settings), 0)
  const deliveredUnpaid = projects.filter((p) => p.stage === 'Delivered' && p.deposit !== 'full')
  const decemberRisk = projects.filter(
    (p) =>
      isOpen(p) &&
      p.deadline >= '2026-12-01' &&
      p.deadline <= '2026-12-31' &&
      p.deposit === 'none',
  )

  if (overdue.length) {
    alerts.push({
      level: 'hot',
      text: `${overdue.length} project${overdue.length > 1 ? 's are' : ' is'} past deadline. Contact those clients today — a renegotiated date holds the relationship, a silent overrun does not.`,
    })
  }
  if (load > settings.capacityCap) {
    alerts.push({
      level: 'hot',
      text: `${load} projects active against a cap of ${settings.capacityCap}. Subcontract the formatting layer or push a start date. Quality degrades before throughput improves.`,
    })
  }
  if (unsecuredValue > 0) {
    alerts.push({
      level: 'warn',
      text: `${fmt(unsecuredValue)} MAD of work is underway with no deposit received. Invoice the 50% before the next deliverable goes out.`,
    })
  }
  if (deliveredUnpaid.length) {
    alerts.push({
      level: 'warn',
      text: `${deliveredUnpaid.length} delivered project${deliveredUnpaid.length > 1 ? 's have' : ' has'} an outstanding balance. Final files stay with you until it clears.`,
    })
  }
  if (decemberRisk.length) {
    alerts.push({
      level: 'hot',
      text: `${decemberRisk.length} December deadline${decemberRisk.length > 1 ? 's carry' : ' carries'} no deposit. Payment will land in January and will not count toward 31 December.`,
    })
  }
  if (!alerts.length && projects.length) {
    alerts.push({
      level: 'ok',
      text: 'Nothing overdue, nothing unsecured, load within cap. This is what the board looks like when it is working.',
    })
  }
  return alerts
}

export function projectFlags(p) {
  const flags = []
  if (
    isOpen(p) &&
    p.deadline >= '2026-12-01' &&
    p.deadline <= '2026-12-31' &&
    p.deposit === 'none'
  ) {
    flags.push('December, no deposit')
  } else if (isActive(p) && p.deposit === 'none') {
    flags.push('Working unsecured')
  }
  if (p.stage === 'Delivered' && p.deposit !== 'full') flags.push('Delivered, unpaid')
  return flags
}

/* ---------- clients ---------- */

export function clientStats(clientId, projects, settings) {
  const own = projects.filter((p) => p.clientId === clientId)
  const lifetime = own.reduce((a, p) => a + toMad(p, settings), 0)
  const collected = own.reduce((a, p) => a + collectedOf(p, settings), 0)
  const owed = own.reduce((a, p) => a + outstandingOf(p, settings), 0)
  return { projects: own, count: own.length, lifetime, collected, owed }
}

/* ---------- workload ---------- */

/**
 * Deadline density by ISO week across the period.
 * Clustering is the thing to see: five deadlines in one week is
 * a problem that must be solved in October, not discovered in November.
 */
export function workloadByWeek(projects, weeks = 22) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - start.getDay() + 1) // Monday of current week

  const buckets = []
  for (let i = 0; i < weeks; i += 1) {
    const from = new Date(start)
    from.setDate(from.getDate() + i * 7)
    const to = new Date(from)
    to.setDate(to.getDate() + 6)
    if (from > new Date('2027-01-15')) break
    const iso = (d) => d.toISOString().slice(0, 10)
    const due = projects.filter(
      (p) => isOpen(p) && p.deadline && p.deadline >= iso(from) && p.deadline <= iso(to),
    )
    buckets.push({
      label: `${from.getDate()}/${from.getMonth() + 1}`,
      from: iso(from),
      count: due.length,
      projects: due,
    })
  }
  return buckets
}

export function peakWeek(buckets) {
  return buckets.reduce((best, b) => (b.count > (best?.count ?? -1) ? b : best), null)
}

/* ---------- weekly review ---------- */

export function reviewTrend(reviews) {
  return [...reviews]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((r) => ({
      date: r.date?.slice(5) || '',
      collected: Number(r.collected) || 0,
      hours: Number(r.hours) || 0,
      leads: Number(r.leads) || 0,
      receivables: Number(r.receivables) || 0,
    }))
}

/* ---------- conversion ---------- */

/**
 * Bid-to-win rate. The export strategy assumes roughly ten bids to win two,
 * so a low rate early is expected — a low rate in November is a pricing problem.
 */
export function conversionStats(projects) {
  const lost = projects.filter(isLost).length
  const won = projects.filter((p) => !isLead(p) && !isLost(p)).length
  const leads = projects.filter(isLead).length
  const decided = won + lost
  return {
    leads,
    won,
    lost,
    decided,
    rate: decided ? won / decided : null,
  }
}

/* ---------- effective rate ---------- */

/**
 * Value per hour by service type, across projects where hours were logged.
 * This is what tells you whether a fixed price is generous or a trap:
 * two services at the same price can differ threefold in real return.
 */
export function effectiveRateByService(projects, settings) {
  const map = new Map()
  projects.forEach((p) => {
    const hours = Number(p.hours) || 0
    if (!hours || isLead(p) || isLost(p)) return
    const cur = map.get(p.deliverable) || { service: p.deliverable, hours: 0, value: 0, n: 0 }
    cur.hours += hours
    cur.value += toMad(p, settings)
    cur.n += 1
    map.set(p.deliverable, cur)
  })
  return [...map.values()]
    .map((r) => ({ ...r, rate: r.value / r.hours }))
    .sort((a, b) => b.rate - a.rate)
}

export function overallRate(projects, settings) {
  const rows = effectiveRateByService(projects, settings)
  const hours = rows.reduce((a, r) => a + r.hours, 0)
  const value = rows.reduce((a, r) => a + r.value, 0)
  return { hours, value, rate: hours ? value / hours : null }
}
