import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { canAccessRoute, getDefaultRoute } from '@/utils/permissions'

interface RoleRouteProps {
  allowedRoles: ('admin' | 'cashier')[]
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRoute(user.role)} replace />
  }

  if (!canAccessRoute(user.role, location.pathname)) {
    return <Navigate to={getDefaultRoute(user.role)} replace />
  }

  return <Outlet />
}
