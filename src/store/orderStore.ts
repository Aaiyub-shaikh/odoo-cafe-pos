import { create } from 'zustand'
import type { Order, OrderItem, OrderStatus } from '@/types'
import { ordersApi } from '@/services/api'

interface OrderState {
  orders: Order[]
  isLoading: boolean
  fetchOrders: () => Promise<void>
  fetchKitchenOrders: () => Promise<void>
  getOrder: (id: string) => Order | undefined
  createOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => Promise<Order>
  updateOrder: (id: string, data: Partial<Order>) => Promise<void>
  deleteOrder: (id: string) => Promise<void>
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>
  updateKitchenItemStatus: (orderId: string, itemId: string, status: OrderItem['kitchenStatus']) => Promise<void>
  getKitchenOrders: () => Order[]
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,
  fetchOrders: async () => {
    set({ isLoading: true })
    try {
      const data = await ordersApi.getAll()
      set({ orders: data as unknown as Order[], isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },
  fetchKitchenOrders: async () => {
    set({ isLoading: true })
    try {
      const data = await ordersApi.getKitchen()
      set({ orders: data as unknown as Order[], isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },
  getOrder: (id) => get().orders.find((o) => o.id === id),
  createOrder: async (order) => {
    const created = (await ordersApi.create(order)) as unknown as Order
    set((s) => ({ orders: [created, ...s.orders] }))
    return created
  },
  updateOrder: async (id, data) => {
    const updated = (await ordersApi.update(id, data)) as unknown as Order
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? updated : o)),
    }))
  },
  deleteOrder: async (id) => {
    await ordersApi.delete(id)
    set((s) => ({ orders: s.orders.filter((o) => o.id !== id) }))
  },
  updateOrderStatus: async (id, status) => {
    await get().updateOrder(id, { status })
  },
  updateKitchenItemStatus: async (orderId, itemId, kitchenStatus) => {
    const updated = (await ordersApi.updateKitchenItem(orderId, itemId, kitchenStatus)) as unknown as Order
    set((s) => ({
      orders: s.orders.map((o) => (o.id === orderId ? updated : o)),
    }))
  },
  getKitchenOrders: () => {
    return get().orders.filter(
      (o) => o.status === 'draft' && o.items.some((i) => i.kitchenStatus !== 'completed')
    )
  },
}))
