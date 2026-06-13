import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { getDefaultRoute } from '@/utils/permissions'

export default function RoleRedirect() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={getDefaultRoute(user.role)} replace />
}
