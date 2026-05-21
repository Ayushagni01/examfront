import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../../utils/axiosInstance'

interface CurrentAffairs {
  id: number
  title: string
  content: string
  summary: string | null
  category: 'NATIONAL' | 'INTERNATIONAL' | 'ECONOMY' | 'SPORTS' | 'SCIENCE' | 'AWARDS' | 'POLITICS' | 'ENVIRONMENT' | 'DEFENCE' | 'ART_CULTURE'
  sourceUrl: string | null
  imageUrl: string | null
  publishedDate: string
  isActive: boolean
  viewCount: number
}

const emptyForm = {
  title: '',
  content: '',
  summary: '',
  category: 'NATIONAL',
  sourceUrl: '',
  imageUrl: '',
  publishedDate: new Date().toISOString().substring(0, 10),
  isActive: true
}

export default function ManageCurrentAffairs() {
  const [items, setItems] = useState<CurrentAffairs[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<CurrentAffairs | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [delId, setDelId] = useState<number | null>(null)

  // Pagination
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const size = 10

  const loadItems = () => {
    setLoading(true)
    api.get(`/admin/current-affairs?page=${page}&size=${size}`)
      .then(res => {
        setItems(res.data.content || [])
        setTotalPages(res.data.totalPages || 0)
        setTotalElements(res.data.totalElements || 0)
      })
      .catch(() => setMsg({ text: 'Failed to load current affairs', type: 'error' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadItems()
  }, [page])

  const openCreate = () => {
    setEditing(null)
    setForm({
      ...emptyForm,
      publishedDate: new Date().toISOString().substring(0, 10)
    })
    setModal(true)
  }

  const openEdit = (item: CurrentAffairs) => {
    setEditing(item)
    setForm({
      title: item.title || '',
      content: item.content || '',
      summary: item.summary || '',
      category: item.category || 'NATIONAL',
      sourceUrl: item.sourceUrl || '',
      imageUrl: item.imageUrl || '',
      publishedDate: item.publishedDate ? item.publishedDate.substring(0, 10) : new Date().toISOString().substring(0, 10),
      isActive: item.isActive !== false
    })
    setModal(true)
  }

  const save = async () => {
    setSaving(true)
    setMsg({ text: '', type: '' })

    try {
      if (editing) {
        await api.put(`/admin/current-affairs/${editing.id}`, form)
        setMsg({ text: 'Current affairs item updated!', type: 'success' })
      } else {
        await api.post('/admin/current-affairs', form)
        setMsg({ text: 'Current affairs item created!', type: 'success' })
      }
      setModal(false)
      loadItems()
    } catch (err: any) {
      setMsg({ text: err.response?.data?.message || 'Error saving item', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const del = async () => {
    if (!delId) return
    try {
      await api.delete(`/admin/current-affairs/${delId}`)
      setMsg({ text: 'Item deleted successfully', type: 'success' })
      setDelId(null)
      loadItems()
    } catch {
      setMsg({ text: 'Failed to delete item', type: 'error' })
      setDelId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Current Affairs</h1>
          <p className="text-slate-500 text-sm mt-1">{totalElements} items total</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors shadow-sm">
          <Plus size={16} /> Add Current Affairs
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
                  {['Title', 'Category', 'Published Date', 'Views', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-md truncate">{item.title}</td>
                    <td className="px-4 py-3 text-slate-500">{item.category}</td>
                    <td className="px-4 py-3 text-slate-500">{item.publishedDate}</td>
                    <td className="px-4 py-3 text-slate-500">{item.viewCount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDelId(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-600 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No items found</td>
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
                <h2 className="text-lg font-bold text-slate-800">{editing ? 'Edit Current Affairs' : 'Add Current Affairs'}</h2>
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
                    placeholder="e.g. India Successfully Launches Chandrayaan-4"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Summary</label>
                  <input
                    value={form.summary}
                    onChange={e => setForm({ ...form, summary: e.target.value })}
                    placeholder="Brief 1-sentence summary"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Content *</label>
                  <textarea
                    value={form.content}
                    onChange={e => setForm({ ...form, content: e.target.value })}
                    rows={6}
                    placeholder="Main article body text..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Category *</label>
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value as any })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="NATIONAL">NATIONAL</option>
                      <option value="INTERNATIONAL">INTERNATIONAL</option>
                      <option value="ECONOMY">ECONOMY</option>
                      <option value="SPORTS">SPORTS</option>
                      <option value="SCIENCE">SCIENCE</option>
                      <option value="AWARDS">AWARDS</option>
                      <option value="POLITICS">POLITICS</option>
                      <option value="ENVIRONMENT">ENVIRONMENT</option>
                      <option value="DEFENCE">DEFENCE</option>
                      <option value="ART_CULTURE">ART_CULTURE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Published Date *</label>
                    <input
                      type="date"
                      value={form.publishedDate}
                      onChange={e => setForm({ ...form, publishedDate: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Image URL</label>
                    <input
                      value={form.imageUrl}
                      onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Source URL</label>
                    <input
                      value={form.sourceUrl}
                      onChange={e => setForm({ ...form, sourceUrl: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
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
                  disabled={saving || !form.title || !form.content}
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
              <h3 className="text-lg font-bold text-slate-800 mb-1">Delete Item?</h3>
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
