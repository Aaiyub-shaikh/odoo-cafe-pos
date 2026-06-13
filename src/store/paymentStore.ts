import { create } from 'zustand'
import type { PaymentMethod, RazorpayConfig, RazorpaySettings } from '@/types'
import { paymentsApi, razorpayApi } from '@/services/api'

interface PaymentState {
  methods: PaymentMethod[]
  razorpaySettings: RazorpaySettings | null
  razorpayConfig: RazorpayConfig | null
  fetchMethods: () => Promise<void>
  fetchRazorpaySettings: () => Promise<void>
  fetchRazorpayConfig: () => Promise<void>
  updateRazorpaySettings: (data: Partial<RazorpaySettings & { razorpayKeySecret?: string }>) => Promise<void>
  toggleMethod: (id: string) => Promise<void>
  updateMethod: (id: string, data: Partial<PaymentMethod>) => Promise<void>
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  methods: [],
  razorpaySettings: null,
  razorpayConfig: null,

  fetchMethods: async () => {
    try {
      const data = await paymentsApi.getAll()
      set({ methods: data as unknown as PaymentMethod[] })
    } catch {
      /* ignore */
    }
  },

  fetchRazorpaySettings: async () => {
    try {
      const data = (await razorpayApi.getSettings()) as unknown as RazorpaySettings
      set({ razorpaySettings: data })
    } catch {
      /* ignore */
    }
  },

  fetchRazorpayConfig: async () => {
    try {
      const data = (await razorpayApi.getConfig()) as unknown as RazorpayConfig
      set({ razorpayConfig: data })
    } catch {
      set({ razorpayConfig: { enabled: false, keyId: '' } })
    }
  },

  updateRazorpaySettings: async (data) => {
    const updated = (await razorpayApi.updateSettings(data)) as unknown as RazorpaySettings
    set({ razorpaySettings: updated })
    await get().fetchRazorpayConfig()
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
