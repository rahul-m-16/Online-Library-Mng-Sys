import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chart, registerables } from 'chart.js'
import { useOutletContext } from 'react-router-dom'
import {
  BookOpen, Users, BookMarked, AlertTriangle,
  TrendingUp, RotateCcw, DollarSign, Clock,
} from 'lucide-react'
import api from '../api/axios'
import { StatCard, Skeleton, PageHeader } from '../components/common'
import { fmtDate, fmtCurrency } from '../utils/helpers'

Chart.register(...registerables)

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const CAT_COLORS   = ['#5c5fff','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444']

export default function Dashboard() {
  const { darkMode }      = useOutletContext()
  const navigate          = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const lineRef = useRef(null)
  const pieRef  = useRef(null)
  const lineChart = useRef(null)
  const pieChart  = useRef(null)

  useEffect(() => {
    api.get('/issues/stats').then(r => {
      setStats(r.data.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // Build chart data from monthlyTrend
  const buildChartData = () => {
    if (!stats?.monthlyTrend) return { labels: [], issued: [], returned: [] }
    const map = {}
    stats.monthlyTrend.forEach(({ _id, count }) => {
      const key = `${_id.year}-${_id.month}`
      if (!map[key]) map[key] = { year: _id.year, month: _id.month, issued: 0, returned: 0 }
      if (_id.status === 'issued' || _id.status === 'overdue') map[key].issued += count
      if (_id.status === 'returned') map[key].returned += count
    })
    const sorted = Object.values(map).sort((a,b) => a.year - b.year || a.month - b.month).slice(-6)
    return {
      labels:   sorted.map(x => MONTH_LABELS[x.month - 1]),
      issued:   sorted.map(x => x.issued),
      returned: sorted.map(x => x.returned),
    }
  }

  useEffect(() => {
    if (!stats) return
    const chartData = buildChartData()
    const tc  = darkMode ? '#94a3b8' : '#64748b'
    const gc  = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
    const tip = {
      backgroundColor: darkMode ? '#1e2035' : '#fff',
      titleColor:      darkMode ? '#f1f5f9' : '#0f172a',
      bodyColor:       tc,
      borderColor:     darkMode ? '#252840' : '#e8eaf2',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 10,
    }
    const fnt = { family: "'DM Sans', sans-serif", size: 11 }

    // Line chart
    lineChart.current?.destroy()
    if (lineRef.current) {
      lineChart.current = new Chart(lineRef.current, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: 'Issued',
              data: chartData.issued,
              borderColor: '#5c5fff',
              backgroundColor: 'rgba(92,95,255,0.08)',
              borderWidth: 2.5,
              pointBackgroundColor: '#5c5fff',
              pointRadius: 4,
              pointHoverRadius: 6,
              tension: 0.45,
              fill: true,
            },
            {
              label: 'Returned',
              data: chartData.returned,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16,185,129,0.06)',
              borderWidth: 2.5,
              pointBackgroundColor: '#10b981',
              pointRadius: 4,
              pointHoverRadius: 6,
              tension: 0.45,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { color: tc, usePointStyle: true, boxWidth: 8, padding: 16, font: fnt } },
            tooltip: tip,
          },
          scales: {
            x: { grid: { color: gc }, ticks: { color: tc, font: fnt } },
            y: { grid: { color: gc }, ticks: { color: tc, font: fnt }, beginAtZero: true },
          },
        },
      })
    }

    // Doughnut chart
    const catData = stats.categoryDist?.slice(0, 6) || []
    pieChart.current?.destroy()
    if (pieRef.current && catData.length) {
      pieChart.current = new Chart(pieRef.current, {
        type: 'doughnut',
        data: {
          labels: catData.map(c => c._id),
          datasets: [{
            data: catData.map(c => c.count),
            backgroundColor: CAT_COLORS,
            borderWidth: 0,
            hoverOffset: 8,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'right',
              labels: { color: tc, usePointStyle: true, boxWidth: 8, padding: 12, font: fnt },
            },
            tooltip: tip,
          },
        },
      })
    }

    return () => { lineChart.current?.destroy(); pieChart.current?.destroy() }
  }, [stats, darkMode])

  const statCards = [
    { title: 'Total Books',    value: stats?.totalBooks    ?? 0, icon: BookOpen,      colorClass: 'bg-ink-100 dark:bg-ink-950/50 text-ink-600 dark:text-ink-400',     bgClass: 'bg-ink-50 dark:bg-ink-950/20' },
    { title: 'Books Issued',   value: stats?.issuedBooks   ?? 0, icon: BookMarked,    colorClass: 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400', bgClass: 'bg-amber-50 dark:bg-amber-950/20' },
    { title: 'Available',      value: stats?.availableBooks ?? 0, icon: TrendingUp,   colorClass: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400', bgClass: 'bg-emerald-50 dark:bg-emerald-950/20' },
    { title: 'Total Students', value: stats?.totalStudents  ?? 0, icon: Users,        colorClass: 'bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400', bgClass: 'bg-violet-50 dark:bg-violet-950/20' },
  ]

  return (
    <div className="animate-fade-up space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle={`Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'} — here's your library overview`}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <StatCard key={s.title} {...s} loading={loading} delta={4} />
        ))}
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Overdue',      val: stats?.overdueBooks  ?? 0, icon: AlertTriangle, c: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-950/20' },
          { label: 'Returned',     val: stats?.returnedBooks ?? 0, icon: RotateCcw,     c: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Total Fines',  val: fmtCurrency(stats?.totalFines ?? 0), icon: DollarSign, c: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
          { label: 'Active Today', val: stats?.issuedBooks ?? 0, icon: Clock,          c: 'text-ink-600',     bg: 'bg-ink-50 dark:bg-ink-950/20' },
        ].map(({ label, val, icon: Icon, c, bg }) => (
          <div key={label} className={`card border-0 ${bg} p-4 flex items-center gap-3`}>
            <Icon className={`w-5 h-5 flex-shrink-0 ${c}`} />
            <div>
              <p className="text-xs text-surface-500">{label}</p>
              {loading
                ? <Skeleton className="h-6 w-12 mt-0.5" />
                : <p className={`text-xl font-display font-bold ${c} font-mono`}>{val}</p>
              }
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-surface-900 dark:text-white">Issue Trend</h3>
              <p className="text-xs text-surface-400 mt-0.5">Books issued vs returned over last 6 months</p>
            </div>
            <span className="badge badge-purple">Last 6 Months</span>
          </div>
          <div style={{ height: 220 }}><canvas ref={lineRef} /></div>
        </div>
        <div className="card p-6">
          <h3 className="font-display font-bold text-surface-900 dark:text-white mb-1">Categories</h3>
          <p className="text-xs text-surface-400 mb-5">Books by category</p>
          <div style={{ height: 220 }}><canvas ref={pieRef} /></div>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Overdue alerts */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-surface-900 dark:text-white">Overdue Books</h3>
            {loading
              ? <Skeleton className="h-5 w-16" />
              : stats?.overdueBooks > 0 && <span className="badge badge-red">{stats.overdueBooks} overdue</span>
            }
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : stats?.overdueBooks === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-surface-400 text-sm font-medium">No overdue books!</p>
            </div>
          ) : (
            <button onClick={() => navigate('/issues?status=overdue')}
              className="w-full text-left p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors group">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400">
                    {stats.overdueBooks} book{stats.overdueBooks > 1 ? 's' : ''} are overdue
                  </p>
                  <p className="text-xs text-red-500 mt-0.5">Click to view details →</p>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Quick actions */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-surface-900 dark:text-white mb-5">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Issue a Book',   icon: '📤', path: '/issues',   color: 'from-ink-500 to-violet-500' },
              { label: 'Add New Book',   icon: '📚', path: '/books',    color: 'from-emerald-500 to-teal-500' },
              { label: 'Add Student',    icon: '🎓', path: '/students', color: 'from-amber-500 to-orange-500' },
              { label: 'Scan Barcode',   icon: '📷', path: '/scanner',  color: 'from-pink-500 to-rose-500' },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.path)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-800 hover:bg-surface-100 dark:hover:bg-surface-800 hover:-translate-y-0.5 transition-all group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-xl shadow-sm group-hover:shadow-glow transition-shadow`}>
                  {a.icon}
                </div>
                <span className="text-xs font-semibold text-surface-600 dark:text-surface-400 text-center">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
