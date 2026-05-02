import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import api from '../../api/axios'
import { Modal, FormField } from '../../components/common'
import { validateISBN } from '../../utils/helpers'

const CATEGORIES = ['Computer Science','Mathematics','Physics','Chemistry','Biology','Literature','History','Philosophy','Engineering','Economics','Psychology','Arts']
const RACKS      = ['A-01','A-02','A-03','A-04','A-05','B-01','B-02','C-01','D-01','E-01','F-01','G-01']
const COLORS     = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f59e0b','#10b981','#06b6d4','#3b82f6','#84cc16','#f97316']

const EMPTY = { title:'', author:'', isbn:'', category:'', quantity:1, rack:'', year: new Date().getFullYear(), coverColor:'#6366f1', description:'' }

const validateBook = (v) => {
  const e = {}
  if (!v.title.trim())    e.title    = 'Title is required'
  if (!v.author.trim())   e.author   = 'Author is required'
  if (!v.isbn.trim())     e.isbn     = 'ISBN is required'
  else if (!validateISBN(v.isbn)) e.isbn = 'Must be 10 or 13 digits'
  if (!v.category)        e.category = 'Category is required'
  if (!v.quantity || v.quantity < 1) e.quantity = 'Min quantity is 1'
  if (!v.rack)            e.rack     = 'Rack is required'
  return e
}

const ISBN_AUTOFILL = {
  '9780132350884': { title:'Clean Code', author:'Robert C. Martin', category:'Computer Science', year:2008 },
  '9780201616224': { title:'The Pragmatic Programmer', author:'Andrew Hunt', category:'Computer Science', year:1999 },
  '9781593279288': { title:'Python Crash Course', author:'Eric Matthes', category:'Computer Science', year:2019 },
}

export default function BookFormModal({ isOpen, onClose, book, onSuccess }) {
  const [form, setForm]     = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(book)

  useEffect(() => {
    if (isOpen) {
      setForm(book ? { ...EMPTY, ...book } : EMPTY)
      setErrors({})
    }
  }, [isOpen, book])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: name === 'quantity' ? Number(value) : value }))
    setErrors(er => ({ ...er, [name]: '' }))
  }

  // Simulate barcode autofill
  const handleISBNScan = () => {
    const isbns = Object.keys(ISBN_AUTOFILL)
    const isbn  = isbns[Math.floor(Math.random() * isbns.length)]
    const info  = ISBN_AUTOFILL[isbn]
    setForm(f => ({ ...f, isbn, ...info }))
    toast.success('📷 ISBN scanned & autofilled!')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validateBook(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/books/${book._id}`, form)
        toast.success('Book updated!')
      } else {
        await api.post('/books', form)
        toast.success('Book added!')
      }
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Book' : 'Add New Book'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* ISBN with scan */}
        <FormField label="ISBN" error={errors.isbn} required>
          <div className="flex gap-2">
            <input name="isbn" value={form.isbn} onChange={handleChange}
              placeholder="9780132350884" className={`input flex-1 font-mono ${errors.isbn ? 'border-red-400' : ''}`} />
            <button type="button" onClick={handleISBNScan}
              className="btn-secondary flex-shrink-0 text-xs gap-1">📷 Scan</button>
          </div>
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Title" error={errors.title} required>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="Book Title" className={`input ${errors.title ? 'border-red-400' : ''}`} />
          </FormField>
          <FormField label="Author" error={errors.author} required>
            <input name="author" value={form.author} onChange={handleChange}
              placeholder="Author Name" className={`input ${errors.author ? 'border-red-400' : ''}`} />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Category" error={errors.category} required>
            <select name="category" value={form.category} onChange={handleChange}
              className={`select ${errors.category ? 'border-red-400' : ''}`}>
              <option value="">Select category…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Publication Year">
            <input name="year" type="number" value={form.year} onChange={handleChange}
              min={1800} max={new Date().getFullYear()} className="input font-mono" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Quantity" error={errors.quantity} required>
            <input name="quantity" type="number" value={form.quantity} onChange={handleChange}
              min={1} className={`input font-mono ${errors.quantity ? 'border-red-400' : ''}`} />
          </FormField>
          <FormField label="Rack Number" error={errors.rack} required>
            <select name="rack" value={form.rack} onChange={handleChange}
              className={`select font-mono ${errors.rack ? 'border-red-400' : ''}`}>
              <option value="">Select rack…</option>
              {RACKS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </FormField>
        </div>

        <FormField label="Description">
          <textarea name="description" value={form.description} onChange={handleChange}
            rows={2} placeholder="Optional notes about this book…"
            className="input resize-none" />
        </FormField>

        {/* Cover color */}
        <FormField label="Cover Color">
          <div className="flex items-center gap-2 flex-wrap">
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => setForm(f => ({ ...f, coverColor: c }))}
                className={`w-7 h-7 rounded-lg transition-all hover:scale-110 ${form.coverColor === c ? 'ring-2 ring-offset-2 ring-surface-400 scale-110' : ''}`}
                style={{ background: c }} />
            ))}
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: form.coverColor }}>
              {form.title?.[0]?.toUpperCase() || 'B'}
            </div>
          </div>
        </FormField>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : isEdit ? 'Update Book' : 'Add Book'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
