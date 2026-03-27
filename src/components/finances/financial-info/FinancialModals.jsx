import { useState } from 'react'
import { X, Info, Upload } from 'lucide-react'
import { formatRMFull } from '../../../lib/calculations'
import NumberInput from '../../ui/NumberInput'
import { ASSET_DYNAMIC_TYPES, INVESTMENT_DEFAULT_RETURN, INVESTMENT_TYPES_CORE, INVESTMENT_TYPES_OPTIONAL, PAYMENT_MODES, INCOME_DYNAMIC_TYPES, EXPENSE_TYPES_CORE, EXPENSE_TYPES_OPTIONAL, FREQUENCIES, LIABILITY_TYPES } from './constants'
import { calcMonthlyRepayment } from './helpers'

function ModalShell({ title, onClose, onSave, saveLabel = 'Save', children }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-hig-lg shadow-hig-lg w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-hig-title3">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-hig-sm hover:bg-hig-gray-6"><X size={18} /></button>
        </div>
        <div className="space-y-4">{children}</div>
        <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-hig-gray-5">
          <button onClick={onClose} className="hig-btn-secondary">Cancel</button>
          <button onClick={onSave} className="hig-btn-primary">{saveLabel}</button>
        </div>
      </div>
    </div>
  )
}

function RMField({ label, value, onChange, placeholder = '0' }) {
  return (
    <div>
      <label className="hig-label">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-hig-text-secondary text-hig-subhead">RM</span>
        <NumberInput
          value={value}
          onChange={onChange}
          className="hig-input pl-10 tabular-nums"
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}

export function AssetModal({ row, onSave, onClose }) {
  const isNew = !row.id
  const [form, setForm] = useState({
    type: 'Property', description: '', growthRate: 5, amount: 0,
    ...row,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <ModalShell
      title={isNew ? 'Add Asset' : 'Edit Asset'}
      onClose={onClose}
      onSave={() => onSave(form)}
      saveLabel={isNew ? 'Add Asset' : 'Save Changes'}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="hig-label">Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value)} className="hig-input">
            {ASSET_DYNAMIC_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="hig-label">Description</label>
          <input value={form.description} onChange={e => set('description', e.target.value)} className="hig-input" placeholder="e.g. Taman Desa House" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="hig-label">Growth Rate (% p.a.)</label>
          <input type="number" step="0.5" min="0" value={form.growthRate} onChange={e => set('growthRate', parseFloat(e.target.value) || 0)} className="hig-input" />
        </div>
        <RMField label="Current Value (RM)" value={form.amount} onChange={v => set('amount', v)} />
      </div>
    </ModalShell>
  )
}

export function InvModal({ row, currentAge, onSave, onClose }) {
  const isNew = !row.id
  const [form, setForm] = useState({
    type: 'Exchange Traded Funds (ETF)', planName: '', paymentMode: 'Monthly',
    ageFrom: currentAge, ageTo: 99,
    growthRate: INVESTMENT_DEFAULT_RETURN['Exchange Traded Funds (ETF)'],
    currentValue: 0,
    ...row,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleTypeChange = (newType) => {
    const defaultRate = INVESTMENT_DEFAULT_RETURN[newType] ?? 5.0
    // Only auto-fill rate if this is a new entry, or if the current rate matches a known default (user hasn't customised it)
    const currentRateIsDefault = Object.values(INVESTMENT_DEFAULT_RETURN).includes(form.growthRate)
    setForm(f => ({
      ...f,
      type: newType,
      growthRate: (isNew || currentRateIsDefault) ? defaultRate : f.growthRate,
    }))
  }

  return (
    <ModalShell
      title={isNew ? 'Add Investment' : 'Edit Investment'}
      onClose={onClose}
      onSave={() => onSave(form)}
      saveLabel={isNew ? 'Add Investment' : 'Save Changes'}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="hig-label">Type</label>
          <select value={form.type} onChange={e => handleTypeChange(e.target.value)} className="hig-input">
            <optgroup label="Core">
              {INVESTMENT_TYPES_CORE.map(t => <option key={t}>{t}</option>)}
            </optgroup>
            <optgroup label="Others">
              {INVESTMENT_TYPES_OPTIONAL.map(t => <option key={t}>{t}</option>)}
            </optgroup>
          </select>
        </div>
        <div>
          <label className="hig-label">Description</label>
          <input value={form.planName || ''} onChange={e => set('planName', e.target.value)} className="hig-input" placeholder="e.g. fund name, provider" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="hig-label">Payment Mode</label>
          <select value={form.paymentMode || 'Monthly'} onChange={e => set('paymentMode', e.target.value)} className="hig-input">
            {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="hig-label">Age From</label>
          <input type="number" min={18} max={100} value={form.ageFrom ?? currentAge} onChange={e => set('ageFrom', parseInt(e.target.value) || currentAge)} className="hig-input" />
        </div>
        <div>
          <label className="hig-label">Age To</label>
          <input type="number" min={18} max={120} value={form.ageTo ?? 99} onChange={e => set('ageTo', parseInt(e.target.value) || 99)} className="hig-input" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="hig-label">Expected Return (% p.a.)</label>
          <input type="number" step="0.1" min="0" value={form.growthRate ?? 0} onChange={e => set('growthRate', parseFloat(e.target.value) || 0)} className="hig-input" />
        </div>
        <RMField label="Current Value (RM)" value={form.currentValue} onChange={v => set('currentValue', v)} />
      </div>
    </ModalShell>
  )
}

export function IncomeModal({ row, onSave, onClose }) {
  const isNew = !row.id
  const [form, setForm] = useState({
    type: 'Rental', description: '', frequency: 'Monthly', amount: 0,
    ...row,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <ModalShell
      title={isNew ? 'Add Income' : 'Edit Income'}
      onClose={onClose}
      onSave={() => onSave(form)}
      saveLabel={isNew ? 'Add Income' : 'Save Changes'}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="hig-label">Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value)} className="hig-input">
            {INCOME_DYNAMIC_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="hig-label">Description</label>
          <input value={form.description} onChange={e => set('description', e.target.value)} className="hig-input" placeholder="e.g. Taman Desa Rental" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="hig-label">Frequency</label>
          <select value={form.frequency} onChange={e => set('frequency', e.target.value)} className="hig-input">
            {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <RMField label="Amount (RM)" value={form.amount} onChange={v => set('amount', v)} />
      </div>
    </ModalShell>
  )
}

export function ExpenseModal({ row, currentAge, onSave, onClose }) {
  const isNew = !row.id
  const [form, setForm] = useState({
    type: 'All - Personal', description: '', ageFrom: currentAge, ageTo: 99, frequency: 'Monthly', amount: 0,
    inflationLinked: true,   // default: expenses rise with inflation
    ...row,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <ModalShell
      title={isNew ? 'Add Expense' : 'Edit Expense'}
      onClose={onClose}
      onSave={() => onSave(form)}
      saveLabel={isNew ? 'Add Expense' : 'Save Changes'}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="hig-label">Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value)} className="hig-input">
            <optgroup label="Default">
              {EXPENSE_TYPES_CORE.map(t => <option key={t}>{t}</option>)}
            </optgroup>
            <optgroup label="Others">
              {EXPENSE_TYPES_OPTIONAL.map(t => <option key={t}>{t}</option>)}
            </optgroup>
          </select>
        </div>
        <div>
          <label className="hig-label">Description</label>
          <input value={form.description} onChange={e => set('description', e.target.value)} className="hig-input" placeholder="e.g. Grocery, Petrol" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="hig-label">Age From</label>
          <input type="number" min={18} max={100} value={form.ageFrom ?? currentAge} onChange={e => set('ageFrom', parseInt(e.target.value) || currentAge)} className="hig-input" />
        </div>
        <div>
          <label className="hig-label">Age To</label>
          <input type="number" min={18} max={120} value={form.ageTo ?? 99} onChange={e => set('ageTo', parseInt(e.target.value) || 99)} className="hig-input" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="hig-label">Frequency</label>
          <select value={form.frequency} onChange={e => set('frequency', e.target.value)} className="hig-input">
            {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <RMField label="Amount (RM)" value={form.amount} onChange={v => set('amount', v)} />
      </div>

      {/* ── Inflation toggle ── */}
      <div
        className={`flex items-center justify-between rounded-hig-sm px-3 py-2.5 cursor-pointer select-none border transition-colors
          ${form.inflationLinked
            ? 'bg-orange-50 border-orange-200'
            : 'bg-hig-gray-6 border-hig-gray-5'
          }`}
        onClick={() => set('inflationLinked', !form.inflationLinked)}
      >
        <div>
          <p className={`text-hig-caption1 font-semibold ${form.inflationLinked ? 'text-orange-700' : 'text-hig-text-secondary'}`}>
            {form.inflationLinked ? 'Inflation-linked' : 'Fixed nominal (no inflation)'}
          </p>
          <p className="text-hig-caption2 text-hig-text-secondary mt-0.5">
            {form.inflationLinked
              ? 'Amount grows each year with the inflation rate.'
              : 'Amount stays fixed — suitable for loan repayments, fixed contracts.'}
          </p>
        </div>
        <div className={`w-11 h-6 rounded-full transition-colors duration-200 relative ml-3 shrink-0
          ${form.inflationLinked ? 'bg-orange-400' : 'bg-hig-gray-3'}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200
            ${form.inflationLinked ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
        </div>
      </div>
    </ModalShell>
  )
}

export function LiabilityModal({ initial, currentAge, onSave, onClose }) {
  const [form, setForm] = useState({ ...initial })
  const monthly = calcMonthlyRepayment(form.principal, form.interestRate, form.loanPeriod)
  const set = (key) => (e) => {
    const val = (key === 'type' || key === 'description') ? e.target.value : (parseFloat(e.target.value) || 0)
    setForm(f => ({ ...f, [key]: val }))
  }
  return (
    <ModalShell
      title={form.id ? 'Edit Liability' : 'New Liability'}
      onClose={onClose}
      onSave={() => onSave(form)}
      saveLabel={form.id ? 'Save Changes' : 'Add Liability'}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="hig-label">Type</label>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="hig-input">
            {LIABILITY_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="hig-label">Description</label>
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="hig-input" placeholder="e.g. Maybank Home Loan" />
        </div>
      </div>
      <div>
        <label className="hig-label">Outstanding Principal (RM)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-hig-text-secondary text-hig-subhead">RM</span>
          <NumberInput
            value={form.principal}
            onChange={(num) => setForm(f => ({ ...f, principal: num }))}
            className="hig-input pl-10"
            placeholder="0"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="hig-label">Start Age</label>
          <input type="number" min={18} max={90} value={form.startAge || currentAge} onChange={set('startAge')} className="hig-input" />
        </div>
        <div>
          <label className="hig-label">Interest (% p.a.)</label>
          <input type="number" step="0.1" min="0" max="30" value={form.interestRate || 0} onChange={set('interestRate')} className="hig-input" />
        </div>
        <div>
          <label className="hig-label">Period (months)</label>
          <input type="number" min="1" max="600" step="12" value={form.loanPeriod || 360} onChange={set('loanPeriod')} className="hig-input" />
        </div>
      </div>
      {Number(form.principal) > 0 && (
        <div className="bg-hig-red/5 border border-hig-red/20 rounded-hig-sm p-3">
          <p className="text-hig-caption1 text-hig-red font-medium">
            Est. Monthly Repayment: {formatRMFull(monthly)}
          </p>
          <p className="text-hig-caption2 text-hig-text-secondary mt-0.5">
            This will be reflected in Cash Flow analysis.
          </p>
        </div>
      )}
    </ModalShell>
  )
}



export function QuickImportModal({ data, onSave, onClose }) {
  const [form, setForm] = useState({
    grossIncome:   (data.income || []).find(r => r.id === 'gross-income')?.amount || 0,
    bonus:         (data.income || []).find(r => r.id === 'bonus')?.amount || 0,
    savingsCash:   (data.assets || []).find(r => r.id === 'savings-cash')?.amount || 0,
    epfAll:        (data.assets || []).find(r => r.id === 'epf-all')?.amount || 0,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    const updatedIncome = (data.income || []).map(r => {
      if (r.id === 'gross-income') return { ...r, amount: Number(form.grossIncome) || 0 }
      if (r.id === 'bonus')        return { ...r, amount: Number(form.bonus)       || 0 }
      return r
    })
    const updatedAssets = (data.assets || []).map(r => {
      if (r.id === 'savings-cash') return { ...r, amount: Number(form.savingsCash) || 0 }
      if (r.id === 'epf-all')      return { ...r, amount: Number(form.epfAll)      || 0 }
      return r
    })
    onSave({ ...data, income: updatedIncome, assets: updatedAssets })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-hig-lg shadow-hig-lg w-full max-w-xl p-6 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-hig-title3">Import Financial Data</h2>
          <button onClick={onClose} className="p-2 rounded-hig-sm hover:bg-hig-gray-6"><X size={18} /></button>
        </div>

        {/* Income */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-hig-caption2 font-semibold text-hig-text-secondary uppercase tracking-wide">Employment Income</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <RMField label="Gross Monthly Income" value={form.grossIncome} onChange={v => set('grossIncome', v)} />
            <RMField label="Annual Bonus" value={form.bonus} onChange={v => set('bonus', v)} />
          </div>
          {Number(form.grossIncome) > 0 && (
            <p className="text-hig-caption1 text-hig-text-secondary mt-2 flex items-start gap-1.5">
              <Info size={12} className="mt-0.5 shrink-0 text-hig-blue" />
              EPF: Employee {formatRMFull(Number(form.grossIncome) * 0.11)}/mth (11%) ·
              Employer {Number(form.grossIncome) > 5000 ? '12%' : '13%'}
            </p>
          )}
        </div>

        {/* Assets */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-hig-caption2 font-semibold text-hig-text-secondary uppercase tracking-wide">Savings & EPF Balances</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <RMField label="Savings / Cash"       value={form.savingsCash} onChange={v => set('savingsCash', v)} />
            <RMField label="EPF (All Accounts)"   value={form.epfAll}      onChange={v => set('epfAll', v)} />
          </div>
        </div>

        <p className="text-hig-caption1 text-hig-text-secondary mb-5 flex items-start gap-1.5">
          <Info size={12} className="mt-0.5 shrink-0" />
          Investments, liabilities, and additional income / expense items can be added in the respective tabs.
        </p>

        <div className="flex justify-end gap-3 pt-4 border-t border-hig-gray-5">
          <button onClick={onClose} className="hig-btn-secondary">Cancel</button>
          <button onClick={handleSave} className="hig-btn-primary gap-1.5">
            <Upload size={14} /> Save Financial Data
          </button>
        </div>
      </div>
    </div>
  )
}


