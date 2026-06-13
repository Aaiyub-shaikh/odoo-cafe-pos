import { create } from 'zustand'
import type { PaymentMethod } from '@/types'
import { paymentsApi } from '@/services/api'

interface PaymentState {
  methods: PaymentMethod[]
  fetchMethods: () => Promise<void>
  toggleMethod: (id: string) => Promise<void>
  updateMethod: (id: string, data: Partial<PaymentMethod>) => Promise<void>
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  methods: [],
  fetchMethods: async () => {
    try {
      const data = await paymentsApi.getAll()
      set({ methods: data as unknown as PaymentMethod[] })
    } catch {
      /* ignore */
    }
  },
  toggleMethod: async (id) => {
    const method = get().methods.find((m) => m.id === id)
    if (!method) return
    const updated = (await paymentsApi.update(id, { enabled: !method.enabled })) as unknown as PaymentMethod
    set((s) => ({
      methods: s.methods.map((m) => (m.id === id ? updated : m)),
    }))
  },
  updateMethod: async (id, data) => {
    const updated = (await paymentsApi.update(id, data)) as unknown as PaymentMethod
    set((s) => ({
      methods: s.methods.map((m) => (m.id === id ? updated : m)),
    }))
  },
}))
