import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { logout } from '../store/authSlice'
import {
  LayoutDashboard,
  FolderTree,
  GraduationCap,
  FileText,
  HelpCircle,
  Newspaper,
  Bell,
  LogOut,
  Shield,
} from 'lucide-react'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
  { to: '/admin/exams', icon: GraduationCap, label: 'Exams' },
  { to: '/admin/test-series', icon: FileText, label: 'Test Series' },
  { to: '/admin/questions', icon: HelpCircle, label: 'Questions' },
  { to: '/admin/current-affairs', icon: Newspaper, label: 'Current Affairs' },
  { to: '/admin/news', icon: Bell, label: 'News' },
]

export default function AdminLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-5 border-b border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <Shield className="h-7 w-7 text-indigo-400" />
            <div>
              <span className="font-bold text-lg tracking-tight">Prepp.in</span>
              <span className="text-xs text-indigo-400 ml-1.5 font-semibold">Admin</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon className="h-4.5 w-4.5 flex-shrink-0" size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700/50">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-slate-400">Signed in as</p>
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
