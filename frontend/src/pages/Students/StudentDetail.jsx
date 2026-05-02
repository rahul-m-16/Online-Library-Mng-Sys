import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Mail, Phone, Calendar, GraduationCap } from 'lucide-react'
import { useState } from 'react'
import { useFetch } from '../../hooks'
import { PageHeader, Skeleton } from '../../components/common'
import { fmtDate, avatarColor, initials, statusBadgeClass, fmtCurrency } from '../../utils/helpers'
import StudentFormModal from './StudentFormModal'

export default function StudentDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)

  const { data, loading, refetch } = useFetch(`/students/${id}`)
  const student = data?.data
  const issues  = student?.issues || []
  const active  = issues.filter(i => i.status !== 'returned')
  const returned= issues.filter(i => i.status === 'returned')
  const totalFine = issues.reduce((s, i) => s + (i.fine || 0), 0)

  if (loading) return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Skeleton className="h-96" />
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-28" /><Skeleton className="h-48" /><Skeleton className="h-48" />
      </div>
    </div>
  )

  if (!student) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">🎓</div>
      <h2 className="font-display font-bold text-xl mb-4">Student not found</h2>
      <button onClick={() => navigate('/students')} className="btn-primary">← Back</button>
    </div>
  )

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Students', href: '/students' }, { label: student.name }]}
        actions={
          <div className="flex gap-3">
            <button onClick={() => navigate('/students')} className="btn-secondary"><ArrowLeft className="w-4 h-4" />Back</button>
            <button onClick={() => setEditOpen(true)} className="btn-primary"><Edit className="w-4 h-4" />Edit</button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile card */}
        <div className="card p-8 text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-card-lg"
            style={{ background: `linear-gradient(135deg, ${avatarColor(student.name)}, ${avatarColor(student.name)}bb)` }}>
            {initials(student.name)}
          </div>
          <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white">{student.name}</h2>
          <p className="font-mono text-sm text-surface-400 mt-1">{student.regNo}</p>
          <span className={`badge mt-3 inline-block ${statusBadgeClass(student.status)}`}>{student.status}</span>

          <div className="mt-6 pt-6 border-t border-surface-100 dark:border-surface-800 space-y-3 text-left">
            {[
              { icon: Mail, label: 'Email', value: student.email },
              { icon: Phone, label: 'Phone', value: student.phone },
              { icon: Calendar, label: 'Joined', value: fmtDate(student.createdAt) },
              { icon: GraduationCap, label: 'Department', value: student.department },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-surface-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">{label}</p>
                  <p className="text-sm text-surface-700 dark:text-surface-300 mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Active Issues', value: active.length,   color: 'text-ink-600',     bg: 'bg-ink-50 dark:bg-ink-950/20' },
              { label: 'Returned',      value: returned.length, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
              { label: 'Total Fines',   value: fmtCurrency(totalFine), color: totalFine > 0 ? 'text-red-600' : 'text-surface-400', bg: totalFine > 0 ? 'bg-red-50 dark:bg-red-950/20' : 'bg-surface-50 dark:bg-surface-800/50' },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl p-4 text-center ${s.bg}`}>
                <p className={`text-2xl font-display font-bold font-mono ${s.color}`}>{s.value}</p>
                <p className="text-xs text-surface-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Active borrows */}
          <div className="card p-6">
            <h3 className="font-display font-bold text-surface-900 dark:text-white mb-4">Currently Borrowed ({active.length})</h3>
            {active.length === 0 ? (
              <p className="text-center text-surface-400 text-sm py-6">No books currently borrowed.</p>
            ) : active.map(issue => (
              <div key={issue._id} className={`flex items-center gap-3 p-3 rounded-xl mb-2 ${issue.status === 'overdue' ? 'bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30' : 'bg-surface-50 dark:bg-surface-800/50'}`}>
                <div className="w-8 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: issue.book?.coverColor || '#6366f1' }}>
                  {issue.book?.title?.[0] || 'B'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{issue.book?.title}</p>
                  <p className="text-xs text-surface-400">Due: {fmtDate(issue.dueDate)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`badge ${statusBadgeClass(issue.status)}`}>{issue.status}</span>
                  {issue.fine > 0 && <p className="text-xs text-red-500 font-bold mt-1">₹{issue.fine}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* History */}
          <div className="card p-6">
            <h3 className="font-display font-bold text-surface-900 dark:text-white mb-4">Borrowing History ({returned.length})</h3>
            {returned.length === 0 ? (
              <p className="text-center text-surface-400 text-sm py-4">No history yet.</p>
            ) : returned.map(issue => (
              <div key={issue._id} className="flex items-center gap-3 p-3 rounded-xl mb-2 bg-surface-50 dark:bg-surface-800/50">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 flex-shrink-0 text-sm">✓</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{issue.book?.title}</p>
                  <p className="text-xs text-surface-400">Returned: {fmtDate(issue.returnDate)}</p>
                </div>
                <span className="badge badge-green flex-shrink-0">returned</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <StudentFormModal isOpen={editOpen} onClose={() => setEditOpen(false)} student={student}
        onSuccess={() => { setEditOpen(false); refetch() }} />
    </div>
  )
}
