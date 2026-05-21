import { useState, useEffect } from 'react'
import { Search, ChevronRight, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../utils/axiosInstance'

export default function ExploreExams() {
  const [categories, setCategories] = useState<any[]>([])
  const [exams, setExams] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<number | null>(null)

  useEffect(() => {
    // Fetch categories
    api.get('/exams/categories').then(res => setCategories(res.data)).catch(() => {})
    // Fetch all exams initially
    fetchExams(null)
  }, [])

  const fetchExams = (catId: number | null) => {
    setActiveCategory(catId)
    const url = catId ? `/exams?categoryId=${catId}` : '/exams'
    api.get(url).then(res => setExams(res.data.content || [])).catch(() => {})
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-24">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4" /> Exam Categories
            </h3>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => fetchExams(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === null ? 'bg-blue-50 text-prepp-navy font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  All Exams
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button 
                    onClick={() => fetchExams(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat.id ? 'bg-blue-50 text-prepp-navy font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Explore Exams</h1>
              <p className="text-slate-500 text-sm mt-1">Find the right study material for your goal.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-prepp-navy/20 focus:border-prepp-navy transition-all"
              />
              <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          {/* Exam Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {exams.map(exam => (
              <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-premium-hover transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-prepp-navy transition-colors">{exam.name}</h3>
                    <p className="text-sm text-slate-500">{exam.description || 'Comprehensive preparation'}</p>
                  </div>
                  <span className="bg-green-50 text-green-700 font-bold px-2 py-1 rounded text-xs border border-green-200">Active</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-auto mb-5 border-t border-b border-slate-50 py-3">
                  <div className="text-center">
                    <div className="text-xs text-slate-500">Mock Tests</div>
                    <div className="font-bold text-slate-800">{exam.totalMocks || 120}</div>
                  </div>
                  <div className="text-center border-l border-r border-slate-100">
                    <div className="text-xs text-slate-500">PYQs</div>
                    <div className="font-bold text-slate-800">{exam.totalPyqs || 45}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-500">Live Classes</div>
                    <div className="font-bold text-slate-800">{exam.totalLiveClasses || 10}</div>
                  </div>
                </div>
                
                <Link to={`/exams/${exam.slug}`} className="mt-auto w-full text-center bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                  View Study Material <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
            
            {exams.length === 0 && (
              <div className="col-span-1 lg:col-span-2 text-center py-20 text-slate-500">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">No exams found</h3>
                <p>Try selecting a different category.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
