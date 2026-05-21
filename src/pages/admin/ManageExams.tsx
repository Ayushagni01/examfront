import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../../utils/axiosInstance'

interface Category {
  id: number
  name: string
}

interface Exam {
  id: number
  name: string
  fullName: string
  description: string
  conductingBody: string
  eligibility: string
  examDate: string | null
  applicationStart: string | null
  applicationEnd: string | null
  vacancyCount: number | null
  isFeatured: boolean
  isActive: boolean
  category: Category | null
}

const emptyForm = {
  name: '',
  fullName: '',
  description: '',
  conductingBody: '',
  eligibility: '',
  examDate: '',
  applicationStart: '',
  applicationEnd: '',
  vacancyCount: 0,
  isFeatured: false,
  isActive: true,
  categoryId: ''
}

export default function ManageExams() {
  const [exams, setExams] = useState<Exam[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Exam | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [delId, setDelId] = useState<number | null>(null)
  
  // Pagination
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const size = 10

  const loadExams = () => {
    setLoading(true)
    api.get(`/admin/exams?page=${page}&size=${size}`)
      .then(res => {
        setExams(res.data.content || [])
        setTotalPages(res.data.totalPages || 0)
        setTotalElements(res.data.totalElements || 0)
      })
      .catch(() => setMsg({ text: 'Failed to load exams', type: 'error' }))
      .finally(() => setLoading(false))
  }

  const loadCategories = () => {
    api.get('/admin/categories')
      .then(res => setCategories(res.data || []))
      .catch(() => {})
  }

  useEffect(() => {
    loadExams()
  }, [page])

  useEffect(() => {
    loadCategories()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({
      ...emptyForm,
      categoryId: categories[0]?.id ? String(categories[0].id) : ''
    })
    setModal(true)
  }

  const openEdit = (e: Exam) => {
    setEditing(e)
    setForm({
      name: e.name || '',
      fullName: e.fullName || '',
      description: e.description || '',
      conductingBody: e.conductingBody || '',
      eligibility: e.eligibility || '',
      examDate: e.examDate ? e.examDate.substring(0, 10) : '',
      applicationStart: e.applicationStart ? e.applicationStart.substring(0, 10) : '',
      applicationEnd: e.applicationEnd ? e.applicationEnd.substring(0, 10) : '',
      vacancyCount: e.vacancyCount || 0,
      isFeatured: e.isFeatured || false,
      isActive: e.isActive !== false,
      categoryId: e.category ? String(e.category.id) : ''
    })
    setModal(true)
  }

  const save = async () => {
    setSaving(true)
    setMsg({ text: '', type: '' })
    
    const payload = {
      name: form.name,
      fullName: form.fullName,
      description: form.description,
      conductingBody: form.conductingBody,
      eligibility: form.eligibility,
      examDate: form.examDate || null,
      applicationStart: form.applicationStart || null,
      applicationEnd: form.applicationEnd || null,
      vacancyCount: form.vacancyCount || null,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
      category: form.categoryId ? { id: Number(form.categoryId) } : null
    }

    try {
      if (editing) {
        await api.put(`/admin/exams/${editing.id}`, payload)
        setMsg({ text: 'Exam updated successfully!', type: 'success' })
      } else {
        await api.post('/admin/exams', payload)
        setMsg({ text: 'Exam created successfully!', type: 'success' })
      }
      setModal(false)
      loadExams()
    } catch (err: any) {
      setMsg({ text: err.response?.data?.message || 'Error saving exam', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const del = async () => {
    if (!delId) return
    try {
      await api.delete(`/admin/exams/${delId}`)
      setMsg({ text: 'Exam deleted successfully', type: 'success' })
      setDelId(null)
      loadExams()
    } catch {
      setMsg({ text: 'Failed to delete exam', type: 'error' })
      setDelId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Exams</h1>
          <p className="text-slate-500 text-sm mt-1">{totalElements} exams total</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors shadow-sm">
          <Plus size={16} /> Add Exam
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
                  {['Name', 'Full Name', 'Category', 'Exam Date', 'Vacancies', 'Featured', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{e.name}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{e.fullName}</td>
                    <td className="px-4 py-3 text-slate-500">{e.category?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-slate-500">{e.examDate || 'N/A'}</td>
                    <td className="px-4 py-3 text-slate-500">{e.vacancyCount ?? 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        e.isFeatured ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {e.isFeatured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        e.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {e.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(e)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDelId(e.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-600 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {exams.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">No exams found</td>
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
                <h2 className="text-lg font-bold text-slate-800">{editing ? 'Edit Exam' : 'Add Exam'}</h2>
                <button onClick={() => setModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Name (Code) *</label>
                    <input
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. SSC CGL"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      value={form.fullName}
                      onChange={e => setForm({ ...form, fullName: e.target.value })}
                      placeholder="e.g. Combined Graduate Level Examination"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={form.categoryId}
                    onChange={e => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
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
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Conducting Body</label>
                    <input
                      value={form.conductingBody}
                      onChange={e => setForm({ ...form, conductingBody: e.target.value })}
                      placeholder="e.g. SSC"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Vacancy Count</label>
                    <input
                      type="number"
                      value={form.vacancyCount}
                      onChange={e => setForm({ ...form, vacancyCount: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Eligibility Criteria</label>
                  <input
                    value={form.eligibility}
                    onChange={e => setForm({ ...form, eligibility: e.target.value })}
                    placeholder="e.g. Graduation"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Exam Date</label>
                    <input
                      type="date"
                      value={form.examDate}
                      onChange={e => setForm({ ...form, examDate: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">App. Start Date</label>
                    <input
                      type="date"
                      value={form.applicationStart}
                      onChange={e => setForm({ ...form, applicationStart: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">App. End Date</label>
                    <input
                      type="date"
                      value={form.applicationEnd}
                      onChange={e => setForm({ ...form, applicationEnd: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Featured Exam</span>
                  </label>
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
                  disabled={saving || !form.name || !form.fullName || !form.categoryId}
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
              <h3 className="text-lg font-bold text-slate-800 mb-1">Delete Exam?</h3>
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
