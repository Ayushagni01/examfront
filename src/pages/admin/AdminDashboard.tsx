import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, GraduationCap, FileText, HelpCircle, Target, Newspaper, Bell, Loader2 } from 'lucide-react'
import { api } from '../../utils/axiosInstance'

interface Stats {
  totalUsers: number
  totalExams: number
  totalTestSeries: number
  totalQuestions: number
  totalAttempts: number
  totalCurrentAffairs: number
  totalNews: number
}

const statCards = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, gradient: 'from-blue-600 to-blue-400' },
  { key: 'totalExams', label: 'Exams', icon: GraduationCap, gradient: 'from-emerald-600 to-emerald-400' },
  { key: 'totalTestSeries', label: 'Test Series', icon: FileText, gradient: 'from-violet-600 to-violet-400' },
  { key: 'totalQuestions', label: 'Questions', icon: HelpCircle, gradient: 'from-amber-600 to-amber-400' },
  { key: 'totalAttempts', label: 'Test Attempts', icon: Target, gradient: 'from-rose-600 to-rose-400' },
  { key: 'totalCurrentAffairs', label: 'Current Affairs', icon: Newspaper, gradient: 'from-cyan-600 to-cyan-400' },
  { key: 'totalNews', label: 'News Articles', icon: Bell, gradient: 'from-indigo-600 to-indigo-400' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load stats'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className={`bg-gradient-to-br ${card.gradient} rounded-xl p-5 text-white shadow-lg`}
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon className="h-8 w-8 opacity-80" />
              <span className="text-3xl font-extrabold">
                {stats ? (stats as any)[card.key] : 0}
              </span>
            </div>
            <p className="text-sm font-medium opacity-90">{card.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
