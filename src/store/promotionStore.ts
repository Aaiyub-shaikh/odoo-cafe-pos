import { create } from 'zustand'
import type { Coupon, Promotion } from '@/types'
import { couponsApi, promotionsApi } from '@/services/api'

export interface CouponValidationResult {
  coupon: Coupon | null
  error?: string
}

interface PromotionState {
  coupons: Coupon[]
  promotions: Promotion[]
  fetchCoupons: () => Promise<void>
  fetchPromotions: () => Promise<void>
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount' | 'createdAt'>) => Promise<void>
  updateCoupon: (id: string, data: Partial<Coupon>) => Promise<void>
  deleteCoupon: (id: string) => Promise<void>
  addPromotion: (promo: Omit<Promotion, 'id' | 'createdAt'>) => Promise<void>
  updatePromotion: (id: string, data: Partial<Promotion>) => Promise<void>
  deletePromotion: (id: string) => Promise<void>
  validateCoupon: (code: string, customerId?: string) => Promise<CouponValidationResult>
}

export const usePromotionStore = create<PromotionState>((set) => ({
  coupons: [],
  promotions: [],
  fetchCoupons: async () => {
    try {
      const data = await couponsApi.getAll()
      set({ coupons: data as unknown as Coupon[] })
    } catch {
      /* ignore */
    }
  },
  fetchPromotions: async () => {
    try {
      const data = await promotionsApi.getAll()
      set({ promotions: data as unknown as Promotion[] })
    } catch {
      /* ignore */
    }
  },
  addCoupon: async (coupon) => {
    const created = (await couponsApi.create(coupon)) as unknown as Coupon
    set((s) => ({ coupons: [...s.coupons, created] }))
  },
  updateCoupon: async (id, data) => {
    const updated = (await couponsApi.update(id, data)) as unknown as Coupon
    set((s) => ({
      coupons: s.coupons.map((c) => (c.id === id ? updated : c)),
    }))
  },
  deleteCoupon: async (id) => {
    await couponsApi.delete(id)
    set((s) => ({ coupons: s.coupons.filter((c) => c.id !== id) }))
  },
  addPromotion: async (promo) => {
    const created = (await promotionsApi.create(promo)) as unknown as Promotion
    set((s) => ({ promotions: [...s.promotions, created] }))
  },
  updatePromotion: async (id, data) => {
    const updated = (await promotionsApi.update(id, data)) as unknown as Promotion
    set((s) => ({
      promotions: s.promotions.map((p) => (p.id === id ? updated : p)),
    }))
  },
  deletePromotion: async (id) => {
    await promotionsApi.delete(id)
    set((s) => ({ promotions: s.promotions.filter((p) => p.id !== id) }))
  },
  validateCoupon: async (code, customerId) => {
    try {
      const result = await couponsApi.validate(code, customerId)
      if (!result.valid) {
        return { coupon: null, error: result.error ?? 'Invalid or expired coupon code' }
      }
      return { coupon: result.coupon as unknown as Coupon }
    } catch {
      return { coupon: null, error: 'Could not validate coupon' }
    }
  },
}))
