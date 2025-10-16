import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    const redirectMap = {
      CLIENT: '/client/dashboard',
      TECHNICIAN: '/technician/dashboard',
      ADMIN: '/admin/dashboard',
    }
    return <Navigate to={redirectMap[user.role] || '/login'} replace />
  }

  return <>{children}</>
}
