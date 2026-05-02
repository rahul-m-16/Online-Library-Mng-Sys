import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Chart, registerables } from 'chart.js'
import { Download } from 'lucide-react'
import api from '../../api/axios'
import { PageHeader, Skeleton } from '../../components/common'
import { exportCSV, fmtDate, fmtCurrency } from '../../utils/helpers'

Chart.register(...registerables)

const CAT_COLORS  = ['#5c5fff','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444']
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function ReportsPage() {
  const { darkMode } = useOutletContext()
  const [stats, setStats]     = useState(null)
  const [issues, setIssues]   = useState([])
  const [loading, setLoading] = useState(true)

  const barRef  = useRef(null)
  const lineRef = useRef(null)
  const barChart  = useRef(null)
  const lineChart = useRef(null)

  useEffect(() => {
    Promise.all([
      api.get('/issues/stats'),
      api.get('/issues?limit=100'),
    ]).then(([s, i]) => {
      setStats(s.data.data)
      setIssues(i.data.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!stats) return
    const tc  = darkMode ? '#94a3b8' : '#64748b'
    const gc  = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
    const tip = {
      backgroundColor: darkMode ? '#1e2035' : '#fff',
      titleColor: darkMode ? '#f1f5f9' : '#0f172a',
      bodyColor: tc,
      borderColor: darkMode ? '#252840' : '#e8eaf2',
      borderWidth: 1, cornerRadius: 10, padding: 10,
    }
    const fnt = { family: "'DM Sans', sans-serif", size: 11 }

    // Bar chart — categories
    const catData = stats.categoryDist?.slice(0, 6) || []
    barChart.current?.destroy()
    if (barRef.current && catData.length) {
      barChart.current = new Chart(barRef.current, {
        type: 'bar',
        data: {
          labels: catData.map(c => c._id),
          datasets: [{
            label: 'Books',
            data: catData.map(c => c.count),
            backgroundColor: CAT_COLORS,
            borderRadius: 8,
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: tip },
          scales: {
            x: { grid: { display: false }, ticks: { color: tc, font: fnt } },
            y: { grid: { color: gc }, ticks: { color: tc, font: fnt }, beginAtZero: true },
          },
        },
      })
    }

    // Line chart — monthly trend
    const map = {}
    ;(stats.monthlyTrend || []).forEach(({ _id, count }) => {
      const key = `${_id.year}-${_id.month}`
      if (!map[key]) map[key] = { year: _id.year, month: _id.month, issued: 0, returned: 0 }
      if (_id.status === 'issued' || _id.status === 'overdue') map[key].issued += count
      if (_id.status === 'returned') map[key].returned += count
    })
    const sorted = Object.values(map).sort((a, b) => a.year - b.year || a.month - b.month).slice(-6)

    lineChart.current?.destroy()
    if (lineRef.current && sorted.length) {
      lineChart.current = new Chart(lineRef.current, {
        type: 'line',
        data: {
          labels: sorted.map(x => MONTH_LABELS[x.month - 1]),
          datasets: [
            { label: 'Issued', data: sorted.map(x => x.issued), borderColor: '#5c5fff', backgroundColor: 'rgba(92,95,255,0.08)', borderWidth: 2.5, pointRadius: 4, tension: 0.45, fill: true },
            { label: 'Returned', data: sorted.map(x => x.returned), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.06)', borderWidth: 2.5, pointRadius: 4, tension: 0.45, fill: true },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { color: tc, usePointStyle: true, boxWidth: 8, padding: 14, font: fnt } },
            tooltip: tip,
          },
          scales: {
            x: { grid: { color: gc }, ticks: { color: tc, font: fnt } },
            y: { grid: { color: gc }, ticks: { color: tc, font: fnt }, beginAtZero: true },
          },
        },
      })
    }

    return () => { barChart.current?.destroy(); lineChart.current?.destroy() }
  }, [stats, darkMode])

  const returnRate = stats
    ? Math.round((stats.returnedBooks / Math.max(1, stats.issuedBooks + stats.returnedBooks)) * 100)
    : 0

  const handleExportIssues = () => {
    exportCSV(issues.map(i => ({
      Book:    i.book?.title,
      Student: i.student?.name,
      RegNo:   i.student?.regNo,
      Issued:  fmtDate(i.issueDate),
      Due:     fmtDate(i.dueDate),
      Returned:fmtDate(i.returnDate),
      Status:  i.status,
      Fine:    i.fine,
    })), 'issues-report')
  }

  return (
    <div className="animate-fade-up space-y-8">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Library performance overview"
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }]}
        actions={
          <button onClick={handleExportIssues} className="btn-secondary">
            <Download className="w-4 h-4" /> Export Issues CSV
          </button>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Return Rate',       val: `${returnRate}%`,                   icon: '🔄', col: 'text-ink-600',     bg: 'bg-ink-50 dark:bg-ink-950/20' },
          { label: 'Total Fines',       val: fmtCurrency(stats?.totalFines ?? 0), icon: '💰', col: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-950/20' },
          { label: 'Overdue Books',     val: stats?.overdueBooks ?? 0,            icon: '⚠️', col: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-950/20' },
          { label: 'Total Students',    val: stats?.totalStudents ?? 0,           icon: '🎓', col: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
        ].map(k => (
          <div key={k.label} className={`rounded-2xl p-5 ${k.bg}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xl">{k.icon}</span>
            </div>
            {loading
              ? <Skeleton className="h-7 w-16 mb-1" />
              : <p className={`text-2xl font-display font-bold font-mono ${k.col}`}>{k.val}</p>
            }
            <p className="text-xs text-surface-500 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-display font-bold text-surface-900 dark:text-white mb-1">Books by Category</h3>
          <p className="text-xs text-surface-400 mb-5">Distribution across all categories</p>
          <div style={{ height: 240 }}><canvas ref={barRef} /></div>
        </div>
        <div className="card p-6">
          <h3 className="font-display font-bold text-surface-900 dark:text-white mb-1">Monthly Trend</h3>
          <p className="text-xs text-surface-400 mb-5">Books issued vs returned per month</p>
          <div style={{ height: 240 }}><canvas ref={lineRef} /></div>
        </div>
      </div>

      {/* Category progress bars */}
      <div className="card p-6">
        <h3 className="font-display font-bold text-surface-900 dark:text-white mb-6">Category Breakdown</h3>
        <div className="space-y-4">
          {(stats?.categoryDist || []).slice(0, 8).map((c, i) => {
            const total = (stats?.categoryDist || []).reduce((s, x) => s + x.count, 0)
            const pct   = Math.round((c.count / Math.max(1, total)) * 100)
            return (
              <div key={c._id}>
                <div className="flex justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />
                    <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{c._id}</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-surface-500">{c.count} <span className="text-surface-400 font-normal">({pct}%)</span></span>
                </div>
                <div className="h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: CAT_COLORS[i % CAT_COLORS.length] }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Issues table */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-800">
          <h3 className="font-display font-bold text-surface-900 dark:text-white">All Issue Records</h3>
          <span className="badge badge-blue">{issues.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Book</th><th>Student</th><th>Issued</th><th>Due</th><th>Returned</th><th>Fine</th><th>Status</th></tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3.5"><div className="h-4 rounded skeleton" /></td>
                    ))}</tr>
                  ))
                : issues.slice(0, 20).map(issue => (
                  <tr key={issue._id}>
                    <td className="font-medium">{issue.book?.title}</td>
                    <td>
                      <p>{issue.student?.name}</p>
                      <p className="text-xs font-mono text-surface-400">{issue.student?.regNo}</p>
                    </td>
                    <td>{fmtDate(issue.issueDate)}</td>
                    <td>{fmtDate(issue.dueDate)}</td>
                    <td>{issue.returnDate ? fmtDate(issue.returnDate) : <span className="text-surface-300 dark:text-surface-700">—</span>}</td>
                    <td>
                      {issue.fine > 0
                        ? <span className="font-mono font-bold text-red-600 text-sm">{fmtCurrency(issue.fine)}</span>
                        : <span className="text-surface-300 dark:text-surface-700">—</span>
                      }
                    </td>
                    <td>
                      <span className={`badge ${issue.status === 'returned' ? 'badge-green' : issue.status === 'overdue' ? 'badge-red' : 'badge-blue'}`}>
                        {issue.status}
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
