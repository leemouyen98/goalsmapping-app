import { useState } from 'react'
import { Plus, Pencil, Trash2, Shield, ChevronDown, ChevronUp } from 'lucide-react'
import { formatRMFull } from '../../lib/calculations'
import { InsuranceExportButton, PolicySummaryExportButton } from '../pdf/InsurancePoliciesPDF'
import { useAuth } from '../../hooks/useAuth'
import PolicyFormWizard from './PolicyFormWizard'

const POLICY_TYPES = [
  'Life',
  'Medical & Health',
  'Critical Illness',
  'Personal Accident',
  'Investment-Linked',
  'Endowment',
  'Term',
  'Whole Life',
]

const COMPANIES = [
  'Tokio Marine',
  'AIA',
  'Prudential',
  'Great Eastern',
  'Manulife',
  'Allianz',
  'Zurich',
  'AXA Affin',
  'Sun Life',
  'Other',
]

const EMPTY_POLICY = {
  policyNo: '',
  company: '',
  type: '',
  planName: '',
  sumAssured: 0,
  annualPremium: 0,
  monthlyPremium: 0,
  commencementDate: '',
  maturityDate: '',
  status: 'Active',
  nominee: '',
  hasPremiumWaiver: false,
  notes: '',
  coverageDetails: {
    death: 0,
    tpd: 0,
    ci: 0,
    medicalCard: 0,
    paDb: 0,
  },
}

export default function InsuranceTab({ financials, onSave, contact }) {
  const { agent } = useAuth()
  const policies = financials.insurance || []
  const [wizardState, setWizardState] = useState(null) // null | { form, idx }
  const [expandedIdx, setExpandedIdx] = useState(null)

  // ─── Summary ────────────────────────────────────────────────────────────

  const totalAnnualPremium = policies.reduce((s, p) => s + (Number(p.annualPremium) || 0), 0)
  const totalDeath = policies.reduce((s, p) => s + (Number(p.coverageDetails?.death) || 0), 0)
  const totalTPD = policies.reduce((s, p) => s + (Number(p.coverageDetails?.tpd) || 0), 0)
  const totalCI = policies.reduce((s, p) => s + (Number(p.coverageDetails?.ci) || 0), 0)
  const totalMedical = policies.reduce((s, p) => s + (Number(p.coverageDetails?.medicalCard) || 0), 0)

  // ─── Handlers ───────────────────────────────────────────────────────────

  const openAdd = () =>
    setWizardState({ form: { ...EMPTY_POLICY, coverageDetails: { ...EMPTY_POLICY.coverageDetails } }, idx: 'new' })

  const openEdit = (idx) => {
    const p = policies[idx]
    setWizardState({
      form: { ...EMPTY_POLICY, ...p, coverageDetails: { ...EMPTY_POLICY.coverageDetails, ...p.coverageDetails } },
      idx,
    })
  }

  const handleDelete = (idx) => {
    onSave({ ...financials, insurance: policies.filter((_, i) => i !== idx) })
  }

  const handleWizardSave = (coerced) => {
    const updated = wizardState.idx === 'new'
      ? [...policies, coerced]
      : policies.map((p, i) => i === wizardState.idx ? coerced : p)
    onSave({ ...financials, insurance: updated })
    setWizardState(null)
  }

  // ─── Empty State ────────────────────────────────────────────────────────

  if (policies.length === 0) {
    return (
      <>
        <div className="hig-card p-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-14 h-14 rounded-2xl bg-hig-green/10 flex items-center justify-center mb-4">
            <Shield size={26} className="text-hig-green" />
          </div>
          <p className="text-hig-headline text-hig-text font-semibold mb-1">No Insurance Policies</p>
          <p className="text-hig-subhead text-hig-text-secondary mb-4">
            Add existing insurance policies to track coverage and identify gaps.
          </p>
          <button onClick={openAdd} className="hig-btn-primary gap-1.5"><Plus size={16} /> Add Policy</button>
        </div>
        {wizardState && (
          <PolicyFormWizard
            initialForm={wizardState.form}
            isEdit={false}
            onSave={handleWizardSave}
            onClose={() => setWizardState(null)}
          />
        )}
      </>
    )
  }

  // ─── Policy List ────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[
          { label: 'Annual Premium', value: totalAnnualPremium, color: 'text-hig-blue' },
          { label: 'Death', value: totalDeath, color: 'text-hig-text' },
          { label: 'TPD', value: totalTPD, color: 'text-hig-text' },
          { label: 'CI', value: totalCI, color: 'text-hig-text' },
          { label: 'Medical', value: totalMedical, color: 'text-hig-text' },
        ].map((s) => (
          <div key={s.label} className="hig-card p-3 text-center">
            <p className="text-hig-caption1 text-hig-text-secondary mb-1">{s.label}</p>
            <p className={`text-hig-subhead font-semibold ${s.color}`}>{formatRMFull(s.value)}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <PolicySummaryExportButton
          policies={policies}
          contact={contact}
          agentName={agent?.name}
          agentMobile={agent?.mobile}
          agentEmail={agent?.email}
        />
        <InsuranceExportButton
          policies={policies}
          contact={contact}
          agentName={agent?.name}
        />
        <button onClick={openAdd} className="hig-btn-ghost gap-1.5"><Plus size={14} /> Add Policy</button>
      </div>

      {/* Policy Cards */}
      {policies.map((p, idx) => (
        <div key={idx} className="hig-card">
          <div
            className="p-4 flex items-center gap-4 cursor-pointer hover:bg-hig-gray-6/50 transition-colors rounded-hig"
            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
          >
            <div className={`w-10 h-10 rounded-hig-sm flex items-center justify-center shrink-0 ${p.status === 'Active' ? 'bg-hig-green/10' : 'bg-hig-gray-6'}`}>
              <Shield size={18} className={p.status === 'Active' ? 'text-hig-green' : 'text-hig-gray-1'} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-hig-subhead font-medium text-hig-text truncate">{p.planName || p.type || 'Unnamed Policy'}</p>
                <span className={`text-hig-caption2 px-2 py-0.5 rounded-full ${p.status === 'Active' ? 'bg-hig-green/10 text-hig-green' : 'bg-hig-gray-6 text-hig-gray-1'}`}>
                  {p.status}
                </span>
                {p.hasPremiumWaiver && (
                  <span className="text-hig-caption2 px-2 py-0.5 rounded-full bg-hig-blue/10 text-hig-blue">PWV</span>
                )}
              </div>
              <p className="text-hig-caption1 text-hig-text-secondary">{p.company} · {p.policyNo || 'No policy no.'}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-hig-subhead font-medium">{formatRMFull(p.sumAssured)}</p>
              <p className="text-hig-caption1 text-hig-text-secondary">{formatRMFull(p.annualPremium)}/yr</p>
            </div>
            {expandedIdx === idx ? <ChevronUp size={16} className="text-hig-gray-1" /> : <ChevronDown size={16} className="text-hig-gray-1" />}
          </div>

          {expandedIdx === idx && (
            <div className="px-4 pb-4 pt-0 border-t border-hig-gray-5 mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                {[
                  { label: 'Death', value: p.coverageDetails?.death },
                  { label: 'TPD', value: p.coverageDetails?.tpd },
                  { label: 'Critical Illness', value: p.coverageDetails?.ci },
                  { label: 'Medical Card', value: p.coverageDetails?.medicalCard },
                  { label: 'PA / DB', value: p.coverageDetails?.paDb },
                ].filter(c => c.value > 0).map((c) => (
                  <div key={c.label} className="py-1">
                    <p className="text-hig-caption1 text-hig-text-secondary">{c.label}</p>
                    <p className="text-hig-subhead font-medium">{formatRMFull(c.value)}</p>
                  </div>
                ))}
              </div>
              {p.nominee && (
                <div className="py-1 mt-1">
                  <p className="text-hig-caption1 text-hig-text-secondary">Nominee</p>
                  <p className="text-hig-subhead font-medium">{p.nominee}</p>
                </div>
              )}
              {p.notes && <p className="text-hig-caption1 text-hig-text-secondary mt-2 pt-2 border-t border-hig-gray-5">{p.notes}</p>}
              <div className="flex gap-2 mt-3">
                <button onClick={(e) => { e.stopPropagation(); openEdit(idx) }} className="hig-btn-ghost gap-1 text-hig-caption1">
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(idx) }} className="hig-btn-ghost gap-1 text-hig-caption1 text-hig-red hover:bg-red-50">
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Wizard modal */}
      {wizardState && (
        <PolicyFormWizard
          initialForm={wizardState.form}
          isEdit={wizardState.idx !== 'new'}
          onSave={handleWizardSave}
          onClose={() => setWizardState(null)}
        />
      )}
    </div>
  )
}

// dead code placeholder to avoid breaking imports during transition
function _unused({ label, value, onChange }) {
  return (
    <div>
      <label className="hig-label">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-hig-text-secondary text-hig-subhead">RM</span>
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="hig-input pl-10 tabular-nums"
          placeholder="0"
          min="0"
        />
      </div>
    </div>
  )
}
