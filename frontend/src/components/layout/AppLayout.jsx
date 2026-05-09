import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024)
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('lms_dark') === 'true'
  )
  const location = useLocation()

  // Apply dark mode to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('lms_dark', darkMode)
  }, [darkMode])

  // Close sidebar on mobile nav
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false)
  }, [location.pathname])

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(true)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-surface-100 dark:bg-surface-950 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─── */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Main area ─── */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300
          ${sidebarOpen ? 'lg:ml-[260px]' : ''}`}
      >
        <Topbar
          onToggleSidebar={() => setSidebarOpen(p => !p)}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(p => !p)}
        />

        <main className="flex-1 p-4 lg:p-8 page-enter bg-surface-100 dark:bg-surface-950 min-h-screen">
          <Outlet context={{ darkMode }} />
        </main>
      </div>
    </div>
  )
}
