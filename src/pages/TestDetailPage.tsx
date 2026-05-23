import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, BookOpenCheck, Users, Star, Lock, Zap, ArrowRight, ChevronLeft, Shield, AlertTriangle } from 'lucide-react'
import { api } from '../utils/axiosInstance'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store/store'
import { setCredentials } from '../store/authSlice'

export default function TestDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth)
  const [test, setTest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/test-series/${id}`).then(res => setTest(res.data)).catch(() => setError('Test not found.')).finally(() => setLoading(false))
  }, [id])

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleBuySubscription = async () => {
    setPaying(true)
    setError('')

    try {
      const res = await api.post('/payments/create-order')
      const { orderId, amount, currency, mock, keyId } = res.data

      if (mock || orderId.startsWith('order_mock_')) {
        const confirmPayment = window.confirm(
          `[DEVELOPER MODE: Simulated Checkout]\n\nDo you want to simulate a successful payment of ₹${amount} for Prepp+ Annual Subscription?`
        )
        if (confirmPayment) {
          try {
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: orderId,
              razorpay_payment_id: 'pay_mock_' + Date.now(),
              razorpay_signature: 'signature_mock_value',
            })

            // Fetch updated user info
            const profileRes = await api.get('/auth/me')
            dispatch(setCredentials({
              user: profileRes.data,
              token: token || ''
            }))

            alert('Congratulations! ' + verifyRes.data.message)
          } catch (err: any) {
            setError(err.response?.data?.message || 'Mock payment verification failed.')
          } finally {
            setPaying(false)
          }
        } else {
          setPaying(false)
        }
        return
      }

      // If not mock, proceed to load Razorpay script and open modal
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        setError('Failed to load Razorpay SDK. Are you online?')
        setPaying(false)
        return
      }

      const options = {
        key: keyId || 'rzp_test_placeholder',
        amount: amount * 100,
        currency: currency,
        name: 'IndiaExamPrep',
        description: 'Prepp+ Annual Subscription',
        order_id: orderId,
        handler: async function (response: any) {
          setPaying(true)
          try {
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })

            // Fetch updated user info
            const profileRes = await api.get('/auth/me')
            dispatch(setCredentials({
              user: profileRes.data,
              token: token || ''
            }))

            alert('Congratulations! ' + verifyRes.data.message)
          } catch (err: any) {
            setError(err.response?.data?.message || 'Payment verification failed.')
          } finally {
            setPaying(false)
          }
        },
        prefill: {
          name: user?.name || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#0f172a',
        },
        modal: {
          ondismiss: function () {
            setPaying(false)
          }
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initiate payment. Please try again.')
      setPaying(false)
    }
  }

  const handleStart = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    setStarting(true)
    setError('')
    try {
      const res = await api.post(`/test-series/${id}/start`)
      navigate(`/test/${id}/attempt/${res.data.attemptId}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start test. Please try again.')
      setStarting(false)
    }
  }

  const isPremiumUser = user?.subscriptionType === 'PREMIUM' || user?.role === 'ROLE_PREMIUM' || user?.role === 'ROLE_ADMIN'
  const isLocked = test?.accessType === 'PREMIUM' && !isPremiumUser

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prepp-navy"></div></div>
  if (error && !test) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-red-500 font-semibold">{error}</p></div>
  if (!test) return null

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-prepp-navy text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/test-series" className="inline-flex items-center gap-1 text-blue-200 hover:text-white text-sm mb-4"><ChevronLeft className="h-4 w-4" />Back to Tests</Link>
          <h1 className="text-3xl font-extrabold">{test.title}</h1>
          <p className="text-blue-100 mt-2">{test.description}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Test info */}
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-100">
            {[
              { label: 'Questions', value: test.totalQuestions, icon: <BookOpenCheck className="h-5 w-5 text-blue-500" /> },
              { label: 'Duration', value: `${test.durationMinutes} min`, icon: <Clock className="h-5 w-5 text-emerald-500" /> },
              { label: 'Total Marks', value: test.totalMarks, icon: <Star className="h-5 w-5 text-amber-500" /> },
              { label: 'Attempts', value: test.attemptCount?.toLocaleString() || 0, icon: <Users className="h-5 w-5 text-purple-500" /> },
            ].map(s => (
              <div key={s.label} className="text-center p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-center mb-2">{s.icon}</div>
                <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                <div className="text-xs text-slate-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Rules */}
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Shield className="h-5 w-5 text-prepp-navy" />Test Rules</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span>Each correct answer carries <strong>+{(test.totalMarks / test.totalQuestions).toFixed(1)}</strong> marks</li>
              <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span>Each wrong answer deducts <strong>{test.negativeMarking}</strong> marks (negative marking)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Unanswered questions carry <strong>0</strong> marks</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>You can mark questions for review and come back later</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Test auto-submits when the timer expires</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Languages: <strong>{test.languages}</strong></li>
            </ul>
          </div>

          {/* CTA */}
          <div className="p-6 bg-slate-50 border-t border-slate-100">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl p-4 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            
            {!isAuthenticated ? (
              <div>
                {test.accessType === 'PREMIUM' && (
                  <div className="bg-amber-50/80 border border-amber-200 text-amber-800 text-sm font-medium rounded-xl p-4 mb-4 flex items-center gap-2.5">
                    <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                    This is a Premium test. Please login to purchase or attempt it.
                  </div>
                )}
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-prepp-navy hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                  Login to Start <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            ) : isLocked ? (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-tr from-amber-500 to-orange-600 text-white p-3 rounded-xl shadow-md">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2 flex-wrap">
                      Unlock Prepp+ Annual Subscription
                      <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        Premium
                      </span>
                    </h4>
                    <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">
                      Get instant access to this test and unlock 500+ other premium test series, expert bilingual analysis, and detailed explanations.
                    </p>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-slate-800">₹349</span>
                      <span className="text-slate-400 text-sm font-medium">/ Year</span>
                      <span className="text-slate-300 mx-1">|</span>
                      <span className="text-emerald-600 text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                        Save 75%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleBuySubscription}
                    disabled={paying}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {paying ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        Unlock Prepp+ Now <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {test.accessType === 'PREMIUM' && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium rounded-xl p-4 mb-4 flex items-center gap-2.5">
                    <Zap className="h-4 w-4 text-emerald-600 shrink-0" />
                    You have unlocked this test with your active Prepp+ Premium subscription!
                  </div>
                )}
                <button
                  onClick={handleStart}
                  disabled={starting}
                  className="w-full bg-prepp-navy hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
                >
                  {starting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      Start Test <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
