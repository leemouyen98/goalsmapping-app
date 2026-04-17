/**
 * PolicyFormWizard — 4-step add / edit policy modal
 *
 * Step 1 · Insurer & Type    (visual grid selection)
 * Step 2 · Policy Details    (number, plan name, dates, status)
 * Step 3 · Premiums          (sum assured + annual/monthly with auto-sync)
 * Step 4 · Coverage & More   (death/tpd/ci/medical/pa + nominee + notes)
 */

import { useState, useRef, useEffect } from 'react'
import {
  X, Check, ChevronRight, ChevronLeft,
  Shield, Clock, PiggyBank, Activity, Zap, AlertTriangle,
  TrendingUp, Heart, ArrowLeftRight, UserCheck, FileText,
  CreditCard, Calendar, ToggleLeft, ToggleRight,
} from 'lucide-react'

// ─── Data ────────────────────────────────────────────────────────────────────

const COMPANIES = [
  { name: 'Tokio Marine', abbr: 'TM',  color: '#E30613' },
  { name: 'AIA',          abbr: 'AIA', color: '#D31245' },
  { name: 'Prudential',   abbr: 'PRU', color: '#C0392B' },
  { name: 'Great Eastern',abbr: 'GE',  color: '#007A3D' },
  { name: 'Manulife',     abbr: 'MFC', color: '#00A758' },
  { name: 'Allianz',      abbr: 'ALZ', color: '#003781' },
  { name: 'Zurich',       abbr: 'ZUR', color: '#1AB5E8' },
  { name: 'AXA Affin',    abbr: 'AXA', color: '#00008F' },
  { name: 'Sun Life',     abbr: 'SL',  color: '#D4820A' },
  { name: 'Other',        abbr: '•••', color: '#8E8E93' },
]

const TYPES = [
  { name: 'Whole Life',        icon: Shield,       color: '#040E1C' },
  { name: 'Term',              icon: Clock,        color: '#2E96FF' },
  { name: 'Endowment',         icon: PiggyBank,    color: '#34C759' },
  { name: 'Medical & Health',  icon: Activity,     color: '#FF3B30' },
  { name: 'Critical Illness',  icon: Zap,          color: '#FF9500' },
  { name: 'Personal Accident', icon: AlertTriangle, color: '#AF52DE' },
  { name: 'Investment-Linked', icon: TrendingUp,   color: '#30B0C7' },
  { name: 'Life',              icon: Heart,        color: '#FF2D55' },
]

const STATUSES = [
  { value: 'Active',      color: '#34C759' },
  { value: 'Lapsed',      color: '#FF3B30' },
  { value: 'Matured',     color: '#2E96FF' },
  { value: 'Surrendered', color: '#FF9500' },
]

const STEPS = [
  { n: 1, label: 'Insurer & Type' },
  { n: 2, label: 'Policy Details' },
  { n: 3, label: 'Premiums'       },
  { n: 4, label: 'Protection'     },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtRM(val) {
  if (!val) return ''
  const n = Number(val)
  if (!n) return ''
  return n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function rmVal(str) {
  const n = parseFloat(String(str).replace(/,/g, ''))
  return isNaN(n) ? 0 : n
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Top progress stepper */
function Stepper({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px', marginBottom: 24 }}>
      {STEPS.map((s, i) => {
        const done   = current > s.n
        const active = current === s.n
        return (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            {/* Circle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? '#34C759' : active ? '#2E96FF' : '#E5E5EA',
                transition: 'background 0.25s',
                flexShrink: 0,
              }}>
                {done
                  ? <Check size={13} color="#fff" strokeWidth={2.5} />
                  : <span style={{ fontSize: 11, fontWeight: 700, color: active ? '#fff' : '#AEAEB2' }}>{s.n}</span>
                }
              </div>
              <span style={{
                fontSize: 10, fontWeight: active ? 600 : 400,
                color: active ? '#2E96FF' : done ? '#34C759' : '#AEAEB2',
                whiteSpace: 'nowrap', letterSpacing: '-0.1px',
              }}>
                {s.label}
              </span>
            </div>
            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, marginTop: -16,
                background: done ? '#34C759' : '#E5E5EA',
                transition: 'background 0.25s',
                marginLeft: 6, marginRight: 6,
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Compact context chip shown at top of steps 2-4 */
function ContextChip({ form }) {
  const co = COMPANIES.find(c => c.name === form.company)
  const ty = TYPES.find(t => t.name === form.type)
  if (!co && !ty) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: '#F2F2F7', borderRadius: 20,
      padding: '5px 12px', marginBottom: 20, alignSelf: 'flex-start',
    }}>
      {co && (
        <span style={{
          width: 18, height: 18, borderRadius: '50%',
          background: co.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>{co.abbr.slice(0,2)}</span>
      )}
      {co && <span style={{ fontSize: 12, fontWeight: 600, color: '#1C1C1E' }}>{co.name}</span>}
      {co && ty && <span style={{ fontSize: 11, color: '#AEAEB2' }}>·</span>}
      {ty && (
        <>
          <ty.icon size={12} color={ty.color} />
          <span style={{ fontSize: 12, color: '#636366' }}>{ty.name}</span>
        </>
      )}
    </div>
  )
}

/** RM big input */
function RMField({ label, value, onChange, hint, autoFocus }) {
  const inputRef = useRef()
  useEffect(() => { if (autoFocus && inputRef.current) inputRef.current.focus() }, [autoFocus])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          fontSize: 15, fontWeight: 600, color: '#8E8E93',
        }}>RM</span>
        <input
          ref={inputRef}
          type="number"
          min="0"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            paddingLeft: 46, paddingRight: 14,
            paddingTop: 12, paddingBottom: 12,
            fontSize: 20, fontWeight: 700, color: '#1C1C1E',
            background: '#F8F8FA', border: '1.5px solid #E5E5EA',
            borderRadius: 10, outline: 'none',
            fontVariantNumeric: 'tabular-nums',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => {
            e.target.style.borderColor = '#2E96FF'
            e.target.style.boxShadow = '0 0 0 3px rgba(46,150,255,0.15)'
          }}
          onBlur={e => {
            e.target.style.borderColor = '#E5E5EA'
            e.target.style.boxShadow = 'none'
          }}
          placeholder="0"
        />
      </div>
      {hint && <p style={{ fontSize: 11, color: '#AEAEB2', marginTop: 2 }}>{hint}</p>}
    </div>
  )
}

/** Coverage card with icon */
function CoverageCard({ icon: Icon, label, sublabel, color, value, onChange }) {
  return (
    <div style={{
      background: '#F8F8FA', border: '1.5px solid #E5E5EA',
      borderRadius: 12, padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: color + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={14} color={color} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1E', lineHeight: 1.2 }}>{label}</p>
          {sublabel && <p style={{ fontSize: 10, color: '#AEAEB2' }}>{sublabel}</p>}
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
          fontSize: 12, fontWeight: 600, color: '#8E8E93',
        }}>RM</span>
        <input
          type="number"
          min="0"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            paddingLeft: 34, paddingRight: 10,
            paddingTop: 9, paddingBottom: 9,
            fontSize: 14, fontWeight: 600, color: '#1C1C1E',
            background: '#fff', border: '1.5px solid #E5E5EA',
            borderRadius: 8, outline: 'none',
            fontVariantNumeric: 'tabular-nums',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => {
            e.target.style.borderColor = color
            e.target.style.boxShadow = `0 0 0 3px ${color}20`
          }}
          onBlur={e => {
            e.target.style.borderColor = '#E5E5EA'
            e.target.style.boxShadow = 'none'
          }}
          placeholder="0"
        />
      </div>
    </div>
  )
}

// ─── Step screens ─────────────────────────────────────────────────────────────

function Step1({ form, update }) {
  return (
    <div>
      {/* Company */}
      <p style={{ fontSize: 13, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
        Insurance Company
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 24 }}>
        {COMPANIES.map(co => {
          const sel = form.company === co.name
          return (
            <button
              key={co.name}
              type="button"
              onClick={() => update('company', co.name)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '10px 4px',
                background: sel ? co.color + '12' : '#F8F8FA',
                border: sel ? `2px solid ${co.color}` : '2px solid transparent',
                borderRadius: 12, cursor: 'pointer',
                transition: 'all 0.15s',
                position: 'relative',
              }}
            >
              {/* Checkmark badge */}
              {sel && (
                <div style={{
                  position: 'absolute', top: -5, right: -5,
                  width: 16, height: 16, borderRadius: '50%',
                  background: co.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={9} color="#fff" strokeWidth={3} />
                </div>
              )}
              {/* Avatar */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: sel ? co.color : co.color + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: sel ? '#fff' : co.color, letterSpacing: '-0.5px' }}>
                  {co.abbr}
                </span>
              </div>
              <span style={{ fontSize: 9, fontWeight: sel ? 600 : 400, color: sel ? co.color : '#636366', textAlign: 'center', lineHeight: 1.3 }}>
                {co.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Policy Type */}
      <p style={{ fontSize: 13, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
        Policy Type
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {TYPES.map(ty => {
          const sel = form.type === ty.name
          const Icon = ty.icon
          return (
            <button
              key={ty.name}
              type="button"
              onClick={() => update('type', ty.name)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                padding: '14px 8px',
                background: sel ? ty.color + '14' : '#F8F8FA',
                border: sel ? `2px solid ${ty.color}` : '2px solid transparent',
                borderRadius: 12, cursor: 'pointer',
                transition: 'all 0.15s',
                position: 'relative',
              }}
            >
              {sel && (
                <div style={{
                  position: 'absolute', top: -5, right: -5,
                  width: 16, height: 16, borderRadius: '50%',
                  background: ty.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={9} color="#fff" strokeWidth={3} />
                </div>
              )}
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: sel ? ty.color : ty.color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}>
                <Icon size={16} color={sel ? '#fff' : ty.color} />
              </div>
              <span style={{ fontSize: 10, fontWeight: sel ? 600 : 400, color: sel ? ty.color : '#636366', textAlign: 'center', lineHeight: 1.3 }}>
                {ty.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Step2({ form, update }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <ContextChip form={form} />

      {/* Plan name + Policy no */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Plan Name" icon={FileText}>
          <input
            type="text"
            value={form.planName}
            onChange={e => update('planName', e.target.value)}
            className="hig-input"
            placeholder="e.g. TM Shield Plus"
            autoFocus
          />
        </Field>
        <Field label="Policy Number" icon={CreditCard}>
          <input
            type="text"
            value={form.policyNo}
            onChange={e => update('policyNo', e.target.value)}
            className="hig-input"
            placeholder="e.g. TML-123456"
          />
        </Field>
      </div>

      {/* Dates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Policy Start Date" icon={Calendar}>
          <input
            type="date"
            value={form.commencementDate}
            onChange={e => update('commencementDate', e.target.value)}
            className="hig-input"
          />
        </Field>
        <Field label="Maturity Date" icon={Calendar}>
          <input
            type="date"
            value={form.maturityDate}
            onChange={e => update('maturityDate', e.target.value)}
            className="hig-input"
          />
        </Field>
      </div>

      {/* Status — segmented control */}
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
          Policy Status
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {STATUSES.map(st => {
            const sel = form.status === st.value
            return (
              <button
                key={st.value}
                type="button"
                onClick={() => update('status', st.value)}
                style={{
                  flex: 1, padding: '9px 4px', borderRadius: 10,
                  border: sel ? `2px solid ${st.color}` : '2px solid #E5E5EA',
                  background: sel ? st.color + '12' : '#F8F8FA',
                  fontSize: 12, fontWeight: sel ? 700 : 400,
                  color: sel ? st.color : '#636366',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {sel && <span style={{ marginRight: 4 }}>✓</span>}
                {st.value}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Step3({ form, update }) {
  // Auto-sync annual ↔ monthly
  const handleAnnual = (val) => {
    update('annualPremium', val)
    const monthly = rmVal(val) / 12
    update('monthlyPremium', monthly > 0 ? parseFloat(monthly.toFixed(2)) : 0)
  }
  const handleMonthly = (val) => {
    update('monthlyPremium', val)
    const annual = rmVal(val) * 12
    update('annualPremium', annual > 0 ? parseFloat(annual.toFixed(2)) : 0)
  }

  const annual  = Number(form.annualPremium)  || 0
  const monthly = Number(form.monthlyPremium) || 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <ContextChip form={form} />

      {/* Sum Assured */}
      <RMField
        label="Sum Assured"
        value={form.sumAssured}
        onChange={v => update('sumAssured', v)}
        hint="Total coverage amount (death benefit)"
        autoFocus
      />

      {/* Premium sync block */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10, display: 'block' }}>
          Premium
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
          {/* Annual */}
          <div style={{ background: '#F8F8FA', border: '1.5px solid #E5E5EA', borderRadius: 12, padding: '12px 14px' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Annual</p>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 600, color: '#8E8E93' }}>RM</span>
              <input
                type="number"
                min="0"
                value={form.annualPremium || ''}
                onChange={e => handleAnnual(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  paddingLeft: 28, paddingRight: 0,
                  paddingTop: 4, paddingBottom: 4,
                  fontSize: 18, fontWeight: 700, color: '#1C1C1E',
                  background: 'transparent', border: 'none', outline: 'none',
                  fontVariantNumeric: 'tabular-nums',
                }}
                placeholder="0"
              />
            </div>
            {annual > 0 && (
              <p style={{ fontSize: 10, color: '#AEAEB2', marginTop: 4 }}>
                RM {fmtRM(annual)} / year
              </p>
            )}
          </div>

          {/* Sync icon */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <ArrowLeftRight size={16} color="#AEAEB2" />
            <span style={{ fontSize: 9, color: '#AEAEB2' }}>÷ 12</span>
          </div>

          {/* Monthly */}
          <div style={{ background: '#F8F8FA', border: '1.5px solid #E5E5EA', borderRadius: 12, padding: '12px 14px' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Monthly</p>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 600, color: '#8E8E93' }}>RM</span>
              <input
                type="number"
                min="0"
                value={form.monthlyPremium || ''}
                onChange={e => handleMonthly(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  paddingLeft: 28, paddingRight: 0,
                  paddingTop: 4, paddingBottom: 4,
                  fontSize: 18, fontWeight: 700, color: '#1C1C1E',
                  background: 'transparent', border: 'none', outline: 'none',
                  fontVariantNumeric: 'tabular-nums',
                }}
                placeholder="0"
              />
            </div>
            {monthly > 0 && (
              <p style={{ fontSize: 10, color: '#AEAEB2', marginTop: 4 }}>
                RM {fmtRM(monthly)} / month
              </p>
            )}
          </div>
        </div>
        <p style={{ fontSize: 11, color: '#AEAEB2', marginTop: 8, textAlign: 'center' }}>
          Editing either field auto-updates the other
        </p>
      </div>

      {/* Premium Waiver toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#F8F8FA', borderRadius: 12, padding: '14px 16px',
        border: form.hasPremiumWaiver ? '1.5px solid #2E96FF' : '1.5px solid transparent',
        transition: 'border-color 0.2s',
        cursor: 'pointer',
      }}
        onClick={() => update('hasPremiumWaiver', !form.hasPremiumWaiver)}
      >
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1E' }}>Premium Waiver <span style={{ fontSize: 12, color: '#8E8E93', fontWeight: 400 }}>免缴保费</span></p>
          <p style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>Premium waived on total disability or critical illness</p>
        </div>
        {form.hasPremiumWaiver
          ? <ToggleRight size={28} color="#2E96FF" />
          : <ToggleLeft size={28} color="#AEAEB2" />
        }
      </div>
    </div>
  )
}

function Step4({ form, update, updateCoverage }) {
  const coverageFields = [
    { key: 'death',      icon: Shield,        label: 'Death',           sublabel: 'Life coverage',         color: '#040E1C' },
    { key: 'tpd',        icon: AlertTriangle, label: 'TPD',             sublabel: 'Total Permanent Disab.', color: '#FF9500' },
    { key: 'ci',         icon: Zap,           label: 'Critical Illness', sublabel: '36–100+ conditions',    color: '#FF3B30' },
    { key: 'medicalCard',icon: Activity,      label: 'Medical Card',    sublabel: 'Hospitalisation',        color: '#2E96FF' },
    { key: 'paDb',       icon: UserCheck,     label: 'PA / DB',         sublabel: 'Personal Accident',      color: '#AF52DE' },
  ]

  const totalCoverage = coverageFields.reduce((s, f) => s + (Number(form.coverageDetails?.[f.key]) || 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <ContextChip form={form} />

      {/* Coverage breakdown */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Coverage Breakdown
          </label>
          {totalCoverage > 0 && (
            <span style={{ fontSize: 11, color: '#2E96FF', fontWeight: 600 }}>
              Total: RM {totalCoverage.toLocaleString('en-MY')}
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {coverageFields.map(f => (
            <CoverageCard
              key={f.key}
              icon={f.icon}
              label={f.label}
              sublabel={f.sublabel}
              color={f.color}
              value={form.coverageDetails?.[f.key]}
              onChange={v => updateCoverage(f.key, v)}
            />
          ))}
        </div>
      </div>

      {/* Nominee */}
      <Field label="Nominee 受益人" icon={UserCheck}>
        <input
          type="text"
          value={form.nominee}
          onChange={e => update('nominee', e.target.value)}
          className="hig-input"
          placeholder="e.g. Spouse, Children"
        />
      </Field>

      {/* Notes */}
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>
          Notes
        </label>
        <textarea
          value={form.notes}
          onChange={e => update('notes', e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '10px 14px', borderRadius: 10,
            border: '1.5px solid #E5E5EA', background: '#F8F8FA',
            fontSize: 14, color: '#1C1C1E', resize: 'vertical',
            minHeight: 72, outline: 'none', lineHeight: 1.5,
            transition: 'border-color 0.2s',
            fontFamily: 'inherit',
          }}
          onFocus={e => { e.target.style.borderColor = '#2E96FF'; e.target.style.background = '#fff' }}
          onBlur={e => { e.target.style.borderColor = '#E5E5EA'; e.target.style.background = '#F8F8FA' }}
          placeholder="Rider details, exclusions, special terms…"
        />
      </div>
    </div>
  )
}

/** Reusable labelled field wrapper */
function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>
        {Icon && <Icon size={11} />}
        {label}
      </label>
      {children}
    </div>
  )
}

// ─── Review mini-summary (shown in footer of step 4) ─────────────────────────

function ReviewSummary({ form }) {
  const annual  = Number(form.annualPremium) || 0
  const assured = Number(form.sumAssured)    || 0
  if (!form.company && !annual && !assured) return null
  return (
    <div style={{
      display: 'flex', gap: 16, padding: '10px 14px',
      background: '#F2F2F7', borderRadius: 10, marginBottom: 14,
      flexWrap: 'wrap',
    }}>
      {form.company && (
        <div>
          <p style={{ fontSize: 10, color: '#AEAEB2', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1E', marginTop: 2 }}>{form.company}</p>
        </div>
      )}
      {form.type && (
        <div>
          <p style={{ fontSize: 10, color: '#AEAEB2', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1E', marginTop: 2 }}>{form.type}</p>
        </div>
      )}
      {assured > 0 && (
        <div>
          <p style={{ fontSize: 10, color: '#AEAEB2', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sum Assured</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1E', marginTop: 2 }}>RM {assured.toLocaleString('en-MY')}</p>
        </div>
      )}
      {annual > 0 && (
        <div>
          <p style={{ fontSize: 10, color: '#AEAEB2', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Annual Prem.</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#2E96FF', marginTop: 2 }}>RM {annual.toLocaleString('en-MY')}</p>
        </div>
      )}
    </div>
  )
}

// ─── Step 1 validation ────────────────────────────────────────────────────────

function stepValid(step, form) {
  if (step === 1) return !!(form.company && form.type)
  return true // steps 2-4 are all optional — save anytime
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────

export default function PolicyFormWizard({ initialForm, onSave, onClose, isEdit }) {
  const [step, setStep]   = useState(1)
  const [dir, setDir]     = useState(1)   // 1 = forward, -1 = backward
  const [form, setForm]   = useState(initialForm)
  const [animKey, setAnimKey] = useState(0)

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const updateCoverage = (key, value) => setForm(prev => ({
    ...prev,
    coverageDetails: { ...prev.coverageDetails, [key]: value },
  }))

  const go = (target) => {
    setDir(target > step ? 1 : -1)
    setAnimKey(k => k + 1)
    setStep(target)
  }

  const handleSave = () => {
    const coerced = {
      ...form,
      sumAssured:    Number(form.sumAssured)    || 0,
      annualPremium: Number(form.annualPremium) || 0,
      monthlyPremium:Number(form.monthlyPremium)|| 0,
      hasPremiumWaiver: !!form.hasPremiumWaiver,
      nominee: form.nominee || '',
      coverageDetails: {
        death:      Number(form.coverageDetails?.death)      || 0,
        tpd:        Number(form.coverageDetails?.tpd)        || 0,
        ci:         Number(form.coverageDetails?.ci)         || 0,
        medicalCard:Number(form.coverageDetails?.medicalCard)|| 0,
        paDb:       Number(form.coverageDetails?.paDb)       || 0,
      },
    }
    onSave(coerced)
  }

  const isLastStep = step === 4
  const canAdvance = stepValid(step, form)

  // Determine button label
  const nextLabel = isLastStep
    ? (isEdit ? 'Save Changes' : 'Add Policy')
    : 'Continue'

  // Slide animation direction
  const slideClass = dir > 0 ? 'wiz-slide-right' : 'wiz-slide-left'

  return (
    <>
      {/* Keyframe styles injected once */}
      <style>{`
        @keyframes wizSlideRight {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes wizSlideLeft {
          from { opacity: 0; transform: translateX(-28px); }
          to   { opacity: 1; transform: translateX(0);     }
        }
        .wiz-slide-right { animation: wizSlideRight 0.22s cubic-bezier(0.25,0.46,0.45,0.94) both; }
        .wiz-slide-left  { animation: wizSlideLeft  0.22s cubic-bezier(0.25,0.46,0.45,0.94) both; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}
      >
        {/* Modal card */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fff',
            borderRadius: 20,
            width: '100%',
            maxWidth: 560,
            maxHeight: '88vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 24px 60px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}
        >
          {/* ── Modal header ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 24px 0',
            flexShrink: 0,
          }}>
            <div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#1C1C1E' }}>
                {isEdit ? 'Edit Policy' : 'Add Policy'}
              </p>
              <p style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>
                Step {step} of 4 · {STEPS[step - 1].label}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#F2F2F7', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#E5E5EA'}
              onMouseLeave={e => e.currentTarget.style.background = '#F2F2F7'}
            >
              <X size={16} color="#636366" />
            </button>
          </div>

          {/* ── Stepper ── */}
          <div style={{ padding: '16px 24px 0', flexShrink: 0 }}>
            <Stepper current={step} />
          </div>

          {/* ── Scrollable content ── */}
          <div
            style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 0' }}
          >
            <div key={animKey} className={slideClass}>
              {step === 1 && <Step1 form={form} update={update} />}
              {step === 2 && <Step2 form={form} update={update} />}
              {step === 3 && <Step3 form={form} update={update} />}
              {step === 4 && <Step4 form={form} update={update} updateCoverage={updateCoverage} />}
            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{ padding: '16px 24px 20px', flexShrink: 0, borderTop: '1px solid #F2F2F7' }}>
            {step === 4 && <ReviewSummary form={form} />}

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {/* Back */}
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => go(step - 1)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 18px', borderRadius: 10,
                    border: '1.5px solid #E5E5EA', background: '#fff',
                    fontSize: 14, fontWeight: 600, color: '#636366',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8F8FA'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '10px 18px', borderRadius: 10,
                    border: '1.5px solid #E5E5EA', background: '#fff',
                    fontSize: 14, fontWeight: 600, color: '#636366',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8F8FA'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  Cancel
                </button>
              )}

              {/* Spacer */}
              <div style={{ flex: 1 }} />

              {/* Step dots — clickable quick navigation */}
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                {STEPS.map(s => (
                  <button
                    key={s.n}
                    type="button"
                    onClick={() => { if (s.n < step || (s.n === step + 1 && canAdvance)) go(s.n) }}
                    style={{
                      width: s.n === step ? 20 : 6,
                      height: 6, borderRadius: 3,
                      background: s.n === step ? '#2E96FF' : s.n < step ? '#34C759' : '#E5E5EA',
                      border: 'none', cursor: s.n <= step ? 'pointer' : 'default',
                      transition: 'all 0.2s', padding: 0,
                    }}
                  />
                ))}
              </div>

              <div style={{ flex: 1 }} />

              {/* Next / Save */}
              <button
                type="button"
                onClick={() => isLastStep ? handleSave() : go(step + 1)}
                disabled={!canAdvance}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 20px', borderRadius: 10,
                  background: canAdvance ? '#2E96FF' : '#E5E5EA',
                  border: 'none',
                  fontSize: 14, fontWeight: 600,
                  color: canAdvance ? '#fff' : '#AEAEB2',
                  cursor: canAdvance ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (canAdvance) e.currentTarget.style.background = '#1A7FE8' }}
                onMouseLeave={e => { if (canAdvance) e.currentTarget.style.background = '#2E96FF' }}
              >
                {isLastStep ? <Check size={16} /> : null}
                {nextLabel}
                {!isLastStep && <ChevronRight size={16} />}
              </button>
            </div>

            {/* Step 1 hint */}
            {step === 1 && !canAdvance && (
              <p style={{ textAlign: 'center', fontSize: 11, color: '#AEAEB2', marginTop: 10 }}>
                Select a company and policy type to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
