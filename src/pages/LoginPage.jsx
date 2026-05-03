import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import ProtectedImg from '../components/ui/ProtectedImg'

export default function LoginPage() {
  const { login, loading, error: authError } = useAuth()
  const navigate = useNavigate()
  const [agentCode, setAgentCode] = useState('')
  const [password, setPassword]   = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [shake, setShake]         = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await login(agentCode, password)
    if (ok) {
      navigate('/dashboard')
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  const canSubmit = agentCode.length === 6 && password.length > 0 && !loading

  return (
    <div className="min-h-screen flex font-sans">

      {/* ═══ LEFT — Branding ══════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex flex-col relative overflow-hidden"
        style={{
          width: '46%',
          background: 'linear-gradient(158deg, #040E1C 0%, #081828 52%, #0C2244 100%)',
        }}
      >
        {/* Subtle dot-grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Glow orbs */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            top: '-12%', right: '-14%',
            width: 580, height: 580,
            background: 'radial-gradient(circle, rgba(46,150,255,0.18) 0%, transparent 68%)',
          }}
        />
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            bottom: '-10%', left: '-10%',
            width: 460, height: 460,
            background: 'radial-gradient(circle, rgba(46,150,255,0.09) 0%, transparent 68%)',
          }}
        />

        {/* ── Inner layout ── */}
        <div className="relative z-10 flex flex-col h-full px-[52px] py-12">

          {/* Logo */}
          <div className="self-start mb-[60px]">
            <div
              className="bg-white rounded-[14px] px-[18px] py-3"
              style={{ boxShadow: '0 8px 36px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.12)' }}
            >
              <ProtectedImg
                src="/assets/sora-logo.png"
                alt="Sora Advisory"
                className="w-[234px] h-auto block"
              />
            </div>
          </div>

          {/* Hero copy — centred vertically */}
          <div className="flex-1 flex flex-col justify-center">

            <p className="text-white/[0.36] text-[11px] font-bold tracking-[2px] uppercase mb-[18px]">
              Financial Advisory Platform
            </p>

            <h1 className="text-white text-[42px] font-bold leading-[1.15] tracking-[-1.2px] mb-5 max-w-[340px]">
              Every client's<br />future, mapped.
            </h1>

            <p className="text-white/[0.37] text-[15px] leading-[1.82] max-w-[300px] mb-[50px]">
              Retirement projections, protection analysis, and client management — built for Malaysian advisors.
            </p>

            {/* Feature pills */}
            <div className="flex flex-col gap-2">
              {[
                { color: '#0A84FF', label: 'Client CRM',         sub: 'Contacts, tasks & activity tracking' },
                { color: '#30D158', label: 'Retirement Planner', sub: 'Goal-based projections with EPF' },
                { color: '#FF9F0A', label: 'Wealth Protection',  sub: 'Death, TPD & CI needs analysis' },
              ].map(({ color, label, sub }) => (
                <div
                  key={label}
                  className="flex items-center gap-[11px] px-4 py-3 rounded-[11px] bg-white/[0.048] border border-white/[0.082]"
                >
                  <span
                    className="w-[7px] h-[7px] rounded-full shrink-0"
                    style={{ background: color, boxShadow: `0 0 10px ${color}bb` }}
                  />
                  <span className="text-white/[0.82] text-[13.5px] font-semibold">{label}</span>
                  <span className="text-white/[0.27] text-[13px]">· {sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <p className="text-white/[0.13] text-[12px] mt-9">
            © {new Date().getFullYear()} Henry Lee Advisory · Private &amp; Confidential
          </p>
        </div>
      </div>

      {/* ═══ RIGHT — Form ═════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12">

        {/* Mobile-only logo */}
        <div className="lg:hidden animate-fade-up text-center mb-[44px]">
          <div
            className="inline-block border border-hig-gray-5 rounded-[16px] px-6 py-[14px] mb-[14px]"
            style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.07)' }}
          >
            <ProtectedImg
              src="/assets/sora-logo.png"
              alt="Sora Advisory"
              className="w-[190px] h-auto block"
            />
          </div>
        </div>

        {/* Form area */}
        <div className="w-full max-w-[364px]">

          {/* Heading */}
          <div className="animate-fade-up mb-[34px]">
            <h2 className="text-[28px] font-bold text-hig-text tracking-[-0.7px] mb-2">
              Welcome back
            </h2>
            <p className="text-[15px] text-hig-text-secondary leading-[1.55]">
              Sign in to your agent account
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className={shake ? 'animate-shake' : ''}
          >
            <div className="flex flex-col gap-4">

              {/* ── Agent Code ── */}
              <div className="animate-fade-up" style={{ animationDelay: '70ms' }}>
                <label className="block mb-[9px] text-[11px] font-bold text-hig-text-secondary tracking-[0.9px] uppercase">
                  Agent Code
                </label>
                <div className="border-[1.5px] border-hig-gray-5 rounded-[13px] bg-[#FAFAFA] px-4 py-[13px] transition-all focus-within:border-hig-blue focus-within:bg-white focus-within:shadow-[0_0_0_3.5px_rgba(46,150,255,0.14)]">
                  <div className="flex items-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={agentCode}
                      onChange={e => setAgentCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      autoFocus
                      autoComplete="username"
                      placeholder="· · · · · ·"
                      className="border-none outline-none bg-transparent flex-1 text-hig-text placeholder-hig-gray-3 text-[26px] font-semibold tracking-[0.52em] font-mono caret-hig-blue"
                    />
                    {/* Live fill indicator */}
                    <div className="flex gap-1 pl-3 shrink-0">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <span key={i} style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: i < agentCode.length
                            ? (agentCode.length === 6 ? '#30D158' : '#2E96FF')
                            : '#E5E5EA',
                          transition: 'background 0.18s ease',
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Password ── */}
              <div className="animate-fade-up" style={{ animationDelay: '140ms' }}>
                <label className="block mb-[9px] text-[11px] font-bold text-hig-text-secondary tracking-[0.9px] uppercase">
                  Password
                </label>
                <div className="border-[1.5px] border-hig-gray-5 rounded-[13px] bg-[#FAFAFA] px-4 py-[13px] flex items-center gap-[10px] transition-all focus-within:border-hig-blue focus-within:bg-white focus-within:shadow-[0_0_0_3.5px_rgba(46,150,255,0.14)]">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="border-none outline-none bg-transparent w-full text-hig-text placeholder-hig-gray-3 text-[16px]"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw(s => !s)}
                    className="bg-transparent border-none p-1 cursor-pointer shrink-0 text-hig-gray-2 flex hover:text-hig-text transition-colors"
                  >
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* ── Error ── */}
              {authError && (
                <div className="flex items-start gap-[10px] bg-red-50 border-[1.5px] border-hig-red/[0.22] rounded-[12px] px-[15px] py-3">
                  <span className="text-[15px] shrink-0">⚠️</span>
                  <span className="text-[13.5px] text-[#C0000A] leading-[1.5]">{authError}</span>
                </div>
              )}

              {/* ── Sign In ── */}
              <div className="animate-fade-up" style={{ animationDelay: '210ms' }}>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="lp-btn mt-1 w-full h-[52px] rounded-[13px] border-none text-[16px] font-semibold flex items-center justify-center gap-2 tracking-[-0.2px]"
                  style={{
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    background: canSubmit
                      ? 'linear-gradient(135deg, #2E96FF 0%, #1060D0 100%)'
                      : '#F2F2F7',
                    color: canSubmit ? 'white' : '#AEAEB2',
                    boxShadow: canSubmit ? '0 4px 22px rgba(0,100,255,0.32)' : 'none',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* ── Footer ── */}
          <div className="animate-fade-up mt-9" style={{ animationDelay: '280ms' }}>
            <p className="text-[13px] text-hig-gray-3 text-center mb-6">
              Forgotten your credentials?{' '}
              <span className="text-hig-text-secondary">Contact your administrator.</span>
            </p>
            <div className="flex items-center justify-center gap-2 pt-5 border-t border-hig-gray-6">
              <span className="text-[12px] text-hig-gray-4">Powered by</span>
              <div className="inline-flex items-center bg-[#F5F5FA] border border-[#EAEAF0] rounded-[8px] px-[10px] py-1">
                <span className="text-[12px] font-bold text-[#3A3A3C] tracking-[0.2px]">
                  LLH Group
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
