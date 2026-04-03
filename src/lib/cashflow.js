const ANNUAL_MULTIPLIER = {
  Monthly: 12,
  Yearly: 1,
  Quarterly: 4,
  'Semi-annually': 2,
  'One-Time': 0,
  'Lump Sum': 0,
}

export function toAnnual(amount, frequency) {
  return (Number(amount) || 0) * (ANNUAL_MULTIPLIER[frequency] ?? 12)
}


export function toMonthly(amount, frequency) {
  const annual = toAnnual(amount, frequency)
  return annual / 12
}

function safeNumber(value) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

export function buildLinkedPlanningCommitments(contact, currentAge, retirementAge) {
  const protectionRecs = Array.isArray(contact?.protectionPlan?.recommendations)
    ? contact.protectionPlan.recommendations.filter((item) => item?.isSelected)
    : []
  const retirementRecs = Array.isArray(contact?.retirementPlan?.recommendations)
    ? contact.retirementPlan.recommendations.filter((item) => item?.isSelected)
    : []

  const schedules = []

  protectionRecs.forEach((rec, index) => {
    const monthlyAmount = toMonthly(rec?.premiumAmount, rec?.frequency || 'Monthly')
    const years = Math.max(1, safeNumber(rec?.periodYears || rec?.termYears || 20))
    if (monthlyAmount <= 0) return
    schedules.push({
      id: `protection-${rec?.id || index}`,
      source: 'protection',
      label: rec?.name || rec?.policyType || 'Protection premium',
      monthlyAmount,
      annualAmount: monthlyAmount * 12,
      startAge: currentAge,
      endAge: currentAge + years - 1,
    })
  })

  retirementRecs.forEach((rec, index) => {
    const monthlyAmount = safeNumber(rec?.monthlyAmount)
    const years = Math.max(1, safeNumber(rec?.periodYears || Math.max(retirementAge - currentAge, 1)))
    if (monthlyAmount > 0) {
      schedules.push({
        id: `retirement-${rec?.id || index}`,
        source: 'retirement',
        label: rec?.name || `Retirement contribution ${index + 1}`,
        monthlyAmount,
        annualAmount: monthlyAmount * 12,
        startAge: currentAge,
        endAge: Math.min(retirementAge - 1, currentAge + years - 1),
      })
    }
  })

  const oneOffRetirementNeeds = retirementRecs
    .map((rec, index) => ({
      id: `retirement-lump-${rec?.id || index}`,
      source: 'retirement',
      label: rec?.name || `Retirement lump sum ${index + 1}`,
      amount: safeNumber(rec?.lumpSum),
      age: currentAge,
    }))
    .filter((item) => item.amount > 0)

  const protectionMonthly = schedules.filter((item) => item.source === 'protection').reduce((sum, item) => sum + item.monthlyAmount, 0)
  const retirementMonthly = schedules.filter((item) => item.source === 'retirement').reduce((sum, item) => sum + item.monthlyAmount, 0)
  const oneOffToday = oneOffRetirementNeeds.reduce((sum, item) => sum + item.amount, 0)

  return {
    schedules,
    oneOffRetirementNeeds,
    protectionMonthly,
    retirementMonthly,
    totalMonthly: protectionMonthly + retirementMonthly,
    oneOffToday,
  }
}

export function formatRMCompact(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return '—'
  const numeric = Number(value)
  const abs = Math.abs(numeric)
  const text =
    abs >= 1_000_000
      ? `RM ${(abs / 1_000_000).toFixed(2)}M`
      : abs >= 1_000
        ? `RM ${(abs / 1_000).toFixed(0)}K`
        : `RM ${abs.toFixed(0)}`
  return numeric < 0 ? `−${text}` : text
}

export function formatAxisLabel(value) {
  if (value >= 1_000_000) return `RM ${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `RM ${(value / 1_000).toFixed(0)}K`
  return `RM ${value}`
}

export function projectCashFlow({
  annualIncome,
  annualExpenses,
  initialSavings,
  initialEpf,
  currentAge,
  expectedAge,
  retirementAge,
  inflationRate,
  savingsRate,
  epfDividendRate,
  goals,
  scenarios,
  linkedCommitments = [],
  oneOffNeeds = [],
}) {
  const rows = []
  let pool = Number(initialSavings) || 0
  let epfLocked = Number(initialEpf) || 0
  const inflation = (Number(inflationRate) || 0) / 100
  const savingsGrowth = (Number(savingsRate) || 0) / 100
  const epfGrowth = (Number(epfDividendRate) || 0) / 100

  const ciScenario = scenarios.find((item) => item.id === 'ci' && item.active)
  const disabilityScenario = scenarios.find((item) => item.id === 'disability' && item.active)
  const deathScenario = scenarios.find((item) => item.id === 'death' && item.active)

  for (let age = currentAge; age <= expectedAge; age += 1) {
    const yearIndex = age - currentAge
    const retired = age >= retirementAge
    const ciOff = ciScenario && age >= ciScenario.age && age < ciScenario.age + (ciScenario.duration ?? 3)
    const disabilityOff = disabilityScenario && age >= disabilityScenario.age
    const deathOff = deathScenario && age >= deathScenario.age
    const activeIncome = retired || ciOff || disabilityOff || deathOff ? 0 : annualIncome
    const goalLumpSum = goals
      .filter((goal) => goal.active && goal.age === age)
      .reduce((sum, goal) => sum + (Number(goal.amount) || 0), 0)
    const linkedAnnualCommitments = linkedCommitments
      .filter((item) => age >= item.startAge && age <= item.endAge)
      .reduce((sum, item) => sum + (Number(item.annualAmount) || 0), 0)
    const linkedOneOff = oneOffNeeds
      .filter((item) => item.age === age)
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
    const inflatedExpenses = annualExpenses * Math.pow(1 + inflation, yearIndex) + goalLumpSum + linkedAnnualCommitments + linkedOneOff

    let takeHomeIncomeUsed = 0
    let cashUsed = 0
    let passiveIncomeUsed = 0
    let shortfall = 0

    const surplus = activeIncome - inflatedExpenses
    if (surplus >= 0) {
      takeHomeIncomeUsed = inflatedExpenses
      pool = pool * (1 + savingsGrowth) + surplus
      if (epfLocked > 0) epfLocked *= 1 + epfGrowth
    } else {
      takeHomeIncomeUsed = activeIncome
      const deficit = inflatedExpenses - activeIncome

      // Step 1: cover from cash pool
      if (pool >= deficit) {
        cashUsed = deficit
        pool = pool * (1 + savingsGrowth) - deficit
        if (epfLocked > 0) epfLocked *= 1 + epfGrowth
      } else {
        cashUsed = pool
        pool = 0
        const afterCash = deficit - cashUsed

        // Step 2: cover remaining from EPF / passive income
        const grownEpf = epfLocked * (1 + epfGrowth)
        if (grownEpf >= afterCash) {
          passiveIncomeUsed = afterCash
          epfLocked = grownEpf - afterCash
        } else {
          passiveIncomeUsed = grownEpf
          shortfall = afterCash - grownEpf
          epfLocked = 0
        }
      }
    }

    rows.push({
      age,
      takeHomeIncomeUsed: Math.round(takeHomeIncomeUsed),
      cashUsed: Math.round(cashUsed),
      passiveIncomeUsed: Math.round(passiveIncomeUsed),
      shortfall: Math.round(shortfall),
      cashSavingsEOY: Math.round(pool),
      epfEOY: Math.round(epfLocked),
      linkedAnnualCommitments: Math.round(linkedAnnualCommitments),
      linkedOneOff: Math.round(linkedOneOff),
    })
  }

  return rows
}

export function summarizeShortfall(chartData) {
  const shortfallYears = chartData.filter((row) => row.shortfall > 0)
  if (!shortfallYears.length) return null
  return {
    total: shortfallYears.reduce((sum, row) => sum + row.shortfall, 0),
    start: shortfallYears[0].age,
    end: shortfallYears[shortfallYears.length - 1].age,
  }
}

export function getCashFlowMilestones(chartData, ages = [55, 60, 65]) {
  return ages.map((age) => {
    const row = chartData.find((item) => item.age === age)
    return {
      age,
      cashSavingsEOY: row?.cashSavingsEOY ?? 0,
      shortfall: row?.shortfall ?? 0,
      status: row?.shortfall > 0 ? 'shortfall' : row?.cashSavingsEOY > 0 ? 'funded' : 'tight',
    }
  })
}

export function buildInsurancePlans(financials) {
  return (Array.isArray(financials?.insurance) ? financials.insurance : []).map((policy) => ({
    id: policy.id,
    name: policy.name || 'Policy',
    type: policy.type || '',
    insurer: policy.insurer || '',
    policyNo: policy.policyNumber || '',
  }))
}

export function buildCashFlowRecommendations({ financials, scenarios, shortfallSummary, linkedPlans = null, t }) {
  const policies = Array.isArray(financials?.insurance) ? financials.insurance : []
  const hasPolicy = (...keywords) =>
    policies.some((policy) =>
      keywords.some((keyword) => {
        const target = keyword.toLowerCase()
        return (policy.type ?? '').toLowerCase().includes(target) || (policy.name ?? '').toLowerCase().includes(target)
      })
    )

  const ciActive = scenarios.find((item) => item.id === 'ci' && item.active)
  const disabilityActive = scenarios.find((item) => item.id === 'disability' && item.active)
  const deathActive = scenarios.find((item) => item.id === 'death' && item.active)
  const hasShortfall = Boolean(shortfallSummary)
  const recommendations = []

  if (!hasPolicy('critical', 'ci')) {
    const triggered = ciActive && hasShortfall
    recommendations.push({
      id: 'ci',
      label: t ? t('cashflow.recCi') : 'Critical Illness cover',
      desc: triggered
        ? `Scenario shows ${formatRMCompact(shortfallSummary?.total)} shortfall over ${ciActive?.duration ?? 3} years of recovery.`
        : (t ? t('cashflow.recCiDesc') : 'Use a CI payout to protect income during recovery.'),
      priority: Boolean(triggered),
    })
  }

  if (!hasPolicy('disability', 'tpd', 'income protection')) {
    const triggered = disabilityActive && hasShortfall
    recommendations.push({
      id: 'tpd',
      label: t ? t('cashflow.recTpd') : 'TPD or income protection',
      desc: triggered
        ? `Disability scenario creates ${formatRMCompact(shortfallSummary?.total)} cumulative shortfall.`
        : (t ? t('cashflow.recTpdDesc') : 'Use lump sum or income replacement for long-term disability.'),
      priority: Boolean(triggered),
    })
  }

  if (!hasPolicy('life', 'term', 'death', 'whole life', 'wholelife')) {
    const triggered = deathActive && hasShortfall
    recommendations.push({
      id: 'life',
      label: t ? t('cashflow.recLife') : 'Life cover',
      desc: triggered
        ? `Death scenario leaves ${formatRMCompact(shortfallSummary?.total)} family shortfall.`
        : (t ? t('cashflow.recLifeDesc') : 'Use life cover to protect dependants and liabilities.'),
      priority: Boolean(triggered),
    })
  }

  if (!hasPolicy('hospital', 'medical', 'h&s', 'surgical')) {
    recommendations.push({
      id: 'medical',
      label: t ? t('cashflow.recHospital') : 'Hospital and surgical cover',
      desc: t ? t('cashflow.recHospitalDesc') : 'Medical cover reduces cash drain from hospital bills.',
      priority: false,
    })
  }


  if (linkedPlans && linkedPlans.totalMonthly > 0) {
    recommendations.unshift({
      id: 'linked-plans',
      label: 'Linked planning load',
      desc: `Selected retirement and protection recommendations add ${formatRMCompact(linkedPlans.totalMonthly * 12)} per year before any new advice is layered on.`,
      priority: linkedPlans.totalMonthly * 12 > ((shortfallSummary?.total || 0) / Math.max((shortfallSummary?.end || 1) - (shortfallSummary?.start || 0) + 1, 1)),
    })
  }
  return recommendations.sort((a, b) => Number(b.priority) - Number(a.priority))
}
