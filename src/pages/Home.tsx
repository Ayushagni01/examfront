import { ArrowRight, Trophy, Users, BookOpenCheck, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect } from 'react'

export default function Home() {

  useEffect(() => {
    // Fetch mock top categories or trigger any analytics if needed
    // api.get('/exams/categories').then(res => setCategories(res.data)).catch(() => {})
  }, [])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-prepp-navy text-white pt-20 pb-24 relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-prepp-yellow rounded-full mix-blend-multiply filter blur-[128px] opacity-20 translate-x-1/3 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-prepp-yellow font-medium text-sm mb-6 shadow-premium backdrop-blur-sm">
                India's #1 Exam Prep Platform
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
                Crack your dream <span className="text-transparent bg-clip-text bg-gradient-to-r from-prepp-yellow to-yellow-200">Government Job</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-lg leading-relaxed">
                Comprehensive study material, latest mock tests, and daily current affairs all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/exams" className="bg-prepp-yellow text-prepp-navy hover:bg-yellow-400 font-bold px-8 py-3.5 rounded-full transition-all hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  Explore Exams <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/test-series" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold px-8 py-3.5 rounded-full transition-all flex items-center justify-center">
                  Try Free Mock Test
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative hidden md:block"
            >
              <div className="glass-card rounded-2xl p-6 relative z-10 mr-8">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-slate-800">Your Daily Goal</h3>
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">75% Complete</span>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4 items-center">
                    <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <BookOpenCheck size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-800">Current Affairs Oct 24</h4>
                      <p className="text-xs text-slate-500">Read 15 mins</p>
                    </div>
                    <div className="ml-auto w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-800">SSC CGL Mini Mock</h4>
                      <p className="text-xs text-slate-500">20 Questions</p>
                    </div>
                    <button className="ml-auto text-xs font-bold text-prepp-navy bg-prepp-yellow px-3 py-1.5 rounded">Start</button>
                  </div>
                </div>
              </div>
              {/* Decorative elements behind card */}
              <div className="absolute top-10 -right-4 w-full h-full border-2 border-prepp-yellow/30 rounded-2xl z-0"></div>
              <div className="absolute top-20 right-[-30px] bg-white p-4 rounded-xl shadow-xl z-20 flex items-center gap-3 animate-bounce shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)]">
                <div className="bg-blue-100 p-2 rounded-full"><Users className="text-blue-600 h-5 w-5" /></div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Active Students</div>
                  <div className="font-bold text-slate-800">+50,000</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b border-slate-100 py-8 relative z-20 -mt-8 mx-4 sm:mx-8 rounded-2xl shadow-premium">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between gap-6 text-center divide-x divide-slate-100">
          <div className="flex-1 px-4">
            <div className="text-3xl font-extrabold text-slate-800">100+</div>
            <div className="text-sm text-slate-500 mt-1 font-medium">Exams Covered</div>
          </div>
          <div className="flex-1 px-4">
            <div className="text-3xl font-extrabold text-slate-800">10K+</div>
            <div className="text-sm text-slate-500 mt-1 font-medium">Mock Tests</div>
          </div>
          <div className="flex-1 px-4">
            <div className="text-3xl font-extrabold text-slate-800">1M+</div>
            <div className="text-sm text-slate-500 mt-1 font-medium">Questions</div>
          </div>
          <div className="flex-1 px-4">
            <div className="text-3xl font-extrabold text-slate-800">5M+</div>
            <div className="text-sm text-slate-500 mt-1 font-medium">Selections</div>
          </div>
        </div>
      </section>

      {/* Popular Exams Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Explore Popular Exams</h2>
            <p className="text-slate-500">Pick your exam and start your preparation right away.</p>
          </div>
          <Link to="/exams" className="text-prepp-navy font-semibold hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "SSC CGL", type: "Staff Selection Commission", tests: 450, color: "bg-blue-50 text-blue-600 border-blue-100" },
            { name: "IBPS PO", type: "Banking", tests: 320, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
            { name: "UPSC CSE", type: "Civil Services", tests: 180, color: "bg-purple-50 text-purple-600 border-purple-100" },
            { name: "RRB NTPC", type: "Railways", tests: 290, color: "bg-amber-50 text-amber-600 border-amber-100" }
          ].map((exam, i) => (
            <Link key={i} to={`/exams/${exam.name.toLowerCase().replace(' ', '-')}`} className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-premium-hover transition-all duration-300 hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg mb-4 border ${exam.color}`}>
                {exam.name.substring(0,1)}
              </div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-prepp-navy transition-colors">{exam.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{exam.type}</p>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
                <BookOpenCheck className="w-4 h-4 text-slate-400" /> {exam.tests} + Tests
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Subscription Banner */}
      <section className="bg-gradient-to-br from-prepp-navy to-slate-900 py-16 text-white my-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <span className="bg-prepp-yellow text-prepp-navy font-bold px-3 py-1 rounded text-sm uppercase tracking-wider mb-4 inline-block">Prepp+ PRO</span>
            <h2 className="text-4xl font-extrabold mb-4">Unlimited Access to All Mock Tests</h2>
            <ul className="space-y-3 mb-8 text-blue-100">
              <li className="flex gap-3 items-center"><div className="bg-green-500 rounded-full p-0.5"><Clock className="w-3 h-3 text-white" /></div> 10,000+ Mock Tests</li>
              <li className="flex gap-3 items-center"><div className="bg-green-500 rounded-full p-0.5"><Clock className="w-3 h-3 text-white" /></div> Previous Year Papers</li>
              <li className="flex gap-3 items-center"><div className="bg-green-500 rounded-full p-0.5"><Clock className="w-3 h-3 text-white" /></div> Detailed Performance Analytics</li>
            </ul>
            <button className="bg-prepp-yellow text-prepp-navy font-bold px-8 py-3.5 rounded-full hover:bg-yellow-400 transition-colors shadow-[0_4px_14px_0_rgba(255,215,0,0.39)]">
              Get Prepp+ at ₹349/year
            </button>
          </div>
          <div className="flex-1 w-full relative">
            <div className="aspect-video bg-slate-800 rounded-xl border border-slate-700 shadow-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                <BookOpenCheck className="w-24 h-24 text-slate-600 opacity-50" />
                <div className="absolute px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-lg bottom-4 left-4 text-sm font-medium">All India Rank Predictor</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
