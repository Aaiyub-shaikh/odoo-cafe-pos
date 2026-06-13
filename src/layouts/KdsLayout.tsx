import { Link, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ChefHat, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSessionStore } from '@/store'
import { formatDateTime } from '@/utils'
import { KDS_BACKGROUND } from '@/utils/chartTheme'
import { isKdsStandalonePort } from '@/config/kds'

export default function KdsLayout() {
  const { session } = useSessionStore()
  const standalone = isKdsStandalonePort()

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: KDS_BACKGROUND }}>
      <div className="brand-stripe shrink-0" />
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-12 shrink-0 items-center justify-between border-b border-[#5d4037] bg-[#4e342e] px-4"
      >
        <div className="flex items-center gap-3">
          <ChefHat className="h-5 w-5 text-accent" />
          <h1 className="text-sm font-semibold tracking-wide uppercase text-[#fff8f0]">
            Kitchen Display System
          </h1>
          {session && (
            <span className="hidden text-xs text-[#d7ccc8] sm:inline">
              · Session started {formatDateTime(session.openedAt)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-[#d7ccc8] hover:text-[#fff8f0]" title="Fullscreen" onClick={() => document.documentElement.requestFullscreen?.()}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          {!standalone && (
            <Button variant="outline" size="sm" className="border-[#5d4037] bg-transparent text-[#fff8f0] hover:bg-[#5d4037]" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Exit KDS
              </Link>
            </Button>
          )}
        </div>
      </motion.header>

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
