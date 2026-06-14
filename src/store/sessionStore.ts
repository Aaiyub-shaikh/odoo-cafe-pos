import { create } from 'zustand'
import type { PosSession } from '@/types'
import { useAuthStore } from './authStore'
import { sessionsApi } from '@/services/api'

function mapSession(raw: Record<string, unknown>): PosSession {
  return raw as unknown as PosSession
}

interface SessionState {
  session: PosSession | null
  isEnsuring: boolean
  openSession: () => Promise<PosSession | null>
  restoreSession: () => Promise<PosSession | null>
  ensureSession: () => Promise<PosSession | null>
  closeSession: () => Promise<void>
  updateSessionStats: (sales: number) => Promise<void>
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  isEnsuring: false,
  openSession: async () => {
    const user = useAuthStore.getState().user
    if (!user) return null
    try {
      const session = mapSession(
        await sessionsApi.open({
          employeeName: user.name,
          openingCash: 5000,
        })
      )
      set({ session })
      return session
    } catch {
      return null
    }
  },
  restoreSession: async () => {
    const user = useAuthStore.getState().user
    if (!user) return null
    try {
      const active = await sessionsApi.getActive()
      if (!active) return null
      const session = mapSession(active)
      set({ session })
      return session
    } catch {
      return null
    }
  },
  ensureSession: async () => {
    const { session, isEnsuring } = get()
    if (session) return session
    if (isEnsuring) return null

    set({ isEnsuring: true })
    try {
      const restored = await get().restoreSession()
      if (restored) return restored
      return await get().openSession()
    } finally {
      set({ isEnsuring: false })
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
