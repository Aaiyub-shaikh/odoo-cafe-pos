import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { DEMO_CREDENTIALS, mockUsers, CASHIER_DEMO_CREDENTIALS } from '@/mock/employees'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  rememberMe: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      rememberMe: false,
      login: async (email, password, remember = false) => {
        await new Promise((r) => setTimeout(r, 800))
        if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
          const user = mockUsers[0]
          set({ user, isAuthenticated: true, rememberMe: remember })
          return true
        }
        if (email === CASHIER_DEMO_CREDENTIALS.email && password === CASHIER_DEMO_CREDENTIALS.password) {
          const user = mockUsers[1]
          set({ user, isAuthenticated: true, rememberMe: remember })
          return true
        }
        const user = mockUsers.find((u) => u.email === email)
        if (user && password.length >= 6) {
          set({ user, isAuthenticated: true, rememberMe: remember })
          return true
        }
        return false
      },
      signup: async (name, email, _password) => {
        await new Promise((r) => setTimeout(r, 800))
        const user: User = { id: crypto.randomUUID(), name, email, role: 'admin' }
        set({ user, isAuthenticated: true, rememberMe: false })
        return true
      },
      logout: () => set({ user: null, isAuthenticated: false, rememberMe: false }),
      updateProfile: (data) =>
        set((s) => (s.user ? { user: { ...s.user, ...data } } : s)),
    }),
    { name: 'auth-storage', partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated, rememberMe: s.rememberMe }) }
  )
)
