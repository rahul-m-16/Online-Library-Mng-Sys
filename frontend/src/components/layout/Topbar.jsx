import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Sun, Moon, Bell, X, ChevronRight } from 'lucide-react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function Topbar({ onToggleSidebar, darkMode, onToggleDark }) {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState(null)
  const [searching, setSearching] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef(null)
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  // Mock notifications
  const notifications = [
    { id: 1, type: 'overdue', text: 'Design Patterns — Rahul Verma overdue 18 days', read: false },
    { id: 2, type: 'overdue', text: 'Sapiens — Kiran Kumar overdue 1 day', read: false },
    { id: 3, type: 'info',    text: 'Python Crash Course was added to library', read: true },
  ]
  const unread = notifications.filter(n => !n.read).length

  // Search with debounce
  useEffect(() => {
    if (query.length < 2) { setResults(null); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const [books, students] = await Promise.all([
          api.get(`/books?search=${query}&limit=4`),
          api.get(`/students?search=${query}&limit=4`),
        ])
        setResults({ books: books.data.data, students: students.data.data })
      } catch { setResults(null) }
      finally { setSearching(false) }
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  // Close notif panel on outside click
  useEffect(() => {
    const handler = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleResultClick = (path) => {
    navigate(path)
    setQuery('')
    setResults(null)
  }

  return (
    <header className="h-16 sticky top-0 z-10 glass border-b border-surface-200 dark:border-surface-800 flex items-center gap-3 px-4 lg:px-6">
      {/* Sidebar toggle */}
      

      {/* Global search */}
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search books, students…"
            className="input-search h-9 pr-8 text-sm"
            aria-label="Global search"
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults(null) }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search dropdown */}
        {(results || searching) && (
          <div className="absolute top-full mt-2 left-0 right-0 card shadow-card-lg z-50 overflow-hidden animate-pop">
            {searching ? (
              <div className="px-4 py-6 text-center text-sm text-surface-400">Searching…</div>
            ) : (
              <>
                {results.books.length > 0 && (
                  <div>
                    <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-surface-400 uppercase tracking-widest">Books</p>
                    {results.books.map(b => (
                      <button key={b._id} onClick={() => handleResultClick(`/books/${b._id}`)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors text-left">
                        <div className="w-7 h-9 rounded-md flex-shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ background: b.coverColor }}>
                          {b.title[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate">{b.title}</p>
                          <p className="text-xs text-surface-400 truncate">{b.author}</p>
                        </div>
                        <span className={`badge flex-shrink-0 ${b.available > 0 ? 'badge-green' : 'badge-red'}`}>
                          {b.available > 0 ? 'Available' : 'Out'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {results.students.length > 0 && (
                  <div>
                    <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-surface-400 uppercase tracking-widest">Students</p>
                    {results.students.map(s => (
                      <button key={s._id} onClick={() => handleResultClick(`/students/${s._id}`)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors text-left">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: `hsl(${s.name.charCodeAt(0) * 5 % 360}, 65%, 55%)` }}>
                          {s.initials || s.name.slice(0,2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{s.name}</p>
                          <p className="text-xs text-surface-400 font-mono">{s.regNo}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-surface-300" />
                      </button>
                    ))}
                  </div>
                )}
                {results.books.length === 0 && results.students.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-surface-400">No results for "{query}"</div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* Dark mode */}
        <button onClick={onToggleDark} className="btn-icon" aria-label="Toggle dark mode">
          {darkMode
            ? <Sun className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            : <Moon className="w-[18px] h-[18px]" />
          }
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifs(p => !p)} className="btn-icon relative" aria-label="Notifications">
            <Bell className="w-[18px] h-[18px]" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse-ring">
                {unread}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-80 card shadow-card-lg z-50 overflow-hidden animate-pop">
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100 dark:border-surface-800">
                <span className="font-semibold text-sm">Notifications</span>
                {unread > 0 && <span className="badge badge-red">{unread} new</span>}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-surface-50 dark:border-surface-800/50 last:border-0 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors ${!n.read ? 'bg-ink-50/50 dark:bg-ink-950/20' : ''}`}>
                    <span className="text-base mt-0.5 flex-shrink-0">{n.type === 'overdue' ? '⚠️' : 'ℹ️'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${!n.read ? 'font-semibold text-surface-800 dark:text-surface-200' : 'text-surface-500 dark:text-surface-400'}`}>
                        {n.text}
                      </p>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-ink-500 flex-shrink-0 mt-1" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ink-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer ml-1"
          onClick={() => navigate('/settings')}>
          {user?.name?.[0]?.toUpperCase() ?? 'A'}
        </div>
      </div>
    </header>
  )
}
