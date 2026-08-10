/**
 * A realistic sample dataset so the app can be explored before any real data
 * is entered. Deadlines are generated relative to today so the workload view
 * and runway colours always look live.
 */

const iso = (offsetDays) => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

const id = (n) => `sample-${n}`

export function sampleData() {
  const clients = [
    {
      id: id('c1'),
      name: 'Dr. K. Rahali',
      institution: 'CHU Ibn Sina — Rabat',
      contact: 'example@chu.example',
      source: 'Referral',
      intro: 'given',
      note: 'Trisomy 21 thesis — defense in spring',
      created: Date.now(),
    },
    {
      id: id('c2'),
      name: 'C. Zaki',
      institution: 'Ibn Tofail University — Kénitra',
      contact: '',
      source: 'Referral',
      intro: 'asked',
      note: 'M&A and SME performance',
      created: Date.now(),
    },
    {
      id: id('c3'),
      name: 'M. Lefèvre',
      institution: 'International',
      contact: 'via Malt.fr',
      source: 'Export platform',
      intro: 'not-asked',
      note: 'Panel econometrics, Lyon',
      created: Date.now(),
    },
    {
      id: id('c4'),
      name: 'H. Bakass',
      institution: 'Moulay Ismail University — Meknès',
      contact: '',
      source: 'Institutional session',
      intro: 'not-asked',
      note: 'Entrepreneurial intention',
      created: Date.now(),
    },
  ]

  const projects = [
    {
      id: id('p1'), clientId: id('c1'), client: 'Dr. K. Rahali',
      deliverable: 'Systematic review support',
      value: 8000, currency: 'MAD', deadline: iso(9),
      stage: 'In progress', deposit: 'half', hours: 14, created: Date.now(),
    },
    {
      id: id('p2'), clientId: id('c1'), client: 'Dr. K. Rahali',
      deliverable: 'Bibliographic audit',
      value: 3500, currency: 'MAD', deadline: iso(-3),
      stage: 'Delivered', deposit: 'half', hours: 15, created: Date.now(),
    },
    {
      id: id('p3'), clientId: id('c2'), client: 'C. Zaki',
      deliverable: 'LaTeX chapter production',
      value: 5000, currency: 'MAD', deadline: iso(21),
      stage: 'In progress', deposit: 'none', hours: 6, created: Date.now(),
    },
    {
      id: id('p4'), clientId: id('c3'), client: 'M. Lefèvre',
      deliverable: 'Statistical analysis + results chapter',
      value: 900, currency: 'EUR', deadline: iso(16),
      stage: 'In progress', deposit: 'half', hours: 11, created: Date.now(),
    },
    {
      id: id('p5'), clientId: id('c4'), client: 'H. Bakass',
      deliverable: 'Defense dossier',
      value: 4500, currency: 'MAD', deadline: iso(-20),
      stage: 'Paid', deposit: 'full', hours: 9, created: Date.now(),
    },
    {
      id: id('p6'), clientId: null, client: 'Enquiry — Dakar',
      deliverable: 'Systematic review support',
      value: 1200, currency: 'EUR', deadline: iso(45),
      stage: 'Lead', deposit: 'none', hours: 0, created: Date.now(),
    },
    {
      id: id('p7'), clientId: null, client: 'Enquiry — Brussels',
      deliverable: 'LaTeX chapter production',
      value: 700, currency: 'EUR', deadline: '',
      stage: 'Lost', deposit: 'none', hours: 2, created: Date.now(),
    },
    {
      id: id('p8'), clientId: id('c2'), client: 'C. Zaki',
      deliverable: 'Bibliographic audit',
      value: 3500, currency: 'MAD', deadline: '2026-12-18',
      stage: 'Quoted', deposit: 'none', hours: 0, created: Date.now(),
    },
  ]

  return {
    clients,
    projects,
    reviews: [
      { id: id('r1'), date: iso(-14), collected: 8500, active: 3, leads: 2, receivables: 6000, hours: 46 },
      { id: id('r2'), date: iso(-7), collected: 11000, active: 4, leads: 3, receivables: 9500, hours: 53 },
    ],
    manualRevenue: { '2026-08': 4000 },
    steps: { 'p0-1': true, 'p0-2': true, 'p0-5': true },
    notes: 'Sample data — clear it from Settings before entering anything real.',
    invoiceSeq: 3,
  }
}
