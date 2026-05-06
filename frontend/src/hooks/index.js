import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../api/axios'

// ── useFetch ──────────────────────────────────────────────
export function useFetch(url, deps = []) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetch = useCallback(async () => {
    if (!url) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(url)
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}

// ── usePagination ─────────────────────────────────────────
export function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage]   = useState(initialPage)
  const [limit]           = useState(initialLimit)

  const goTo  = useCallback((p) => setPage(p), [])
  const reset = useCallback(() => setPage(1), [])

  return { page, limit, goTo, reset }
}

// ── useDebounce ───────────────────────────────────────────
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ── useForm ───────────────────────────────────────────────
export function useForm(initial, validateFn) {
  const [values, setValues]   = useState(initial)
  const [errors, setErrors]   = useState({})
  const [touched, setTouched] = useState({})

  const handleChange = useCallback(e => {
    const { name, value, type, checked } = e.target
    setValues(v => ({ ...v, [name]: type === 'checkbox' ? checked : value }))
    setErrors(er => ({ ...er, [name]: '' }))
  }, [])

  const handleBlur = useCallback(e => {
    setTouched(t => ({ ...t, [e.target.name]: true }))
  }, [])

  const validate = useCallback(() => {
    if (!validateFn) return true
    const errs = validateFn(values)
    setErrors(errs)
    setTouched(Object.fromEntries(Object.keys(errs).map(k => [k, true])))
    return Object.keys(errs).length === 0
  }, [values, validateFn])

  const reset = useCallback(() => {
    setValues(initial)
    setErrors({})
    setTouched({})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setValue = useCallback((name, value) => {
    setValues(v => ({ ...v, [name]: value }))
  }, [])

  const setAll = useCallback((vals) => {
    setValues(vals)
    setErrors({})
    setTouched({})
  }, [])

  return { values, errors, touched, handleChange, handleBlur, validate, reset, setValue, setAll }
}

// ── useModal ──────────────────────────────────────────────
export function useModal() {
  const [isOpen, setOpen] = useState(false)
  const [data, setData]   = useState(null)
  const open  = useCallback((d = null) => { setData(d); setOpen(true) }, [])
  const close = useCallback(() => { setOpen(false); setData(null) }, [])
  return { isOpen, data, open, close }
}
