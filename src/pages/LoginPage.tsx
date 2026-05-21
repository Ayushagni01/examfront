import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Phone, Shield, ArrowRight, BookOpen, ChevronRight, Loader2 } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../store/authSlice'
import { api } from '../utils/axiosInstance'

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [devOtp, setDevOtp] = useState<string | null>(null)

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/send-otp', { phone: `+91${phone}` })
      // In dev mode, OTP may be returned in response
      if (res.data?.otp) setDevOtp(res.data.otp)
      setStep('otp')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/verify-otp', { phone: `+91${phone}`, otp: otpString })
      dispatch(setCredentials({
        user: res.data.user,
        token: res.data.accessToken
      }))
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1)
    if (value && !/^\d$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    // Auto focus next
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`)
      next?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`)
      prev?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-prepp-navy via-blue-900 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-prepp-yellow rounded-full mix-blend-multiply filter blur-[140px] opacity-15 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-15 -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-10">
            <BookOpen className="h-10 w-10 text-prepp-yellow" />
            <span className="font-bold text-3xl tracking-tight">Prepp.in</span>
          </div>

          <h2 className="text-4xl font-extrabold leading-tight mb-6">
            Start your exam <br />
            preparation <span className="text-transparent bg-clip-text bg-gradient-to-r from-prepp-yellow to-yellow-200">today</span>
          </h2>

          <div className="space-y-5 text-blue-100">
            <div className="flex items-start gap-4">
              <div className="bg-white/10 rounded-lg p-2 mt-0.5"><Shield className="h-5 w-5 text-prepp-yellow" /></div>
              <div>
                <h4 className="font-semibold text-white">Secure & Fast Login</h4>
                <p className="text-sm">OTP-based authentication — no password needed</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-white/10 rounded-lg p-2 mt-0.5"><BookOpen className="h-5 w-5 text-prepp-yellow" /></div>
              <div>
                <h4 className="font-semibold text-white">10,000+ Mock Tests</h4>
                <p className="text-sm">Full-length mocks, sectional, and previous year papers</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-white/10 rounded-lg p-2 mt-0.5"><ChevronRight className="h-5 w-5 text-prepp-yellow" /></div>
              <div>
                <h4 className="font-semibold text-white">Detailed Analytics</h4>
                <p className="text-sm">Track your progress and compare with toppers</p>
              </div>
            </div>
          </div>

          <div className="mt-16 p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex -space-x-2">
                {['bg-blue-400','bg-green-400','bg-purple-400','bg-amber-400'].map((c, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white/20 flex items-center justify-center text-xs font-bold text-white`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="font-semibold text-white text-sm">50,000+ Students</div>
                <div className="text-xs text-blue-200">actively preparing on Prepp.in</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <BookOpen className="h-8 w-8 text-prepp-navy" />
            <span className="font-bold text-2xl tracking-tight text-prepp-navy">Prepp.in</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
            {step === 'phone' ? 'Welcome back!' : 'Verify OTP'}
          </h1>
          <p className="text-slate-500 mb-8">
            {step === 'phone'
              ? 'Enter your mobile number to get started.'
              : `We've sent a 6-digit OTP to +91 ${phone}`}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-lg p-3 mb-6">
              {error}
            </div>
          )}

          {devOtp && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium rounded-lg p-3 mb-6">
              <strong>Dev Mode OTP:</strong> {devOtp}
            </div>
          )}

          {step === 'phone' ? (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number</label>
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-3 text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError('') }}
                  placeholder="Enter 10-digit number"
                  className="flex-1 border border-slate-200 rounded-lg px-4 py-3 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-prepp-navy/20 focus:border-prepp-navy transition-all tracking-wider"
                  autoFocus
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={loading || phone.length !== 10}
                className="w-full bg-prepp-navy hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-premium"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Phone className="h-5 w-5" /> Send OTP</>}
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Enter OTP</label>
              <div className="flex gap-3 mb-6 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-prepp-navy/20 focus:border-prepp-navy transition-all"
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-prepp-navy hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-premium"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Verify & Login <ArrowRight className="h-5 w-5" /></>}
              </button>
              <button
                onClick={() => { setStep('phone'); setOtp(['','','','','','']); setError(''); setDevOtp(null) }}
                className="w-full text-center text-sm font-semibold text-prepp-navy mt-4 hover:underline"
              >
                ← Change Number
              </button>
            </div>
          )}

          <p className="text-xs text-slate-400 text-center mt-8">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
