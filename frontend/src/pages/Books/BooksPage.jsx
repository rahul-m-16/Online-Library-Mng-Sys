import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Download, Search, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { PageHeader, Pagination, EmptyState, Confirm, TableSkeleton } from '../../components/common'
import { useDebounce, usePagination, useModal } from '../../hooks'
import { useFetch } from '../../hooks'
import { exportCSV, fmtDate } from '../../utils/helpers'
import BookFormModal from './BookFormModal'

const CATEGORIES = ['Computer Science','Mathematics','Physics','Chemistry','Biology','Literature','History','Philosophy','Engineering','Economics','Psychology','Arts']

export default function BooksPage() {
  const navigate = useNavigate()
  const [search, setSearch]   = useState('')
  const [category, setCategory] = useState('')
  const [avail, setAvail]     = useState('')
  const [sort, setSort]       = useState('createdAt')
  const debouncedSearch = useDebounce(search, 400)
  const { page, limit, goTo } = usePagination(1, 10)
  const formModal   = useModal()
  const deleteModal = useModal()

  const params = new URLSearchParams({
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(category && { category }),
    ...(avail && { availability: avail }),
    sort, page, limit,
  }).toString()

  const { data, loading, refetch } = useFetch(`/books?${params}`, [debouncedSearch, category, avail, sort, page])
  const books    = data?.data || []
  const pagination = data?.pagination || {}

  const handleDelete = async () => {
    try {
      await api.delete(`/books/${deleteModal.data._id}`)
      toast.success('Book deleted')
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const handleExport = () => {
    exportCSV(books.map(b => ({
      Title: b.title, Author: b.author, ISBN: b.isbn,
      Category: b.category, Qty: b.quantity, Available: b.available, Rack: b.rack,
    })), 'books')
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Book Management"
        subtitle={`${pagination.total ?? 0} books in library`}
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Books' }]}
        actions={
          <>
            <button onClick={handleExport} className="btn-secondary">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={() => formModal.open(null)} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Book
            </button>
          </>
        }
      />

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
            <input value={search} onChange={e => { setSearch(e.target.value); goTo(1) }}
              placeholder="Search title, author, ISBN…"
              className="input-search" />
          </div>
          <select value={category} onChange={e => { setCategory(e.target.value); goTo(1) }} className="select w-48">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={avail} onChange={e => { setAvail(e.target.value); goTo(1) }} className="select w-40">
            <option value="">All Availability</option>
            <option value="available">Available</option>
            <option value="out">Out of Stock</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} className="select w-40">
            <option value="createdAt">Latest First</option>
            <option value="title">Title A–Z</option>
            <option value="author">Author A–Z</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="table-container border-0 rounded-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th><th>ISBN</th><th>Category</th>
                <th>Qty</th><th>Available</th><th>Rack</th><th>Added</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={6} cols={8} />
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState icon="📚" title="No books found" message="Try adjusting your filters or add a new book."
                      action={<button onClick={() => formModal.open(null)} className="btn-primary mt-2"><Plus className="w-4 h-4" />Add Book</button>} />
                  </td>
                </tr>
              ) : books.map(book => (
                <tr key={book._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
                        style={{ background: book.coverColor }}>
                        {book.title[0]}
                      </div>
                      <div>
                        <button onClick={() => navigate(`/books/${book._id}`)}
                          className="font-semibold text-surface-800 dark:text-surface-100 hover:text-ink-600 dark:hover:text-ink-400 transition-colors text-left">
                          {book.title}
                        </button>
                        <p className="text-xs text-surface-400">{book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="font-mono text-xs text-surface-500">{book.isbn}</span></td>
                  <td><span className="badge badge-purple">{book.category}</span></td>
                  <td><span className="font-mono font-semibold">{book.quantity}</span></td>
                  <td>
                    <span className={`badge ${book.available > 0 ? 'badge-green' : 'badge-red'}`}>
                      {book.available > 0 ? `${book.available} left` : 'Out'}
                    </span>
                  </td>
                  <td><span className="font-mono text-xs bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-lg">{book.rack}</span></td>
                  <td className="text-xs text-surface-400">{fmtDate(book.createdAt)}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/books/${book._id}`)}
                        className="btn-icon" title="View">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      </button>
                      <button onClick={() => formModal.open(book)}
                        className="btn-icon" title="Edit">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button onClick={() => deleteModal.open(book)}
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

      <BookFormModal isOpen={formModal.isOpen} onClose={formModal.close} book={formModal.data} onSuccess={() => { formModal.close(); refetch() }} />
      <Confirm isOpen={deleteModal.isOpen} onClose={deleteModal.close} onConfirm={handleDelete}
        title="Delete Book" message={`Remove "${deleteModal.data?.title}" permanently? This cannot be undone.`}
        confirmLabel="Delete" danger />
    </div>
  )
}
