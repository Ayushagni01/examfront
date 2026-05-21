import { Link, Outlet, useNavigate } from 'react-router-dom'
import { BookOpen, UserCircle, Menu, Search, LogOut, Settings } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store/store'
import { logout } from '../store/authSlice'

export default function RootLayout() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-prepp-navy text-white shadow-premium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-prepp-yellow" />
                <span className="font-bold text-2xl tracking-tight">Prepp.in</span>
              </Link>
              <nav className="hidden md:flex gap-6 font-medium">
                <Link to="/exams" className="hover:text-prepp-yellow transition-colors">Exams</Link>
                <Link to="/test-series" className="hover:text-prepp-yellow transition-colors">Test Series</Link>
                <Link to="/current-affairs" className="hover:text-prepp-yellow transition-colors">Current Affairs</Link>
                <Link to="/news" className="hover:text-prepp-yellow transition-colors">News</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex relative">
                <input 
                  type="text" 
                  placeholder="Search exams..." 
                  className="bg-white/10 border border-white/20 rounded-full py-1.5 pl-10 pr-4 text-sm outline-none focus:bg-white/20 transition-all text-white placeholder:text-white/60"
                />
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-white/60" />
              </div>
              <button className="md:hidden">
                <Menu className="h-6 w-6" />
              </button>
              
              {isAuthenticated && user ? (
                <div className="flex items-center gap-4">
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="bg-prepp-yellow text-prepp-navy hover:bg-yellow-400 font-bold px-4 py-2 rounded-full text-sm transition-all flex items-center gap-1.5 shadow-sm">
                      <Settings className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <div className="flex items-center gap-3 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15">
                    <UserCircle className="h-5 w-5 text-prepp-yellow" />
                    <span className="text-sm font-semibold max-w-[120px] truncate">{user.name}</span>
                    <button onClick={handleLogout} className="text-white/70 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors ml-1" title="Logout">
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/dashboard" className="border border-white/20 hover:bg-white/10 flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all">
                  <UserCircle className="h-5 w-5" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-white">
              <BookOpen className="h-6 w-6 text-prepp-yellow" />
              <span className="font-bold text-xl tracking-tight">Prepp.in</span>
            </div>
            <p className="mb-4">India's most comprehensive exam preparation platform. Build your career with confidence.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Top Exams</h4>
            <ul className="space-y-2">
              <li><Link to="/exams/ssc-cgl" className="hover:text-prepp-yellow transition-colors">SSC CGL</Link></li>
              <li><Link to="/exams/upsc-cse" className="hover:text-prepp-yellow transition-colors">UPSC CSE</Link></li>
              <li><Link to="/exams/ibps-po" className="hover:text-prepp-yellow transition-colors">IBPS PO</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/test-series" className="hover:text-prepp-yellow transition-colors">Mock Tests</Link></li>
              <li><Link to="/current-affairs" className="hover:text-prepp-yellow transition-colors">Current Affairs</Link></li>
              <li><Link to="/news" className="hover:text-prepp-yellow transition-colors">Latest Notifications</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li>support@examprep.com</li>
              <li>+91 98765 43210</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-500">
          &copy; {new Date().getFullYear()} IndiaExamPrep. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

