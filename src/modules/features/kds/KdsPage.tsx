import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Trash2,
  Users,
  Grid3x3,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useOrderStore } from '@/store'
import type { KitchenStatus, Order } from '@/types'
import { cn, formatDateTime } from '@/utils'

const COLUMNS: {
  status: KitchenStatus
  label: string
  icon: React.ReactNode
  headerClass: string
  badgeClass: string
  borderClass: string
  emptyText: string
}[] = [
  {
    status: 'to_cook',
    label: 'To Cook',
    icon: <Clock className="h-4 w-4" />,
    headerClass: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    borderClass: 'border-l-4 border-l-red-400',
    emptyText: 'No orders waiting',
  },
  {
    status: 'preparing',
    label: 'Preparing',
    icon: <ChefHat className="h-4 w-4" />,
    headerClass: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    borderClass: 'border-l-4 border-l-amber-400',
    emptyText: 'Nothing being prepared',
  },
  {
    status: 'completed',
    label: 'Ready',
    icon: <CheckCircle2 className="h-4 w-4" />,
    headerClass: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    borderClass: 'border-l-4 border-l-emerald-400',
    emptyText: 'No completed orders',
  },
]

function getOrderStage(order: Order): KitchenStatus {
  const statuses = order.items.map((i) => i.kitchenStatus)
  if (statuses.some((s) => s === 'to_cook')) return 'to_cook'
  if (statuses.some((s) => s === 'preparing')) return 'preparing'
  return 'completed'
}

function LiveClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="text-right">
      <p className="text-xl font-mono font-bold text-primary sm:text-2xl">
        {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </p>
      <p className="text-xs text-muted-foreground">
        {time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
      </p>
    </div>
  )
}

export function KdsPage() {
  const { orders, fetchKitchenOrders, updateKitchenOrderStage, dismissKitchenOrder } =
    useOrderStore()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchKitchenOrders()
    const interval = setInterval(fetchKitchenOrders, 5000)
    return () => clearInterval(interval)
  }, [fetchKitchenOrders])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchKitchenOrders()
    setTimeout(() => setRefreshing(false), 600)
  }

  const kitchenOrders = useMemo(() => orders, [orders])

  const ordersByStage = useMemo(() => {
    const grouped: Record<KitchenStatus, Order[]> = {
      to_cook: [],
      preparing: [],
      completed: [],
    }
    for (const order of kitchenOrders) {
      grouped[getOrderStage(order)].push(order)
    }
    return grouped
  }, [kitchenOrders])

  const handleToCookAction = (order: Order, action: 'preparing' | 'completed') => {
    if (action === 'preparing') {
      void updateKitchenOrderStage(order.id, 'preparing', 'to_cook')
    } else {
      void updateKitchenOrderStage(order.id, 'completed')
    }
  }

  const handlePreparingAction = (order: Order, action: 'to_cook' | 'completed') => {
    if (action === 'to_cook') {
      void updateKitchenOrderStage(order.id, 'to_cook', 'preparing')
    } else {
      void updateKitchenOrderStage(order.id, 'completed', 'preparing')
    }
  }

  const handleDismiss = (orderId: string) => {
    void dismissKitchenOrder(orderId)
  }

  const renderActions = (order: Order, stage: KitchenStatus) => {
    if (stage === 'to_cook') {
      return (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
            onClick={(e) => { e.stopPropagation(); handleToCookAction(order, 'preparing') }}
          >
            <ChefHat className="h-3.5 w-3.5 mr-1" />
            Prepare
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={(e) => { e.stopPropagation(); handleToCookAction(order, 'completed') }}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Done
          </Button>
        </div>
      )
    }
    if (stage === 'preparing') {
      return (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={(e) => { e.stopPropagation(); handlePreparingAction(order, 'to_cook') }}
          >
            <Clock className="h-3.5 w-3.5 mr-1" />
            To Cook
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={(e) => { e.stopPropagation(); handlePreparingAction(order, 'completed') }}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Done
          </Button>
        </div>
      )
    }
    return (
      <Button
        size="sm"
        variant="destructive"
        className="mt-3 w-full"
        onClick={(e) => { e.stopPropagation(); handleDismiss(order.id) }}
      >
        <Trash2 className="h-3.5 w-3.5 mr-1" />
        Dismiss Order
      </Button>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      {/* Sub-header with stats */}
      <div className="flex flex-col gap-3 border-b border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {kitchenOrders.length} order{kitchenOrders.length !== 1 ? 's' : ''} active
            </span>
          </div>
          <div className="flex items-center gap-2">
            {COLUMNS.map((col) => (
              <Badge key={col.status} className={cn('gap-1 text-xs', col.badgeClass)}>
                {col.icon}
                {ordersByStage[col.status].length}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleRefresh}
          >
            <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', refreshing && 'animate-spin')} />
            Refresh
          </Button>
          <LiveClock />
        </div>
      </div>

      {/* Kanban columns */}
      <div className="flex flex-1 flex-col gap-3 overflow-hidden p-3 sm:gap-4 sm:p-4 md:flex-row">
        {COLUMNS.map((col) => (
          <div
            key={col.status}
            className="flex min-h-0 flex-col rounded-xl border border-border bg-card shadow-sm md:flex-1"
          >
            {/* Column header */}
            <div className={cn('flex items-center gap-2 rounded-t-xl border-b px-4 py-3', col.headerClass)}>
              <span>{col.icon}</span>
              <h2 className="font-semibold tracking-wide">{col.label}</h2>
              <span className={cn('ml-auto rounded-full px-2.5 py-0.5 text-xs font-bold', col.badgeClass)}>
                {ordersByStage[col.status].length}
              </span>
            </div>

            {/* Order cards */}
            <div className="flex max-h-[40vh] flex-1 flex-col gap-2.5 overflow-y-auto p-3 sm:max-h-none md:max-h-none">
              {ordersByStage[col.status].length === 0 ? (
                <div className="flex flex-1 items-center justify-center py-12 text-muted-foreground">
                  <p className="text-sm">{col.emptyText}</p>
                </div>
              ) : (
                ordersByStage[col.status].map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn(
                      'rounded-xl border border-border bg-background p-3 shadow-sm sm:p-4',
                      col.borderClass
                    )}
                  >
                    {/* Order header */}
                    <div className="mb-2.5 flex items-start justify-between gap-2">
                      <div>
                        <span className="text-base font-bold text-primary">{order.orderNumber}</span>
                        {order.customerName && (
                          <p className="mt-0.5 text-xs font-medium text-foreground">{order.customerName}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-muted-foreground">
                          {formatDateTime(order.createdAt).split(',')[1]?.trim()}
                        </p>
                        {order.tableId && (
                          <div className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                            <Users className="h-3 w-3" />
                            Table
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <ul className="space-y-1">
                      {order.items.map((item) => {
                        const isDone = item.kitchenStatus === 'completed'
                        return (
                          <li
                            key={item.id}
                            className={cn(
                              'flex items-center gap-2 rounded-lg bg-secondary/50 px-2.5 py-1.5',
                              isDone && 'opacity-40'
                            )}
                          >
                            <span
                              className={cn(
                                'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold',
                                isDone
                                  ? 'bg-muted text-muted-foreground'
                                  : 'bg-primary/15 text-primary'
                              )}
                            >
                              {item.quantity}
                            </span>
                            <span
                              className={cn(
                                'flex-1 text-sm font-medium',
                                isDone && 'line-through text-muted-foreground'
                              )}
                            >
                              {item.productName}
                            </span>
                            {isDone && (
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                            )}
                          </li>
                        )
                      })}
                    </ul>

                    {renderActions(order, col.status)}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
