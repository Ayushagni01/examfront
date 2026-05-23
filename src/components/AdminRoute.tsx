import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'

interface AdminRouteProps {
  children: React.ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
