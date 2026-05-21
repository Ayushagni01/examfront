import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../../utils/axiosInstance'

interface Exam {
  id: number
  name: string
}

interface TestSeries {
  id: number
  title: string
  slug: string
  description: string
  type: 'FULL_MOCK' | 'SECTIONAL' | 'TOPIC_WISE' | 'PREVIOUS_YEAR'
  totalQuestions: number
  totalMarks: number
  durationMinutes: number
  negativeMarking: number
  languages: string
  accessType: 'FREE' | 'PREMIUM'
  exam: Exam | null
  isActive: boolean
  isLiveTest: boolean
  liveStartAt: string | null
  liveEndAt: string | null
}

const emptyForm = {
  title: '',
  description: '',
  type: 'FULL_MOCK',
  totalQuestions: 25,
  totalMarks: 50.0,
  durationMinutes: 60,
  negativeMarking: 0.25,
  languages: 'English,Hindi',
  accessType: 'FREE',
  examId: '',
  isLiveTest: false,
  liveStartAt: '',
  liveEndAt: '',
  isActive: true
}

export default function ManageTestSeries() {
  const [testSeries, setTestSeries] = useState<TestSeries[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<TestSeries | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [delId, setDelId] = useState<number | null>(null)
  
  // Pagination
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const size = 10

  const loadTestSeries = () => {
    setLoading(true)
    api.get(`/admin/test-series?page=${page}&size=${size}`)
      .then(res => {
        setTestSeries(res.data.content || [])
        setTotalPages(res.data.totalPages || 0)
        setTotalElements(res.data.totalElements || 0)
      })
      .catch(() => setMsg({ text: 'Failed to load test series', type: 'error' }))
      .finally(() => setLoading(false))
  }

  const loadExams = () => {
    api.get('/admin/exams?page=0&size=100')
      .then(res => setExams(res.data.content || []))
      .catch(() => {})
  }

  useEffect(() => {
    loadTestSeries()
  }, [page])

  useEffect(() => {
    loadExams()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({
      ...emptyForm,
      examId: exams[0]?.id ? String(exams[0].id) : ''
    })
    setModal(true)
  }

  const openEdit = (t: TestSeries) => {
    setEditing(t)
    setForm({
      title: t.title || '',
      description: t.description || '',
      type: t.type || 'FULL_MOCK',
      totalQuestions: t.totalQuestions || 0,
      totalMarks: t.totalMarks || 0,
      durationMinutes: t.durationMinutes || 0,
      negativeMarking: t.negativeMarking || 0,
      languages: t.languages || 'English,Hindi',
      accessType: t.accessType || 'FREE',
      examId: t.exam ? String(t.exam.id) : '',
      isLiveTest: t.isLiveTest || false,
      liveStartAt: t.liveStartAt ? t.liveStartAt.substring(0, 16) : '',
      liveEndAt: t.liveEndAt ? t.liveEndAt.substring(0, 16) : '',
      isActive: t.isActive !== false
    })
    setModal(true)
  }

  const save = async () => {
    setSaving(true)
    setMsg({ text: '', type: '' })

    const payload = {
      title: form.title,
      description: form.description,
      type: form.type,
      totalQuestions: form.totalQuestions,
      totalMarks: form.totalMarks,
      durationMinutes: form.durationMinutes,
      negativeMarking: form.negativeMarking,
      languages: form.languages,
      accessType: form.accessType,
      examId: form.examId ? Number(form.examId) : null,
      isLiveTest: form.isLiveTest,
      liveStartAt: form.isLiveTest && form.liveStartAt ? form.liveStartAt : null,
      liveEndAt: form.isLiveTest && form.liveEndAt ? form.liveEndAt : null,
      isActive: form.isActive
    }

    try {
      if (editing) {
        await api.put(`/admin/test-series/${editing.id}`, payload)
        setMsg({ text: 'Test series updated successfully!', type: 'success' })
      } else {
        await api.post('/admin/test-series', payload)
        setMsg({ text: 'Test series created successfully!', type: 'success' })
      }
      setModal(false)
      loadTestSeries()
    } catch (err: any) {
      setMsg({ text: err.response?.data?.message || 'Error saving test series', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const del = async () => {
    if (!delId) return
    try {
      await api.delete(`/admin/test-series/${delId}`)
      setMsg({ text: 'Test series deleted successfully', type: 'success' })
      setDelId(null)
      loadTestSeries()
    } catch {
      setMsg({ text: 'Failed to delete test series', type: 'error' })
      setDelId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Test Series</h1>
          <p className="text-slate-500 text-sm mt-1">{totalElements} test series total</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors shadow-sm">
          <Plus size={16} /> Add Test Series
        </button>
      </div>

      {msg.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
          msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {msg.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Title', 'Type', 'Questions', 'Marks', 'Duration', 'Access', 'Exam', 'Live Test', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {testSeries.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{t.title}</td>
                    <td className="px-4 py-3 text-slate-500">{t.type}</td>
                    <td className="px-4 py-3 text-slate-500">{t.totalQuestions}</td>
                    <td className="px-4 py-3 text-slate-500">{t.totalMarks}</td>
                    <td className="px-4 py-3 text-slate-500">{t.durationMinutes} mins</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        t.accessType === 'FREE' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {t.accessType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{t.exam?.name || 'Global'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        t.isLiveTest ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {t.isLiveTest ? 'LIVE' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        t.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {t.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDelId(t.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-600 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {testSeries.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-slate-400">No test series found</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
                <span className="text-sm text-slate-600">
                  Page <strong className="font-semibold text-slate-800">{page + 1}</strong> of <strong className="font-semibold text-slate-800">{totalPages}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-2 border border-slate-300 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    className="p-2 border border-slate-300 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-xl w-full max-w-2xl shadow-2xl my-8">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">{editing ? 'Edit Test Series' : 'Add Test Series'}</h2>
                <button onClick={() => setModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label>
                  <input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. SSC CGL Mock Test - 1"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Type *</label>
                    <select
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="FULL_MOCK">Full Mock Test</option>
                      <option value="SECTIONAL">Sectional Test</option>
                      <option value="TOPIC_WISE">Topic-wise Test</option>
                      <option value="PREVIOUS_YEAR">Previous Year Paper</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Associated Exam</label>
                    <select
                      value={form.examId}
                      onChange={e => setForm({ ...form, examId: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="">Global / No Exam</option>
                      {exams.map(ex => (
                        <option key={ex.id} value={ex.id}>{ex.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Questions *</label>
                    <input
                      type="number"
                      value={form.totalQuestions}
                      onChange={e => setForm({ ...form, totalQuestions: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Total Marks *</label>
                    <input
                      type="number"
                      value={form.totalMarks}
                      onChange={e => setForm({ ...form, totalMarks: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Duration (Min) *</label>
                    <input
                      type="number"
                      value={form.durationMinutes}
                      onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Negative Mark *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.negativeMarking}
                      onChange={e => setForm({ ...form, negativeMarking: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Languages</label>
                    <input
                      value={form.languages}
                      onChange={e => setForm({ ...form, languages: e.target.value })}
                      placeholder="e.g. English,Hindi"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Access Type *</label>
                    <select
                      value={form.accessType}
                      onChange={e => setForm({ ...form, accessType: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="FREE">FREE</option>
                      <option value="PREMIUM">PREMIUM</option>
                    </select>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isLiveTest}
                      onChange={e => setForm({ ...form, isLiveTest: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-semibold text-slate-700">Is Live Test (scheduled)</span>
                  </label>

                  {form.isLiveTest && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Live Start Time</label>
                        <input
                          type="datetime-local"
                          value={form.liveStartAt}
                          onChange={e => setForm({ ...form, liveStartAt: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Live End Time</label>
                        <input
                          type="datetime-local"
                          value={form.liveEndAt}
                          onChange={e => setForm({ ...form, liveEndAt: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Active</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
                <button
                  onClick={() => setModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving || !form.title}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {delId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6 text-center">
              <Trash2 className="mx-auto h-10 w-10 text-red-500 mb-3" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">Delete Test Series?</h3>
              <p className="text-sm text-slate-500 mb-5">This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDelId(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button onClick={del} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
