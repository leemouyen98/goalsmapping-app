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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    }}>
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-7px); }
          40%      { transform: translateX(7px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .lp-f1 { animation: fadeUp 0.55s ease both; }
        .lp-f2 { animation: fadeUp 0.55s 0.09s ease both; }
        .lp-f3 { animation: fadeUp 0.55s 0.18s ease both; }
        .lp-input {
          border: none; background: transparent; outline: none; width: 100%;
          color: #1C1C1E; font-family: inherit;
        }
        .lp-input::placeholder { color: #C7C7CC; }
        .lp-field {
          border: 1.5px solid #E8E8ED;
          border-radius: 14px;
          background: white;
          padding: 14px 18px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .lp-field:focus-within {
          border-color: #007AFF;
          box-shadow: 0 0 0 3px rgba(0,122,255,0.1);
        }
        .lp-btn { transition: all 0.15s ease; }
        .lp-btn:not(:disabled):hover {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 12px 32px rgba(0,122,255,0.38) !important;
        }
        .lp-btn:not(:disabled):active { transform: translateY(0); }
        .lp-pill {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 15px;
          border-radius: 11px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.07);
        }
      `}</style>

      {/* ── Left: Branding ───────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex"
        style={{
          width: '46%',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(158deg, #060F1E 0%, #091830 48%, #0C2248 100%)',
        }}
      >
        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }} />

        {/* Glow accents */}
        <div style={{
          position: 'absolute', top: '-20%', right: '-15%',
          width: 620, height: 620, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(0,122,255,0.12) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-12%',
          width: 500, height: 500, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(0,80,200,0.07) 0%, transparent 65%)',
        }} />

        <div style={{
          position: 'relative', zIndex: 10,
          display: 'flex', flexDirection: 'column',
          height: '100%', padding: '44px 52px',
        }}>

          {/* Logo — top left, compact badge */}
          <div>
            <div style={{
              display: 'inline-block',
              background: 'white',
              borderRadius: 12,
              padding: '9px 16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.28)',
            }}>
              <ProtectedImg
                src="/assets/sora-logo.png"
                alt="Sora Advisory"
                style={{ height: 34, width: 'auto', display: 'block', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* Centre content */}
          <div style={{
            flex: 1,
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center',
            paddingBottom: 32,
          }}>
            <h1 style={{
              color: 'white',
              fontSize: 40, fontWeight: 700,
              lineHeight: 1.17, letterSpacing: -1,
              marginBottom: 18, maxWidth: 340,
            }}>
              Every client's<br />future, mapped.
            </h1>

            <p style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 15, lineHeight: 1.78,
              maxWidth: 305, marginBottom: 44,
            }}>
              A private planning suite for financial advisors — retirement projections, protection analysis, and client management in one place.
            </p>

            {/* Feature pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                { dot: '#007AFF', label: 'Client CRM',          desc: 'Contacts, tasks & activity tracking' },
                { dot: '#34C759', label: 'Retirement Planner',  desc: 'Goal-based projections with EPF' },
                { dot: '#FF9500', label: 'Wealth Protection',   desc: 'Death, TPD & CI needs analysis' },
              ].map(({ dot, label, desc }) => (
                <div key={label} className="lp-pill">
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                    background: dot, boxShadow: `0 0 8px ${dot}99`,
                  }} />
                  <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13, fontWeight: 600 }}>
                    {label}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.27)', fontSize: 13 }}>
                    · {desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p style={{ color: 'rgba(255,255,255,0.14)', fontSize: 12 }}>
            © {new Date().getFullYear()} Henry Lee Advisory · Private &amp; Confidential
          </p>
        </div>
      </div>

      {/* ── Right: Form ──────────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'white',
        padding: '48px 24px',
      }}>

        {/* Mobile logo */}
        <div className="lg:hidden lp-f1" style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-block',
            border: '1px solid #EBEBF0',
            borderRadius: 14,
            padding: '12px 20px',
            boxShadow: '0 2px 14px rgba(0,0,0,0.07)',
            marginBottom: 12,
          }}>
            <ProtectedImg
              src="/assets/sora-logo.png"
              alt="Sora Advisory"
              style={{ height: 80, width: 'auto', maxWidth: 260, objectFit: 'contain', display: 'block' }}
            />
          </div>
          <p style={{ color: '#AEAEB2', fontSize: 13 }}>Insurance, Risk &amp; Benefits Advisory</p>
        </div>

        <div style={{ width: '100%', maxWidth: 356 }}>

          {/* Heading */}
          <div className="lp-f1" style={{ marginBottom: 30 }}>
            <h2 style={{
              fontSize: 26, fontWeight: 700,
              color: '#1C1C1E', letterSpacing: -0.5, marginBottom: 6,
            }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 15, color: '#8E8E93', lineHeight: 1.5 }}>
              Sign in to your agent account
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ animation: shake ? 'shake 0.45s ease' : undefined }}>
            <div className="lp-f2" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Agent Code */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 11, fontWeight: 700,
                  color: '#8E8E93', letterSpacing: '0.9px',
                  textTransform: 'uppercase', marginBottom: 8,
                }}>
                  Agent Code
                </label>
                <div className="lp-field">
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      className="lp-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={agentCode}
                      onChange={e => setAgentCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      autoFocus
                      autoComplete="username"
                      placeholder="· · · · · ·"
                      style={{
                        fontSize: 24, fontWeight: 600,
                        letterSpacing: '0.45em',
                        fontFamily: 'ui-monospace, monospace',
                        caretColor: '#007AFF',
                        paddingRight: 54,
                      }}
                    />
                    {/* Progress dots */}
                    <div style={{ position: 'absolute', right: 0, display: 'flex', gap: 4 }}>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <span key={i} style={{
                          width: 6, height: 6, borderRadius: '50%',
                          transition: 'background 0.18s',
                          background: i < agentCode.length
                            ? (agentCode.length === 6 ? '#34C759' : '#007AFF')
                            : '#E5E5EA',
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 11, fontWeight: 700,
                  color: '#8E8E93', letterSpacing: '0.9px',
                  textTransform: 'uppercase', marginBottom: 8,
                }}>
                  Password
                </label>
                <div className="lp-field" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    className="lp-input"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    style={{ fontSize: 16 }}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw(s => !s)}
                    style={{
                      background: 'none', border: 'none',
                      cursor: 'pointer', padding: 4, flexShrink: 0,
                      color: '#C7C7CC', display: 'flex',
                    }}
                  >
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {authError && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  background: 'rgba(255,59,48,0.05)',
                  border: '1.5px solid rgba(255,59,48,0.18)',
                  borderRadius: 12, padding: '12px 16px',
                }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
                  <span style={{ fontSize: 14, color: '#FF3B30', lineHeight: 1.45 }}>{authError}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="lp-btn"
                style={{
                  marginTop: 4,
                  width: '100%', height: 52,
                  borderRadius: 14, border: 'none',
                  background: canSubmit
                    ? 'linear-gradient(135deg, #007AFF 0%, #0055D4 100%)'
                    : '#F0F0F5',
                  color: canSubmit ? 'white' : '#AEAEB2',
                  fontSize: 16, fontWeight: 600,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: canSubmit ? '0 4px 20px rgba(0,122,255,0.28)' : 'none',
                  letterSpacing: -0.1,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} />
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
          </form>

          {/* Help + Powered by */}
          <div className="lp-f3" style={{ marginTop: 32 }}>
            <p style={{ fontSize: 13, color: '#C7C7CC', textAlign: 'center', marginBottom: 24 }}>
              Forgotten your credentials?{' '}
              <span style={{ color: '#8E8E93' }}>Contact your administrator.</span>
            </p>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              paddingTop: 20,
              borderTop: '1px solid #F0F0F5',
            }}>
              <span style={{ fontSize: 12, color: '#C7C7CC' }}>Powered by</span>
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                background: '#F7F7FA',
                border: '1px solid #EBEBF0',
                borderRadius: 8, padding: '5px 10px',
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#3A3A3C', letterSpacing: 0.2 }}>
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
