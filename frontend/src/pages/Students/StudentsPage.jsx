import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Download, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { PageHeader, Pagination, EmptyState, Confirm, TableSkeleton } from '../../components/common'
import { useDebounce, usePagination, useModal } from '../../hooks'
import { useFetch } from '../../hooks'
import { exportCSV, fmtDate, avatarColor, initials, statusBadgeClass } from '../../utils/helpers'
import StudentFormModal from './StudentFormModal'

const DEPARTMENTS = ['Computer Science & Engineering','Electronics & Communication','Mechanical Engineering','Civil Engineering','Information Technology','Electrical Engineering','Mathematics','Physics']

export default function StudentsPage() {
  const navigate      = useNavigate()
  const [search, setSearch] = useState('')
  const [dept, setDept]     = useState('')
  const [status, setStatus] = useState('')
  const debouncedSearch = useDebounce(search, 400)
  const { page, limit, goTo } = usePagination(1, 10)
  const formModal   = useModal()
  const deleteModal = useModal()

  const params = new URLSearchParams({
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(dept && { department: dept }),
    ...(status && { status }),
    page, limit,
  }).toString()

  const { data, loading, refetch } = useFetch(`/students?${params}`, [debouncedSearch, dept, status, page])
  const students   = data?.data || []
  const pagination = data?.pagination || {}

  const handleDelete = async () => {
    try {
      await api.delete(`/students/${deleteModal.data._id}`)
      toast.success('Student removed')
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const handleExport = () => {
    exportCSV(students.map(s => ({
      Name: s.name, RegNo: s.regNo, Dept: s.department,
      Email: s.email, Phone: s.phone, Status: s.status,
    })), 'students')
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Student Management"
        subtitle={`${pagination.total ?? 0} students registered`}
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Students' }]}
        actions={
          <>
            <button onClick={handleExport} className="btn-secondary"><Download className="w-4 h-4" /> Export</button>
            <button onClick={() => formModal.open(null)} className="btn-primary"><Plus className="w-4 h-4" /> Add Student</button>
          </>
        }
      />

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
            <input value={search} onChange={e => { setSearch(e.target.value); goTo(1) }}
              placeholder="Search name, reg no, email…" className="input-search" />
          </div>
          <select value={dept} onChange={e => { setDept(e.target.value); goTo(1) }} className="select w-56">
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={status} onChange={e => { setStatus(e.target.value); goTo(1) }} className="select w-36">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="table-container border-0 rounded-none">
          <table className="data-table">
            <thead>
              <tr><th>Student</th><th>Reg. No.</th><th>Department</th><th>Contact</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={6} cols={7} />
              ) : students.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon="🎓" title="No students found"
                  action={<button onClick={() => formModal.open(null)} className="btn-primary mt-2"><Plus className="w-4 h-4" />Add Student</button>} /></td></tr>
              ) : students.map(s => (
                <tr key={s._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ background: avatarColor(s.name) }}>
                        {initials(s.name)}
                      </div>
                      <button onClick={() => navigate(`/students/${s._id}`)}
                        className="font-semibold text-surface-800 dark:text-surface-100 hover:text-ink-600 dark:hover:text-ink-400 transition-colors">
                        {s.name}
                      </button>
                    </div>
                  </td>
                  <td><span className="font-mono text-xs text-surface-500">{s.regNo}</span></td>
                  <td><span className="text-xs text-surface-500 max-w-[160px] block truncate">{s.department}</span></td>
                  <td>
                    <div>
                      <p className="text-xs text-surface-500">{s.email}</p>
                      <p className="text-xs font-mono text-surface-400">{s.phone}</p>
                    </div>
                  </td>
                  <td><span className={`badge ${statusBadgeClass(s.status)}`}>{s.status}</span></td>
                  <td className="text-xs text-surface-400">{fmtDate(s.createdAt)}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/students/${s._id}`)} className="btn-icon" title="View">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      </button>
                      <button onClick={() => formModal.open(s)} className="btn-icon" title="Edit">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button onClick={() => deleteModal.open(s)}
                        className="btn-icon text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" title="Delete">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
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

      <StudentFormModal isOpen={formModal.isOpen} onClose={formModal.close} student={formModal.data}
        onSuccess={() => { formModal.close(); refetch() }} />
      <Confirm isOpen={deleteModal.isOpen} onClose={deleteModal.close} onConfirm={handleDelete}
        title="Remove Student" message={`Remove "${deleteModal.data?.name}" from the system?`}
        confirmLabel="Remove" danger />
    </div>
  )
}
