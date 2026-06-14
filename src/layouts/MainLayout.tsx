import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar, MobileSidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { useAuthStore, useSessionStore, useUIStore } from '@/store'
import { APP_NAME, APP_SHORT_NAME } from '@/config/brand'

export default function MainLayout() {
  const location = useLocation()
  const theme = useUIStore((s) => s.theme)
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen)
  const user = useAuthStore((s) => s.user)
  const session = useSessionStore((s) => s.session)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  useEffect(() => {
    const sessionLabel = session?.status === 'open' ? ' · Session Open' : ''
    document.title = user ? `${APP_NAME} · ${user.name}${sessionLabel}` : APP_SHORT_NAME
  }, [user, session])

  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname, setMobileSidebarOpen])

  if (user?.role === 'cashier') {
    return <Navigate to="/pos" replace />
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      <Sidebar />
      <MobileSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="brand-stripe shrink-0" />
        <Topbar />
        <main className="flex-1 overflow-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-4 sm:p-5 lg:p-6"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
