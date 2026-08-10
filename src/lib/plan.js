// Static plan definition. Editing this file changes the whole app's targets.

export const MONTHS = [
  { key: '2026-08', label: 'August', plan: 18000 },
  { key: '2026-09', label: 'September', plan: 30000 },
  { key: '2026-10', label: 'October', plan: 49000 },
  { key: '2026-11', label: 'November', plan: 52000 },
  { key: '2026-12', label: 'December', plan: 60000 },
]

export const PERIOD_START = '2026-08-01'
export const PERIOD_END = '2026-12-31'

export const DEFAULT_SETTINGS = {
  target: 200000,
  eurRate: 10.7,
  usdRate: 10.0,
  capacityCap: 7,
  currency: 'MAD',
}

export const SERVICES = [
  { name: 'Bibliographic audit', mad: 3500, eur: 450, days: 5 },
  { name: 'Statistical analysis + results chapter', mad: 6000, eur: 900, days: 10 },
  { name: 'LaTeX chapter production', mad: 5000, eur: 700, days: 10 },
  { name: 'Systematic review support', mad: 8000, eur: 1200, days: 15 },
  { name: 'Defense dossier', mad: 4500, eur: 600, days: 7 },
  { name: 'Full thesis retainer (monthly)', mad: 12000, eur: 1500, days: 30 },
  { name: 'Micro-service', mad: 1200, eur: 150, days: 2 },
  { name: 'Cohort workshop seat', mad: 900, eur: 120, days: 1 },
]

export const STAGES = ['Lead', 'Quoted', 'In progress', 'In review', 'Delivered', 'Paid', 'Lost']
export const DEPOSITS = [
  { value: 'none', label: 'Deposit not taken' },
  { value: 'half', label: 'Deposit 50% received' },
  { value: 'full', label: 'Paid in full' },
]

export const GATES = [
  {
    date: '2026-09-30',
    label: '30 September',
    amount: 48000,
    action:
      'Below 35,000 means the export channel has not converted. Rewrite the profile and pricing this week rather than waiting for October.',
  },
  {
    date: '2026-10-31',
    label: '31 October',
    amount: 97000,
    action:
      'Below 80,000 triggers contingency: reprice upward, convert three clients to monthly retainers, add a third December cohort.',
  },
  {
    date: '2026-11-30',
    label: '30 November',
    amount: 149000,
    action:
      'Below 130,000 makes the target unreachable through delivery alone. December becomes collections and cohort work only.',
  },
  {
    date: '2026-12-31',
    label: '31 December',
    amount: 200000,
    action:
      'A missed number is recoverable. A damaged reputation in the Rabat–Kénitra doctoral network is not.',
  },
]

export const REVIEW_METRICS = [
  ['Revenue collected this week', '≥ 10,000 MAD (Oct–Dec)'],
  ['Cumulative vs. plan', 'within 10%'],
  ['Active projects', '4 – 7'],
  ['New leads generated', '≥ 3'],
  ['Outstanding receivables', '< 15,000 MAD'],
  ['Hours worked', '< 55'],
]

export const PHASES = [
  {
    id: 'p0',
    name: 'Phase 0',
    title: 'Foundation',
    when: '5 – 20 August',
    note: 'Nothing here earns money. All of it unblocks money.',
    steps: [
      {
        t: 'Open a Wise or Payoneer account',
        d: 'Verification takes one to two weeks. Roughly 60,000 MAD of this plan cannot be collected without it, so it starts on day one.',
        tag: 'Blocker',
      },
      {
        t: 'Commit to the rate card',
        d: 'Fixed prices for the core packages. Quoting case by case costs hours, invites negotiation and anchors low.',
      },
      {
        t: 'Write the engagement terms',
        d: '50% deposit before work starts, 50% before final delivery. Two revision rounds included. Scope agreed in writing.',
      },
      {
        t: 'Book a comptable in Meknès',
        d: 'Ask about the auto-entrepreneur ceiling, treatment of EUR revenue, and whether another structure fits at this volume.',
      },
      {
        t: 'Assemble four portfolio artifacts',
        d: 'Anonymized before/after: a corrected bibliography, a PRISMA figure, a results table, a compiled chapter.',
      },
      {
        t: 'Set up the project tracking board',
        d: 'This app. Client, deliverable, deposit status, deadline, stage — running seven projects from memory in November is how deadlines get missed.',
      },
    ],
  },
  {
    id: 'p1',
    name: 'Phase 1',
    title: 'Capacity',
    when: '15 August – 20 September',
    note: 'Every hour spent here returns roughly three in November.',
    steps: [
      {
        t: 'Build the LaTeX thesis skeleton',
        d: 'Rabat and Kénitra variants conforming to each university\u2019s norms. Compiles clean on first run.',
      },
      {
        t: 'Package the docx style set',
        d: 'Style definitions plus the XML unpack/repack pipeline, documented well enough to hand to someone else.',
      },
      {
        t: 'Assemble the SPSS syntax library',
        d: 'Descriptive, bivariate, regression, survival, reliability. Parameterized, not copy-pasted per project.',
      },
      {
        t: 'Ship the Python tools with a README',
        d: 'PDF retrieval, DOI verification and BibTeX deduplication already exist. Give them a stable CLI so the assistant can run them.',
      },
      {
        t: 'Build the figure templates',
        d: 'PRISMA, forest plot, geographic distribution, CONSORT. Matplotlib, publication standard, data in and figure out.',
      },
      {
        t: 'Recruit a student assistant',
        d: "Master's level, 3,000–4,000 MAD per month or per task. Onboard by mid-September.",
      },
      {
        t: 'Write SOPs for delegated work',
        d: 'Reference formatting, PDF retrieval, data entry, table construction, style checks, first-pass screening.',
      },
      {
        t: 'Train the assistant on two supervised projects',
        d: 'You keep all statistical interpretation, methodological judgment and final review. Every deliverable passes your eyes before it leaves.',
      },
    ],
  },
  {
    id: 'p2',
    name: 'Phase 2',
    title: 'Demand',
    when: 'From 25 August, continuous',
    note: 'Referrals convert fastest and cost nothing. Export has a four to six week latency, so it starts in parallel.',
    steps: [
      {
        t: 'Send fifteen personal referral messages',
        d: 'Every past client sits in a lab with 10–40 candidates facing the same problems. Individually written, referencing their project. Ask for two introductions each.',
        tag: 'Highest ROI',
      },
      {
        t: 'Put the Malt.fr profile live',
        d: 'Strongest French-speaking market. Position as docteur-conseil in statistical analysis and scientific writing across health and applied economics.',
      },
      {
        t: 'Put the Upwork profile live',
        d: 'Broader and more price-competitive. Useful mainly to accumulate early reviews.',
      },
      {
        t: 'Bid on the first ten export projects',
        d: 'Price 20% under the card to win the first two. The same analysis that sells for 4,000 MAD locally sells for €900 in Lyon or Brussels.',
        tag: 'Blocker',
      },
      {
        t: 'Pitch two free institutional sessions',
        d: 'A 90-minute methodology session at a doctoral school. The session is the acquisition channel for the paid cohort, not a loss.',
      },
      {
        t: 'Normalize export pricing after two reviews',
        d: 'The discount was for reviews, not for positioning. Move to the full rate card once they land.',
      },
    ],
  },
  {
    id: 'p3',
    name: 'Phase 3',
    title: 'Cohort',
    when: 'September build · October and December delivery',
    note: 'Eighteen people at 900 MAD is one weekend of delivery. Recorded once, it sells afterward at no marginal cost.',
    steps: [
      {
        t: 'Build the curriculum',
        d: 'SPSS for health and social science research, LaTeX thesis production, bibliography management with Zotero and BibTeX.',
      },
      {
        t: 'Market cohort 1',
        d: 'Target 18 seats, break-even at 8. Feed from the free institutional sessions.',
      },
      {
        t: 'Deliver cohort 1 — mid October',
        d: 'Before the panic, while delivery load is still moderate. Record everything.',
      },
      {
        t: 'Cut the recording into an evergreen product',
        d: 'Self-paced, 400–600 MAD, zero marginal delivery cost.',
      },
      {
        t: 'Market cohort 2',
        d: 'Early December, when urgency peaks and price sensitivity drops. Consider pricing above cohort 1.',
      },
      {
        t: 'Deliver cohort 2 — early December',
        d: 'The curriculum already exists. This one is almost pure margin.',
      },
    ],
  },
  {
    id: 'p4',
    name: 'Phase 4',
    title: 'Peak and collect',
    when: 'October – December',
    note: 'This is where the plan either holds or breaks. Both failure modes are preventable.',
    steps: [
      {
        t: 'Take a deposit on every project, without exception',
        d: 'This is what prevents arriving at 31 December having done the work and not been paid.',
      },
      {
        t: 'Cap simultaneous projects at seven',
        d: 'Beyond that, quality degrades before throughput improves. Decline or subcontract instead.',
      },
      {
        t: 'Subcontract overflow rather than refusing it',
        d: 'You keep the client relationship and the review. Someone else does the formatting layer.',
      },
      {
        t: 'Hold one full day off per week',
        d: 'Tracked, not aspirational. Burnout and quality collapse are the same risk wearing two faces.',
      },
      {
        t: 'From 1 December: collections push',
        d: 'Active follow-up on every outstanding balance. No final files released before payment clears.',
      },
    ],
  },
]

export const TOTAL_STEPS = PHASES.reduce((a, p) => a + p.steps.length, 0)

/* ---------- clients ---------- */

export const CLIENT_SOURCES = [
  'Referral',
  'Institutional session',
  'Export platform',
  'Direct enquiry',
  'Returning client',
]

export const INTRO_STATES = [
  { value: 'not-asked', label: 'Introduction not asked' },
  { value: 'asked', label: 'Introduction asked' },
  { value: 'given', label: 'Introduction given' },
  { value: 'declined', label: 'Declined' },
]

export const INSTITUTIONS = [
  'CHU Ibn Sina — Rabat',
  'Mohammed V University — Rabat',
  'Ibn Tofail University — Kénitra',
  'Moulay Ismail University — Meknès',
  'Other Moroccan institution',
  'International',
]

/* ---------- invoicing ---------- */

export const INVOICE_TERMS = [
  '50% deposit payable before work begins.',
  'Balance payable before delivery of final files.',
  'Two revision rounds included in the quoted price.',
  'Scope as described above; additional work quoted separately.',
]
