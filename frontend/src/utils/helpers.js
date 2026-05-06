// ── Date helpers ──────────────────────────────────────────
export const fmtDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export const fmtDateTime = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export const daysOverdue = (dueDate) => {
  const diff = Math.floor((Date.now() - new Date(dueDate)) / 86400000)
  return diff > 0 ? diff : 0
}

export const addDays = (date, n) => {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

export const today = () => new Date().toISOString().split('T')[0]

// ── Avatar color from name ────────────────────────────────
const AVATAR_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#ef4444',
  '#f59e0b','#10b981','#06b6d4','#3b82f6',
]
export const avatarColor = (name = '') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

export const initials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

// ── CSV Export ────────────────────────────────────────────
export const exportCSV = (data, filename) => {
  if (!data?.length) return
  const headers = Object.keys(data[0])
  const rows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
    ),
  ]
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
  const a    = document.createElement('a')
  a.href     = URL.createObjectURL(blob)
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

// ── Validation helpers ────────────────────────────────────
export const validateEmail = email =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const validatePhone = phone =>
  /^[6-9]\d{9}$/.test(phone)

export const validateISBN = isbn =>
  /^(?:\d{10}|\d{13})$/.test(isbn.replace(/-/g, ''))

// ── Number formatting ─────────────────────────────────────
export const fmtCurrency = (n) =>
  `₹${Number(n).toLocaleString('en-IN')}`

export const fmtNumber = (n) =>
  Number(n).toLocaleString('en-IN')

// ── Status helpers ────────────────────────────────────────
export const statusBadgeClass = (status) => ({
  issued:    'badge-blue',
  returned:  'badge-green',
  overdue:   'badge-red',
  active:    'badge-green',
  suspended: 'badge-red',
}[status] || 'badge-slate')
