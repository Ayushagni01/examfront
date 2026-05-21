import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Eye, ArrowRight, Search, ChevronLeft, ChevronRight, Globe, Landmark, TrendingUp, Medal, Beaker, Award, Shield, Leaf, Palette } from 'lucide-react'
import { api } from '../utils/axiosInstance'

const categories = [
  { key: null, label: 'All Topics', icon: <Globe className="h-4 w-4" /> },
  { key: 'NATIONAL', label: 'National', icon: <Landmark className="h-4 w-4" /> },
  { key: 'INTERNATIONAL', label: 'International', icon: <Globe className="h-4 w-4" /> },
  { key: 'ECONOMY', label: 'Economy', icon: <TrendingUp className="h-4 w-4" /> },
  { key: 'SPORTS', label: 'Sports', icon: <Medal className="h-4 w-4" /> },
  { key: 'SCIENCE', label: 'Science', icon: <Beaker className="h-4 w-4" /> },
  { key: 'AWARDS', label: 'Awards', icon: <Award className="h-4 w-4" /> },
  { key: 'DEFENCE', label: 'Defence', icon: <Shield className="h-4 w-4" /> },
  { key: 'ENVIRONMENT', label: 'Environment', icon: <Leaf className="h-4 w-4" /> },
  { key: 'ART_CULTURE', label: 'Art & Culture', icon: <Palette className="h-4 w-4" /> },
]

const categoryColors: Record<string, string> = {
  NATIONAL: 'from-blue-500 to-blue-600',
  INTERNATIONAL: 'from-indigo-500 to-indigo-600',
  ECONOMY: 'from-emerald-500 to-emerald-600',
  SPORTS: 'from-orange-500 to-orange-600',
  SCIENCE: 'from-cyan-500 to-cyan-600',
  AWARDS: 'from-amber-500 to-amber-600',
  POLITICS: 'from-red-500 to-red-600',
  ENVIRONMENT: 'from-green-500 to-green-600',
  DEFENCE: 'from-slate-600 to-slate-700',
  ART_CULTURE: 'from-purple-500 to-purple-600',
}

export default function CurrentAffairsPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedArticle, setSelectedArticle] = useState<any>(null)

  useEffect(() => {
    fetchArticles()
  }, [activeCategory, page])

  const fetchArticles = () => {
    setLoading(true)
    let url = `/current-affairs?page=${page}&size=12`
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-prepp-navy via-blue-900 to-slate-900 text-white py-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-prepp-yellow rounded-full mix-blend-multiply filter blur-[140px] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-prepp-yellow font-medium text-sm mb-4">
              Daily Updates
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Current Affairs</h1>
            <p className="text-blue-100 text-lg max-w-xl">
              Stay updated with daily current affairs curated for competitive exams. Never miss an important update.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8 -mt-8 relative z-20">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(cat => (
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
              {selectedArticle.imageUrl && (
                <div className="h-48 bg-gradient-to-br from-prepp-navy to-blue-800 rounded-t-2xl relative overflow-hidden">
                  <img src={selectedArticle.imageUrl} alt="" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
              )}
              <div className="p-6">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${categoryColors[selectedArticle.category] || 'from-slate-500 to-slate-600'} mb-3`}>
                  {selectedArticle.category?.replace('_', ' ')}
                </span>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedArticle.title}</h2>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(selectedArticle.publishedDate)}</span>
                  {selectedArticle.viewCount > 0 && (
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {selectedArticle.viewCount} views</span>
                  )}
                </div>
                {selectedArticle.summary && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 text-sm text-slate-700 font-medium">
                    {selectedArticle.summary}
                  </div>
                )}
                <div className="prose max-w-none text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedArticle.content || '<p>Full content coming soon.</p>' }} />
                {selectedArticle.sourceUrl && (
                  <a href={selectedArticle.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-prepp-navy font-semibold mt-4 hover:underline">
                    Read Source <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-1/4 mb-3"></div>
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Articles grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <motion.button
                key={article.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                onClick={() => setSelectedArticle(article)}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-premium-hover transition-all group flex flex-col text-left"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${categoryColors[article.category] || 'from-slate-500 to-slate-600'}`}>
                    {article.category?.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {formatDate(article.publishedDate)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 group-hover:text-prepp-navy transition-colors mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">
                  {article.summary || article.content?.substring(0, 150) || 'Click to read the full article.'}
                </p>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                  {article.viewCount > 0 && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {article.viewCount} views
                    </span>
                  )}
                  <span className="text-sm font-semibold text-prepp-navy group-hover:underline flex items-center gap-1 ml-auto">
                    Read More <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </motion.button>
            ))}

            {articles.length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-500">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">No articles found</h3>
                <p>Check back later for updates or try a different category.</p>
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
