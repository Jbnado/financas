import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import type { ReactNode } from 'react'
import { useAuth } from './use-auth'
import { useAuthStore } from '@/shared/stores/auth.store'
import { clearAccessToken } from '@/shared/services/api.service'

vi.mock('@/shared/services/api.service', async () => {
  const actual = await vi.importActual<typeof import('@/shared/services/api.service')>('@/shared/services/api.service')
  return {
    ...actual,
    apiService: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  }
})

import { apiService } from '@/shared/services/api.service'

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('useAuth', () => {
  beforeEach(() => {
    clearAccessToken()
    useAuthStore.setState({ isAuthenticated: false })
    vi.clearAllMocks()
  })

  it('should return isAuthenticated from store', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should call login API and set token on success', async () => {
    vi.mocked(apiService.post).mockResolvedValueOnce({ accessToken: 'new-token' })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login('admin@financas.local', '12345678')
    })

    expect(apiService.post).toHaveBeenCalledWith('/auth/login', {
      email: 'admin@financas.local',
      password: '12345678',
    })
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('should call logout API and clear auth', async () => {
    useAuthStore.getState().setAuthenticated('token')
    vi.mocked(apiService.post).mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.logout()
    })

    expect(apiService.post).toHaveBeenCalledWith('/auth/logout')
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
