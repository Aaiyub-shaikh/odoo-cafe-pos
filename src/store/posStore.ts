import { create } from 'zustand'
import type { CartItem, Customer, DateFilter, ReportFilters } from '@/types'
import { usePromotionStore } from './promotionStore'

interface PosState {
  cart: CartItem[]
  selectedCustomer: Customer | null
  selectedTableId: string | null
  couponCode: string | null
  couponDiscount: number
  searchQuery: string
  selectedCategoryId: string | null
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setCustomer: (customer: Customer | null) => void
  setTable: (tableId: string | null) => void
  applyCoupon: (code: string) => boolean
  removeCoupon: () => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (categoryId: string | null) => void
  getSubtotal: () => number
  getTax: () => number
  getDiscount: () => number
  getTotal: () => number
}

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  selectedCustomer: null,
  selectedTableId: null,
  couponCode: null,
  couponDiscount: 0,
  searchQuery: '',
  selectedCategoryId: null,
  addToCart: (item) => {
    set((s) => {
      const existing = s.cart.find((c) => c.productId === item.productId)
      if (existing) {
        return {
          cart: s.cart.map((c) =>
            c.productId === item.productId
              ? { ...c, quantity: c.quantity + (item.quantity ?? 1) }
              : c
          ),
        }
      }
      return { cart: [...s.cart, { ...item, quantity: item.quantity ?? 1 }] }
    })
  },
  removeFromCart: (productId) => {
    set((s) => ({ cart: s.cart.filter((c) => c.productId !== productId) }))
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId)
      return
    }
    set((s) => ({
      cart: s.cart.map((c) => (c.productId === productId ? { ...c, quantity } : c)),
    }))
  },
  clearCart: () => set({ cart: [], selectedCustomer: null, selectedTableId: null, couponCode: null, couponDiscount: 0 }),
  setCustomer: (customer) => set({ selectedCustomer: customer }),
  setTable: (tableId) => set({ selectedTableId: tableId }),
  applyCoupon: (code) => {
    const coupon = usePromotionStore.getState().validateCoupon(code)
    if (!coupon) return false
    const subtotal = get().getSubtotal()
    let discount = 0
    if (coupon.percentage) discount = subtotal * (coupon.percentage / 100)
    if (coupon.fixedAmount) discount = coupon.fixedAmount
    set({ couponCode: coupon.code, couponDiscount: discount })
    return true
  },
  removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (categoryId) => set({ selectedCategoryId: categoryId }),
  getSubtotal: () => get().cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  getTax: () => get().cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity * item.tax) / 100, 0),
  getDiscount: () => get().couponDiscount,
  getTotal: () => {
    const subtotal = get().getSubtotal()
    const tax = get().getTax()
    const discount = get().getDiscount()
    return subtotal + tax - discount
  },
}))

interface ReportState {
  dateFilter: DateFilter
  filters: ReportFilters
  setDateFilter: (filter: DateFilter) => void
  setFilters: (filters: Partial<ReportFilters>) => void
}

export const useReportStore = create<ReportState>((set) => ({
  dateFilter: 'week',
  filters: {
    dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
  },
  setDateFilter: (filter) => set({ dateFilter: filter }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
}))

interface UIState {
  sidebarCollapsed: boolean
  mobileSidebarOpen: boolean
  theme: 'dark' | 'light'
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileSidebarOpen: (open: boolean) => void
  toggleMobileSidebar: () => void
  toggleTheme: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  theme: 'light',
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
}))
