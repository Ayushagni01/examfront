import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store/store'
import { setCredentials } from '../store/authSlice'
import { 
  Trophy, 
  Clock, 
  BookOpenCheck, 
  Percent, 
  Calendar, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  UserCircle
} from 'lucide-react'
import { api } from '../utils/axiosInstance'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth)
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAttempts: 0,
    avgAccuracy: 0,
    avgScore: 0,
    completedTests: 0
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Refresh user profile for updated subscription status
    api.get('/auth/me')
      .then(res => {
        dispatch(setCredentials({
          user: res.data,
          token: token || ''
        }))
      })
      .catch((err) => console.error('Failed to sync profile', err))

    // Fetch user attempts
    api.get('/api/v1/user/attempts?size=20')
      .then(res => {
        const history = res.data.content || []
        setAttempts(history)
        
        // Calculate statistics
        const completed = history.filter((a: any) => a.status === 'SUBMITTED')
        if (completed.length > 0) {
          const totalAccuracy = completed.reduce((acc: number, curr: any) => acc + (curr.accuracyPct || 0), 0)
          const totalScore = completed.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0)
          
          setStats({
            totalAttempts: history.length,
            completedTests: completed.length,
            avgAccuracy: Math.round(totalAccuracy / completed.length),
            avgScore: parseFloat((totalScore / completed.length).toFixed(1))
          })
        } else {
          setStats({
            totalAttempts: history.length,
            completedTests: 0,
            avgAccuracy: 0,
            avgScore: 0
          })
        }
      })
      .catch((err) => {
        console.error('Failed to fetch attempts', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [isAuthenticated, navigate, token, dispatch])

  if (!isAuthenticated || !user) return null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prepp-navy"></div>
      </div>
    )
  }

  const isPremiumUser = user.subscriptionType === 'PREMIUM' || user.role === 'ROLE_PREMIUM' || user.role === 'ROLE_ADMIN'

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome & Subscription Status */}
        <div className="bg-gradient-to-r from-prepp-navy to-slate-900 rounded-2xl p-6 text-white mb-8 shadow-premium relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-prepp-yellow rounded-full mix-blend-multiply filter blur-[80px] opacity-15 translate-x-1/4 -translate-y-1/4"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-full border border-white/20">
                <UserCircle className="h-10 w-10 text-prepp-yellow" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Welcome, {user.name}!
                </h1>
                <p className="text-blue-200 text-sm mt-1">
                  Keep practicing to crack your target government jobs.
                </p>
              </div>
            </div>

            {/* Premium Badge & Upgrade */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 backdrop-blur-sm">
              <div>
                <div className="text-xs text-blue-200 font-semibold uppercase tracking-wider">Subscription</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isPremiumUser ? (
                    <>
                      <Sparkles className="h-4.5 w-4.5 text-prepp-yellow animate-pulse" />
                      <span className="font-bold text-prepp-yellow">Prepp+ Premium</span>
                    </>
                  ) : (
                    <span className="font-bold text-slate-300">Free Tier</span>
                  )}
                </div>
              </div>
              
              {!isPremiumUser ? (
                <Link
                  to="/pricing"
                  className="bg-prepp-yellow hover:bg-yellow-400 text-prepp-navy font-bold px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-1.5 shadow-sm hover:shadow"
                >
                  Upgrade Now <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <div className="bg-white/10 text-xs px-3 py-1.5 rounded-lg font-semibold border border-white/15 text-blue-100 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Active
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Statistics cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Attempts',
              value: stats.totalAttempts,
              icon: <BookOpenCheck className="h-5 w-5 text-blue-500" />,
              color: 'text-blue-600',
              bg: 'bg-blue-50 border-blue-100'
            },
            {
              title: 'Completed Tests',
              value: stats.completedTests,
              icon: <Trophy className="h-5 w-5 text-emerald-500" />,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50 border-emerald-100'
            },
            {
              title: 'Average Accuracy',
              value: `${stats.avgAccuracy}%`,
              icon: <Percent className="h-5 w-5 text-purple-500" />,
              color: 'text-purple-600',
              bg: 'bg-purple-50 border-purple-100'
            },
            {
              title: 'Average Score',
              value: stats.avgScore,
              icon: <TrendingUp className="h-5 w-5 text-amber-500" />,
              color: 'text-amber-600',
              bg: 'bg-amber-50 border-amber-100'
            }
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-slate-500">{card.title}</span>
                <div className={`p-2 rounded-lg border ${card.bg}`}>{card.icon}</div>
              </div>
              <div className="text-3xl font-extrabold text-slate-800">{card.value}</div>
            </div>
          ))}
        </div>

        {/* Main Sections (Left: Attempts History, Right: Promo/Quick Actions) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-lg">Attempt History</h3>
              </div>

              {attempts.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {attempts.map(attempt => {
                    const dateStr = attempt.submittedAt || attempt.startedAt
                      ? new Date(attempt.submittedAt || attempt.startedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'Unknown Date'

                    const isInProgress = attempt.status === 'IN_PROGRESS'

                    return (
                      <div key={attempt.id} className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50/50 transition-colors">
                        <div>
                          <h4 className="font-bold text-slate-800 mb-1.5">
                            {attempt.testSeries?.title || 'Practice Test'}
                          </h4>
                          
                          {/* Metadata row */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 font-semibold">
                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {dateStr}</span>
                            {!isInProgress && (
                              <>
                                <span>Score: <strong className="text-slate-700">{attempt.score}/{attempt.totalMarks}</strong></span>
                                <span>Accuracy: <strong className="text-slate-700">{attempt.accuracyPct}%</strong></span>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          {isInProgress ? (
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1.5 animate-pulse">
                                <Clock className="h-3 w-3" /> In Progress
                              </span>
                              <Link
                                to={`/test/${attempt.testSeries.id}/attempt/${attempt.id}`}
                                className="bg-prepp-navy hover:bg-blue-800 text-white font-semibold text-xs px-4.5 py-2 rounded-lg transition-colors flex items-center gap-1"
                              >
                                Resume
                              </Link>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                                Completed
                              </span>
                              <Link
                                to={`/test-result/${attempt.id}`}
                                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                              >
                                Review Results
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-16 px-4">
                  <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <BookOpenCheck className="h-6 w-6 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-slate-700 mb-1">No tests attempted yet</h4>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto mb-5">
                    Start practicing by taking one of our premium exam test series.
                  </p>
                  <Link
                    to="/exams"
                    className="inline-flex items-center gap-1.5 bg-prepp-navy hover:bg-slate-800 text-white font-semibold px-5 py-2 rounded-full text-sm transition-all"
                  >
                    Browse Exams <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Ads / Actions */}
          <div className="space-y-6">
            {/* Promo Card if Free User */}
            {!isPremiumUser && (
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 text-white shadow-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 bg-white/20 border border-white/20 w-fit px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-4">
                    <Sparkles className="h-3 w-3" /> Popular Plan
                  </div>
                  
                  <h4 className="text-xl font-extrabold mb-2 leading-snug">
                    Unlock All 10,000+ Mock Tests
                  </h4>
                  <p className="text-white/90 text-sm mb-6 leading-relaxed">
                    Subscribe to Prepp+ Premium Annual Pass for ₹349 and practice previous year papers, detailed analytics, and full mocks.
                  </p>

                  <Link
                    to="/pricing"
                    className="w-full text-center bg-white text-orange-600 font-bold py-3 rounded-lg block shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
                  >
                    Upgrade Now
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-3.5">Study Tips</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-2 items-start">
                  <span className="text-prepp-navy">•</span>
                  Take sectional mocks to improve speed in specific weak topics.
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-prepp-navy">•</span>
                  Spend at least 30 minutes reading current affairs daily to boost General Awareness.
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-prepp-navy">•</span>
                  Review all incorrect responses to avoid making the same mistakes in real exams.
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
