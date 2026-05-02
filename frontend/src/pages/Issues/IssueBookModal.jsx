// IssueBookModal.jsx
import { useState, useMemo } from 'react'
import { Loader2, Search, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { Modal } from '../../components/common'
import { useDebounce } from '../../hooks'
import { useFetch } from '../../hooks'
import { fmtDate, avatarColor, initials, addDays, today } from '../../utils/helpers'

function StepBar({ step }) {
  const steps = ['Student', 'Book', 'Confirm']
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((label, i) => (
        <span key={label} className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
            ${i + 1 < step ? 'bg-ink-600 text-white' :
              i + 1 === step ? 'bg-ink-100 dark:bg-ink-950/50 text-ink-600 dark:text-ink-400 ring-2 ring-ink-400' :
              'bg-surface-100 dark:bg-surface-800 text-surface-400'}`}>
            {i + 1 < step ? '✓' : i + 1}
          </span>
          <span className={`text-xs font-semibold hidden sm:block ${i + 1 <= step ? 'text-ink-600 dark:text-ink-400' : 'text-surface-400'}`}>{label}</span>
          {i < 2 && <div className={`flex-1 h-0.5 w-8 rounded-full transition-colors ${i + 1 < step ? 'bg-ink-500' : 'bg-surface-200 dark:bg-surface-700'}`} />}
        </span>
      ))}
    </div>
  )
}

export function IssueBookModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep]             = useState(1)
  const [studentQ, setStudentQ]     = useState('')
  const [bookQ, setBookQ]           = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedBook, setSelectedBook]       = useState(null)
  const [loanDays, setLoanDays]     = useState(14)
  const [saving, setSaving]         = useState(false)
  const dStudent = useDebounce(studentQ, 300)
  const dBook    = useDebounce(bookQ, 300)

  const { data: sData } = useFetch(`/students?search=${dStudent}&status=active&limit=8`, [dStudent])
  const { data: bData } = useFetch(`/books?search=${dBook}&availability=available&limit=8`, [dBook])
  const students = sData?.data || []
  const books    = bData?.data || []

  const dueDate = addDays(today(), loanDays)

  const reset = () => {
    setStep(1); setStudentQ(''); setBookQ('')
    setSelectedStudent(null); setSelectedBook(null); setLoanDays(14)
  }

  const handleClose = () => { reset(); onClose() }

  const handleIssue = async () => {
    setSaving(true)
    try {
      await api.post('/issues', { bookId: selectedBook._id, studentId: selectedStudent._id, loanDays })
      toast.success(`"${selectedBook.title}" issued to ${selectedStudent.name}`)
      reset(); onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Issue failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Issue Book" size="md">
      <StepBar step={step} />

      {/* Step 1 — Select Student */}
      {step === 1 && (
        <div className="space-y-3 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
            <input value={studentQ} onChange={e => setStudentQ(e.target.value)}
              placeholder="Search student by name or reg no…" className="input-search" autoFocus />
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {students.length === 0
              ? <p className="text-center text-surface-400 text-sm py-8">No active students found</p>
              : students.map(s => (
                <button key={s._id} onClick={() => { setSelectedStudent(s); setStep(2) }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-surface-100 dark:border-surface-800 hover:border-ink-300 hover:bg-ink-50/50 dark:hover:bg-ink-950/20 transition-all text-left group">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: avatarColor(s.name) }}>{initials(s.name)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-xs text-surface-400 font-mono">{s.regNo}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-surface-300 group-hover:text-ink-500 transition-colors" />
                </button>
              ))
            }
          </div>
        </div>
      )}

      {/* Step 2 — Select Book */}
      {step === 2 && (
        <div className="space-y-3 animate-fade-in">
          {/* Selected student pill */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-ink-50 dark:bg-ink-950/30 border border-ink-100 dark:border-ink-900/40">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: avatarColor(selectedStudent.name) }}>{initials(selectedStudent.name)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{selectedStudent.name}</p>
              <p className="text-xs font-mono text-surface-400">{selectedStudent.regNo}</p>
            </div>
            <button onClick={() => { setSelectedStudent(null); setStep(1) }}
              className="text-xs text-ink-500 hover:text-ink-700 font-medium">Change</button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
            <input value={bookQ} onChange={e => setBookQ(e.target.value)}
              placeholder="Search book by title, author, ISBN…" className="input-search" autoFocus />
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {books.length === 0
              ? <p className="text-center text-surface-400 text-sm py-8">No available books found</p>
              : books.map(b => (
                <button key={b._id} onClick={() => { setSelectedBook(b); setStep(3) }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-surface-100 dark:border-surface-800 hover:border-ink-300 hover:bg-ink-50/50 dark:hover:bg-ink-950/20 transition-all text-left group">
                  <div className="w-8 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: b.coverColor }}>{b.title[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{b.title}</p>
                    <p className="text-xs text-surface-400">{b.author}</p>
                  </div>
                  <span className="badge badge-green flex-shrink-0">{b.available} left</span>
                </button>
              ))
            }
          </div>
        </div>
      )}

      {/* Step 3 — Confirm */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-2xl border border-surface-100 dark:border-surface-800 divide-y divide-surface-100 dark:divide-surface-800 overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <span className="text-xl">🎓</span>
              <div>
                <p className="text-xs font-bold text-surface-400 uppercase tracking-widest">Student</p>
                <p className="font-semibold">{selectedStudent.name}</p>
                <p className="text-xs font-mono text-surface-400">{selectedStudent.regNo}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <span className="text-xl">📚</span>
              <div>
                <p className="text-xs font-bold text-surface-400 uppercase tracking-widest">Book</p>
                <p className="font-semibold">{selectedBook.title}</p>
                <p className="text-xs text-surface-400">{selectedBook.author}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 p-4 gap-4">
              <div>
                <p className="text-xs font-bold text-surface-400 uppercase tracking-widest">Issue Date</p>
                <p className="font-semibold mt-0.5">{fmtDate(today())}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-surface-400 uppercase tracking-widest">Due Date</p>
                <p className="font-semibold mt-0.5">{fmtDate(dueDate)}</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-2">Loan Period</p>
              <div className="flex gap-2">
                {[7, 14, 21, 30].map(d => (
                  <button key={d} onClick={() => setLoanDays(d)} type="button"
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${loanDays === d ? 'bg-ink-600 text-white shadow-glow' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'}`}>
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
            <button onClick={handleIssue} disabled={saving} className="btn-primary flex-1">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Issuing…</> : 'Confirm Issue'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default IssueBookModal
