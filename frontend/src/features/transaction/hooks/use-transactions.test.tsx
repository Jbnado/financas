import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useTransactions } from './use-transactions'

vi.mock('@/shared/services/api.service', async () => {
  const actual = await vi.importActual<typeof import('@/shared/services/api.service')>('@/shared/services/api.service')
  return {
    ...actual,
    apiService: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  }
})

import { apiService } from '@/shared/services/api.service'

const mockTransactions = [
  {
    id: 'tx-1',
    description: 'Supermercado',
    amount: '125.50',
    date: '2026-03-01T00:00:00.000Z',
    isPaid: false,
    installmentNumber: null,
    totalInstallments: null,
    userId: 'user-1',
    billingCycleId: 'cycle-1',
    categoryId: 'cat-1',
    paymentMethodId: 'pm-1',
    parentTransactionId: null,
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
    category: { id: 'cat-1', name: 'Alimentação', icon: null, color: '#22c55e' },
    paymentMethod: { id: 'pm-1', name: 'Nubank', type: 'credit' as const },
  },
]

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

describe('useTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch transactions for a cycle', async () => {
    vi.mocked(apiService.get).mockResolvedValueOnce(mockTransactions)

    const { result } = renderHook(
      () => useTransactions('cycle-1'),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.transactions).toEqual(mockTransactions)
    })

    expect(apiService.get).toHaveBeenCalledWith('/billing-cycles/cycle-1/transactions')
  })

  it('should not fetch when cycleId is undefined', () => {
    const { result } = renderHook(
      () => useTransactions(undefined),
      { wrapper: createWrapper() },
    )

    expect(result.current.isLoading).toBe(false)
    expect(result.current.transactions).toEqual([])
  })

  it('should append filter query params', async () => {
    vi.mocked(apiService.get).mockResolvedValueOnce([])

    renderHook(
      () => useTransactions('cycle-1', { categoryId: 'cat-1', isPaid: true }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(apiService.get).toHaveBeenCalledWith(
        '/billing-cycles/cycle-1/transactions?categoryId=cat-1&isPaid=true',
      )
    })
  })

  it('should create a transaction', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockTransactions)
    vi.mocked(apiService.post).mockResolvedValueOnce(mockTransactions[0])

    const { result } = renderHook(
      () => useTransactions('cycle-1'),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.transactions).toBeDefined()
    })

    await act(async () => {
      await result.current.createTransaction({
        description: 'Supermercado',
        amount: '125.50',
        date: '2026-03-01T00:00:00.000Z',
        billingCycleId: 'cycle-1',
        categoryId: 'cat-1',
        paymentMethodId: 'pm-1',
      })
    })

    expect(apiService.post).toHaveBeenCalledWith('/transactions', expect.objectContaining({
      description: 'Supermercado',
    }))
  })

  it('should toggle paid status', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockTransactions)
    vi.mocked(apiService.patch).mockResolvedValueOnce({ ...mockTransactions[0], isPaid: true })

    const { result } = renderHook(
      () => useTransactions('cycle-1'),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.transactions).toBeDefined()
    })

    act(() => {
      result.current.togglePaid('tx-1')
    })

    await waitFor(() => {
      expect(apiService.patch).toHaveBeenCalledWith('/transactions/tx-1/toggle-paid')
    })
  })
})
