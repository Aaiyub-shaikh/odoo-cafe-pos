import { create } from 'zustand'
import type { PosSession } from '@/types'
import { useAuthStore } from './authStore'
import { sessionsApi } from '@/services/api'

interface SessionState {
  session: PosSession | null
  openSession: () => Promise<void>
  closeSession: () => Promise<void>
  updateSessionStats: (sales: number) => Promise<void>
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  openSession: async () => {
    const user = useAuthStore.getState().user
    if (!user || user.role !== 'cashier') return
    try {
      const session = (await sessionsApi.open({
        employeeName: user.name,
        openingCash: 5000,
      })) as unknown as PosSession
      set({ session })
    } catch {
      /* ignore */
    }
  },
  closeSession: async () => {
    const { session } = get()
    if (session) {
      try {
        await sessionsApi.close(session.id)
      } catch {
        /* ignore */
      }
    }
    set({ session: null })
  },
  updateSessionStats: async (sales) => {
    const { session } = get()
    if (!session) return
    try {
      const updated = (await sessionsApi.updateStats(session.id, sales)) as unknown as PosSession
      set({ session: updated })
    } catch {
      set({
        session: {
          ...session,
          totalSales: session.totalSales + sales,
          orderCount: session.orderCount + 1,
        },
      })
    }
  },
}))
