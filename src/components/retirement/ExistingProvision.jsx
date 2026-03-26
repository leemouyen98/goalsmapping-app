import { useState, useMemo } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { formatRMFull } from '../../lib/calculations'
import { projectProvision } from '../../lib/calculations'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import NumberInput from '../ui/NumberInput'

const FREQUENCIES = ['One-Time', 'Monthly', 'Quarterly', 'Semi-annually', 'Yearly']
const PROVISION_TYPES = ['Unit Trust', 'Fixed Deposit', 'ASNB', 'Cash Savings', 'Insurance', 'EPF Voluntary', 'Private Pension', 'Other']

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2)

export default function ExistingProvision({ plan, currentAge, onChange, onBack, onContinue }) {
  const { t } = useLanguage()
  const provisions = plan.provisions || []
  const yearsToRetirement = plan.retirementAge - currentAge

  const addProvision = () => {
    onChange({
      provisions: [
        ...provisions,
        { id: uid(), name: '', amount: 0, frequency: 'Monthly', preRetirementReturn: 5, currentBalance: 0 },
      ],
    })
  }

  const updateProvision = (idx, updates) => {
    const next = [...provisions]
    next[idx] = { ...next[idx], ...updates }
    onChange({ provisions: next })
  }

  const removeProvision = (idx) => {
    onChange({ provisions: provisions.filter((_, i) => i !== idx) })
  }

  // Calculate projected values
  const projections = useMemo(() => {
    return provisions.map((p) => ({
      ...p,
      projectedValue: Math.round(projectProvision(p, yearsToRetirement)),
    }))
  }, [provisions, yearsToRetirement])

  // Total capital = current balances + all future contributions over the period
  const totalCapital = provisions.reduce((sum, p) => {
    const balance = p.currentBalance || 0
    if (p.frequency === 'One-Time') return sum + balance + (p.amount || 0)
    const freqMap = { Monthly: 12, Quarterly: 4, 'Semi-annually': 2, Yearly: 1 }
    return sum + balance + (p.amount || 0) * (freqMap[p.frequency] || 12) * yearsToRetirement
  }, 0)

  const totalProjected = projections.reduce((sum, p) => sum + p.projectedValue, 0)

  return (
    <div className="flex gap-6">
      {/* Left: Form */}
      <div className="flex-1 space-y-4">
        <div className="hig-card p-5">
          <h3 className="text-hig-headline mb-2">{t('retirement.existingProvision')}</h3>
          <p className="text-hig-subhead text-hig-text-secondary mb-5">
            {t('retirement.existingProvisionDesc')}
          </p>

          {provisions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-hig-subhead text-hig-text-secondary mb-4">
                {t('retirement.noProvisions')}
              </p>
              <button onClick={addProvision} className="hig-btn-primary gap-2">
                <Plus size={16} /> {t('retirement.addProvision')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {provisions.map((p, idx) => (
                <div key={p.id} className="border border-hig-gray-5 rounded-hig-sm p-4 relative">
                  <button
                    onClick={() => removeProvision(idx)}
                    className="absolute top-3 right-3 text-hig-text-secondary hover:text-hig-red transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="hig-label">{t('retirement.provisionName')}</label>
                      <input
                        value={p.name}
                        onChange={(e) => updateProvision(idx, { name: e.target.value })}
                        className="hig-input"
                        placeholder="e.g. PRS, ASNB"
                      />
                    </div>
                    <div>
                      <label className="hig-label">{t('retirement.provisionType')}</label>
                      <select
                        value={p.type || ''}
                        onChange={(e) => updateProvision(idx, { type: e.target.value })}
                        className="hig-input"
                      >
                        <option value="">{t('common.select')}</option>
                        {PROVISION_TYPES.map((pt) => <option key={pt}>{pt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="hig-label">{t('retirement.currentBalanceRM')}</label>
                      <NumberInput
                        value={p.currentBalance}
                        onChange={(num) => updateProvision(idx, { currentBalance: num })}
                        className="hig-input"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="hig-label">{t('retirement.preRetirementReturnPct')}</label>
                      <input
                        type="number"
                        step="0.5"
                        value={p.preRetirementReturn}
                        onChange={(e) => updateProvision(idx, { preRetirementReturn: parseFloat(e.target.value) || 0 })}
                        className="hig-input"
                      />
                    </div>
                    <div>
                      <label className="hig-label">{t('retirement.contributionAmountRM')}</label>
                      <NumberInput
                        value={p.amount}
                        onChange={(num) => updateProvision(idx, { amount: num })}
                        className="hig-input"
                        placeholder="500"
                      />
                    </div>
                    <div>
                      <label className="hig-label">{t('common.period')}</label>
                      <select
                        value={p.frequency}
                        onChange={(e) => updateProvision(idx, { frequency: e.target.value })}
                        className="hig-input"
                      >
                        {FREQUENCIES.map((f) => (
                          <option key={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={addProvision} className="hig-btn-secondary gap-2 w-full">
                <Plus size={16} /> {t('retirement.addProvision')}
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button onClick={onBack} className="hig-btn-ghost gap-1.5">
            <ArrowLeft size={16} /> {t('common.back')}
          </button>
          <button onClick={onContinue} className="hig-btn-primary">
            {t('common.continue')}
          </button>
        </div>
      </div>

      {/* Right: Summary */}
      <div className="w-72 shrink-0">
        <div className="hig-card p-5 space-y-4 sticky top-4">
          <h3 className="text-hig-headline">{t('retirement.provisionSummary')}</h3>

          {provisions.length === 0 ? (
            <p className="text-hig-subhead text-hig-text-secondary">
              {t('retirement.addProvisionsPrompt')}
            </p>
          ) : (
            <>
              <div className="bg-green-50 rounded-hig-sm p-4">
                <p className="text-hig-caption1 text-hig-green font-medium mb-1">
                  {t('retirement.epfAtAge', { age: plan.retirementAge })}
                </p>
                <p className="text-hig-title2 text-hig-green">
                  {formatRMFull(totalProjected)}
                </p>
                <p className="text-hig-caption2 text-hig-text-secondary mt-1">
                  {t('retirement.growsBy', { amount: formatRMFull(totalProjected - totalCapital), years: yearsToRetirement })}
                  {totalCapital > 0 ? ` — ${t('retirement.gainOnCapital', { pct: Math.round(((totalProjected / totalCapital) - 1) * 100).toLocaleString('en-MY') })}` : '.'}
                </p>
              </div>

              <div className="space-y-2.5 text-hig-subhead">
                <div className="flex justify-between">
                  <span className="text-hig-text-secondary">{t('retirement.existingProvision')}</span>
                  <span className="font-semibold">{provisions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-hig-text-secondary">{t('retirement.totalCommitted')}</span>
                  <span className="font-semibold">{formatRMFull(totalCapital)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-hig-text-secondary">{t('retirement.todayValue')}</span>
                  <span className="font-semibold">{formatRMFull(provisions.reduce((s, p) => s + (p.currentBalance || 0) + (p.frequency === 'One-Time' ? (p.amount || 0) : 0), 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-hig-text-secondary">{t('retirement.yearsToTarget')}</span>
                  <span className="font-semibold">{yearsToRetirement}</span>
                </div>
              </div>

              {/* Individual projections */}
              <hr className="border-hig-gray-5" />
              <div className="space-y-2">
                {projections.map((p, i) => (
                  <div key={p.id} className="flex justify-between text-hig-caption1">
                    <span className="text-hig-text-secondary truncate">{p.name || t('retirement.provisionN', { n: i + 1 })}</span>
                    <span className="font-medium">{formatRMFull(p.projectedValue)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
