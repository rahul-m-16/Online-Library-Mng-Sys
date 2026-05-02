// StudentFormModal.jsx
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { Modal, FormField } from '../../components/common'
import { validateEmail, validatePhone } from '../../utils/helpers'

const DEPARTMENTS = ['Computer Science & Engineering','Electronics & Communication','Mechanical Engineering','Civil Engineering','Information Technology','Electrical Engineering','Mathematics','Physics']
const EMPTY = { name:'', regNo:'', department:'', email:'', phone:'', status:'active' }

const validateStudent = (v) => {
  const e = {}
  if (!v.name.trim())       e.name       = 'Name is required'
  if (!v.regNo.trim())      e.regNo      = 'Register number is required'
  if (!v.department)        e.department = 'Department is required'
  if (!v.email.trim())      e.email      = 'Email is required'
  else if (!validateEmail(v.email)) e.email = 'Invalid email address'
  if (!v.phone.trim())      e.phone      = 'Phone is required'
  else if (!validatePhone(v.phone)) e.phone = 'Invalid phone (10 digits, start 6-9)'
  return e
}

export default function StudentFormModal({ isOpen, onClose, student, onSuccess }) {
  const [form, setForm]     = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(student)

  useEffect(() => {
    if (isOpen) {
      setForm(student ? { ...EMPTY, ...student } : EMPTY)
      setErrors({})
    }
  }, [isOpen, student])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(er => ({ ...er, [name]: '' }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validateStudent(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/students/${student._id}`, form)
        toast.success('Student updated!')
      } else {
        await api.post('/students', form)
        toast.success('Student added!')
      }
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Student' : 'Add New Student'}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="Full Name" error={errors.name} required>
          <input name="name" value={form.name} onChange={handleChange}
            placeholder="Arjun Sharma" className={`input ${errors.name ? 'border-red-400' : ''}`} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Register Number" error={errors.regNo} required>
            <input name="regNo" value={form.regNo} onChange={handleChange}
              placeholder="CS2024001" className={`input font-mono uppercase ${errors.regNo ? 'border-red-400' : ''}`} />
          </FormField>
          <FormField label="Department" error={errors.department} required>
            <select name="department" value={form.department} onChange={handleChange}
              className={`select ${errors.department ? 'border-red-400' : ''}`}>
              <option value="">Select…</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Email" error={errors.email} required>
          <input name="email" type="email" value={form.email} onChange={handleChange}
            placeholder="student@college.edu" className={`input ${errors.email ? 'border-red-400' : ''}`} />
        </FormField>
        <FormField label="Phone" error={errors.phone} required>
          <input name="phone" value={form.phone} onChange={handleChange}
            placeholder="9876543210" maxLength={10} className={`input font-mono ${errors.phone ? 'border-red-400' : ''}`} />
        </FormField>
        {isEdit && (
          <FormField label="Status">
            <select name="status" value={form.status} onChange={handleChange} className="select">
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </FormField>
        )}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : isEdit ? 'Update' : 'Add Student'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
