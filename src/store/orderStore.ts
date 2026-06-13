import { create } from 'zustand'
import type { Order, OrderItem, OrderStatus } from '@/types'
import { ordersApi } from '@/services/api'

interface OrderState {
  orders: Order[]
  kitchenOrders: Order[]
  isLoading: boolean
  fetchOrders: () => Promise<void>
  fetchKitchenOrders: () => Promise<void>
  getOrder: (id: string) => Order | undefined
  createOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => Promise<Order>
  updateOrder: (id: string, data: Partial<Order>) => Promise<void>
  deleteOrder: (id: string) => Promise<void>
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>
  updateKitchenItemStatus: (orderId: string, itemId: string, status: OrderItem['kitchenStatus']) => Promise<void>
  replaceOrder: (order: Order) => void
  getKitchenOrders: () => Order[]
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  kitchenOrders: [],
  isLoading: false,
  fetchOrders: async () => {
    set({ isLoading: true })
    try {
      const data = await ordersApi.getAll()
      set({ orders: data as unknown as Order[], isLoading: false })
    } catch (err) {
      console.error('[Orders] fetchOrders failed:', err)
      set({ isLoading: false })
    }
  },
  fetchKitchenOrders: async () => {
    set({ isLoading: true })
    try {
      const data = await ordersApi.getKitchen()
      set({ kitchenOrders: data as unknown as Order[], isLoading: false })
    } catch (err) {
      console.error('[Orders] fetchKitchenOrders failed:', err)
      set({ isLoading: false })
    }
  },
  getOrder: (id) => get().orders.find((o) => o.id === id) ?? get().kitchenOrders.find((o) => o.id === id),
  createOrder: async (order) => {
    const created = (await ordersApi.create(order)) as unknown as Order
    set((s) => ({ orders: [created, ...s.orders] }))
    return created
  },
  updateOrder: async (id, data) => {
    const updated = (await ordersApi.update(id, data)) as unknown as Order
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? updated : o)),
      kitchenOrders: s.kitchenOrders.map((o) => (o.id === id ? updated : o)),
    }))
  },
  deleteOrder: async (id) => {
    await ordersApi.delete(id)
    set((s) => ({
      orders: s.orders.filter((o) => o.id !== id),
      kitchenOrders: s.kitchenOrders.filter((o) => o.id !== id),
    }))
  },
  updateOrderStatus: async (id, status) => {
    await get().updateOrder(id, { status })
  },
  updateKitchenItemStatus: async (orderId, itemId, kitchenStatus) => {
    const updated = (await ordersApi.updateKitchenItem(orderId, itemId, kitchenStatus)) as unknown as Order
    set((s) => ({
      kitchenOrders: s.kitchenOrders.map((o) => (o.id === orderId ? updated : o)),
      orders: s.orders.map((o) => (o.id === orderId ? updated : o)),
    }))
  },
  replaceOrder: (order) => {
    const isKitchenOrder =
      (order.status === 'CONFIRMED' || order.status === 'draft') &&
      order.items.some((i) => i.kitchenStatus !== 'completed')

    set((s) => ({
      orders: s.orders.some((o) => o.id === order.id)
        ? s.orders.map((o) => (o.id === order.id ? order : o))
        : [order, ...s.orders],
      kitchenOrders: isKitchenOrder
        ? s.kitchenOrders.some((o) => o.id === order.id)
          ? s.kitchenOrders.map((o) => (o.id === order.id ? order : o))
          : [order, ...s.kitchenOrders]
        : s.kitchenOrders,
    }))
  },
  getKitchenOrders: () => {
    return get().kitchenOrders.filter(
      (o) =>
        (o.status === 'CONFIRMED' || o.status === 'draft') &&
        o.items.some((i) => i.kitchenStatus !== 'completed')
    )
  },
}))
