import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, ChevronLeft, ChevronRight, Bookmark, LayoutGrid, Send } from 'lucide-react'
import { api } from '../utils/axiosInstance'

export default function TestInterface() {
  const { testSeriesId, attemptId } = useParams()
  const navigate = useNavigate()

  const [testTitle, setTestTitle] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [startedAt, setStartedAt] = useState<string | null>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [markedReview, setMarkedReview] = useState<Record<number, boolean>>({})
  const [responses, setResponses] = useState<Record<number, string>>({})
  const [visited, setVisited] = useState<Record<number, boolean>>({})
  const [timeLeft, setTimeLeft] = useState(3600)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const timePerQuestion = useRef<Record<number, number>>({})
  const lastVisitTime = useRef<number>(Date.now())
  const autoSaveTimer = useRef<any>(null)

  // Load test data from API
  useEffect(() => {
    const loadTest = async () => {
      try {
        const res = await api.post(`/test-series/${testSeriesId}/start`)
        const data = res.data
        setTestTitle(data.testTitle)
        setDurationMinutes(data.durationMinutes)
        setStartedAt(data.startedAt)
        setQuestions(data.questions || [])

        // Restore saved responses
        if (data.savedResponses) {
          setResponses(data.savedResponses)
        }
        if (data.markedReview) {
          setMarkedReview(data.markedReview)
        }

        // Calculate remaining time from server startedAt
        const started = new Date(data.startedAt).getTime()
        const totalMs = data.durationMinutes * 60 * 1000
        const elapsed = Date.now() - started
        const remaining = Math.max(0, Math.floor((totalMs - elapsed) / 1000))
        setTimeLeft(remaining)
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to load test')
        navigate('/test-series')
      } finally {
        setLoading(false)
      }
    }
    loadTest()
  }, [testSeriesId])

  // Timer (server-synced)
  useEffect(() => {
    if (loading || timeLeft <= 0) return
    const timerId = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerId)
          handleAutoSubmit()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerId)
  }, [loading])

  // Track time per question
  useEffect(() => {
    lastVisitTime.current = Date.now()
    return () => {
      if (questions[currentIndex]) {
        const qId = questions[currentIndex].questionId
        const spent = Math.floor((Date.now() - lastVisitTime.current) / 1000)
        timePerQuestion.current[qId] = (timePerQuestion.current[qId] || 0) + spent
      }
    }
  }, [currentIndex, questions])

  // Mark visited
  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex]) {
      const qId = questions[currentIndex].questionId
      if (!visited[qId]) setVisited(prev => ({ ...prev, [qId]: true }))
    }
  }, [currentIndex, questions])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const saveResponseToServer = useCallback((qId: number, option: string | null, isReview: boolean) => {
    api.put(`/test-series/attempts/${attemptId}/response`, {
      questionId: qId,
      selectedOption: option,
      isMarkedReview: isReview,
      timeSpentSeconds: timePerQuestion.current[qId] || 0
    }).catch(console.error)
  }, [attemptId])

  const handleOptionSelect = (option: string) => {
    const qId = questions[currentIndex].questionId
    setResponses(prev => ({ ...prev, [qId]: option }))
    saveResponseToServer(qId, option, markedReview[qId] || false)
  }

  const handleClear = () => {
    const qId = questions[currentIndex].questionId
    setResponses(prev => { const n = { ...prev }; delete n[qId]; return n })
    saveResponseToServer(qId, null, markedReview[qId] || false)
  }

  const handleMarkReview = () => {
    const qId = questions[currentIndex].questionId
    const newVal = !markedReview[qId]
    setMarkedReview(prev => ({ ...prev, [qId]: newVal }))
    if (responses[qId]) saveResponseToServer(qId, responses[qId], newVal)
  }

  const handleSaveAndNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1)
  }

  const handleAutoSubmit = async () => {
    try {
      const res = await api.post(`/test-series/attempts/${attemptId}/submit`)
      navigate(`/test-result/${attemptId}`, { state: res.data })
    } catch { navigate('/test-series') }
  }

  const submitTest = async () => {
    if (!confirm('Are you sure you want to submit the test? You cannot change your answers after submission.')) return
    setSubmitting(true)
    try {
      const res = await api.post(`/test-series/attempts/${attemptId}/submit`)
      navigate(`/test-result/${attemptId}`, { state: res.data })
    } catch (err: any) {
      alert(err.response?.data?.message || 'Submit failed')
      setSubmitting(false)
    }
  }

  const getQuestionStatusClass = (idx: number) => {
    const q = questions[idx]
    if (!q) return 'bg-slate-200 text-slate-600'
    const qId = q.questionId
    if (responses[qId] && markedReview[qId]) return 'bg-purple-600 text-white border-purple-800'
    if (responses[qId]) return 'bg-green-500 text-white border-green-600'
    if (markedReview[qId]) return 'bg-purple-100 text-purple-700 border-purple-400'
    if (visited[qId] && !responses[qId]) return 'bg-red-500 text-white border-red-600'
    return 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prepp-navy"></div></div>
  if (questions.length === 0) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-slate-500">No questions found for this test.</p></div>

  const currentQ = questions[currentIndex]
  const sections = Array.from(new Set(questions.map(q => q.section)))
  const isUrgent = timeLeft < 300

  const answered = Object.keys(responses).length
  const reviewCount = Object.values(markedReview).filter(Boolean).length

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-prepp-navy text-white px-4 py-3 flex justify-between items-center shadow-md z-30">
        <h1 className="font-bold text-lg md:text-xl truncate max-w-xl">{testTitle}</h1>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex gap-3 text-xs font-semibold">
            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded">{answered}/{questions.length} answered</span>
            {reviewCount > 0 && <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">{reviewCount} review</span>}
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isUrgent ? 'bg-red-900/80 border-red-600 animate-pulse' : 'bg-slate-800/80 border-slate-700'}`}>
            <Clock className={`h-5 w-5 ${isUrgent ? 'text-red-400' : 'text-prepp-yellow'}`} />
            <span className={`font-mono text-lg font-bold tracking-wider ${isUrgent ? 'text-red-300' : ''}`}>{formatTime(timeLeft)}</span>
          </div>
          <button onClick={() => setShowPalette(!showPalette)} className="lg:hidden bg-slate-700 p-2 rounded-lg"><LayoutGrid className="h-5 w-5" /></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
        {/* Left: Questions */}
        <div className="w-full lg:w-3/4 flex flex-col pt-2 px-2 overflow-y-auto pb-24 lg:pb-2">
          {/* Section Tabs */}
          <div className="flex overflow-x-auto gap-2 p-2 bg-white rounded-t-xl border border-slate-200 border-b-0 hide-scrollbar">
            {sections.map(sec => (
              <button key={sec} onClick={() => { const idx = questions.findIndex(q => q.section === sec); if (idx !== -1) setCurrentIndex(idx) }}
                className={`whitespace-nowrap px-4 py-2 rounded font-semibold text-sm transition-colors ${currentQ?.section === sec ? 'bg-blue-50 text-prepp-navy border-b-2 border-prepp-navy' : 'text-slate-500 hover:bg-slate-50'}`}>{sec}</button>
            ))}
          </div>

          <div className="flex-1 bg-white p-6 border border-slate-200 rounded-b-xl shadow-sm flex flex-col relative">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <span className="font-bold text-lg text-slate-800">Question {currentIndex + 1}</span>
              <div className="flex gap-2">
                <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded font-medium">+{currentQ.marks?.toFixed(1) || '1.0'}</span>
                <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded font-medium">-{currentQ.marks ? (currentQ.marks * 0.25).toFixed(2) : '0.25'}</span>
              </div>
            </div>

            <div className="prose max-w-none mb-8">
              <p className="text-lg text-slate-700 font-medium leading-relaxed">{currentQ.questionTextEn}</p>
              {currentQ.questionImageUrl && <img src={currentQ.questionImageUrl} alt="Question" className="max-w-md rounded-lg mt-4" />}
            </div>

            <div className="space-y-3 max-w-3xl">
              {['A', 'B', 'C', 'D'].map(opt => {
                const optKey = `option${opt}En` as keyof typeof currentQ
                const isSelected = responses[currentQ.questionId] === opt
                return (
                  <button key={opt} onClick={() => handleOptionSelect(opt)}
                    className={`w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all ${isSelected ? 'bg-blue-50 border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,1)]' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-sm font-bold shrink-0 ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 text-slate-500'}`}>{opt}</div>
                    <span className={`text-slate-700 ${isSelected ? 'font-medium' : ''}`}>{currentQ[optKey]}</span>
                  </button>
                )
              })}
            </div>

            {/* Bottom actions */}
            <div className="fixed lg:absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 flex justify-between items-center z-10">
              <div className="flex gap-2">
                <button onClick={handleMarkReview} className="border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold text-slate-700 text-sm flex items-center gap-2">
                  <Bookmark className={`h-4 w-4 ${markedReview[currentQ.questionId] ? 'fill-prepp-yellow text-prepp-yellow' : ''}`} /><span className="hidden sm:inline">Mark Review</span></button>
                <button onClick={handleClear} className="border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold text-slate-700 text-sm hidden sm:block">Clear</button>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}
                  className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 px-4 py-2 rounded-lg font-bold flex items-center transition-colors"><ChevronLeft className="h-5 w-5" /></button>
                <button onClick={handleSaveAndNext}
                  className="bg-prepp-navy hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-premium">Save & Next<ChevronRight className="h-5 w-5" /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Question palette */}
        <div className={`${showPalette ? 'fixed inset-0 z-40 bg-black/50 lg:bg-transparent lg:static' : 'hidden'} lg:flex w-full lg:w-1/4`} onClick={() => setShowPalette(false)}>
          <div className={`${showPalette ? 'absolute right-0 top-0 h-full w-80' : ''} lg:w-full bg-white border-l border-slate-200 flex flex-col`} onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><LayoutGrid className="h-4 w-4" />Question Palette</h3>
            </div>
            <div className="p-4 text-xs font-semibold text-slate-600 grid grid-cols-2 gap-y-3 gap-x-2 border-b border-slate-100">
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-green-500 border border-green-600 text-white flex items-center justify-center">✓</div>Answered</div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-red-500 border border-red-600 text-white flex items-center justify-center">✗</div>Not Answered</div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-white border border-slate-300 text-slate-600 flex items-center justify-center">○</div>Not Visited</div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-purple-100 border-purple-400 text-purple-700 flex items-center justify-center">★</div>Review</div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, idx) => (
                  <button key={idx} onClick={() => { setCurrentIndex(idx); setShowPalette(false) }}
                    className={`w-9 h-9 rounded text-sm font-bold flex items-center justify-center border transition-all ${getQuestionStatusClass(idx)} ${currentIndex === idx ? 'ring-2 ring-prepp-navy ring-offset-1' : ''}`}>{idx + 1}</button>
                ))}
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <button onClick={submitTest} disabled={submitting}
                className="w-full bg-prepp-yellow hover:bg-yellow-400 text-prepp-navy font-extrabold py-3 rounded-lg shadow-[0_4px_14px_0_rgba(255,215,0,0.39)] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {submitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-prepp-navy"></div> : <><Send className="h-5 w-5" />SUBMIT TEST</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
