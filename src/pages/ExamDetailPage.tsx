import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, 
  Calendar, 
  Briefcase, 
  Building, 
  Trophy, 
  Clock, 
  BookOpenCheck, 
  Users, 
  Star, 
  Lock, 
  ArrowRight,
  BookOpen
} from 'lucide-react'
import { api } from '../utils/axiosInstance'

const typeIcons: Record<string, JSX.Element> = {
  FULL_MOCK: <Trophy className="h-5 w-5" />,
  SECTIONAL: <BookOpen className="h-5 w-5" />,
  PREVIOUS_YEAR: <BookOpenCheck className="h-5 w-5" />,
  TOPIC_WISE: <Star className="h-5 w-5" />,
}

const typeColors: Record<string, string> = {
  FULL_MOCK: 'bg-blue-50 text-blue-600 border-blue-200',
  SECTIONAL: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  PREVIOUS_YEAR: 'bg-purple-50 text-purple-600 border-purple-200',
  TOPIC_WISE: 'bg-amber-50 text-amber-600 border-amber-200',
}

export default function ExamDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [exam, setExam] = useState<any>(null)
  const [testSeries, setTestSeries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return

    setLoading(true)
    setError('')

    // Fetch Exam Details
    api.get(`/exams/${slug}`)
      .then(examRes => {
        const examData = examRes.data
        setExam(examData)
        
        // Fetch Test Series for this Exam
        return api.get(`/test-series?examId=${examData.id}&size=50`)
      })
      .then(testRes => {
        setTestSeries(testRes.data.content || [])
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to load exam details. Please verify the exam slug.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prepp-navy"></div>
      </div>
    )
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-premium border border-slate-200">
          <div className="text-red-500 font-semibold mb-4 text-lg">Error Loading Page</div>
          <p className="text-slate-600 mb-6">{error || 'Exam not found.'}</p>
          <Link 
            to="/exams" 
            className="inline-flex items-center gap-2 bg-prepp-navy hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-full transition-all"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Explore Exams
          </Link>
        </div>
      </div>
    )
  }

  // Format date
  const examDateStr = exam.examDate 
    ? new Date(exam.examDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'To be announced'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-prepp-navy text-white pt-10 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-transparent"></div>
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-prepp-yellow rounded-full mix-blend-multiply filter blur-[100px] opacity-15 translate-x-1/4 -translate-y-1/4"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link 
            to="/exams" 
            className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-sm font-semibold mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Explore Exams
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-prepp-yellow text-prepp-navy font-bold px-3 py-1 rounded text-xs uppercase tracking-wider shadow-sm">
                Study Material
              </span>
              {exam.conductingBody && (
                <span className="bg-white/10 border border-white/20 text-white font-medium px-3 py-1 rounded text-xs flex items-center gap-1">
                  <Building className="h-3 w-3" /> {exam.conductingBody}
                </span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
              {exam.name}
            </h1>
            
            {exam.fullName && (
              <p className="text-xl text-blue-100 font-medium mb-4 max-w-3xl">
                {exam.fullName}
              </p>
            )}

            <p className="text-blue-200/90 text-base mb-8 max-w-4xl leading-relaxed">
              {exam.description || 'Access comprehensive mock tests, sectional papers, and previous year solutions for complete exam preparation.'}
            </p>

            {/* Quick Stats Grid */}
            <div className="flex flex-wrap gap-6 pt-4 border-t border-white/10">
              {exam.examDate && (
                <div className="flex items-center gap-2.5">
                  <div className="bg-white/10 p-2 rounded-lg"><Calendar className="h-5 w-5 text-prepp-yellow" /></div>
                  <div>
                    <div className="text-xs text-blue-200 font-semibold uppercase tracking-wider">Exam Date</div>
                    <div className="font-bold">{examDateStr}</div>
                  </div>
                </div>
              )}
              {exam.vacancyCount && (
                <div className="flex items-center gap-2.5">
                  <div className="bg-white/10 p-2 rounded-lg"><Briefcase className="h-5 w-5 text-prepp-yellow" /></div>
                  <div>
                    <div className="text-xs text-blue-200 font-semibold uppercase tracking-wider">Vacancies</div>
                    <div className="font-bold">{exam.vacancyCount.toLocaleString()} + Posts</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-prepp-navy" /> Available Test Series & Mock Tests
        </h2>

        {testSeries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testSeries.map((test, index) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-premium-hover transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  {/* Badge & Access type */}
                  <div className="flex justify-between items-center mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${typeColors[test.type] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {typeIcons[test.type] || <BookOpenCheck className="h-4 w-4" />}
                      {test.type?.replace('_', ' ')}
                    </span>
                    {test.accessType === 'PREMIUM' ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Lock className="h-3 w-3" /> PRO
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                        Free
                      </span>
                    )}
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-prepp-navy transition-colors mb-2">
                    {test.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                    {test.description || 'Mock test with expert answers, performance tracking, and all-India ranking.'}
                  </p>
                </div>

                <div>
                  {/* Stats */}
                  <div className="flex gap-4 text-xs font-semibold text-slate-600 mb-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <BookOpenCheck className="h-3.5 w-3.5 text-slate-400" />
                      {test.totalQuestions} Qs
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {test.durationMinutes} mins
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {test.attemptCount || 0}
                    </div>
                    {test.avgRating > 0 && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        {test.avgRating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    to={`/test-series/${test.id}`}
                    className="w-full text-center bg-prepp-navy hover:bg-blue-800 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    Start Practice <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto">
            <div className="bg-slate-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <BookOpenCheck className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No Mock Tests Available</h3>
            <p className="text-slate-500 text-sm px-4">
              We are currently creating practice material for {exam.name}. Please check back shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
