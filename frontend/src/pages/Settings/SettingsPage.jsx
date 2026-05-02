import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PageHeader } from '../../components/common'
import { Sun, Moon, Bell, Shield, Info, Key, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-semibold text-surface-800 dark:text-surface-200">{label}</p>
        {desc && <p className="text-xs text-surface-400 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-ink-500/40 outline-none
          ${checked ? 'bg-ink-600' : 'bg-surface-200 dark:bg-surface-700'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200
          ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const { darkMode, onToggleDark } = useOutletContext() || {}
  const { user } = useAuth()

  const [emailNotifs, setEmailNotifs]   = useState(true)
  const [overdueAlerts, setOverdueAlerts] = useState(true)
  const [fineRate, setFineRate]         = useState(5)
  const [loanDays, setLoanDays]         = useState(14)
  const [maxBooks, setMaxBooks]         = useState(3)

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [pwLoading, setPwLoading] = useState(false)

  const handleSavePolicy = () => {
    toast.success('Library policies saved!')
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!pwForm.current) errs.current = 'Current password required'
    if (!pwForm.newPw || pwForm.newPw.length < 8) errs.newPw = 'Min 8 characters'
    if (pwForm.newPw !== pwForm.confirm) errs.confirm = 'Passwords do not match'
    if (Object.keys(errs).length) { setPwErrors(errs); return }

    setPwLoading(true)
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.newPw })
      toast.success('Password changed successfully!')
      setPwForm({ current: '', newPw: '', confirm: '' })
      setPwErrors({})
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setPwLoading(false)
    }
  }

  const Section = ({ icon: Icon, title, children }) => (
    <div className="card p-0 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/30">
        <div className="w-8 h-8 rounded-xl bg-ink-100 dark:bg-ink-950/50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-ink-600 dark:text-ink-400" />
        </div>
        <h3 className="font-display font-bold text-surface-900 dark:text-white">{title}</h3>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  )

  return (
    <div className="animate-fade-up space-y-6 max-w-2xl">
      <PageHeader
        title="Settings"
        subtitle="Manage your library system preferences"
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]}
      />

      {/* Appearance */}
      <Section icon={Sun} title="Appearance">
        <Toggle
          checked={darkMode}
          onChange={onToggleDark}
          label="Dark Mode"
          desc="Switch between light and dark interface theme"
        />
      </Section>

      {/* Library policies */}
      <Section icon={Shield} title="Library Policies">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Fine per Day (₹)', key: 'fineRate', val: fineRate, set: setFineRate, min: 1, max: 50 },
            { label: 'Default Loan (days)', key: 'loanDays', val: loanDays, set: setLoanDays, min: 7, max: 90 },
            { label: 'Max Books / Student', key: 'maxBooks', val: maxBooks, set: setMaxBooks, min: 1, max: 10 },
          ].map(f => (
            <div key={f.key}>
              <label className="form-label">{f.label}</label>
              <input
                type="number"
                value={f.val}
                onChange={e => f.set(Number(e.target.value))}
                min={f.min} max={f.max}
                className="input font-mono"
              />
            </div>
          ))}
        </div>
        <button onClick={handleSavePolicy} className="btn-primary btn-sm">Save Policies</button>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications">
        <div className="divide-y divide-surface-100 dark:divide-surface-800">
          <Toggle checked={emailNotifs} onChange={() => setEmailNotifs(p => !p)}
            label="Email Notifications" desc="Send email alerts for overdue books" />
          <Toggle checked={overdueAlerts} onChange={() => setOverdueAlerts(p => !p)}
            label="Auto Overdue Detection" desc="Automatically mark books as overdue past due date" />
        </div>
      </Section>

      {/* Change password */}
      <Section icon={Key} title="Change Password">
        <form onSubmit={handleChangePassword} className="space-y-3" noValidate>
          {[
            { name: 'current', label: 'Current Password', key: 'current' },
            { name: 'newPw',   label: 'New Password',     key: 'newPw' },
            { name: 'confirm', label: 'Confirm New Password', key: 'confirm' },
          ].map(f => (
            <div key={f.name}>
              <label className="form-label">{f.label}</label>
              <input
                type="password"
                value={pwForm[f.name]}
                onChange={e => setPwForm(p => ({ ...p, [f.name]: e.target.value }))}
                className={`input ${pwErrors[f.key] ? 'border-red-400' : ''}`}
                placeholder="••••••••"
              />
              {pwErrors[f.key] && <p className="form-error mt-1">{pwErrors[f.key]}</p>}
            </div>
          ))}
          <button type="submit" disabled={pwLoading} className="btn-primary btn-sm mt-1">
            {pwLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Updating…</> : 'Update Password'}
          </button>
        </form>
      </Section>

      {/* System info */}
      <Section icon={Info} title="System Information">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ['Version', '1.0.0'],
            ['Stack', 'MERN'],
            ['Role', user?.role || 'admin'],
            ['User', user?.username || 'admin'],
          ].map(([label, val]) => (
            <div key={label} className="rounded-xl bg-surface-50 dark:bg-surface-800/50 p-3 text-center">
              <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">{label}</p>
              <p className="font-mono font-semibold text-sm text-surface-800 dark:text-surface-200">{val}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
