import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store/store'
import { setCredentials } from '../store/authSlice'
import { 
  Check, 
  X, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  HelpCircle, 
  ChevronDown, 
  CreditCard 
} from 'lucide-react'
import { api } from '../utils/axiosInstance'

export default function PricingPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const isPremiumUser = user?.subscriptionType === 'PREMIUM' || user?.role === 'ROLE_PREMIUM' || user?.role === 'ROLE_ADMIN'

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setPaying(true)
    setError('')

    try {
      const res = await api.post('/payments/create-order')
      const { orderId, amount, currency, mock, keyId } = res.data

      // Developer Mode Simulation Check
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

            // Sync user state
            const profileRes = await api.get('/auth/me')
            dispatch(setCredentials({
              user: profileRes.data,
              token: token || ''
            }))

            alert('Congratulations! ' + verifyRes.data.message)
            navigate('/dashboard')
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

      // Live Mode Razorpay SDK Checkout
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

            // Sync user state
            const profileRes = await api.get('/auth/me')
            dispatch(setCredentials({
              user: profileRes.data,
              token: token || ''
            }))

            alert('Congratulations! ' + verifyRes.data.message)
            navigate('/dashboard')
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
          color: '#004085',
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
      setError(err.response?.data?.message || 'Failed to initiate payment order. Please try again.')
      setPaying(false)
    }
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="bg-blue-50 text-prepp-navy font-bold px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider border border-blue-100 shadow-sm inline-block mb-4">
            Pricing Plans
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
            Invest in your <span className="text-prepp-navy">Future Career</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Choose a plan that fits your study needs. Upgrade to unlock all premium mock tests, syllabus guides, and detailed ranking metrics.
          </p>
        </div>

        {/* Pricing Card Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16 items-stretch">
          
          {/* Free Tier */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between hover:shadow-premium transition-all duration-300">
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-700">Free Pass</h3>
                <p className="text-slate-400 text-sm mt-1">Get started with basic prep material.</p>
              </div>
              
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-800">₹0</span>
                <span className="text-slate-400 text-sm font-semibold">/ Always Free</span>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Access to 2 Free Mock Tests',
                  'Basic results evaluation after submission',
                  'Access to Daily Current Affairs articles',
                  'Latest exam vacancy notifications',
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check className="h-4.5 w-4.5 text-green-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
                {[
                  'Bilingual solutions & explanations',
                  'Performance rank & percentile predictor',
                  'Weak-area analyzer & recommendations',
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                    <X className="h-4.5 w-4.5 text-slate-300 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/exams"
              className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-all block"
            >
              Start Free Practice
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="bg-white rounded-2xl border-2 border-amber-400 p-8 shadow-premium flex flex-col justify-between relative overflow-hidden transform md:-translate-y-2 hover:shadow-premium-hover transition-all duration-300">
            {/* Ribbon */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white font-bold text-[10px] uppercase tracking-wider py-1.5 px-8 translate-x-[28%] translate-y-[100%] rotate-45 shadow-sm">
              Popular
            </div>

            <div>
              <div className="mb-6">
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="text-xl font-bold text-slate-800">Prepp+ Premium Pass</h3>
                  <Sparkles className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-slate-500 text-sm">Full all-access pass to crack government jobs.</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-800">₹349</span>
                  <span className="text-slate-400 text-sm font-semibold">/ Year</span>
                </div>
                <div className="text-xs text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-0.5 rounded-full border border-emerald-100 mt-2">
                  Save 75% (Originally ₹1,399)
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Unlock 10,000+ Mock Tests & PYQs',
                  'Unlimited access to ALL exam prep categories',
                  'Complete bilingual explanations & review',
                  'Rank & percentile analysis vs all-India toppers',
                  'Detailed subject-wise accuracy metrics',
                  'Ad-free premium platform experience',
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <Check className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="font-medium">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg p-3 mb-4 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {isPremiumUser ? (
              <div className="w-full text-center bg-emerald-50 text-emerald-700 font-bold py-3.5 rounded-xl border border-emerald-200 flex items-center justify-center gap-1">
                <Check className="h-5 w-5" /> Plan Active
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={paying}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:pointer-events-none"
              >
                {paying ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" /> Unlock Prepp+ Now <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-16 max-w-4xl mx-auto">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-lg">Compare Features</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 font-semibold text-slate-600">
                  <th className="p-4">Feature</th>
                  <th className="p-4 w-32 text-center">Free Pass</th>
                  <th className="p-4 w-36 text-center text-prepp-navy bg-blue-50/50">Prepp+ Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {[
                  { name: '10,000+ Mock Tests & PYQs', free: 'Limited (2 tests)', premium: 'Unlimited' },
                  { name: 'Detailed Explanations & Keys', free: 'Basic overview', premium: 'Full step-by-step' },
                  { name: 'National Rank & Percentiles', free: 'No', premium: 'Yes (All-India rank)' },
                  { name: 'Subject-wise analytics', free: 'No', premium: 'Yes' },
                  { name: 'Ad-free Experience', free: 'No', premium: 'Yes' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">{row.name}</td>
                    <td className="p-4 text-center text-slate-500">{row.free}</td>
                    <td className="p-4 text-center text-prepp-navy font-bold bg-blue-50/20">{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center flex items-center justify-center gap-2">
            <HelpCircle className="h-6 w-6 text-prepp-navy" /> Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {[
              {
                q: 'How do I access premium mock tests after purchasing?',
                a: 'Once your payment is verified (which usually takes less than 3 seconds), your profile is automatically upgraded. You can instantly start any test marked with the PRO badge from the Exams or Test Series lists.'
              },
              {
                q: 'What payment modes are supported?',
                a: 'We use Razorpay, which supports all Indian payment mechanisms including UPI (Google Pay, PhonePe, Paytm), Netbanking (SBI, HDFC, ICICI), credit/debit cards, and mobile wallets.'
              },
              {
                q: 'Can I cancel or get a refund?',
                a: 'Because our materials (mock questions, answers, explanation keys) are digital assets that are instantly unlocked upon checkout, we operate a strict no-refund policy. Please try our free mock tests before upgrading!'
              },
              {
                q: 'How long is the subscription valid for?',
                a: 'The subscription is valid for exactly 1 year (365 days) from the date of checkout. You will receive an email/SMS alert 7 days before renewal is due.'
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full p-5 text-left font-bold text-slate-800 flex justify-between items-center transition-colors hover:bg-slate-50"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-500 leading-relaxed border-t border-slate-50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
