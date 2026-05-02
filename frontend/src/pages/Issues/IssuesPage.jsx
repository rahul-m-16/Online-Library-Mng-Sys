import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { PageHeader, Pagination, EmptyState, TableSkeleton } from '../../components/common'
import { useDebounce, usePagination, useModal } from '../../hooks'
import { useFetch } from '../../hooks'
import { fmtDate, statusBadgeClass, fmtCurrency } from '../../utils/helpers'
import IssueBookModal from './IssueBookModal'
import ReturnBookModal from './ReturnBookModal'

export default function IssuesPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const debouncedSearch = useDebounce(search, 400)
  const { page, limit, goTo } = usePagination(1, 10)
  const issueModal  = useModal()
  const returnModal = useModal()

  const params = new URLSearchParams({
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(status && { status }),
    page, limit,
  }).toString()

  const { data, loading, refetch } = useFetch(`/issues?${params}`, [debouncedSearch, status, page])
  const issues     = data?.data || []
  const pagination = data?.pagination || {}

  const statusCounts = {
    issued:   issues.filter(i => i.status === 'issued').length,
    overdue:  issues.filter(i => i.status === 'overdue').length,
    returned: issues.filter(i => i.status === 'returned').length,
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Issue & Return"
        subtitle="Manage book lending and returns"
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Issue & Return' }]}
        actions={
          <button onClick={() => issueModal.open()} className="btn-primary">
            <Plus className="w-4 h-4" /> Issue Book
          </button>
        }
      />

      {/* Status cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'issued',   label: 'Currently Issued', color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-950/20',    border: 'border-blue-100 dark:border-blue-900/30' },
          { key: 'overdue',  label: 'Overdue',          color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-950/20',      border: 'border-red-100 dark:border-red-900/30' },
          { key: 'returned', label: 'Returned',         color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-100 dark:border-emerald-900/30' },
        ].map(s => (
          <button key={s.key}
            onClick={() => { setStatus(status === s.key ? '' : s.key); goTo(1) }}
            className={`rounded-2xl p-5 text-center border-2 transition-all hover:-translate-y-0.5 ${s.bg} ${status === s.key ? s.border.replace('border-','ring-2 ring-').split(' ')[0] + ' ' + s.border : 'border-transparent'}`}>
            <p className={`text-3xl font-display font-bold font-mono ${s.color}`}>{statusCounts[s.key]}</p>
            <p className="text-sm text-surface-500 mt-1">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
            <input value={search} onChange={e => { setSearch(e.target.value); goTo(1) }}
              placeholder="Search book title, student name, reg no…" className="input-search" />
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); goTo(1) }} className="select w-36">
            <option value="">All Status</option>
            <option value="issued">Issued</option>
            <option value="overdue">Overdue</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="table-container border-0 rounded-none">
          <table className="data-table">
            <thead>
              <tr><th>Book</th><th>Student</th><th>Issue Date</th><th>Due Date</th><th>Return Date</th><th>Fine</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={6} cols={8} />
              ) : issues.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon="🔄" title="No records found" /></td></tr>
              ) : issues.map(issue => (
                <tr key={issue._id} className={issue.status === 'overdue' ? 'bg-red-50/30 dark:bg-red-950/10' : ''}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-9 rounded-md flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: issue.book?.coverColor || '#6366f1' }}>
                        {issue.book?.title?.[0] || 'B'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{issue.book?.title}</p>
                        <p className="text-xs text-surface-400 font-mono">{issue.book?.isbn}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="font-medium text-sm">{issue.student?.name}</p>
                    <p className="text-xs font-mono text-surface-400">{issue.student?.regNo}</p>
                  </td>
                  <td className="text-sm">{fmtDate(issue.issueDate)}</td>
                  <td className={`text-sm ${issue.status === 'overdue' ? 'text-red-600 font-semibold' : ''}`}>{fmtDate(issue.dueDate)}</td>
                  <td className="text-sm">{issue.returnDate ? fmtDate(issue.returnDate) : <span className="text-surface-300 dark:text-surface-700">—</span>}</td>
                  <td>
                    {issue.fine > 0
                      ? <span className="font-mono font-bold text-red-600 text-sm">{fmtCurrency(issue.fine)}</span>
                      : <span className="text-surface-300 dark:text-surface-700">—</span>
                    }
                  </td>
                  <td><span className={`badge ${statusBadgeClass(issue.status)}`}>{issue.status}</span></td>
                  <td>
                    {issue.status !== 'returned' ? (
                      <button onClick={() => returnModal.open(issue)} className="btn-success text-xs py-1.5 px-3">
                        Return
                      </button>
                    ) : (
                      <span className="text-xs text-surface-300 dark:text-surface-700">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-surface-100 dark:border-surface-800">
          <Pagination page={page} pages={pagination.pages || 1} total={pagination.total || 0} perPage={limit} onPage={goTo} />
        </div>
      </div>

      <IssueBookModal isOpen={issueModal.isOpen} onClose={issueModal.close} onSuccess={() => { issueModal.close(); refetch() }} />
      <ReturnBookModal isOpen={returnModal.isOpen} onClose={returnModal.close} issue={returnModal.data} onSuccess={() => { returnModal.close(); refetch() }} />
    </div>
  )
}
