import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit } from 'lucide-react'
import { useState } from 'react'
import { useFetch } from '../../hooks'
import { PageHeader, Skeleton } from '../../components/common'
import { fmtDate, statusBadgeClass } from '../../utils/helpers'
import BookFormModal from './BookFormModal'
import { useFetch as useIssueFetch } from '../../hooks'

export default function BookDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [editOpen, setEditOpen] = useState(false)

  const { data, loading, refetch } = useFetch(`/books/${id}`)
  const book = data?.data

  // Fetch issue history for this book via issues endpoint
  const { data: issueData } = useFetch(`/issues?search=${book?.title || ''}&limit=20`, [book?.title])
  const bookIssues = (issueData?.data || []).filter(i => i.book?._id === id || i.book === id)

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64" />
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  )

  if (!book) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">📚</div>
      <h2 className="font-display font-bold text-xl mb-4">Book not found</h2>
      <button onClick={() => navigate('/books')} className="btn-primary">← Back to Books</button>
    </div>
  )

  const utilPct = Math.round(((book.quantity - book.available) / book.quantity) * 100)

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Books', href: '/books' }, { label: book.title }]}
        actions={
          <div className="flex gap-3">
            <button onClick={() => navigate('/books')} className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Back</button>
            <button onClick={() => setEditOpen(true)} className="btn-primary"><Edit className="w-4 h-4" /> Edit</button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Book card */}
        <div className="card p-8 flex flex-col items-center text-center">
          <div className="w-32 h-44 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-card-lg mb-6"
            style={{ background: `linear-gradient(135deg, ${book.coverColor}, ${book.coverColor}bb)` }}>
            {book.title[0]}
          </div>
          <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white leading-tight">{book.title}</h2>
          <p className="text-surface-500 mt-1.5">{book.author}</p>
          <p className="text-xs text-surface-400 mt-0.5">{book.year}</p>
          <div className="flex gap-2 mt-4 flex-wrap justify-center">
            <span className="badge badge-purple">{book.category}</span>
            <span className={`badge ${book.available > 0 ? 'badge-green' : 'badge-red'}`}>
              {book.available > 0 ? 'Available' : 'Out of Stock'}
            </span>
          </div>
          {book.description && (
            <p className="text-sm text-surface-400 mt-4 leading-relaxed">{book.description}</p>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <div className="card p-6">
            <h3 className="font-display font-bold text-surface-900 dark:text-white mb-5">Book Details</h3>
            <div className="grid grid-cols-2 gap-5">
              {[
                ['Book ID', book._id?.slice(-8), true],
                ['ISBN', book.isbn, true],
                ['Category', book.category, false],
                ['Rack', book.rack, true],
                ['Total Copies', book.quantity, true],
                ['Available', book.available, true],
              ].map(([label, val, mono]) => (
                <div key={label}>
                  <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-1">{label}</p>
                  <p className={`font-semibold text-surface-800 dark:text-surface-200 ${mono ? 'font-mono text-sm' : ''}`}>{val}</p>
                </div>
              ))}
            </div>

            {/* Utilization bar */}
            <div className="mt-6 pt-5 border-t border-surface-100 dark:border-surface-800">
              <div className="flex justify-between mb-2">
                <p className="text-sm font-semibold text-surface-700 dark:text-surface-300">Utilization Rate</p>
                <p className="text-sm font-bold text-ink-600">{utilPct}%</p>
              </div>
              <div className="h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-ink-500 to-violet-500 transition-all duration-700"
                  style={{ width: `${utilPct}%` }} />
              </div>
              <p className="text-xs text-surface-400 mt-1.5">
                {book.quantity - book.available} of {book.quantity} copies currently issued
              </p>
            </div>
          </div>

          {/* Issue history */}
          <div className="card p-6">
            <h3 className="font-display font-bold text-surface-900 dark:text-white mb-5">
              Issue History ({bookIssues.length})
            </h3>
            {bookIssues.length === 0 ? (
              <p className="text-center text-surface-400 text-sm py-8">No issue history for this book.</p>
            ) : bookIssues.map(issue => (
              <div key={issue._id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 mb-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: `hsl(${(issue.student?.name||'').charCodeAt(0)*5%360}, 60%, 55%)` }}>
                  {issue.student?.name?.slice(0,2).toUpperCase() || 'NA'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-800 dark:text-surface-200">{issue.student?.name}</p>
                  <p className="text-xs text-surface-400 font-mono">{issue.student?.regNo} · {fmtDate(issue.issueDate)}</p>
                </div>
                <div className="text-right">
                  <span className={`badge ${statusBadgeClass(issue.status)}`}>{issue.status}</span>
                  {issue.fine > 0 && <p className="text-xs text-red-500 font-bold mt-1">₹{issue.fine}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BookFormModal isOpen={editOpen} onClose={() => setEditOpen(false)} book={book}
        onSuccess={() => { setEditOpen(false); refetch() }} />
    </div>
  )
}
