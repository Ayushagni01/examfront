import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Newspaper, Calendar, ArrowRight, ExternalLink, ChevronLeft, ChevronRight, Bell, FileCheck, Award, Briefcase, FileText, BookOpen, Tag } from 'lucide-react'
import { api } from '../utils/axiosInstance'

const newsCategories = [
  { key: null, label: 'All News', icon: <Newspaper className="h-4 w-4" /> },
  { key: 'NOTIFICATION', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { key: 'ADMIT_CARD', label: 'Admit Cards', icon: <FileCheck className="h-4 w-4" /> },
  { key: 'RESULT', label: 'Results', icon: <Award className="h-4 w-4" /> },
  { key: 'VACANCY', label: 'Vacancies', icon: <Briefcase className="h-4 w-4" /> },
  { key: 'ANSWER_KEY', label: 'Answer Keys', icon: <FileText className="h-4 w-4" /> },
  { key: 'SYLLABUS', label: 'Syllabus', icon: <BookOpen className="h-4 w-4" /> },
]

const categoryBadge: Record<string, { bg: string; text: string; border: string }> = {
  NOTIFICATION: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  ADMIT_CARD: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  RESULT: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  VACANCY: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  ANSWER_KEY: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  SYLLABUS: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  GENERAL: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
}

export default function NewsPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedArticle, setSelectedArticle] = useState<any>(null)

  useEffect(() => {
    fetchNews()
  }, [activeCategory, page])

  const fetchNews = () => {
    setLoading(true)
    let url = `/news?page=${page}&size=12`
    if (activeCategory) url += `&category=${activeCategory}`
    api.get(url)
      .then(res => {
        setArticles(res.data.content || [])
        setTotalPages(res.data.totalPages || 0)
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const getBadge = (category: string) => categoryBadge[category] || categoryBadge.GENERAL

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-prepp-navy to-slate-900 text-white py-12 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-multiply filter blur-[120px] opacity-15 translate-x-1/4 translate-y-1/4"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-prepp-yellow font-medium text-sm mb-4">
              Latest Updates
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">News & Notifications</h1>
            <p className="text-blue-100 text-lg max-w-xl">
              Admit cards, exam results, vacancy notifications, and important updates for all government exams.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8 -mt-8 relative z-20">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {newsCategories.map(cat => (
              <button
                key={cat.key || 'all'}
                onClick={() => { setActiveCategory(cat.key); setPage(0) }}
                className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeCategory === cat.key ? 'bg-prepp-navy text-white shadow-premium' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Article detail modal */}
        {selectedArticle && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedArticle(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="h-32 bg-gradient-to-r from-prepp-navy to-blue-800 rounded-t-2xl relative flex items-end p-6">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0zMCAzMGg2MHY2MEgzMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30"></div>
                <div className="relative z-10">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getBadge(selectedArticle.category).bg} ${getBadge(selectedArticle.category).text} ${getBadge(selectedArticle.category).border}`}>
                    <Tag className="h-3 w-3" />
                    {selectedArticle.category?.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedArticle.title}</h2>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(selectedArticle.publishedDate)}</span>
                </div>
                {selectedArticle.summary && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4 text-sm text-slate-700 font-medium">
                    <strong className="text-amber-700">Summary:</strong> {selectedArticle.summary}
                  </div>
                )}
                <div className="prose max-w-none text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedArticle.content || '<p>Full details will be available soon.</p>' }} />
                {selectedArticle.sourceUrl && (
                  <a href={selectedArticle.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-prepp-navy font-semibold mt-6 hover:underline bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                    <ExternalLink className="h-3.5 w-3.5" /> Visit Official Source
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse flex gap-4">
                <div className="w-2 h-16 bg-slate-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-3 bg-slate-200 rounded w-1/6 mb-2"></div>
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* News list - using a timeline-style list layout for news */}
        {!loading && (
          <div className="space-y-4">
            {articles.map((article, i) => {
              const badge = getBadge(article.category)
              return (
                <motion.button
                  key={article.id || i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  onClick={() => setSelectedArticle(article)}
                  className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-premium-hover transition-all group flex gap-4 text-left"
                >
                  {/* Color accent bar */}
                  <div className={`w-1.5 self-stretch rounded-full bg-gradient-to-b ${
                    article.category === 'ADMIT_CARD' ? 'from-green-400 to-green-600' :
                    article.category === 'RESULT' ? 'from-purple-400 to-purple-600' :
                    article.category === 'VACANCY' ? 'from-amber-400 to-amber-600' :
                    article.category === 'NOTIFICATION' ? 'from-blue-400 to-blue-600' :
                    'from-slate-300 to-slate-400'
                  }`}></div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                        <Tag className="h-3 w-3" />
                        {article.category?.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatDate(article.publishedDate)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-prepp-navy transition-colors truncate">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                      {article.summary || 'Click to read the full notification details.'}
                    </p>
                  </div>

                  <div className="flex items-center shrink-0">
                    <span className="text-prepp-navy group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </div>
                </motion.button>
              )
            })}

            {articles.length === 0 && (
              <div className="text-center py-20 text-slate-500">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Newspaper className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">No news found</h3>
                <p>Check back later for the latest notifications and updates.</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-sm font-medium text-slate-500">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
