import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { ApiError, authApi, setAuthToken } from '@/services/api'
import { getPersistedToken } from '@/services/authToken'

type AuthResult = { success: true } | { success: false; error: string }

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  rememberMe: boolean
  isInitializing: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<AuthResult>
  signup: (name: string, email: string, password: string) => Promise<AuthResult>
  signupEmployee: (name: string, email: string, password: string) => Promise<AuthResult>
  logout: () => void
  validateSession: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

function mapUser(raw: Record<string, unknown>): User {
  return {
    id: String(raw.id),
    name: String(raw.name),
    email: String(raw.email),
    role: raw.role as User['role'],
    avatar: raw.avatar ? String(raw.avatar) : undefined,
  }
}

function authErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message
  return fallback
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      rememberMe: false,
      isInitializing: true,

      login: async (email, password, remember = false) => {
        try {
          const { token, user } = await authApi.login(email, password)
          const mappedUser = mapUser(user)
          setAuthToken(token)
          set({ user: mappedUser, token, isAuthenticated: true, rememberMe: remember, isInitializing: false })
          return { success: true }
        } catch (err) {
          return { success: false, error: authErrorMessage(err, 'Invalid email or password') }
        }
      },

      signup: async (name, email, password) => {
        try {
          const { token, user } = await authApi.signup(name, email, password)
          const mappedUser = mapUser(user)
          setAuthToken(token)
          set({ user: mappedUser, token, isAuthenticated: true, rememberMe: false, isInitializing: false })
          return { success: true }
        } catch (err) {
          return { success: false, error: authErrorMessage(err, 'Registration failed') }
        }
      },

      signupEmployee: async (name, email, password) => {
        try {
          const { token, user } = await authApi.signupEmployee(name, email, password)
          const mappedUser = mapUser(user)
          setAuthToken(token)
          set({ user: mappedUser, token, isAuthenticated: true, rememberMe: false, isInitializing: false })
          return { success: true }
        } catch (err) {
          return { success: false, error: authErrorMessage(err, 'Registration failed') }
        }
      },

      logout: () => {
        setAuthToken(null)
        set({ user: null, token: null, isAuthenticated: false, rememberMe: false, isInitializing: false })
      },

      validateSession: async () => {
        const { token } = get()
        if (!token) {
          set({ isAuthenticated: false, user: null, isInitializing: false })
          return
        }

        setAuthToken(token)
        try {
          const user = await authApi.me()
          set({ user: mapUser(user), isAuthenticated: true, isInitializing: false })
        } catch {
          setAuthToken(null)
          set({ user: null, token: null, isAuthenticated: false, isInitializing: false })
        }
      },

      updateProfile: async (data) => {
        const updated = await authApi.updateProfile(data)
        set((s) => (s.user ? { user: { ...s.user, ...mapUser(updated) } } : s))
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
        const t = state?.token ?? getPersistedToken()
        if (t) setAuthToken(t)
      },
    }
  )
)
