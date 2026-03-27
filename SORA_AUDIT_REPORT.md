# Sora — Full Audit & Test Report
**Date:** 28 March 2026
**Scope:** Full code audit, browser test of all pages/functions, applied fixes, product direction review
**Auditor:** Claude (AI engineer session)

---

## What Was Done

This session covered four phases: code audit, chart fixes, browser testing of every page, and applying code corrections. It closes with a frank assessment of what to build next.

---

## Phase 1–2: Fixes Applied

### Retirement Planner — Lifetime Needs Analysis chart (broken, now fixed)
A Batch-2 AI refactor had deleted the `const shortfallAmount` declaration while keeping all 9 references to it — including one inside a `useMemo` dependency array. This caused a `ReferenceError` crash before the chart could mount. One line restored, confirmed working.

### Insurance Planner — Coverage Gap Analysis bar chart (missing, now added)
No Recharts bar chart existed for the 4-risk cross-comparison. A CSS-based version had been removed in a prior commit and never replaced. Added a proper `CoverageGapChart` component (stacked bar: Existing / Recommended / Shortfall) across all 4 risks (Death, TPD, ACI, ECI) with a tooltip. Renders correctly in production.

---

## Phase 3: Browser Test Results

Tested on `portal.llhgroup.co` with account `728175 / demo1234`.

### Pages tested and status

| Page / Function | Status | Notes |
|---|---|---|
| Dashboard | ✅ Works | Stats, upcoming, quick links all load |
| Contacts list | ✅ Works | All 3 contacts visible |
| Contact Detail — profile | ✅ Works | Name, DOB, tags, notes render |
| Contact Detail — Interaction tab | ✅ Works | Notes / Tasks / Activities sub-tabs |
| Contact Detail — Finances → Financial Info | ✅ Works | Assets, income, liabilities all shown |
| Contact Detail — Finances → Insurance | ✅ Works | Empty state handled cleanly |
| Contact Detail — Finances → Financial Ratios | ✅ Works | All 6 ratios with benchmarks |
| Retirement Planner — Step 1 | ✅ Works | Parameters, assumptions, EPF sense-check |
| Retirement Planner — Step 2 | ✅ Works | Provision entry and summary |
| Retirement Planner — Step 3 | ✅ Works | Stacked area chart, 3 tiers, sensitivity checks |
| Insurance Planner — Step 1 | ✅ Works | All 4 risk needs inputs |
| Insurance Planner — Step 2 | ✅ Works | Existing coverage, progress bars |
| Insurance Planner — Step 3 | ✅ Works | New bar chart, age depletion chart, recommendations |
| Cash Flow Planner | ✅ Works | GoalsMapper chart, linked plans toggle, planner summary |
| Search (global) | ⚠️ Partial | Works via Enter key, routes to /contacts?q=. No live dropdown autocomplete. |
| Admin Dashboard | ⚠️ Bug | Stat cards showed wrong count (see bugs) |
| Settings | ✅ Works | Profile read-only, password change form |
| About Sora modal | ✅ Works | Branded, polished |

### Bugs found and fixed in Phase 4

**Monthly Cash Flow — Contact Detail overview card (fixed)**
The overview card computed `income − expenses` only. The correct formula (matching the Finances tab) is `income − expenses − loan repayments`. This made the overview show RM 4,333 while the Finances tab correctly showed RM 1.1k for Alex Test. Fixed by adding PMT calculation from liabilities.

**Investment field mismatch — FinancesTab (fixed)**
Investment rows use a `currentValue` field, not `amount`. FinancesTab was summing `i.amount` (always 0) instead of `i.currentValue`. For clients with investment portfolios, Net Worth would have silently been understated. Fixed.

**Admin stat cards — wrong count (fixed)**
Filtered to `role === 'agent'` only, showing "2 Total Agents, 1 Active" while the table displayed 4 members. Fixed to count all users regardless of role.

**Security — wrangler SQL command exposed in Admin page (fixed)**
A developer-only `wrangler d1 execute hla-db` command was rendered in the production Admin UI. This exposes the database name and table schema to every logged-in admin user. Removed.

**Retirement defaults — wrong (fixed)**
Default retirement age was 55; life expectancy was 85. Changed to 60/100 across all files (RetirementPlannerPage, RetirementPlanner, ExistingProvision, CashFlowTab, ContactDetailPage, ContactsPage, PDF export, RetirementReportPDF).

### Bugs found — not yet fixed (need investigation)

**Net Worth discrepancy — Contact Detail overview vs Finances tab**
Alex Test shows RM 525,000 in the overview card and RM 375,000 in the Finances tab. Both use the same formula (`totalAssets + totalInvestments − totalLiabilities`). The gap is RM 150,000, suggesting one code path reads a different or partially-normalised version of the financials object from the Zustand store. The most likely cause: the Contact Detail page reads `contact?.financials` raw, while the Finances tab first runs `normalizeFinancials()` which adds/transforms liability rows. Needs a targeted Zustand store inspection.

**Retirement Step 2 — mislabeled card**
The "Estimated EPF Balance at age 55" card in the Provision Summary shows the Unit Trust provision projection (RM 10k × 1.05^14 = RM 19,799), not the EPF balance. The EPF figure from Step 1 (RM 1,149,031) is not carried over or shown in Step 2. Label fix and data plumbing needed.

**Cash Flow — One-off today anomaly**
The Cash Flow Planner shows "One-off today: RM 600,000" which is far above the retirement Stronger Path recommendation of RM 60,952. Likely a data artefact from the test client, but the origin of the RM 600,000 figure in the linked plans state is unconfirmed.

---

## Phase 4: Code Cleanup Applied

| Item | Action |
|---|---|
| `InvestmentsTab.jsx` | Deleted — completely unimported, dead code |
| `uid()` function | Consolidated to `lib/formatters.js`; removed 4 duplicate definitions |
| Monthly Cash Flow formula | Fixed in ContactDetailPage |
| Investment `currentValue` field | Fixed in FinancesTab |
| Admin stat cards | Fixed to count all users |
| Wrangler SQL command | Removed from Admin page |
| Retirement defaults | Changed to 60 / 100 everywhere |

---

## What to Build Next — Ranked by Impact

### 1. Planning Snapshot on Contact Detail (Batch 5 — deploy it)

The document describes it. The code may exist. It isn't visible on the Contact Detail page in production. This is the most useful single surface in the product — a contact-level advisory dashboard showing readiness, gaps, linked monthly load, and next actions. Ship it.

**Why it's first:** Every other planner produces output that disappears when you leave. The Planning Snapshot makes that output persistent and visible at the client level without opening each tool. This is what separates a planning system from a set of calculators.

---

### 2. Fix the Net Worth discrepancy (data integrity)

A financial tool that shows different Net Worth depending on which screen you're on is dangerous in a client meeting. Until this is resolved, the overview card is untrustworthy. This is a 1–2 hour investigation and fix.

**Why it matters:** Credibility. If a client sees two different numbers on two screens, the conversation dies there.

---

### 3. Search — live autocomplete dropdown

The global search requires Enter and redirects to a filtered contacts list. For an iPad-first tool used in meetings, this is too slow. A `useState` + filtered list dropdown on keystroke would take an afternoon and meaningfully improve the feel of the product.

---

### 4. Case Priority Engine (Batch 6, item 1)

After the Planning Snapshot, the next highest-leverage advisory feature. The system already has all the data it needs: retirement shortfall, protection gap, cash flow surplus, financial readiness score. What it doesn't do is rank what matters most and surface it plainly.

The implementation is: a priority scoring function that takes contact state and returns an ordered list of advisory flags — "Protection gap critical", "Retirement underfunded", "Surplus too thin for linked plans", etc. These flags drive the Planning Snapshot's "Next Actions" section.

**Concrete output:** When an adviser opens any client, they see: "Top priority: Death coverage 13% of target — this is the conversation to have today."

---

### 5. Export quality — PDF report improvements

The PDF export buttons exist on both planners. The outputs likely work but haven't been tested in this session. Based on the code, the retirement PDF includes the chart but it may be a static SVG render. The protection PDF is a separate component.

Priority improvements:
- Include the Coverage Gap Analysis bar chart in the protection PDF
- Add a one-page advisory summary page (current readiness, top 3 risks, recommended order, affordability pressure)
- Adviser branding header (name, logo, date)

This is the deliverable that goes to the client after the meeting. It's the tangible output of the whole system.

---

### 6. Meeting Mode (Batch 6, item 5)

A clean client-facing view that strips out adviser-only controls (sensitivity sliders, assumption presets, assumption cards) and shows only the core decision. Minimum viable version: a toggle on each planner that hides input panels and enlarges the chart and recommendation cards.

**Why it matters for COT production:** You're running multiple client meetings per week. A mode that reduces cognitive load during the meeting — fewer inputs visible, stronger summaries — means you spend less time explaining the tool and more time on the advice.

---

### 7. Data confidence signaling

The system currently shows recommendations regardless of how complete or reliable the input data is. If income is estimated, expenses are blank, or liabilities aren't entered, the recommendation looks just as authoritative as a fully-completed profile.

Simple fix: a `completeness` score per contact (0–100%) based on which fields are filled. Show a banner on planners when completeness is below threshold: "Estimate only — financial data incomplete." This protects the adviser from presenting weak outputs as definitive advice.

---

## What ChatGPT's Batch Plan Got Right

The 6-batch structure is sound. The direction — from isolated calculators to connected planning engine — is the right call. Batch 4 (linking recommendations into cash flow) is the most important conceptual improvement in the product; it's what makes Sora different from a calculator collection.

The Batch 6 concept (decision engine, recommendation ranking, advisory workflow, meeting mode) maps almost exactly to items 4–6 above. ChatGPT is right that this is the missing bridge. The gap is that it didn't prioritise — everything in Batch 6 was presented as equal weight.

**My ranking of Batch 6 items:**

1. Case Priority Engine (highest leverage — drives next action at client level)
2. Meeting Mode (immediately useful in live client sessions)
3. Better Case Narrative / Export quality (leave-behind deliverable)
4. Recommendation Ranking (refines existing outputs, lower urgency)
5. Advisory Action Workflow (high effort, needs the priority engine first)

---

## What to Ignore for Now

- Multi-language support — the `useLanguage` hook exists throughout, but translation is incomplete. Not the constraint right now.
- Chunk size warnings in build — the react-pdf bundle (1.58MB) drives this. Split it lazily if Lighthouse scores become a concern.
- Investments tab — deleted. Not needed until someone wants portfolio tracking beyond EPF and savings.
- The `loanPeriod` default of 360 (months) — that's 30 years of monthly payments. Correct for home loans, probably wrong for car loans (84 months = 7 years is already set). Leave it.

---

## Final Verdict

The product is functionally solid. Both planners now render. The cash flow connection works. The data entry surface is reasonable.

The gap between what Sora does now and what it should do next is narrow but important: it produces planning outputs but doesn't tell the adviser what to do with them. That's the next six months of work — and it starts with the Planning Snapshot and the Case Priority Engine.

Push the fixes to GitHub. Build the Planning Snapshot. Then build the priority engine.
