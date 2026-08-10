# Aleph Tracker

Revenue and project management for a solo academic research support practice.

Built around one question: **will the money actually be in hand by 31 December?** Not invoiced, not promised — collected. Most project trackers answer "what am I working on." This one answers "what is at risk of not paying."

![React](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![License](https://img.shields.io/badge/license-MIT-green)

---

## Why it exists

Running six or seven doctoral support projects at once during thesis season, the failure mode is never forgetting a project. It is:

- delivering work in December that gets paid in January
- working three weeks on a chapter with no deposit taken
- passing the point where an extra project makes quality worse, not revenue better

The app surfaces those three things as first-class numbers instead of leaving them buried in a spreadsheet.

## Features

**Dashboard** — a pace meter showing cumulative collected revenue against where the plan says you should be *today*, plus checkpoint gates, a trajectory chart, plan progress and automatic alerts.

**Projects** — pipeline sorted by deadline, with inline stage and deposit controls, full editing, and search. Cards are colour-coded by runway and flagged when work is unsecured, overdue, or delivered but unpaid. Bids you have not yet won are tracked as **Lead** and, if they fall through, **Lost** — producing a conversion rate.

**Clients** — a directory of relationships rather than transactions, with lifetime value per client and referral-ask tracking. Every past client sits in a doctoral school full of candidates with the same problems; this page tracks who you have asked and who you have not.

**Workload** — deadline density by week against your capacity cap, so clustering is visible months ahead. Also holds the Sunday review log, which builds a trend of revenue against hours worked.

**Revenue** — month-by-month plan against actual. Cash from tracked projects is counted automatically in the month of its deadline; a manual column covers cohort seats, workshops and retainers. An effective-rate table shows MAD earned per hour by service, so underpriced work is visible.

**Invoices** — generate a printable quote or invoice from any project, with deposit terms and automatic invoice numbering. Print to PDF from the browser; no other software needed. The rate card lives here too, with the export multiple calculated so the pricing gap stays visible.

**Plan** — 31 execution steps across five phases, with persistent progress.

**Settings** — targets, exchange rates, capacity cap, working notes, and JSON export/import.

### The signals that matter

| Signal | What it means |
|---|---|
| **Unsecured** | Work in progress with no deposit received. This is what becomes unpaid January invoices. |
| **Active load vs cap** | Turns red past the cap, so you subcontract *before* quality slips. |
| **December, no deposit** | A December deadline without a deposit will be paid in January and miss the target entirely. |
| **Peak week** | The worst deadline pile-up ahead. A problem to solve in October, not discover in November. |
| **Intro not asked** | Past clients you have not asked for a referral — the cheapest revenue available. |
| **Conversion rate** | Wins against decided bids. The export plan assumes roughly two in ten. |
| **MAD per hour** | Which fixed prices are generous and which are traps. |

---

## Getting started

Requires Node 18 or newer.

```bash
git clone https://github.com/YOUR-USERNAME/aleph-tracker.git
cd aleph-tracker
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build       # production build to dist/
npm run preview     # serve the build locally
npm test            # run the test suite
npm run test:watch  # tests in watch mode
```

First time opening it, *Settings → Load sample data* fills the board with a realistic
practice so every page has something to show. Clear it before entering anything real.

## Deploying

The build uses relative asset paths (`base: './'`), so `dist/` works on any static host without configuration.

**GitHub Pages** — a workflow is included at `.github/workflows/deploy.yml`. Push to `main`, then in your repository go to *Settings → Pages* and set the source to **GitHub Actions**. The site publishes automatically.

**Netlify / Vercel / Cloudflare Pages** — build command `npm run build`, publish directory `dist`.

Routing uses `HashRouter`, so deep links work on static hosts with no rewrite rules.

---

## Data and privacy

All data is stored in your browser's `localStorage` under the key `aleph-tracker-v1`. Nothing is transmitted anywhere — there is no backend, no analytics, no account.

The practical consequence: **clearing your browser data deletes everything.** Use *Settings → Export JSON* regularly, and import the file to restore or to move between machines.

## Configuring the plan

Targets and content live in one file, `src/lib/plan.js`:

| Export | Controls |
|---|---|
| `MONTHS` | monthly revenue targets |
| `SERVICES` | the rate card |
| `GATES` | checkpoint dates and amounts |
| `PHASES` | execution steps |
| `SERVICES` / `INVOICE_TERMS` | rate card and invoice terms |
| `INSTITUTIONS` / `CLIENT_SOURCES` | client dropdown options |
| `DEFAULT_SETTINGS` | target, exchange rates, capacity cap |

Editing that file reconfigures the whole app. No other changes needed.

## Project structure

```
src/
  lib/
    plan.js          Static plan: targets, services, phases, gates
    calc.js          Currency, collection, pacing, alert logic
    calc.test.js     Test suite for the above
    seed.js          Sample dataset
  context/
    DataContext.jsx  Persisted state + actions
  components/
    Nav, StatCard, PaceMeter, Alerts, ProjectCard, ProjectForm
  pages/
    Dashboard, Projects, Clients, Workload, Revenue, Invoices, Plan, Settings
  styles.css         Design tokens and all styling
```

Business logic in `calc.js` is pure and framework-independent. It is covered by 34 tests in
`src/lib/calc.test.js` — run `npm test` after editing `plan.js`, since the pacing and attribution
tests assert against the monthly targets defined there.

## Notes

Revenue figures are projections, not guarantees. Exchange rates change; check them before quoting in EUR.

If you are operating under Morocco's *auto-entrepreneur* regime, note that the annual revenue ceiling for service activities sits close to a 200,000 MAD target. Confirm your position with a comptable — this is a planning tool, not tax or legal advice.

## License

MIT. See [LICENSE](LICENSE).
# aleph-tracker
