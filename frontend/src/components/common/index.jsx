import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react'

// ── Skeleton ──────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i}>
      {Array.from({ length: cols }).map((_, j) => (
        <td key={j} className="px-4 py-3.5">
          <Skeleton className={`h-4 ${j === 0 ? 'w-32' : j === cols - 1 ? 'w-16' : 'w-24'}`} />
        </td>
      ))}
    </tr>
  ))
}

// ── Empty state ───────────────────────────────────────────
export function EmptyState({ icon = '📭', title = 'Nothing here', message = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-display font-semibold text-surface-700 dark:text-surface-300 mb-1">{title}</h3>
      {message && <p className="text-sm text-surface-400 mb-5 max-w-xs">{message}</p>}
      {action}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size]
  return <Loader2 className={`${s} ${className} animate-spin text-ink-600`} />
}

// ── Badge status ──────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    issued:    'badge-blue',
    returned:  'badge-green',
    overdue:   'badge-red',
    active:    'badge-green',
    suspended: 'badge-red',
  }
  return <span className={map[status] || 'badge-slate'}>{status}</span>
}

// ── Pagination ────────────────────────────────────────────
export function Pagination({ page, pages, total, perPage, onPage }) {
  if (pages <= 1) return null
  const start = (page - 1) * perPage + 1
  const end   = Math.min(page * perPage, total)

  const range = []
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) range.push(i)
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
      <p className="text-sm text-surface-400">
        Showing <span className="font-semibold text-surface-700 dark:text-surface-300">{start}–{end}</span>
        {' '}of <span className="font-semibold text-surface-700 dark:text-surface-300">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className="btn-icon disabled:opacity-40">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {range.map((n, i) => (
          <span key={n} className="flex items-center">
            {i > 0 && range[i - 1] !== n - 1 && (
              <span className="text-surface-400 px-1 text-sm">…</span>
            )}
            <button onClick={() => onPage(n)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                n === page
                  ? 'bg-ink-600 text-white shadow-glow'
                  : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800'
              }`}>
              {n}
            </button>
          </span>
        ))}
        <button onClick={() => onPage(page + 1)} disabled={page === pages}
          className="btn-icon disabled:opacity-40">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal-box w-full ${sizes[size]}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-800">
          <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="btn-icon">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── Confirm dialog ────────────────────────────────────────
export function Confirm({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = true }) {
  if (!isOpen) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm p-6 text-center animate-pop">
        <div className={`w-12 h-12 rounded-2xl ${danger ? 'bg-red-100 dark:bg-red-950/30' : 'bg-ink-100 dark:bg-ink-950/30'} flex items-center justify-center mx-auto mb-4`}>
          <AlertCircle className={`w-6 h-6 ${danger ? 'text-red-500' : 'text-ink-500'}`} />
        </div>
        <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-surface-500 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className={`btn flex-1 text-white ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-ink-600 hover:bg-ink-700'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── FormField ─────────────────────────────────────────────
export function FormField({ label, error, required, children, className = '' }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="form-label">
          {label} {required && <span className="text-red-500 normal-case">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="form-error">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
}

// ── Breadcrumb ────────────────────────────────────────────
export function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <ChevronRight className="w-3 h-3 breadcrumb-sep" />}
          {item.href ? (
            <a href={item.href} className="hover:text-ink-600 transition-colors">{item.label}</a>
          ) : (
            <span className={i === items.length - 1 ? 'breadcrumb-current' : ''}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

// ── Stat card ─────────────────────────────────────────────
export function StatCard({ title, value, icon: Icon, colorClass, bgClass, delta, loading }) {
  return (
    <div className={`stat-card ${bgClass} border-transparent`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 mb-1">{title}</p>
        {loading
          ? <Skeleton className="h-7 w-16" />
          : <p className="text-2xl font-display font-bold text-surface-900 dark:text-white font-mono">{value}</p>
        }
        {delta !== undefined && (
          <p className={`text-xs mt-1 font-medium ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}% from last month
          </p>
        )}
      </div>
    </div>
  )
}

// ── Page header ───────────────────────────────────────────
export function PageHeader({ title, subtitle, actions, breadcrumb }) {
  return (
    <div className="mb-8">
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
      </div>
    </div>
  )
}
