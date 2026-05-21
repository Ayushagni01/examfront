import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Loader2, ChevronLeft, ChevronRight, Upload } from 'lucide-react'
import { api } from '../../utils/axiosInstance'

interface Question {
  id: number
  questionTextEn: string
  questionTextHi: string | null
  optionAEn: string
  optionBEn: string
  optionCEn: string
  optionDEn: string
  correctOption: 'A' | 'B' | 'C' | 'D'
  explanationEn: string | null
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  subject: string | null
  topic: string | null
  marks: number
  negativeMarks: number
}

interface TestSeries {
  id: number
  title: string
}

const emptyForm = {
  questionTextEn: '',
  questionTextHi: '',
  optionAEn: '',
  optionBEn: '',
  optionCEn: '',
  optionDEn: '',
  optionAHi: '',
  optionBHi: '',
  optionCHi: '',
  optionDHi: '',
  correctOption: 'A',
  explanationEn: '',
  explanationHi: '',
  difficulty: 'MEDIUM',
  subject: '',
  topic: '',
  marks: 1.0,
  negativeMarks: 0.25
}

export default function ManageQuestions() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [testSeriesList, setTestSeriesList] = useState<TestSeries[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [bulkModal, setBulkModal] = useState(false)
  
  const [editing, setEditing] = useState<Question | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [delId, setDelId] = useState<number | null>(null)
  
  // Bulk Add form
  const [selectedTestSeriesId, setSelectedTestSeriesId] = useState('')
  const [bulkJson, setBulkJson] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)

  // Pagination
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const size = 10

  const loadQuestions = () => {
    setLoading(true)
    api.get(`/admin/questions?page=${page}&size=${size}`)
      .then(res => {
        setQuestions(res.data.content || [])
        setTotalPages(res.data.totalPages || 0)
        setTotalElements(res.data.totalElements || 0)
      })
      .catch(() => setMsg({ text: 'Failed to load questions', type: 'error' }))
      .finally(() => setLoading(false))
  }

  const loadTestSeries = () => {
    api.get('/admin/test-series?page=0&size=100')
      .then(res => setTestSeriesList(res.data.content || []))
      .catch(() => {})
  }

  useEffect(() => {
    loadQuestions()
  }, [page])

  useEffect(() => {
    loadTestSeries()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModal(true)
  }

  const openEdit = (q: Question) => {
    setEditing(q)
    setForm({
      questionTextEn: q.questionTextEn || '',
      questionTextHi: q.questionTextHi || '',
      optionAEn: q.optionAEn || '',
      optionBEn: q.optionBEn || '',
      optionCEn: q.optionCEn || '',
      optionDEn: q.optionDEn || '',
      optionAHi: (q as any).optionAHi || '',
      optionBHi: (q as any).optionBHi || '',
      optionCHi: (q as any).optionCHi || '',
      optionDHi: (q as any).optionDHi || '',
      correctOption: q.correctOption || 'A',
      explanationEn: q.explanationEn || '',
      explanationHi: (q as any).explanationHi || '',
      difficulty: q.difficulty || 'MEDIUM',
      subject: q.subject || '',
      topic: q.topic || '',
      marks: q.marks || 1.0,
      negativeMarks: q.negativeMarks || 0.25
    })
    setModal(true)
  }

  const save = async () => {
    setSaving(true)
    setMsg({ text: '', type: '' })

    try {
      if (editing) {
        await api.put(`/admin/questions/${editing.id}`, form)
        setMsg({ text: 'Question updated successfully!', type: 'success' })
      } else {
        await api.post('/admin/questions', form)
        setMsg({ text: 'Question created successfully!', type: 'success' })
      }
      setModal(false)
      loadQuestions()
    } catch (err: any) {
      setMsg({ text: err.response?.data?.message || 'Error saving question', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleBulkAdd = async () => {
    if (!selectedTestSeriesId || !bulkJson) return
    setBulkLoading(true)
    setMsg({ text: '', type: '' })
    
    try {
      const parsed = JSON.parse(bulkJson)
      if (!Array.isArray(parsed)) {
        throw new Error('JSON must be an array of questions')
      }
      await api.post(`/admin/test-series/${selectedTestSeriesId}/questions`, parsed)
      setMsg({ text: `Successfully bulk added ${parsed.length} questions!`, type: 'success' })
      setBulkModal(false)
      setBulkJson('')
      loadQuestions()
    } catch (err: any) {
      setMsg({ text: err.message || err.response?.data?.message || 'Invalid JSON format or request failed', type: 'error' })
    } finally {
      setBulkLoading(false)
    }
  }

  const del = async () => {
    if (!delId) return
    try {
      await api.delete(`/admin/questions/${delId}`)
      setMsg({ text: 'Question deleted successfully', type: 'success' })
      setDelId(null)
      loadQuestions()
    } catch {
      setMsg({ text: 'Failed to delete question', type: 'error' })
      setDelId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Questions</h1>
          <p className="text-slate-500 text-sm mt-1">{totalElements} questions total</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setBulkModal(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors shadow-sm">
            <Upload size={16} /> Bulk Add to Test Series
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors shadow-sm">
            <Plus size={16} /> Add Question
          </button>
        </div>
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
                  {['ID', 'Question Text', 'Subject', 'Difficulty', 'Correct Option', 'Marks', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questions.map(q => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-500">#{q.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-md truncate">{q.questionTextEn}</td>
                    <td className="px-4 py-3 text-slate-500">{q.subject || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        q.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                        q.difficulty === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-indigo-600">{q.correctOption}</td>
                    <td className="px-4 py-3 text-slate-500">{q.marks}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(q)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDelId(q.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-600 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {questions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">No questions found</td>
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

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-xl w-full max-w-3xl shadow-2xl my-8">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">{editing ? 'Edit Question' : 'Add Question'}</h2>
                <button onClick={() => setModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Question (English) *</label>
                    <textarea
                      value={form.questionTextEn}
                      onChange={e => setForm({ ...form, questionTextEn: e.target.value })}
                      rows={3}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Question (Hindi)</label>
                    <textarea
                      value={form.questionTextHi}
                      onChange={e => setForm({ ...form, questionTextHi: e.target.value })}
                      rows={3}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <h3 className="text-sm font-bold text-slate-700">Options (English)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Option A *</label>
                      <input value={form.optionAEn} onChange={e => setForm({ ...form, optionAEn: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Option B *</label>
                      <input value={form.optionBEn} onChange={e => setForm({ ...form, optionBEn: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Option C *</label>
                      <input value={form.optionCEn} onChange={e => setForm({ ...form, optionCEn: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Option D *</label>
                      <input value={form.optionDEn} onChange={e => setForm({ ...form, optionDEn: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white" />
                    </div>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <h3 className="text-sm font-bold text-slate-700">Options (Hindi)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Option A (Hindi)</label>
                      <input value={form.optionAHi} onChange={e => setForm({ ...form, optionAHi: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Option B (Hindi)</label>
                      <input value={form.optionBHi} onChange={e => setForm({ ...form, optionBHi: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Option C (Hindi)</label>
                      <input value={form.optionCHi} onChange={e => setForm({ ...form, optionCHi: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Option D (Hindi)</label>
                      <input value={form.optionDHi} onChange={e => setForm({ ...form, optionDHi: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Correct Option *</label>
                    <select
                      value={form.correctOption}
                      onChange={e => setForm({ ...form, correctOption: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Difficulty *</label>
                    <select
                      value={form.difficulty}
                      onChange={e => setForm({ ...form, difficulty: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                    <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g. History" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Topic</label>
                    <input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Modern India" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Marks</label>
                    <input type="number" step="0.1" value={form.marks} onChange={e => setForm({ ...form, marks: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Negative Marks</label>
                    <input type="number" step="0.05" value={form.negativeMarks} onChange={e => setForm({ ...form, negativeMarks: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Explanation (English)</label>
                    <textarea value={form.explanationEn} onChange={e => setForm({ ...form, explanationEn: e.target.value })} rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Explanation (Hindi)</label>
                    <textarea value={form.explanationHi} onChange={e => setForm({ ...form, explanationHi: e.target.value })} rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
                <button onClick={() => setModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button
                  onClick={save}
                  disabled={saving || !form.questionTextEn || !form.optionAEn || !form.optionBEn || !form.optionCEn || !form.optionDEn}
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

      {/* Bulk Add Modal */}
      <AnimatePresence>
        {bulkModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-xl w-full max-w-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                <h3 className="text-lg font-bold text-slate-800">Bulk Add Questions</h3>
                <button onClick={() => setBulkModal(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Target Test Series *</label>
                  <select
                    value={selectedTestSeriesId}
                    onChange={e => setSelectedTestSeriesId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select Test Series</option>
                    {testSeriesList.map(ts => (
                      <option key={ts.id} value={ts.id}>{ts.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Questions JSON Array *</label>
                  <textarea
                    value={bulkJson}
                    onChange={e => setBulkJson(e.target.value)}
                    rows={10}
                    placeholder={`[\n  {\n    "questionTextEn": "What is the capital of India?",\n    "optionAEn": "Mumbai", "optionBEn": "New Delhi", "optionCEn": "Kolkata", "optionDEn": "Chennai",\n    "correctOption": "B",\n    "explanationEn": "New Delhi has been the capital since 1911."\n  }\n]`}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 mt-6">
                <button onClick={() => setBulkModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button
                  onClick={handleBulkAdd}
                  disabled={bulkLoading || !selectedTestSeriesId || !bulkJson}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {bulkLoading && <Loader2 size={14} className="animate-spin" />} Bulk Upload
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
              <h3 className="text-lg font-bold text-slate-800 mb-1">Delete Question?</h3>
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
