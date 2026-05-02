import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScanLine, Search, X, BookOpen, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { PageHeader } from '../../components/common'
import { fmtDate } from '../../utils/helpers'

const DEMO_ISBNS = [
  '9780132350884','9780201616224','9780262033848','9781593279288','9780062316097'
]

export default function ScannerPage() {
  const navigate      = useNavigate()
  const [isbn, setIsbn]           = useState('')
  const [scanning, setScanning]   = useState(false)
  const [result, setResult]       = useState(null)
  const [history, setHistory]     = useState([])
  const [cameraErr, setCameraErr] = useState('')
  const [scanLinePos, setScanLinePos] = useState(10)
  const [lineDir, setLineDir]     = useState(1)
  const videoRef  = useRef(null)
  const streamRef = useRef(null)
  const animRef   = useRef(null)

  // Animate scan line
  useEffect(() => {
    if (!scanning) return
    const tick = () => {
      setScanLinePos(p => {
        const next = p + 1.2 * lineDir
        if (next >= 88) { setLineDir(-1); return 88 }
        if (next <= 8)  { setLineDir(1);  return 8  }
        return next
      })
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [scanning, lineDir])

  const startCamera = async () => {
    setCameraErr('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setScanning(true)
    } catch {
      setCameraErr('Camera access denied. Use manual entry or demo scan below.')
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setScanning(false)
  }

  useEffect(() => () => stopCamera(), [])

  const lookupISBN = async (code) => {
    const clean = code.replace(/[-\s]/g, '')
    if (!clean) return
    try {
      const res = await api.get(`/books/isbn/${clean}`)
      const book = res.data.data
      const entry = { isbn: clean, title: book.title, time: new Date().toLocaleTimeString(), found: true }
      setResult({ type: 'found', book, isbn: clean })
      setHistory(h => [entry, ...h.slice(0, 9)])
    } catch {
      const entry = { isbn: clean, title: 'Not in library', time: new Date().toLocaleTimeString(), found: false }
      setResult({ type: 'notfound', isbn: clean })
      setHistory(h => [entry, ...h.slice(0, 9)])
    }
  }

  const handleManual = async (e) => {
    e.preventDefault()
    if (!isbn.trim()) return
    await lookupISBN(isbn)
    setIsbn('')
  }

  const handleDemo = () => {
    const pick = DEMO_ISBNS[Math.floor(Math.random() * DEMO_ISBNS.length)]
    setScanning(true)
    setTimeout(async () => {
      setScanning(false)
      toast.success(`Scanned: ${pick}`)
      await lookupISBN(pick)
    }, 1400)
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Barcode Scanner"
        subtitle="Scan ISBN barcodes to look up books instantly"
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Scanner' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main scanner panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Camera viewport */}
          <div className="card p-0 overflow-hidden">
            <div className="relative bg-surface-950 aspect-video flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

              {/* Overlay when scanning */}
              {scanning && (
                <div className="absolute inset-0">
                  {/* Corner guides */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-ink-400 rounded-tl-md" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-ink-400 rounded-tr-md" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-ink-400 rounded-bl-md" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-ink-400 rounded-br-md" />
                  {/* Scan line */}
                  <div
                    className="absolute left-8 right-8 h-0.5 bg-ink-400 shadow-[0_0_8px_rgba(92,95,255,0.8)]"
                    style={{ top: `${scanLinePos}%`, transition: 'top 0.016s linear' }}
                  />
                  <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-xs bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    Point camera at barcode
                  </p>
                </div>
              )}

              {/* Idle state */}
              {!scanning && !cameraErr && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 gap-3">
                  <ScanLine className="w-12 h-12" />
                  <p className="text-sm">Camera not active</p>
                </div>
              )}

              {/* Camera error */}
              {cameraErr && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 gap-3 p-8 text-center">
                  <span className="text-4xl">🚫</span>
                  <p className="text-sm">{cameraErr}</p>
                </div>
              )}
            </div>

            {/* Camera controls */}
            <div className="p-4 flex gap-3 border-t border-surface-100 dark:border-surface-800">
              {!scanning ? (
                <button onClick={startCamera} className="btn-primary flex-1">
                  <ScanLine className="w-4 h-4" /> Start Camera
                </button>
              ) : (
                <button onClick={stopCamera} className="btn-danger flex-1">
                  <X className="w-4 h-4" /> Stop
                </button>
              )}
              <button onClick={handleDemo} className="btn-secondary flex-1">
                🎯 Demo Scan
              </button>
            </div>
          </div>

          {/* Manual entry */}
          <div className="card p-5">
            <h3 className="font-display font-bold text-surface-900 dark:text-white mb-1">Manual ISBN Entry</h3>
            <p className="text-xs text-surface-400 mb-4">Type or paste a 10/13-digit ISBN</p>
            <form onSubmit={handleManual} className="flex gap-3">
              <input
                value={isbn}
                onChange={e => setIsbn(e.target.value)}
                placeholder="9780132350884"
                className="input flex-1 font-mono text-base tracking-widest"
                maxLength={17}
              />
              <button type="submit" className="btn-primary px-6">
                <Search className="w-4 h-4" /> Look up
              </button>
            </form>

            {/* Demo ISBNs */}
            <div className="mt-4">
              <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-2">Demo ISBNs</p>
              <div className="flex flex-wrap gap-2">
                {DEMO_ISBNS.map(i => (
                  <button key={i} onClick={() => lookupISBN(i)}
                    className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 hover:bg-ink-100 dark:hover:bg-ink-950/40 hover:text-ink-600 transition-colors">
                    {i}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scan result */}
          {result && (
            <div className={`card p-5 animate-slide-up border-2 ${result.type === 'found' ? 'border-ink-200 dark:border-ink-800' : 'border-red-200 dark:border-red-900'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${result.type === 'found' ? 'bg-ink-50 dark:bg-ink-950/40' : 'bg-red-50 dark:bg-red-950/30'}`}>
                  {result.type === 'found' ? '✅' : '❓'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${result.type === 'found' ? 'badge-green' : 'badge-red'}`}>
                      {result.type === 'found' ? 'Found in Library' : 'Not Found'}
                    </span>
                    <span className="font-mono text-xs text-surface-400">{result.isbn}</span>
                  </div>
                  {result.book && (
                    <>
                      <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white">{result.book.title}</h3>
                      <p className="text-surface-500 mt-1">{result.book.author}</p>
                      <div className="flex gap-4 mt-3 text-sm flex-wrap">
                        <span>Category: <strong>{result.book.category}</strong></span>
                        <span>Rack: <strong className="font-mono">{result.book.rack}</strong></span>
                        <span>Available: <strong className={result.book.available > 0 ? 'text-emerald-600' : 'text-red-600'}>{result.book.available}</strong></span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => navigate(`/books/${result.book._id}`)} className="btn-secondary btn-sm">
                          <BookOpen className="w-4 h-4" /> View Details
                        </button>
                        {result.book.available > 0 && (
                          <button onClick={() => navigate('/issues')} className="btn-primary btn-sm">
                            Issue Book <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                  {result.type === 'notfound' && (
                    <div>
                      <p className="text-surface-500 text-sm">No book found with ISBN <span className="font-mono">{result.isbn}</span></p>
                      <button onClick={() => navigate('/books')} className="btn-primary btn-sm mt-3">
                        <BookOpen className="w-4 h-4" /> Add to Library
                      </button>
                    </div>
                  )}
                </div>
                <button onClick={() => setResult(null)} className="btn-icon flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* History */}
        <div className="card p-5 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-surface-900 dark:text-white">Scan History</h3>
            {history.length > 0 && (
              <button onClick={() => setHistory([])} className="text-xs text-surface-400 hover:text-red-500 transition-colors">
                Clear
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="text-center py-12">
              <ScanLine className="w-10 h-10 text-surface-300 dark:text-surface-700 mx-auto mb-3" />
              <p className="text-sm text-surface-400">No scans yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i}
                  className={`flex items-start gap-3 p-3 rounded-xl ${h.found ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'bg-surface-50 dark:bg-surface-800/50'}`}>
                  <span className="text-base flex-shrink-0 mt-0.5">{h.found ? '✅' : '❌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-surface-800 dark:text-surface-200">{h.title}</p>
                    <p className="text-xs font-mono text-surface-400 mt-0.5">{h.isbn}</p>
                    <p className="text-xs text-surface-400">{h.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
