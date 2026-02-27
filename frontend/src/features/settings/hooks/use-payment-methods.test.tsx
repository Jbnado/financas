import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { usePaymentMethods } from './use-payment-methods'

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

const mockPaymentMethod = {
  id: 'pm-1',
  name: 'Nubank',
  type: 'credit' as const,
  dueDay: 15,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('usePaymentMethods', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch payment methods', async () => {
    vi.mocked(apiService.get).mockResolvedValueOnce([mockPaymentMethod])

    const { result } = renderHook(() => usePaymentMethods(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.paymentMethods).toEqual([mockPaymentMethod]))
    expect(apiService.get).toHaveBeenCalledWith('/payment-methods')
  })

  it('should create a payment method', async () => {
    vi.mocked(apiService.get).mockResolvedValue([])
    vi.mocked(apiService.post).mockResolvedValueOnce(mockPaymentMethod)

    const { result } = renderHook(() => usePaymentMethods(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      result.current.createPaymentMethod({ name: 'Nubank', type: 'credit', dueDay: 15 })
    })

    await waitFor(() => expect(apiService.post).toHaveBeenCalledWith('/payment-methods', {
      name: 'Nubank',
      type: 'credit',
      dueDay: 15,
    }))
  })

  it('should update a payment method', async () => {
    vi.mocked(apiService.get).mockResolvedValue([mockPaymentMethod])
    vi.mocked(apiService.put).mockResolvedValueOnce({ ...mockPaymentMethod, name: 'Nubank Gold' })

    const { result } = renderHook(() => usePaymentMethods(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      result.current.updatePaymentMethod({ id: 'pm-1', data: { name: 'Nubank Gold' } })
    })

    await waitFor(() => expect(apiService.put).toHaveBeenCalledWith('/payment-methods/pm-1', {
      name: 'Nubank Gold',
    }))
  })

  it('should remove a payment method', async () => {
    vi.mocked(apiService.get).mockResolvedValue([mockPaymentMethod])
    vi.mocked(apiService.delete).mockResolvedValueOnce({ ...mockPaymentMethod, isActive: false })

    const { result } = renderHook(() => usePaymentMethods(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      result.current.removePaymentMethod('pm-1')
    })

    await waitFor(() => expect(apiService.delete).toHaveBeenCalledWith('/payment-methods/pm-1'))
  })
})
