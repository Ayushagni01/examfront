import { useLocation, useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Target, TrendingUp, Clock, Users, CheckCircle2, XCircle, MinusCircle, BarChart3, ChevronLeft, Home, BookOpen, AlertCircle, Sparkles, Filter, Languages } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../utils/axiosInstance'

interface ReviewItem {
  questionOrder: number
  questionTextEn: string
  questionTextHi: string | null
  optionAEn: string
  optionBEn: string
  optionCEn: string
  optionDEn: string
  optionAHi: string | null
  optionBHi: string | null
  optionCHi: string | null
  optionDHi: string | null
  correctOption: string
  selectedOption: string | null
  isCorrect: boolean | null
  isMarkedReview: boolean
  isVisited: boolean
  explanationEn: string | null
  explanationHi: string | null
  timeSpentSeconds: number
  marksObtained: number
  difficulty: string
}

export default function TestResultPage() {
  const { attemptId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [result, setResult] = useState<any>(location.state || null)
  const [loading, setLoading] = useState(true)
  
  // Review questions state
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([])
  const [reviewLoading, setReviewLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all')
  const [lang, setLang] = useState<'en' | 'hi'>('en')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        // Fetch test attempt summary result
        let resData = result
        if (!resData) {
          const res = await api.get(`/test-series/attempts/${attemptId}/result`)
          resData = res.data
          setResult(resData)
        }
        setLoading(false)

        // Fetch detailed question-by-question review items
        setReviewLoading(true)
        const reviewRes = await api.get(`/test-series/attempts/${attemptId}/review`)
        setReviewItems(reviewRes.data || [])
      } catch (err) {
        console.error('Failed to load result details', err)
        navigate('/test-series')
      } finally {
        setLoading(false)
        setReviewLoading(false)
      }
    }
    loadData()
  }, [attemptId])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-sm font-semibold text-slate-500">Calculating your detailed performance report...</p>
      </div>
    )
  }
  if (!result) return null

  const scorePercent = Math.round((result.score / result.totalMarks) * 100)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}m ${s}s`
  }

  // Filter logic
  const filteredReview = reviewItems.filter(item => {
    if (filter === 'correct') return item.isCorrect === true
    if (filter === 'incorrect') return item.isCorrect === false && item.selectedOption !== null
    if (filter === 'unattempted') return item.selectedOption === null
    return true
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Banner */}
      <div className={`py-12 text-white relative overflow-hidden ${
        scorePercent >= 70 ? 'bg-gradient-to-r from-emerald-600 to-green-700' : 
        scorePercent >= 40 ? 'bg-gradient-to-r from-indigo-600 to-blue-800' : 'bg-gradient-to-r from-rose-600 to-red-700'
      }`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0zMCAzMGg2MHY2MEgzMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-20"></div>
        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 120 }}>
            <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4 backdrop-blur-md">
              <Trophy className="h-10 w-10 text-amber-300" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Test Summary & Review</h1>
          <p className="text-lg text-white/95 font-medium">{result.testTitle}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 -mt-8 relative z-20">
        
        {/* Key Metrics Dashboard */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-extrabold text-indigo-950">
                {result.score?.toFixed(2)}
                <span className="text-lg text-slate-400 font-medium">/{result.totalMarks}</span>
              </div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Your Score</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-emerald-600">{result.accuracyPct?.toFixed(1)}%</div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-indigo-600">#{result.allIndiaRank || '1'}</div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">All India Rank</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-amber-600">
                {result.topperScore ? result.topperScore.toFixed(2) : result.totalMarks}
              </div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Highest Score</div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Correct Answers', val: result.correctCount, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-green-600 bg-green-50 border-green-200' },
            { label: 'Wrong Answers', val: result.wrongCount, icon: <XCircle className="h-5 w-5" />, color: 'text-red-600 bg-red-50 border-red-200' },
            { label: 'Unattempted', val: result.unattemptedCount, icon: <MinusCircle className="h-5 w-5" />, color: 'text-slate-500 bg-slate-50 border-slate-200' },
            { label: 'Time Taken', val: formatTime(result.timeTakenSeconds || 0), icon: <Clock className="h-5 w-5" />, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
            { label: 'Total Test Takers', val: result.totalAttempts || 1, icon: <Users className="h-5 w-5" />, color: 'text-purple-600 bg-purple-50 border-purple-200' },
          ].map(s => (
            <div key={s.label} className={`p-4 rounded-xl border ${s.color} flex flex-col items-center gap-1.5 text-center`}>
              {s.icon}
              <div className="text-xl font-bold">{s.val}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-85">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Topper vs Average Benchmark */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Score Benchmarking
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Your Score', val: result.score || 0, color: 'bg-indigo-600' },
                { label: 'Highest Score (Topper)', val: result.topperScore || result.score || 0, color: 'bg-emerald-500' },
                { label: 'Average Score', val: result.averageScore || 0, color: 'bg-amber-500' },
              ].map(bar => {
                const pct = result.totalMarks > 0 ? Math.min(100, (bar.val / result.totalMarks) * 100) : 0
                return (
                  <div key={bar.label}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">{bar.label}</span>
                      <span className="text-slate-800">{bar.val.toFixed(2)} / {result.totalMarks}</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.2 }}
                        className={`h-full rounded-full ${bar.color}`} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
              <Sparkles size={160} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase mb-3">
                <Target size={12} className="text-amber-300" /> Performance Index
              </div>
              <h4 className="text-lg font-bold">Accuracy Metric</h4>
              <p className="text-xs text-indigo-200 mt-1.5 leading-relaxed">
                You correctly answered {result.correctCount} out of {result.correctCount + result.wrongCount} attempted questions.
                Maintaining an accuracy rate above 80% is highly recommended for clearing competitive exam cutoffs.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-indigo-300">Grade</span>
              <span className="text-lg font-extrabold text-amber-300">
                {scorePercent >= 80 ? 'Excellent' : scorePercent >= 60 ? 'Very Good' : scorePercent >= 45 ? 'Average' : 'Needs Practice'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION FOR ANSWER KEY REVIEW */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                Detailed Question-by-Question Review
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Verify your selected choices against correct answers and view details</p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'correct', label: 'Correct' },
                { id: 'incorrect', label: 'Incorrect' },
                { id: 'unattempted', label: 'Unattempted' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    filter === f.id ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language selection */}
          <div className="px-5 py-2 border-b border-slate-100 bg-slate-100/50 flex justify-end gap-2 items-center">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Languages size={14} /> Display Language:
            </span>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                lang === 'en' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                lang === 'hi' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Review List */}
          {reviewLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="text-xs font-medium">Loading answers key review...</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredReview.map((q, idx) => {
                const questionText = lang === 'hi' && q.questionTextHi ? q.questionTextHi : q.questionTextEn
                
                // Get multilingual options
                const optA = lang === 'hi' && q.optionAHi ? q.optionAHi : q.optionAEn
                const optB = lang === 'hi' && q.optionBHi ? q.optionBHi : q.optionBEn
                const optC = lang === 'hi' && q.optionCHi ? q.optionCHi : q.optionCEn
                const optD = lang === 'hi' && q.optionDHi ? q.optionDHi : q.optionDEn
                
                const explanation = lang === 'hi' && q.explanationHi ? q.explanationHi : q.explanationEn

                return (
                  <div key={idx} className="p-6 hover:bg-slate-50/50 transition-colors">
                    {/* Tags row */}
                    <div className="flex items-center justify-between gap-4 mb-2.5">
                      <span className="text-xs font-bold text-indigo-600 uppercase">
                        Question {q.questionOrder}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          q.difficulty === 'EASY' ? 'bg-green-50 text-green-700 border border-green-200' :
                          q.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {q.difficulty}
                        </span>

                        {q.selectedOption === null ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            Unattempted (0.0 Marks)
                          </span>
                        ) : q.isCorrect ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            Correct (+{q.marksObtained})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            Incorrect ({q.marksObtained})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question text */}
                    <p className="text-sm font-medium text-slate-800 mb-4 whitespace-pre-line leading-relaxed">
                      {questionText}
                    </p>

                    {/* Options list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {[
                        { key: 'A', text: optA },
                        { key: 'B', text: optB },
                        { key: 'C', text: optC },
                        { key: 'D', text: optD },
                      ].map(opt => {
                        const isCorrectAnswer = opt.key === q.correctOption
                        const isUserChoice = opt.key === q.selectedOption
                        
                        let optionStyle = 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50/50'
                        let icon = null

                        if (isCorrectAnswer) {
                          // Correct Option is highlighted in green
                          optionStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-medium'
                          icon = <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        } else if (isUserChoice && !q.isCorrect) {
                          // User choice was wrong (highlighted in red)
                          optionStyle = 'border-rose-300 bg-rose-50/80 text-rose-900 font-medium'
                          icon = <XCircle size={16} className="text-rose-500 shrink-0" />
                        }

                        return (
                          <div
                            key={opt.key}
                            className={`border rounded-xl px-4 py-3 text-xs flex items-center justify-between gap-3 transition-colors ${optionStyle}`}
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="font-bold opacity-60">({opt.key})</span>
                              <span>{opt.text}</span>
                            </div>
                            {icon}
                          </div>
                        )
                      })}
                    </div>

                    {/* Explanation */}
                    {explanation && (
                      <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                        <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                          <AlertCircle size={14} className="text-indigo-600" /> Explanation
                        </h5>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                          {explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}

              {filteredReview.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No questions match the selected filter.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sectional Analysis */}
        {result.sectionAnalysis && result.sectionAnalysis.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-indigo-600" />Section-wise Analysis</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 font-semibold text-slate-600">Section</th>
                    <th className="px-4 py-3 font-semibold text-slate-600 text-center">Total</th>
                    <th className="px-4 py-3 font-semibold text-green-600 text-center">Correct</th>
                    <th className="px-4 py-3 font-semibold text-red-600 text-center">Wrong</th>
                    <th className="px-4 py-3 font-semibold text-slate-600 text-center">Score</th>
                    <th className="px-4 py-3 font-semibold text-slate-600 text-center">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {result.sectionAnalysis.map((sec: any, i: number) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">{sec.section}</td>
                      <td className="px-4 py-3 text-center">{sec.totalQuestions}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-semibold">{sec.correct}</td>
                      <td className="px-4 py-3 text-center text-red-600 font-semibold">{sec.wrong}</td>
                      <td className="px-4 py-3 text-center font-bold">{sec.score?.toFixed(2)}/{sec.totalMarks?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${sec.accuracyPct >= 70 ? 'bg-green-100 text-green-700' : sec.accuracyPct >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {sec.accuracyPct?.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/test-series" className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl text-center hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <ChevronLeft className="h-5 w-5" /> More Tests
          </Link>
          <Link to="/" className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl text-center hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2">
            <Home className="h-5 w-5" /> Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}

