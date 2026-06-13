import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { authApi, setAuthToken } from '@/services/api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  rememberMe: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      rememberMe: false,
      login: async (email, password, remember = false) => {
        try {
          const { token, user } = await authApi.login(email, password)
          const mappedUser = user as unknown as User
          setAuthToken(token)
          set({ user: mappedUser, token, isAuthenticated: true, rememberMe: remember })
          return true
        } catch {
          return false
        }
      },
      signup: async (name, email, password) => {
        try {
          const { token, user } = await authApi.signup(name, email, password)
          const mappedUser = user as unknown as User
          setAuthToken(token)
          set({ user: mappedUser, token, isAuthenticated: true, rememberMe: false })
          return true
        } catch {
          return false
        }
      },
      logout: () => {
        setAuthToken(null)
        set({ user: null, token: null, isAuthenticated: false, rememberMe: false })
      },
      updateProfile: async (data) => {
        const updated = await authApi.updateProfile(data)
        set((s) => (s.user ? { user: { ...s.user, ...(updated as unknown as User) } } : s))
      },
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        isAuthenticated: s.isAuthenticated,
        rememberMe: s.rememberMe,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) setAuthToken(state.token)
      },
    }
  )
)
