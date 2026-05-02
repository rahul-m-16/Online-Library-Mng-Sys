import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="text-center animate-fade-up">
        <p className="text-8xl font-display font-black text-gradient mb-4">404</p>
        <h1 className="text-2xl font-display font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-surface-400 mb-8">The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}
