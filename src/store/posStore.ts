import { create } from 'zustand'
import type { CartItem, Customer, DateFilter, ReportFilters } from '@/types'
import { findBestPromotion } from '@/utils/promotionEngine'
import { usePromotionStore } from './promotionStore'

interface AppliedCoupon {
  code: string
  percentage?: number
  fixedAmount?: number
}

interface PosState {
  cart: CartItem[]
  selectedCustomer: Customer | null
  selectedTableId: string | null
  couponCode: string | null
  appliedCoupon: AppliedCoupon | null
  couponDiscount: number
  promotionId: string | null
  promotionName: string | null
  promotionDiscount: number
  searchQuery: string
  selectedCategoryId: string | null
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  resetPos: () => void
  setCustomer: (customer: Customer | null) => void
  setTable: (tableId: string | null) => void
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>
  removeCoupon: () => void
  recalculateDiscounts: () => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (categoryId: string | null) => void
  getSubtotal: () => number
  getTax: () => number
  getDiscount: () => number
  getPromotionDiscount: () => number
  getCouponDiscount: () => number
  getTotal: () => number
}

function calcCouponDiscount(coupon: AppliedCoupon | null, subtotal: number): number {
  if (!coupon) return 0
  if (coupon.percentage) return subtotal * (coupon.percentage / 100)
  if (coupon.fixedAmount) return coupon.fixedAmount
  return 0
}

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  selectedCustomer: null,
  selectedTableId: null,
  couponCode: null,
  appliedCoupon: null,
  couponDiscount: 0,
  promotionId: null,
  promotionName: null,
  promotionDiscount: 0,
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
    get().recalculateDiscounts()
  },
  removeFromCart: (productId) => {
    set((s) => ({ cart: s.cart.filter((c) => c.productId !== productId) }))
    get().recalculateDiscounts()
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId)
      return
    }
    set((s) => ({
      cart: s.cart.map((c) => (c.productId === productId ? { ...c, quantity } : c)),
    }))
    get().recalculateDiscounts()
  },
  clearCart: () => {
    set({
      cart: [],
      couponCode: null,
      appliedCoupon: null,
      couponDiscount: 0,
      promotionId: null,
      promotionName: null,
      promotionDiscount: 0,
    })
    get().recalculateDiscounts()
  },
  resetPos: () =>
    set({
      cart: [],
      selectedCustomer: null,
      selectedTableId: null,
      couponCode: null,
      appliedCoupon: null,
      couponDiscount: 0,
      promotionId: null,
      promotionName: null,
      promotionDiscount: 0,
    }),
  setCustomer: (customer) => {
    set({ selectedCustomer: customer })
    const { appliedCoupon, couponCode } = get()
    if (appliedCoupon && couponCode) {
      void usePromotionStore.getState().validateCoupon(couponCode, customer?.id).then((result) => {
        if (!result.coupon) {
          set({ couponCode: null, appliedCoupon: null, couponDiscount: 0 })
        }
        get().recalculateDiscounts()
      })
      return
    }
    get().recalculateDiscounts()
  },
  setTable: (tableId) => set({ selectedTableId: tableId }),
  applyCoupon: async (code) => {
    const customerId = get().selectedCustomer?.id
    const result = await usePromotionStore.getState().validateCoupon(code, customerId)
    if (!result.coupon) {
      return { success: false, error: result.error }
    }
    const subtotal = get().getSubtotal()
    const discount = calcCouponDiscount(
      {
        code: result.coupon.code,
        percentage: result.coupon.percentage,
        fixedAmount: result.coupon.fixedAmount,
      },
      subtotal
    )
    set({
      couponCode: result.coupon.code,
      appliedCoupon: {
        code: result.coupon.code,
        percentage: result.coupon.percentage,
        fixedAmount: result.coupon.fixedAmount,
      },
      couponDiscount: discount,
    })
    return { success: true }
  },
  removeCoupon: () => set({ couponCode: null, appliedCoupon: null, couponDiscount: 0 }),
  recalculateDiscounts: () => {
    const cart = get().cart
    const subtotal = get().getSubtotal()
    const promotions = usePromotionStore.getState().promotions.filter((p) => p.active)
    const best = findBestPromotion(promotions, cart, subtotal)

    const couponDiscount = calcCouponDiscount(get().appliedCoupon, subtotal)

    set({
      promotionId: best?.promotion.id ?? null,
      promotionName: best?.promotion.name ?? null,
      promotionDiscount: best?.discount ?? 0,
      couponDiscount,
    })
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (categoryId) => set({ selectedCategoryId: categoryId }),
  getSubtotal: () => get().cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  getTax: () => get().cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity * item.tax) / 100, 0),
  getPromotionDiscount: () => get().promotionDiscount,
  getCouponDiscount: () => get().couponDiscount,
  getDiscount: () => get().promotionDiscount + get().couponDiscount,
  getTotal: () => {
    const subtotal = get().getSubtotal()
    const tax = get().getTax()
    const discount = get().getDiscount()
    return Math.max(0, subtotal + tax - discount)
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
  setDateFilter: (filter) => {
    const today = new Date()
    const toISO = (d: Date) => d.toISOString().split('T')[0]
    const dateTo = toISO(today)
    let dateFrom = dateTo

    if (filter === 'week') {
      dateFrom = toISO(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000))
    } else if (filter === 'month') {
      dateFrom = toISO(new Date(today.getFullYear(), today.getMonth(), 1))
    }

    set((s) => ({
      dateFilter: filter,
      filters: filter === 'custom' ? s.filters : { ...s.filters, dateFrom, dateTo },
    }))
  },
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
