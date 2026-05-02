import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, BookOpen, GraduationCap, ArrowLeftRight,
  ScanLine, BarChart3, Settings, LogOut, X, BookMarked,
} from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/books',     icon: BookOpen,        label: 'Books' },
  { to: '/students',  icon: GraduationCap,   label: 'Students' },
  { to: '/issues',    icon: ArrowLeftRight,  label: 'Issue & Return' },
  { to: '/scanner',   icon: ScanLine,        label: 'Scanner' },
  { to: '/reports',   icon: BarChart3,       label: 'Reports' },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()

  return (
    <aside
      className={`layout-sidebar
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
    >
      {/* ── Logo ── */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-surface-100 dark:border-surface-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ink-500 to-violet-500 flex items-center justify-center shadow-glow">
            <BookMarked className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-base text-surface-900 dark:text-white leading-none">
              LibraryOS
            </p>
            <p className="text-[10px] text-surface-400 mt-0.5">Management System</p>
          </div>
        </div>
        <button onClick={onClose} className="btn-icon lg:hidden">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── User pill ── */}
      <div className="mx-4 mt-4 mb-2 px-3 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-950/30 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ink-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {user?.name?.[0]?.toUpperCase() ?? 'A'}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 truncate leading-none">
            {user?.name}
          </p>
          <p className="text-[11px] text-ink-500 dark:text-ink-400 capitalize mt-0.5">
            {user?.role}
          </p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <p className="px-3 pt-3 pb-1.5 text-[10px] font-bold text-surface-400 uppercase tracking-widest">
          Main Menu
        </p>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}

        <p className="px-3 pt-4 pb-1.5 text-[10px] font-bold text-surface-400 uppercase tracking-widest">
          System
        </p>
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* ── Logout ── */}
      <div className="p-3 border-t border-surface-100 dark:border-surface-800">
        <button
          onClick={logout}
          className="nav-link w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
