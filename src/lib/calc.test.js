import { describe, it, expect } from 'vitest'
import {
  toMad, collectedOf, outstandingOf, isOpen, isWon, isLead, isLost, isActive,
  daysUntil, runwayClass, monthlyCollected, cumulativeSeries, totalCollected,
  planToDate, buildAlerts, projectFlags, clientStats, workloadByWeek, peakWeek,
  conversionStats, effectiveRateByService, overallRate,
} from './calc'
import { MONTHS } from './plan'

const S = { eurRate: 10.7, usdRate: 10, capacityCap: 7, target: 200000 }

const proj = (over = {}) => ({
  id: 'x', client: 'C', deliverable: 'Bibliographic audit',
  value: 1000, currency: 'MAD', deadline: '2026-10-15',
  stage: 'In progress', deposit: 'none', ...over,
})

/* helper: a date n days from now, as YYYY-MM-DD */
const inDays = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

describe('currency', () => {
  it('passes MAD through unchanged', () => {
    expect(toMad(proj({ value: 4500 }), S)).toBe(4500)
  })
  it('converts EUR and USD at the configured rates', () => {
    expect(toMad(proj({ value: 900, currency: 'EUR' }), S)).toBeCloseTo(9630)
    expect(toMad(proj({ value: 500, currency: 'USD' }), S)).toBeCloseTo(5000)
  })
  it('treats a missing value as zero rather than NaN', () => {
    expect(toMad(proj({ value: undefined }), S)).toBe(0)
  })
})

describe('collection', () => {
  it('counts nothing when no deposit was taken', () => {
    expect(collectedOf(proj({ deposit: 'none' }), S)).toBe(0)
  })
  it('counts half on a 50% deposit', () => {
    expect(collectedOf(proj({ value: 6000, deposit: 'half' }), S)).toBe(3000)
  })
  it('counts the full value once paid, whatever the deposit field says', () => {
    expect(collectedOf(proj({ value: 6000, stage: 'Paid', deposit: 'none' }), S)).toBe(6000)
  })
  it('reports the remaining balance as outstanding', () => {
    expect(outstandingOf(proj({ value: 6000, deposit: 'half' }), S)).toBe(3000)
    expect(outstandingOf(proj({ value: 6000, stage: 'Paid' }), S)).toBe(0)
  })
})

describe('project state', () => {
  it('treats paid and lost work as closed', () => {
    expect(isOpen(proj({ stage: 'Paid' }))).toBe(false)
    expect(isOpen(proj({ stage: 'Lost' }))).toBe(false)
    expect(isOpen(proj({ stage: 'Delivered' }))).toBe(true)
  })
  it('excludes unconverted leads from won work', () => {
    expect(isWon(proj({ stage: 'Lead' }))).toBe(false)
    expect(isWon(proj({ stage: 'Quoted' }))).toBe(true)
    expect(isLead(proj({ stage: 'Lead' }))).toBe(true)
    expect(isLost(proj({ stage: 'Lost' }))).toBe(true)
  })
  it('counts only in-progress and in-review work toward active load', () => {
    expect(isActive(proj({ stage: 'In progress' }))).toBe(true)
    expect(isActive(proj({ stage: 'In review' }))).toBe(true)
    expect(isActive(proj({ stage: 'Quoted' }))).toBe(false)
  })
})

describe('deadlines', () => {
  it('returns null when no deadline is set', () => {
    expect(daysUntil(null)).toBeNull()
    expect(runwayClass(proj({ deadline: '' }))).toBe('none')
  })
  it('classifies overdue, imminent and comfortable deadlines', () => {
    expect(runwayClass(proj({ deadline: inDays(-2) }))).toBe('overdue')
    expect(runwayClass(proj({ deadline: inDays(5) }))).toBe('soon')
    expect(runwayClass(proj({ deadline: inDays(40) }))).toBe('clear')
  })
  it('marks paid work closed regardless of date', () => {
    expect(runwayClass(proj({ stage: 'Paid', deadline: inDays(-50) }))).toBe('closed')
  })
})

describe('revenue attribution', () => {
  const projects = [
    proj({ value: 6000, deadline: '2026-09-15', deposit: 'half' }),
    proj({ value: 900, currency: 'EUR', deadline: '2026-10-20', stage: 'Paid' }),
    proj({ value: 8000, deadline: '2026-12-10', deposit: 'none' }),
  ]

  it('attributes project cash to the month of its deadline', () => {
    const m = monthlyCollected(projects, {}, S)
    expect(m['2026-09']).toBe(3000)
    expect(m['2026-10']).toBeCloseTo(9630)
    expect(m['2026-12']).toBe(0)
  })

  it('adds manual entries on top of project cash', () => {
    const m = monthlyCollected(projects, { '2026-09': 5000 }, S)
    expect(m['2026-09']).toBe(8000)
  })

  it('ignores deadlines outside the tracked period', () => {
    const m = monthlyCollected([proj({ deadline: '2027-03-01', stage: 'Paid' })], {}, S)
    expect(Object.values(m).every((v) => v === 0)).toBe(true)
  })

  it('builds a cumulative series matching the plan totals', () => {
    const s = cumulativeSeries([], {}, S)
    expect(s).toHaveLength(MONTHS.length)
    expect(s[s.length - 1].cumPlan).toBe(MONTHS.reduce((a, m) => a + m.plan, 0))
  })

  it('totals collected across all months', () => {
    expect(totalCollected(projects, { '2026-08': 1000 }, S)).toBeCloseTo(13630)
  })
})

describe('pacing', () => {
  it('is zero before the period and the full target after it', () => {
    expect(planToDate(200000, new Date('2026-07-01'))).toBe(0)
    expect(planToDate(200000, new Date('2027-02-01'))).toBe(200000)
  })
  it('interpolates within the period and never decreases', () => {
    const a = planToDate(200000, new Date('2026-09-15'))
    const b = planToDate(200000, new Date('2026-11-15'))
    expect(a).toBeGreaterThan(0)
    expect(b).toBeGreaterThan(a)
    expect(b).toBeLessThan(200000)
  })
  it('reaches the first two monthly targets by 1 October', () => {
    expect(planToDate(200000, new Date('2026-10-01'))).toBe(48000)
  })
})

describe('alerts and flags', () => {
  it('warns when active load passes the cap', () => {
    const many = Array.from({ length: 9 }, () => proj({ deadline: inDays(30) }))
    const a = buildAlerts(many, S)
    expect(a.some((x) => x.text.includes('against a cap'))).toBe(true)
  })

  it('flags a December deadline with no deposit', () => {
    const f = projectFlags(proj({ deadline: '2026-12-20', deposit: 'none' }))
    expect(f).toContain('December, no deposit')
  })

  it('flags delivered work that is not fully paid', () => {
    const f = projectFlags(proj({ stage: 'Delivered', deposit: 'half', deadline: '2026-10-01' }))
    expect(f).toContain('Delivered, unpaid')
  })

  it('reports an all-clear only when there is something to report on', () => {
    expect(buildAlerts([], S)).toHaveLength(0)
    const clean = [proj({ stage: 'Paid', deadline: inDays(20) })]
    expect(buildAlerts(clean, S)[0].level).toBe('ok')
  })
})

describe('clients', () => {
  const projects = [
    proj({ clientId: 'c1', value: 6000, deposit: 'half' }),
    proj({ clientId: 'c1', value: 4000, stage: 'Paid' }),
    proj({ clientId: 'c2', value: 3000, deposit: 'none' }),
  ]
  it('aggregates lifetime value, cash and balance per client', () => {
    const s = clientStats('c1', projects, S)
    expect(s.count).toBe(2)
    expect(s.lifetime).toBe(10000)
    expect(s.collected).toBe(7000)
    expect(s.owed).toBe(3000)
  })
  it('returns an empty record for an unknown client', () => {
    expect(clientStats('nobody', projects, S).count).toBe(0)
  })
})

describe('workload', () => {
  it('buckets open deadlines by week and finds the peak', () => {
    const projects = [
      proj({ deadline: inDays(2) }),
      proj({ deadline: inDays(3) }),
      proj({ deadline: inDays(30) }),
      proj({ deadline: inDays(2), stage: 'Paid' }), // closed, must not count
    ]
    const weeks = workloadByWeek(projects)
    const total = weeks.reduce((a, w) => a + w.count, 0)
    expect(total).toBe(3)
    expect(peakWeek(weeks).count).toBe(2)
  })
  it('returns buckets even with no projects', () => {
    expect(workloadByWeek([]).length).toBeGreaterThan(0)
  })
})

describe('conversion', () => {
  it('counts wins against decided bids, ignoring open leads', () => {
    const projects = [
      proj({ stage: 'Lead' }),
      proj({ stage: 'Lost' }),
      proj({ stage: 'Lost' }),
      proj({ stage: 'Paid' }),
      proj({ stage: 'In progress' }),
    ]
    const c = conversionStats(projects)
    expect(c.leads).toBe(1)
    expect(c.lost).toBe(2)
    expect(c.won).toBe(2)
    expect(c.rate).toBeCloseTo(0.5)
  })
  it('has no rate before anything is decided', () => {
    expect(conversionStats([proj({ stage: 'Lead' })]).rate).toBeNull()
  })
})

describe('effective rate', () => {
  const projects = [
    proj({ deliverable: 'Bibliographic audit', value: 3500, hours: 16, stage: 'Paid' }),
    proj({ deliverable: 'Bibliographic audit', value: 3500, hours: 14, stage: 'Delivered' }),
    proj({ deliverable: 'Systematic review support', value: 8000, hours: 18, stage: 'Paid' }),
    proj({ deliverable: 'LaTeX chapter production', value: 700, currency: 'EUR', hours: 5, stage: 'Lost' }),
    proj({ deliverable: 'Defense dossier', value: 4500, hours: 0, stage: 'Paid' }),
  ]

  it('groups hours and value by service, sorted by rate', () => {
    const rows = effectiveRateByService(projects, S)
    expect(rows).toHaveLength(2)
    expect(rows[0].service).toBe('Systematic review support')
    expect(rows[0].rate).toBeCloseTo(8000 / 18)
    expect(rows[1].n).toBe(2)
    expect(rows[1].hours).toBe(30)
  })

  it('excludes lost work and projects with no hours logged', () => {
    const services = effectiveRateByService(projects, S).map((r) => r.service)
    expect(services).not.toContain('LaTeX chapter production')
    expect(services).not.toContain('Defense dossier')
  })

  it('computes an overall rate, or null with no hours at all', () => {
    expect(overallRate(projects, S).hours).toBe(48)
    expect(overallRate([], S).rate).toBeNull()
  })
})
