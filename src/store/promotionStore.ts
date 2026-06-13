import { create } from 'zustand'
import type { Coupon, Promotion } from '@/types'
import { mockCoupons, mockPromotions } from '@/mock/misc'

interface PromotionState {
  coupons: Coupon[]
  promotions: Promotion[]
  fetchCoupons: () => Promise<void>
  fetchPromotions: () => Promise<void>
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount' | 'createdAt'>) => void
  updateCoupon: (id: string, data: Partial<Coupon>) => void
  deleteCoupon: (id: string) => void
  addPromotion: (promo: Omit<Promotion, 'id' | 'createdAt'>) => void
  updatePromotion: (id: string, data: Partial<Promotion>) => void
  deletePromotion: (id: string) => void
  validateCoupon: (code: string) => Coupon | null
}

export const usePromotionStore = create<PromotionState>((set, get) => ({
  coupons: [...mockCoupons],
  promotions: [...mockPromotions],
  fetchCoupons: async () => {
    await new Promise((r) => setTimeout(r, 300))
    set({ coupons: [...mockCoupons] })
  },
  fetchPromotions: async () => {
    await new Promise((r) => setTimeout(r, 300))
    set({ promotions: [...mockPromotions] })
  },
  addCoupon: (coupon) => {
    const newCoupon: Coupon = {
      ...coupon,
      id: crypto.randomUUID(),
      usageCount: 0,
      createdAt: new Date().toISOString(),
    }
    set((s) => ({ coupons: [...s.coupons, newCoupon] }))
  },
  updateCoupon: (id, data) => {
    set((s) => ({
      coupons: s.coupons.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }))
  },
  deleteCoupon: (id) => {
    set((s) => ({ coupons: s.coupons.filter((c) => c.id !== id) }))
  },
  addPromotion: (promo) => {
    const newPromo: Promotion = {
      ...promo,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    set((s) => ({ promotions: [...s.promotions, newPromo] }))
  },
  updatePromotion: (id, data) => {
    set((s) => ({
      promotions: s.promotions.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }))
  },
  deletePromotion: (id) => {
    set((s) => ({ promotions: s.promotions.filter((p) => p.id !== id) }))
  },
  validateCoupon: (code) => {
    const coupon = get().coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.active)
    return coupon ?? null
  },
}))
