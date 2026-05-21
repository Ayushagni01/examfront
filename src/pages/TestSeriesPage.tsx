import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Users, Star, Lock, Zap, Trophy, BookOpenCheck, ArrowRight, Search, Filter } from 'lucide-react'
import { api } from '../utils/axiosInstance'

const testTypes = [
  { key: null, label: 'All Tests' },
  { key: 'FULL_MOCK', label: 'Full Mock' },
  { key: 'SECTIONAL', label: 'Sectional' },
  { key: 'PREVIOUS_YEAR', label: 'Previous Year' },
  { key: 'TOPIC_WISE', label: 'Topic Wise' },
]

const accessFilters = [
  { key: null, label: 'All' },
  { key: 'FREE', label: '🆓 Free' },
  { key: 'PREMIUM', label: '⭐ Premium' },
]

const typeIcons: Record<string, JSX.Element> = {
  FULL_MOCK: <Trophy className="h-5 w-5" />,
  SECTIONAL: <Filter className="h-5 w-5" />,
  PREVIOUS_YEAR: <BookOpenCheck className="h-5 w-5" />,
  TOPIC_WISE: <Zap className="h-5 w-5" />,
}

const typeColors: Record<string, string> = {
  FULL_MOCK: 'bg-blue-50 text-blue-600 border-blue-200',
  SECTIONAL: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  PREVIOUS_YEAR: 'bg-purple-50 text-purple-600 border-purple-200',
  TOPIC_WISE: 'bg-amber-50 text-amber-600 border-amber-200',
}

export default function TestSeriesPage() {
  const [tests, setTests] = useState<any[]>([])
  const [activeType, setActiveType] = useState<string | null>(null)
  const [activeAccess, setActiveAccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchTests()
  }, [activeType, activeAccess])

  const fetchTests = () => {
    setLoading(true)
    let url = '/test-series?size=20'
    if (activeType) url += `&type=${activeType}`
    if (activeAccess) url += `&accessType=${activeAccess}`
    api.get(url)
      .then(res => setTests(res.data.content || []))
      .catch(() => setTests([]))
      .finally(() => setLoading(false))
  }

  const filtered = tests.filter(t =>
    !searchQuery || t.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero banner */}
      <section className="bg-prepp-navy text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-transparent"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-prepp-yellow rounded-full mix-blend-multiply filter blur-[120px] opacity-15 translate-x-1/3 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-prepp-yellow font-medium text-sm mb-4">
              Practice Makes Perfect
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Test Series</h1>
            <p className="text-blue-100 text-lg max-w-xl">
              Attempt full-length mock tests, sectional tests, and previous year papers with detailed analytics.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 -mt-8 relative z-20">
          <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
            {testTypes.map(t => (
              <button
                key={t.key || 'all'}
                onClick={() => setActiveType(t.key)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeType === t.key ? 'bg-prepp-navy text-white shadow-premium' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search tests..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-prepp-navy/20 focus:border-prepp-navy transition-all"
            />
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          </div>
        </div>

        {/* Access filter pills */}
        <div className="flex gap-2 mb-6">
          {accessFilters.map(f => (
            <button
              key={f.key || 'all-access'}
              onClick={() => setActiveAccess(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeAccess === f.key ? 'bg-prepp-yellow text-prepp-navy shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3 mb-6"></div>
                <div className="flex gap-4">
                  <div className="h-8 bg-slate-200 rounded flex-1"></div>
                  <div className="h-8 bg-slate-200 rounded flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Test grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((test, i) => (
              <motion.div
                key={test.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-premium-hover transition-all group flex flex-col"
              >
                {/* Type badge */}
                <div className="flex justify-between items-start mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${typeColors[test.type] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {typeIcons[test.type] || <BookOpenCheck className="h-4 w-4" />}
                    {test.type?.replace('_', ' ')}
                  </span>
                  {test.accessType === 'PREMIUM' ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      <Lock className="h-3 w-3" /> PRO
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                      Free
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-prepp-navy transition-colors mb-1">
                  {test.title}
                </h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                  {test.description || 'Practice test with detailed solutions and performance analytics.'}
                </p>

                {/* Stats */}
                <div className="flex gap-4 text-xs font-semibold text-slate-600 mb-4 mt-auto border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-1.5">
                    <BookOpenCheck className="h-3.5 w-3.5 text-slate-400" />
                    {test.totalQuestions} Qs
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {test.durationMinutes} min
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {test.attemptCount?.toLocaleString() || 0}
                  </div>
                  {test.avgRating > 0 && (
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      {test.avgRating?.toFixed(1)}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <Link
                  to={`/test-series/${test.id}`}
                  className="w-full text-center bg-prepp-navy hover:bg-blue-800 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  Start Test <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}

            {filtered.length === 0 && !loading && (
              <div className="col-span-full text-center py-20 text-slate-500">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpenCheck className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">No tests found</h3>
                <p>Try changing your filters or check back later.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
