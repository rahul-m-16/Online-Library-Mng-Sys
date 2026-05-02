import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import LoginPage       from './pages/LoginPage'
import Dashboard       from './pages/Dashboard'
import BooksPage       from './pages/Books/BooksPage'
import BookDetail      from './pages/Books/BookDetail'
import StudentsPage    from './pages/Students/StudentsPage'
import StudentDetail   from './pages/Students/StudentDetail'
import IssuesPage      from './pages/Issues/IssuesPage'
import ScannerPage     from './pages/Scanner/ScannerPage'
import ReportsPage     from './pages/Reports/ReportsPage'
import SettingsPage    from './pages/Settings/SettingsPage'
import NotFound        from './pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected — all share AppLayout with persistent sidebar + topbar */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"        element={<Dashboard />} />
            <Route path="books"            element={<BooksPage />} />
            <Route path="books/:id"        element={<BookDetail />} />
            <Route path="students"         element={<StudentsPage />} />
            <Route path="students/:id"     element={<StudentDetail />} />
            <Route path="issues"           element={<IssuesPage />} />
            <Route path="scanner"          element={<ScannerPage />} />
            <Route path="reports"          element={<ReportsPage />} />
            <Route path="settings"         element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}
