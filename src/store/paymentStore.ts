import { create } from 'zustand'
import type { PaymentMethod } from '@/types'
import { mockPaymentMethods } from '@/mock/misc'

interface PaymentState {
  methods: PaymentMethod[]
  fetchMethods: () => Promise<void>
  toggleMethod: (id: string) => void
  updateMethod: (id: string, data: Partial<PaymentMethod>) => void
}

export const usePaymentStore = create<PaymentState>((set) => ({
  methods: [...mockPaymentMethods],
  fetchMethods: async () => {
    await new Promise((r) => setTimeout(r, 300))
    set({ methods: [...mockPaymentMethods] })
  },
  toggleMethod: (id) => {
    set((s) => ({
      methods: s.methods.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)),
    }))
  },
  updateMethod: (id, data) => {
    set((s) => ({
      methods: s.methods.map((m) => (m.id === id ? { ...m, ...data } : m)),
    }))
  },
}))
