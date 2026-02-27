import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './auth.store'
import { getAccessToken, clearAccessToken } from '@/shared/services/api.service'

describe('useAuthStore', () => {
  beforeEach(() => {
    clearAccessToken()
    useAuthStore.setState({ isAuthenticated: false })
  })

  it('should start as not authenticated', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('should set authenticated and store token in memory', () => {
    useAuthStore.getState().setAuthenticated('my-token')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(getAccessToken()).toBe('my-token')
  })

  it('should clear auth and remove token', () => {
    useAuthStore.getState().setAuthenticated('my-token')
    useAuthStore.getState().clearAuth()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(getAccessToken()).toBeNull()
  })

  it('should check auth based on token presence', () => {
    expect(useAuthStore.getState().checkAuth()).toBe(false)
    useAuthStore.getState().setAuthenticated('token')
    expect(useAuthStore.getState().checkAuth()).toBe(true)
  })
})
