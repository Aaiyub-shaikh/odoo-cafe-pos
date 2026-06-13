import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChefHat, Clock, CheckCircle2, Utensils } from 'lucide-react'
import { useOrderStore } from '@/store'
import { getSocket } from '@/services/socket'
import type { KitchenStatus, Order } from '@/types'
import { cn, formatDateTime } from '@/utils'
import { KDS_BACKGROUND } from '@/utils/chartTheme'

const COLUMNS: { status: KitchenStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { status: 'to_cook', label: 'To Cook', icon: <Clock className="h-4 w-4 sm:h-5 sm:w-5" />, color: 'border-red-500/40' },
  { status: 'preparing', label: 'Preparing', icon: <ChefHat className="h-4 w-4 sm:h-5 sm:w-5" />, color: 'border-orange-500/40' },
  { status: 'completed', label: 'Completed', icon: <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />, color: 'border-emerald-500/40' },
]

function getOrderStage(order: Order): KitchenStatus {
  const statuses = order.items.map((i) => i.kitchenStatus)
  if (statuses.some((s) => s === 'to_cook')) return 'to_cook'
  if (statuses.some((s) => s === 'preparing')) return 'preparing'
  return 'completed'
}

function nextStatus(current: KitchenStatus): KitchenStatus {
  if (current === 'to_cook') return 'preparing'
  if (current === 'preparing') return 'completed'
  return 'completed'
}

export function KdsPage() {
  const { kitchenOrders, fetchKitchenOrders, updateKitchenItemStatus } = useOrderStore()

  useEffect(() => {
    fetchKitchenOrders()
    const socket = getSocket()
    const onNewOrder = () => {
      console.log('[KDS] newOrder received — refreshing kitchen queue')
      fetchKitchenOrders()
    }
    socket.on('newOrder', onNewOrder)
    const interval = setInterval(fetchKitchenOrders, 5000)
    return () => {
      socket.off('newOrder', onNewOrder)
      clearInterval(interval)
    }
  }, [fetchKitchenOrders])

  const activeKitchenOrders = useMemo(
    () =>
      kitchenOrders.filter(
        (o) =>
          (o.status === 'CONFIRMED' || o.status === 'draft') &&
          o.items.some((i) => i.kitchenStatus !== 'completed')
      ),
    [kitchenOrders]
  )

  const ordersByStage = useMemo(() => {
    const grouped: Record<KitchenStatus, Order[]> = {
      to_cook: [],
      preparing: [],
      completed: [],
    }
    for (const order of activeKitchenOrders) {
      grouped[getOrderStage(order)].push(order)
    }
    return grouped
  }, [activeKitchenOrders])

  const handleTicketClick = (order: Order) => {
    const stage = getOrderStage(order)
    const next = nextStatus(stage)
    for (const item of order.items) {
      if (item.kitchenStatus !== 'completed') {
        updateKitchenItemStatus(order.id, item.id, next)
      }
    }
  }

  const handleItemClick = (orderId: string, itemId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    updateKitchenItemStatus(orderId, itemId, 'completed')
  }

  return (
    <div className="flex h-full flex-col text-foreground" style={{ backgroundColor: KDS_BACKGROUND }}>
      <header className="flex flex-col gap-3 border-b border-[#5d4037] bg-[#4e342e] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 sm:h-10 sm:w-10">
            <Utensils className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#fff8f0] sm:text-2xl">Kitchen Display</h1>
            <p className="text-xs text-[#d7ccc8] sm:text-sm">
              {activeKitchenOrders.length} active order{activeKitchenOrders.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-2xl font-mono font-bold text-accent sm:text-3xl">
            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-xs text-[#d7ccc8] sm:text-sm">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-3 overflow-hidden p-3 sm:gap-4 sm:p-4 md:flex-row md:overflow-hidden">
        {COLUMNS.map((col) => (
          <div
            key={col.status}
            className={cn(
              'flex min-h-0 flex-col rounded-xl border border-[#5d4037] bg-[#4e342e]/80 md:flex-1',
              col.color
            )}
          >
            <div className="flex items-center gap-2 border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
              <span className="text-primary">{col.icon}</span>
              <h2 className="text-sm font-bold uppercase tracking-wide sm:text-lg">{col.label}</h2>
              <span className="ml-auto rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium sm:px-3 sm:text-sm">
                {ordersByStage[col.status].length}
              </span>
            </div>

            <div className="flex max-h-[40vh] flex-1 flex-row gap-2 overflow-x-auto p-2 sm:max-h-none sm:flex-col sm:gap-3 sm:overflow-y-auto sm:p-3 md:max-h-none">
              {ordersByStage[col.status].length === 0 ? (
                <div className="flex h-24 w-full items-center justify-center text-muted-foreground sm:h-32">
                  <p className="text-sm sm:text-lg">No orders</p>
                </div>
              ) : (
                ordersByStage[col.status].map((order, i) => (
                  <motion.button
                    key={order.id}
                    type="button"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTicketClick(order)}
                    className="w-64 shrink-0 rounded-xl border border-border bg-secondary/40 p-3 text-left transition-colors hover:border-primary/50 hover:bg-secondary/70 sm:w-full sm:p-4"
                  >
                    <div className="mb-2 flex items-center justify-between sm:mb-3">
                      <span className="text-base font-bold text-primary sm:text-xl">{order.orderNumber}</span>
                      <span className="text-xs text-muted-foreground sm:text-sm">
                        {formatDateTime(order.createdAt).split(',')[1]?.trim()}
                      </span>
                    </div>

                    {order.customerName && (
                      <p className="mb-2 text-sm font-medium sm:text-base">{order.customerName}</p>
                    )}

                    <ul className="space-y-1.5 sm:space-y-2">
                      {order.items.map((item) => {
                        const isDone = item.kitchenStatus === 'completed'
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={(e) => handleItemClick(order.id, item.id, e)}
                              className={cn(
                                'flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors hover:bg-background/50 sm:gap-3 sm:py-1.5',
                                isDone && 'opacity-50'
                              )}
                            >
                              <span
                                className={cn(
                                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/20 text-sm font-bold text-primary sm:h-8 sm:w-8 sm:text-lg',
                                  isDone && 'bg-muted text-muted-foreground'
                                )}
                              >
                                {item.quantity}
                              </span>
                              <span
                                className={cn(
                                  'flex-1 text-sm font-medium sm:text-lg',
                                  isDone && 'line-through text-muted-foreground'
                                )}
                              >
                                {item.productName}
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>

                    <p className="mt-2 text-[10px] text-muted-foreground sm:mt-3 sm:text-xs">
                      Tap ticket to advance · Tap item to complete
                    </p>
                  </motion.button>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
