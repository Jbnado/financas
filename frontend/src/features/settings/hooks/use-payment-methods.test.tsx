import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { usePaymentMethods } from './use-payment-methods'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

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
import { toast } from 'sonner'

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

  it('should create a payment method and show success toast', async () => {
    vi.mocked(apiService.get).mockResolvedValue([])
    vi.mocked(apiService.post).mockResolvedValueOnce(mockPaymentMethod)

    const { result } = renderHook(() => usePaymentMethods(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.createPaymentMethod({ name: 'Nubank', type: 'credit', dueDay: 15 })
    })

    expect(apiService.post).toHaveBeenCalledWith('/payment-methods', {
      name: 'Nubank',
      type: 'credit',
      dueDay: 15,
    })
    expect(toast.success).toHaveBeenCalledWith('Meio de pagamento criado')
  })

  it('should show error toast on create failure', async () => {
    vi.mocked(apiService.get).mockResolvedValue([])
    vi.mocked(apiService.post).mockRejectedValueOnce(new Error('fail'))

    const { result } = renderHook(() => usePaymentMethods(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.createPaymentMethod({ name: 'X', type: 'credit' }).catch(() => {})
    })

    expect(toast.error).toHaveBeenCalledWith('Erro ao criar meio de pagamento')
  })

  it('should update a payment method', async () => {
    vi.mocked(apiService.get).mockResolvedValue([mockPaymentMethod])
    vi.mocked(apiService.put).mockResolvedValueOnce({ ...mockPaymentMethod, name: 'Nubank Gold' })

    const { result } = renderHook(() => usePaymentMethods(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.updatePaymentMethod({ id: 'pm-1', data: { name: 'Nubank Gold' } })
    })

    expect(apiService.put).toHaveBeenCalledWith('/payment-methods/pm-1', {
      name: 'Nubank Gold',
    })
    expect(toast.success).toHaveBeenCalledWith('Meio de pagamento atualizado')
  })

  it('should show error toast on update failure', async () => {
    vi.mocked(apiService.get).mockResolvedValue([mockPaymentMethod])
    vi.mocked(apiService.put).mockRejectedValueOnce(new Error('fail'))

    const { result } = renderHook(() => usePaymentMethods(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.updatePaymentMethod({ id: 'pm-1', data: { name: 'X' } }).catch(() => {})
    })

    expect(toast.error).toHaveBeenCalledWith('Erro ao atualizar meio de pagamento')
  })

  it('should show error toast on remove failure', async () => {
    vi.mocked(apiService.get).mockResolvedValue([mockPaymentMethod])
    vi.mocked(apiService.delete).mockRejectedValueOnce(new Error('fail'))

    const { result } = renderHook(() => usePaymentMethods(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.removePaymentMethod('pm-1').catch(() => {})
    })

    expect(toast.error).toHaveBeenCalledWith('Erro ao remover meio de pagamento')
  })

  it('should remove a payment method', async () => {
    vi.mocked(apiService.get).mockResolvedValue([mockPaymentMethod])
    vi.mocked(apiService.delete).mockResolvedValueOnce({ ...mockPaymentMethod, isActive: false })

    const { result } = renderHook(() => usePaymentMethods(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.removePaymentMethod('pm-1')
    })

    expect(apiService.delete).toHaveBeenCalledWith('/payment-methods/pm-1')
    expect(toast.success).toHaveBeenCalledWith('Meio de pagamento removido')
  })
})
