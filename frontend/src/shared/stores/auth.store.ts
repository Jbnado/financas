import { create } from 'zustand'
import { setAccessToken, clearAccessToken, getAccessToken } from '@/shared/services/api.service'

interface AuthState {
  isAuthenticated: boolean
  setAuthenticated: (token: string) => void
  clearAuth: () => void
  checkAuth: () => boolean
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (token: string) => {
    setAccessToken(token)
    set({ isAuthenticated: true })
  },
  clearAuth: () => {
    clearAccessToken()
    set({ isAuthenticated: false })
  },
  checkAuth: () => {
    const hasToken = getAccessToken() !== null
    set({ isAuthenticated: hasToken })
    return hasToken
  },
}))
