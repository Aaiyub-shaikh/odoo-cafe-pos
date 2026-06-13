import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store'
import { getDefaultRoute } from '@/utils/permissions'

function useAuthReady() {
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated())
  const isInitializing = useAuthStore((s) => s.isInitializing)
  const validateSession = useAuthStore((s) => s.validateSession)

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true))
  }, [])

  useEffect(() => {
    if (hydrated) validateSession()
  }, [hydrated, validateSession])

  return !hydrated || isInitializing
}

export default function GuestRoute() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const loading = useAuthReady()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRoute(user.role)} replace />
  }

  return <Outlet />
}
