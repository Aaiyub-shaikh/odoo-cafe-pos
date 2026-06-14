import { Link, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ChefHat, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSessionStore } from '@/store'
import { formatDateTime } from '@/utils'
import { isKdsStandalonePort } from '@/config/kds'

export default function KdsLayout() {
  const { session } = useSessionStore()
  const standalone = isKdsStandalonePort()

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="brand-stripe shrink-0" />
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <ChefHat className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide uppercase text-foreground">
              Kitchen Display
            </h1>
            {session && (
              <p className="hidden text-[10px] text-muted-foreground sm:block">
                Session · {formatDateTime(session.openedAt)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            title="Fullscreen"
            onClick={() => document.documentElement.requestFullscreen?.()}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          {!standalone && (
            <Button variant="outline" size="sm" asChild>
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
