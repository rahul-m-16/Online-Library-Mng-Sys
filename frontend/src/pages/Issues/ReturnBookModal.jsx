import { useState } from 'react'
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { Modal } from '../../components/common'
import { fmtDate, daysOverdue, fmtCurrency, today } from '../../utils/helpers'

export default function ReturnBookModal({ isOpen, onClose, issue, onSuccess }) {
  const [saving, setSaving] = useState(false)

  if (!issue) return null

  const fine     = issue.dueDate ? daysOverdue(issue.dueDate) * 5 : 0
  const overdue  = daysOverdue(issue.dueDate)
  const isLate   = overdue > 0

  const handleReturn = async () => {
    setSaving(true)
    try {
      await api.put(`/issues/${issue._id}/return`)
      toast.success(`Book returned${fine > 0 ? ` · Fine: ${fmtCurrency(fine)}` : ' · No fine!'}`)
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Return failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Return Book" size="sm">
      <div className="space-y-4">
        {/* Book + student info */}
        <div className="rounded-2xl bg-surface-50 dark:bg-surface-800/50 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-11 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: issue.book?.coverColor || '#6366f1' }}>
              {issue.book?.title?.[0] || 'B'}
            </div>
            <div>
              <p className="text-xs font-bold text-surface-400 uppercase tracking-widest">Book</p>
              <p className="font-semibold text-surface-900 dark:text-white">{issue.book?.title}</p>
              <p className="text-xs text-surface-400 font-mono">{issue.book?.isbn}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">🎓</span>
            <div>
              <p className="text-xs font-bold text-surface-400 uppercase tracking-widest">Student</p>
              <p className="font-semibold text-surface-900 dark:text-white">{issue.student?.name}</p>
              <p className="text-xs text-surface-400 font-mono">{issue.student?.regNo}</p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Issue Date',  value: fmtDate(issue.issueDate), warn: false },
            { label: 'Due Date',    value: fmtDate(issue.dueDate),   warn: isLate },
            { label: 'Return Date', value: fmtDate(today()),          warn: false },
          ].map(d => (
            <div key={d.label}
              className={`rounded-xl p-3 text-center ${d.warn ? 'bg-red-50 dark:bg-red-950/20' : 'bg-surface-50 dark:bg-surface-800/50'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${d.warn ? 'text-red-400' : 'text-surface-400'}`}>
                {d.label}
              </p>
              <p className={`text-xs font-semibold ${d.warn ? 'text-red-600' : 'text-surface-700 dark:text-surface-300'}`}>
                {d.value}
              </p>
            </div>
          ))}
        </div>

        {/* Fine info */}
        <div className={`rounded-2xl p-4 border ${isLate
          ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40'
          : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'}`}>
          <div className="flex items-center justify-between">
            <div>
              {isLate ? (
                <>
                  <p className="font-bold text-red-700 dark:text-red-400">Fine: {fmtCurrency(fine)}</p>
                  <p className="text-xs text-red-500 mt-0.5">{overdue} days overdue × ₹5/day</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">No Fine 🎉</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Returned on time!</p>
                </>
              )}
            </div>
            {isLate
              ? <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
              : <CheckCircle  className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            }
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleReturn} disabled={saving} className="btn-primary flex-1">
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" />Processing…</>
              : 'Confirm Return'
            }
          </button>
        </div>
      </div>
    </Modal>
  )
}
