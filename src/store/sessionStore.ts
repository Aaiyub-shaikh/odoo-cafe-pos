import { create } from 'zustand'
import type { PosSession } from '@/types'
import { useAuthStore } from './authStore'

interface SessionState {
  session: PosSession | null
  openSession: () => void
  closeSession: () => void
  updateSessionStats: (sales: number) => void
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  openSession: () => {
    const user = useAuthStore.getState().user
    if (!user || user.role !== 'cashier') return
    const session: PosSession = {
      id: `sess-${Date.now()}`,
      employeeId: user.id,
      employeeName: user.name,
      openedAt: new Date().toISOString(),
      status: 'open',
      openingCash: 5000,
      totalSales: 0,
      orderCount: 0,
    }
    set({ session })
  },
  closeSession: () => set({ session: null }),
  updateSessionStats: (sales) => {
    const { session } = get()
    if (!session) return
    set({
      session: {
        ...session,
        totalSales: session.totalSales + sales,
        orderCount: session.orderCount + 1,
      },
    })
  },
}))
