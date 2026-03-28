/**
 * Case Priority Engine
 * Analyses a contact's retirement plan, protection plan, and financials
 * and returns sorted advisory flags — highest urgency first.
 *
 * Flags: { type, severity, message, detail, [shortfall], [coveragePercent], [surplus], [totalLinked] }
 * severity: 'critical' | 'warning' | 'info' | 'ok'
 */

import { generateRetirementProjection, generateProtectionSummary } from './calculations'
import { getAge } from './formatters'

// Minimal toMonthly — mirrors the one in financial-info/helpers.js
function toMonthly(amount, frequency) {
  const map = { Monthly: 1, Yearly: 1 / 12, Quarterly: 1 / 3, 'Semi-annually': 1 / 6, 'One-Time': 0 }
  return (Number(amount) || 0) * (map[frequency] ?? 1)
}

function fmtK(n) {
  if (n >= 1_000_000) return `RM ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `RM ${Math.round(n / 1_000)}k`
  return `RM ${Math.round(n)}`
}

// ─── Protection Priority ─────────────────────────────────────────────────────
function protectionFlag(contact) {
  const prot = contact?.protectionPlan
  if (!prot || !prot.needs) {
    return {
      type: 'protection', severity: 'critical',
      message: 'No protection plan',
      detail: 'Family is unprotected — run Insurance Planner',
    }
  }

  const summary = generateProtectionSummary({
    needs: prot.needs,
    existing: prot.existing ?? {},
    inflationRate: prot.inflationRate ?? 4,
    returnRate: prot.returnRate ?? 1,
    recommendations: prot.recommendations ?? [],
  })

  // Find the worst-covered risk that has a non-zero target
  const active = summary.filter(s => s.targetCoverage > 0)
  if (!active.length) {
    return { type: 'protection', severity: 'info', message: 'No protection needs entered', detail: 'Add needs in Step 1' }
  }

  const worst = active.reduce((w, s) => s.coveragePercent < w.coveragePercent ? s : w)
  const allFunded = active.every(s => s.coveragePercent >= 100)
  const totalGap = active.reduce((s, r) => s + r.shortfall, 0)

  // Monthly premium from selected recommendations
  const monthlyPremium = (prot.recommendations ?? [])
    .filter(r => r.isSelected)
    .reduce((s, r) => s + (Number(r.monthly || r.premium) || 0), 0)

  if (allFunded) {
    return {
      type: 'protection', severity: 'ok',
      message: 'All protection gaps closed',
      detail: monthlyPremium > 0 ? `Premium: RM ${Math.round(monthlyPremium).toLocaleString()}/mo` : '',
      monthlyPremium,
      summary,
    }
  }

  const pct = worst.coveragePercent
  return {
    type: 'protection',
    severity: pct < 30 ? 'critical' : pct < 70 ? 'warning' : 'info',
    message: `${worst.label} at ${pct}% — ${active.filter(s => s.shortfall > 0).length} of ${active.length} risks with gaps`,
    detail: totalGap > 0 ? `Total gap ${fmtK(totalGap)}` : '',
    shortfall: totalGap,
    worst,
    monthlyPremium,
    summary,
  }
}

// ─── Retirement Priority ─────────────────────────────────────────────────────
function retirementFlag(contact) {
  const plan = contact?.retirementPlan
  const currentAge = getAge(contact?.dob) || 30

  if (!plan) {
    return {
      type: 'retirement', severity: 'warning',
      message: 'No retirement plan',
      detail: 'Run Retirement Planner',
    }
  }

  const proj = generateRetirementProjection({ ...plan, currentAge })
  const pct = Math.round(proj.coveragePercent)

  // Monthly from selected recommendations
  const monthlyRec = (plan.recommendations ?? [])
    .filter(r => r.isSelected !== false)
    .reduce((s, r) => s + (Number(r.monthly) || 0), 0)

  if (proj.isFullyFunded) {
    return {
      type: 'retirement', severity: 'ok',
      message: `Retirement ${pct}% funded`,
      detail: `Funds last to ${proj.fundsRunOutWithRec ?? plan.lifeExpectancy}`,
      coveragePercent: pct,
      monthlyRec,
      projection: proj,
    }
  }

  return {
    type: 'retirement',
    severity: pct < 50 ? 'critical' : 'warning',
    message: `Retirement ${pct}% funded`,
    detail: proj.fundsRunOutAge < (plan.lifeExpectancy ?? 100)
      ? `Funds run out at ${proj.fundsRunOutAge} — shortfall ${fmtK(proj.shortfall)}`
      : `Shortfall ${fmtK(proj.shortfall)}`,
    shortfall: proj.shortfall,
    coveragePercent: pct,
    monthlyRec,
    projection: proj,
  }
}

// ─── Cash Flow Priority ──────────────────────────────────────────────────────
function cashFlowFlag(contact) {
  const fin = contact?.financials
  const prot = contact?.protectionPlan
  const plan = contact?.retirementPlan

  if (!fin) return null

  const income = (fin.income || []).reduce((s, r) => s + toMonthly(r.amount, r.frequency), 0)
  if (income === 0) return null

  const expenses = (fin.expenses || []).reduce((s, r) => s + toMonthly(r.amount, r.frequency), 0)
  const loanRepayments = (fin.liabilities || []).reduce((s, l) => {
    const P = Number(l.principal) || 0
    const r = (Number(l.interestRate) || 0) / 100 / 12
    const n = Number(l.loanPeriod) || 1
    if (P === 0) return s
    const pmt = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
    return s + pmt
  }, 0)
  const surplus = income - expenses - loanRepayments

  const protMonthly = (prot?.recommendations ?? [])
    .filter(r => r.isSelected)
    .reduce((s, r) => s + (Number(r.monthly || r.premium) || 0), 0)
  const retMonthly = (plan?.recommendations ?? [])
    .filter(r => r.isSelected !== false)
    .reduce((s, r) => s + (Number(r.monthly) || 0), 0)
  const totalLinked = protMonthly + retMonthly
  const afterPlans = surplus - totalLinked

  const ratio = afterPlans / Math.max(1, income)
  const severity = afterPlans < 0 ? 'warning' : ratio < 0.1 ? 'warning' : 'info'

  return {
    type: 'cashflow',
    severity,
    message: afterPlans >= 0
      ? `RM ${Math.round(afterPlans).toLocaleString()}/mo surplus after all plans`
      : `RM ${Math.round(-afterPlans).toLocaleString()}/mo deficit`,
    detail: totalLinked > 0 ? `Linked plans: RM ${Math.round(totalLinked).toLocaleString()}/mo` : 'No linked plans yet',
    surplus: afterPlans,
    grossSurplus: surplus,
    totalLinked,
    income,
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────
const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2, ok: 3 }

/**
 * Returns all advisory flags for a contact, sorted by severity.
 */
export function computePriorities(contact) {
  const flags = [
    protectionFlag(contact),
    retirementFlag(contact),
    cashFlowFlag(contact),
  ].filter(Boolean)

  return flags.sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 4) - (SEVERITY_ORDER[b.severity] ?? 4))
}

/**
 * Returns the single most urgent flag — use for dashboard callouts.
 */
export function getTopPriority(contact) {
  return computePriorities(contact)[0] ?? null
}
