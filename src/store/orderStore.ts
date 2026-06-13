import { create } from 'zustand'
import type { Order, OrderItem, OrderStatus } from '@/types'
import { mockOrders } from '@/mock/orders'
import { useSessionStore } from './sessionStore'

interface OrderState {
  orders: Order[]
  isLoading: boolean
  fetchOrders: () => Promise<void>
  getOrder: (id: string) => Order | undefined
  createOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => Order
  updateOrder: (id: string, data: Partial<Order>) => void
  deleteOrder: (id: string) => void
  updateOrderStatus: (id: string, status: OrderStatus) => void
  updateKitchenItemStatus: (orderId: string, itemId: string, status: OrderItem['kitchenStatus']) => void
  getKitchenOrders: () => Order[]
}

let orderCounter = 7

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [...mockOrders],
  isLoading: false,
  fetchOrders: async () => {
    set({ isLoading: true })
    await new Promise((r) => setTimeout(r, 500))
    set({ orders: [...mockOrders], isLoading: false })
  },
  getOrder: (id) => get().orders.find((o) => o.id === id),
  createOrder: (order) => {
    orderCounter++
    const newOrder: Order = {
      ...order,
      id: crypto.randomUUID(),
      orderNumber: `ORD-2025-${String(orderCounter).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set((s) => ({ orders: [newOrder, ...s.orders] }))
    if (order.status === 'paid') {
      useSessionStore.getState().updateSessionStats(order.total)
    }
    return newOrder
  },
  updateOrder: (id, data) => {
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, ...data, updatedAt: new Date().toISOString() } : o
      ),
    }))
  },
  deleteOrder: (id) => {
    set((s) => ({ orders: s.orders.filter((o) => o.id !== id) }))
  },
  updateOrderStatus: (id, status) => {
    get().updateOrder(id, { status })
  },
  updateKitchenItemStatus: (orderId, itemId, kitchenStatus) => {
    set((s) => ({
      orders: s.orders.map((o) => {
        if (o.id !== orderId) return o
        return {
          ...o,
          items: o.items.map((item) =>
            item.id === itemId ? { ...item, kitchenStatus } : item
          ),
          updatedAt: new Date().toISOString(),
        }
      }),
    }))
  },
  getKitchenOrders: () => {
    return get().orders.filter(
      (o) => o.status === 'draft' && o.items.some((i) => i.kitchenStatus !== 'completed')
    )
  },
}))
