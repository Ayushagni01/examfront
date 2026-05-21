import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, BookOpenCheck, Users, Star, Lock, Zap, ArrowRight, ChevronLeft, Shield, AlertTriangle } from 'lucide-react'
import { api } from '../utils/axiosInstance'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'

export default function TestDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [test, setTest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/test-series/${id}`).then(res => setTest(res.data)).catch(() => setError('Test not found.')).finally(() => setLoading(false))
  }, [id])

  const handleStart = async () => {
    if (!isAuthenticated) { navigate('/dashboard'); return }
    setStarting(true)
    setError('')
    try {
      const res = await api.post(`/test-series/${id}/start`)
      navigate(`/test/${id}/attempt/${res.data.attemptId}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start test. Please try again.')
      setStarting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prepp-navy"></div></div>
  if (error && !test) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-red-500 font-semibold">{error}</p></div>
  if (!test) return null

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-prepp-navy text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/test-series" className="inline-flex items-center gap-1 text-blue-200 hover:text-white text-sm mb-4"><ChevronLeft className="h-4 w-4" />Back to Tests</Link>
          <h1 className="text-3xl font-extrabold">{test.title}</h1>
          <p className="text-blue-100 mt-2">{test.description}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Test info */}
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-100">
            {[
              { label: 'Questions', value: test.totalQuestions, icon: <BookOpenCheck className="h-5 w-5 text-blue-500" /> },
              { label: 'Duration', value: `${test.durationMinutes} min`, icon: <Clock className="h-5 w-5 text-emerald-500" /> },
              { label: 'Total Marks', value: test.totalMarks, icon: <Star className="h-5 w-5 text-amber-500" /> },
              { label: 'Attempts', value: test.attemptCount?.toLocaleString() || 0, icon: <Users className="h-5 w-5 text-purple-500" /> },
            ].map(s => (
              <div key={s.label} className="text-center p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-center mb-2">{s.icon}</div>
                <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                <div className="text-xs text-slate-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Rules */}
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Shield className="h-5 w-5 text-prepp-navy" />Test Rules</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span>Each correct answer carries <strong>+{(test.totalMarks / test.totalQuestions).toFixed(1)}</strong> marks</li>
              <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span>Each wrong answer deducts <strong>{test.negativeMarking}</strong> marks (negative marking)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Unanswered questions carry <strong>0</strong> marks</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>You can mark questions for review and come back later</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Test auto-submits when the timer expires</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Languages: <strong>{test.languages}</strong></li>
            </ul>
          </div>

          {/* CTA */}
          <div className="p-6 bg-slate-50">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-lg p-3 mb-4 flex items-center gap-2"><AlertTriangle className="h-4 w-4" />{error}</div>}
            {test.accessType === 'PREMIUM' && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium rounded-lg p-3 mb-4 flex items-center gap-2"><Lock className="h-4 w-4" />This test requires a Prepp+ subscription</div>
            )}
            <button onClick={handleStart} disabled={starting} className="w-full bg-prepp-navy hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-premium disabled:opacity-60">
              {starting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <>{isAuthenticated ? 'Start Test' : 'Login to Start'}<ArrowRight className="h-5 w-5" /></>}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
