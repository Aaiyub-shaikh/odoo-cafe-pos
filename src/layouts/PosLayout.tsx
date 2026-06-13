import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Circle, UtensilsCrossed, LogOut, Grid3x3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthStore, useSessionStore, usePosStore } from '@/store'
import { formatCurrency } from '@/utils'
import { CloseSessionDialog } from '@/modules/features/pos/CloseSessionDialog'
import { useTableStore } from '@/store'

export default function PosLayout() {
  const user = useAuthStore((s) => s.user)
  const { session } = useSessionStore()
  const selectedTableId = usePosStore((s) => s.selectedTableId)
  const floors = useTableStore((s) => s.floors)
  const [closeOpen, setCloseOpen] = useState(false)

  if (user?.role === 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  const selectedTable = floors.flatMap((f) => f.tables).find((t) => t.id === selectedTableId)

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <div className="brand-stripe shrink-0" />
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-3 shadow-sm sm:h-14 sm:px-4"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <UtensilsCrossed className="h-4 w-4" />
          </div>
          <div>
            <span className="text-sm font-semibold">POS Terminal</span>
            {selectedTable && (
              <p className="flex items-center gap-1 text-[10px] text-muted-foreground sm:text-xs">
                <Grid3x3 className="h-3 w-3" />
                Table {selectedTable.number}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {session ? (
            <>
              <div className="hidden text-right text-xs sm:block">
                <p className="font-medium text-foreground">{session.employeeName}</p>
                <p className="text-muted-foreground">
                  {session.orderCount} orders · {formatCurrency(session.totalSales)}
                </p>
              </div>
              <Badge variant="success" className="gap-1.5">
                <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" />
                <span className="hidden sm:inline">Session Open</span>
                <span className="sm:hidden">Open</span>
              </Badge>
            </>
          ) : (
            <Badge variant="warning">No Session</Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => setCloseOpen(true)} className="h-8">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Close Shift</span>
          </Button>
        </div>
      </motion.header>

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      <CloseSessionDialog open={closeOpen} onOpenChange={setCloseOpen} />
    </div>
  )
}
