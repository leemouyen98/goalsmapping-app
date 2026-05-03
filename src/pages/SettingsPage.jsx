import { useState } from 'react'
import { User, Lock, Shield, AlertCircle, Eye, EyeOff, Phone, Mail } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { useLanguage } from '../hooks/useLanguage'

// ─── Section card ──────────────────────────────────────────────────────────────
function SectionCard({ icon: Icon, iconColor, iconBg, title, children }) {
  return (
    <div className="hig-card p-6 mb-4">
      <div className="flex items-center gap-3 mb-5">
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: iconBg, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} style={{ color: iconColor }} />
        </div>
        <h2 className="text-hig-headline font-semibold text-hig-text">{title}</h2>
      </div>
      {children}
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { agent, token, updateAgentProfile } = useAuth()
  const { addToast } = useToast()
  const { t } = useLanguage()

  // ── Password state ──────────────────────────────────────────────────────────
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')

  // ── Contact info state ──────────────────────────────────────────────────────
  const [contactInfo, setContactInfo] = useState({
    email:  agent?.email  || '',
    mobile: agent?.mobile || '',
  })
  const [contactLoading, setContactLoading] = useState(false)
  const [contactError, setContactError]   = useState('')

  const toggleShowPw = (field) => setShowPw((s) => ({ ...s, [field]: !s[field] }))

  // ── Password change ─────────────────────────────────────────────────────────
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwError('')

    if (pw.next !== pw.confirm) {
      setPwError(t('settings.errMismatch'))
      return
    }
    if (pw.next.length < 6) {
      setPwError(t('settings.errTooShort'))
      return
    }
    if (pw.next === pw.current) {
      setPwError(t('settings.errSamePassword'))
      return
    }

    setPwLoading(true)
    try {
      const res = await fetch('/api/agent/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPwError(data.error || 'Failed to update password.')
      } else {
        setPw({ current: '', next: '', confirm: '' })
        addToast(t('settings.pwSuccess'), 'success')
      }
    } catch {
      setPwError(t('settings.errNetwork'))
    } finally {
      setPwLoading(false)
    }
  }

  // ── Contact info save ───────────────────────────────────────────────────────
  const handleContactSave = async (e) => {
    e.preventDefault()
    setContactError('')
    setContactLoading(true)
    try {
      const res = await fetch('/api/agent/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: contactInfo.email, mobile: contactInfo.mobile }),
      })
      const data = await res.json()
      if (!res.ok) {
        setContactError(data.error || t('settings.errContactNetwork'))
      } else {
        updateAgentProfile({ email: data.email, mobile: data.mobile })
        addToast(t('settings.contactInfoSaved'), 'success')
      }
    } catch {
      setContactError(t('settings.errContactNetwork'))
    } finally {
      setContactLoading(false)
    }
  }

  // Initials avatar
  const initials = agent?.name
    ? agent.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  return (
    <div className="max-w-[680px] mx-auto">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-[26px] font-bold text-hig-text leading-tight">{t('settings.title')}</h1>
        <p className="text-hig-subhead text-hig-text-secondary mt-1">{t('settings.subtitle')}</p>
      </div>

      {/* ── Profile ───────────────────────────────────────────────────────────── */}
      <SectionCard
        icon={User}
        iconColor="#2E96FF"
        iconBg="rgba(46,150,255,0.1)"
        title={t('settings.profile')}
      >
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-hig-blue/10 flex items-center justify-center
                          text-hig-title3 font-bold text-hig-blue shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-hig-callout font-semibold text-hig-text">{agent?.name || '—'}</p>
            <p className="text-hig-footnote text-hig-text-secondary mt-0.5">Agent Code: {agent?.code || '—'}</p>
          </div>
        </div>

        {/* Read-only fields */}
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="hig-label">{t('settings.agentCode')}</label>
            <input
              value={agent?.code || '—'}
              readOnly
              className="hig-input bg-hig-gray-5 text-hig-text-secondary cursor-default"
            />
          </div>
          <div>
            <label className="hig-label">{t('settings.fullName')}</label>
            <input
              value={agent?.name || '—'}
              readOnly
              className="hig-input bg-hig-gray-5 text-hig-text-secondary cursor-default"
            />
          </div>
        </div>
        <p className="text-hig-caption1 text-hig-gray-3 mt-2.5">
          {t('settings.adminNote')}
        </p>
      </SectionCard>

      {/* ── Contact Info ──────────────────────────────────────────────────────── */}
      <SectionCard
        icon={Phone}
        iconColor="#FF9500"
        iconBg="rgba(255,149,0,0.1)"
        title={t('settings.contactInfoTitle')}
      >
        <p className="text-hig-footnote text-hig-text-secondary mb-4 leading-relaxed">
          {t('settings.contactInfoDesc')}
        </p>
        <form onSubmit={handleContactSave} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="hig-label">{t('settings.mobileNumber')}</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-hig-text-secondary">
                  <Phone size={14} />
                </div>
                <input
                  type="tel"
                  value={contactInfo.mobile}
                  onChange={e => setContactInfo(f => ({ ...f, mobile: e.target.value }))}
                  className="hig-input pl-9"
                  placeholder="e.g. 012-3456789"
                />
              </div>
            </div>
            <div>
              <label className="hig-label">{t('settings.emailAddress')}</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-hig-text-secondary">
                  <Mail size={14} />
                </div>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={e => setContactInfo(f => ({ ...f, email: e.target.value }))}
                  className="hig-input pl-9"
                  placeholder="e.g. henry@llhgroup.com"
                />
              </div>
            </div>
          </div>

          {contactError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-hig-sm px-3.5 py-2.5">
              <AlertCircle size={14} className="text-hig-red shrink-0" />
              <p className="text-hig-footnote text-hig-red">{contactError}</p>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="hig-btn-primary"
              disabled={contactLoading}
              style={{ opacity: contactLoading ? 0.65 : 1, minWidth: 140 }}
            >
              {contactLoading ? t('settings.saving') : t('settings.saveContactInfo')}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* ── Security ──────────────────────────────────────────────────────────── */}
      <SectionCard
        icon={Lock}
        iconColor="#34C759"
        iconBg="rgba(52,199,89,0.1)"
        title={t('settings.changePassword')}
      >
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-3.5">
          <div>
            <label className="hig-label">{t('settings.currentPassword')}</label>
            <div className="relative">
              <input
                type={showPw.current ? 'text' : 'password'}
                value={pw.current}
                onChange={e => setPw(f => ({ ...f, current: e.target.value }))}
                className="hig-input pr-10"
                placeholder={t('settings.phCurrentPw')}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => toggleShowPw('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-hig-text-secondary hover:text-hig-text transition-colors"
                tabIndex={-1}
              >
                {showPw.current ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="hig-label">{t('settings.newPassword')}</label>
              <div className="relative">
                <input
                  type={showPw.next ? 'text' : 'password'}
                  value={pw.next}
                  onChange={e => setPw(f => ({ ...f, next: e.target.value }))}
                  className="hig-input pr-10"
                  placeholder={t('settings.phNewPw')}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPw('next')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-hig-text-secondary hover:text-hig-text transition-colors"
                  tabIndex={-1}
                >
                  {showPw.next ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="hig-label">{t('settings.confirmPassword')}</label>
              <div className="relative">
                <input
                  type={showPw.confirm ? 'text' : 'password'}
                  value={pw.confirm}
                  onChange={e => setPw(f => ({ ...f, confirm: e.target.value }))}
                  className="hig-input pr-10"
                  placeholder={t('settings.phConfirmPw')}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPw('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-hig-text-secondary hover:text-hig-text transition-colors"
                  tabIndex={-1}
                >
                  {showPw.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          {pwError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-hig-sm px-3.5 py-2.5">
              <AlertCircle size={14} className="text-hig-red shrink-0" />
              <p className="text-hig-footnote text-hig-red">{pwError}</p>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="hig-btn-primary"
              disabled={pwLoading}
              style={{ opacity: pwLoading ? 0.65 : 1, minWidth: 140 }}
            >
              {pwLoading ? t('settings.updating') : t('settings.updatePassword')}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* ── App info ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-[18px] py-3.5 bg-black/[0.03] rounded-hig-sm">
        <div className="flex items-center gap-2">
          <Shield size={13} className="text-hig-gray-3" />
          <p className="text-hig-caption1 font-medium text-hig-text-secondary">{t('settings.appLabel')}</p>
        </div>
        <p className="text-hig-caption2 text-hig-gray-3">V1.0 · LLH Group</p>
      </div>

    </div>
  )
}
