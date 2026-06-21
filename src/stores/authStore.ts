import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Customer } from '@/api/types'
import * as authApi from '@/api/auth'

interface AuthState {
  user: Customer | null
  accessToken: string | null
  refreshToken: string | null
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; phone: string; email: string; password: string; address?: string }) => Promise<void>
  logout: () => void
  fetchProfile: () => Promise<void>
  updateProfile: (data: { name?: string; email?: string; address?: string }) => Promise<void>
  setTokens: (accessToken: string, refreshToken: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      login: async (email, password) => {
        const tokens = await authApi.login({ email, password })
        set({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token })
        const user = await authApi.getMe()
        set({ user })
      },

      register: async (data) => {
        const tokens = await authApi.register(data)
        set({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token })
        const user = await authApi.getMe()
        set({ user })
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null })
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      },

      fetchProfile: async () => {
        if (!get().accessToken) return
        try {
          const user = await authApi.getMe()
          set({ user })
        } catch {
          // Token might be invalid
        }
      },

      updateProfile: async (data) => {
        const user = await authApi.updateMe(data)
        set({ user })
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken })
      },
    }),
    {
      name: 'auth-storage',
      skipHydration: true,
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
)
