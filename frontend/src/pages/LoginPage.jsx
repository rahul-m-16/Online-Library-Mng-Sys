import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, BookMarked, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const PW_RULES = [
  { label: '8+ characters',    test: p => p.length >= 8 },
  { label: '1 uppercase',      test: p => /[A-Z]/.test(p) },
  { label: '1 number',         test: p => /[0-9]/.test(p) },
  { label: '1 special char',   test: p => /[!@#$%^&*()_+\-=]/.test(p) },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm]       = useState({ username: '', password: '', remember: false })
  const [errors, setErrors]   = useState({})
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent]   = useState(false)

  const pwScore = PW_RULES.filter(r => r.test(form.password)).length
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwScore] || ''
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'][pwScore] || ''
  const strengthWidth = ['0%', '25%', '50%', '75%', '100%'][pwScore] || '0%'

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Username is required'
    if (!form.password)        e.password = 'Password is required'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await login({ username: form.username, password: form.password })
      toast.success(`Welcome back! 👋`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials'
      setErrors({ submit: msg })
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = e => {
    e.preventDefault()
    setForgotSent(true)
    toast.success('Reset link sent to your email!')
  }

  if (showForgot) {
    return (
      <div className="min-h-screen login-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-up">
          <div className="card bg-surface-900/60 border-surface-700/50 backdrop-blur-xl p-8 shadow-[0_32px_64px_rgba(0,0,0,0.4)]">
            <button onClick={() => { setShowForgot(false); setForgotSent(false) }}
              className="text-sm text-surface-400 hover:text-white flex items-center gap-1 mb-6 transition-colors">
              ← Back to Login
            </button>
            {!forgotSent ? (
              <>
                <h2 className="font-display text-xl font-bold text-white mb-1">Reset Password</h2>
                <p className="text-surface-400 text-sm mb-6">Enter your email to receive a reset link.</p>
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <label className="form-label text-surface-400">Email Address</label>
                    <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                      required placeholder="admin@library.edu"
                      className="input bg-surface-800/60 border-surface-600/40 text-white placeholder:text-surface-500 focus:border-ink-400" />
                  </div>
                  <button type="submit" className="btn-primary w-full">
                    Send Reset Link <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-3xl">✉️</div>
                <h2 className="font-display text-xl font-bold text-white mb-2">Email Sent!</h2>
                <p className="text-surface-400 text-sm">Check your inbox for the password reset link.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen login-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-ink-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/8 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ink-500 to-violet-500 flex items-center justify-center mx-auto mb-4 shadow-glow-lg">
            <BookMarked className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">LibraryOS</h1>
          <p className="text-surface-400 text-sm mt-1">Modern Library Management</p>
        </div>

        {/* Card */}
        <div className="card bg-surface-900/60 border-surface-700/50 backdrop-blur-xl p-8 shadow-[0_32px_64px_rgba(0,0,0,0.4)]">
          <h2 className="font-display text-xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-surface-400 text-sm mb-6">Sign in to your admin account</p>

          {errors.submit && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-sm text-red-300">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Username */}
            <div>
              <label className="form-label text-surface-400">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={e => { setForm(f => ({ ...f, username: e.target.value })); setErrors(er => ({ ...er, username: '' })) }}
                placeholder="Enter your username"
                autoComplete="username"
                className={`input bg-surface-800/60 border-surface-600/40 text-white placeholder:text-surface-500 focus:border-ink-400
                  ${errors.username ? 'border-red-500 focus:border-red-400' : ''}`}
              />
              {errors.username && <p className="form-error text-red-400 mt-1">{errors.username}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="form-label text-surface-400">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(er => ({ ...er, password: '' })) }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`input bg-surface-800/60 border-surface-600/40 text-white placeholder:text-surface-500 focus:border-ink-400 pr-11
                    ${errors.password ? 'border-red-500' : ''}`}
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {form.password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="h-1 bg-surface-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: strengthWidth, background: strengthColor }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      {PW_RULES.map(r => (
                        <span key={r.label} className={`text-[10px] font-medium transition-colors ${r.test(form.password) ? 'text-emerald-400' : 'text-surface-600'}`}>
                          {r.test(form.password) ? '✓' : '○'} {r.label}
                        </span>
                      ))}
                    </div>
                    {strengthLabel && (
                      <span className="text-[10px] font-bold" style={{ color: strengthColor }}>
                        {strengthLabel}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {errors.password && <p className="form-error text-red-400 mt-1">{errors.password}</p>}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.remember}
                  onChange={e => setForm(f => ({ ...f, remember: e.target.checked }))}
                  className="w-4 h-4 rounded accent-ink-600" />
                <span className="text-sm text-surface-400">Remember me</span>
              </label>
              <button type="button" onClick={() => setShowForgot(true)}
                className="text-sm text-ink-400 hover:text-ink-300 transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                : <>Sign In <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-surface-600 mt-6">
          LibraryOS v1.0 · © 2024 Library Management System
        </p>
      </div>
    </div>
  )
}
