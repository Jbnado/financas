import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useFixedExpenses } from './use-fixed-expenses'

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

const mockExpenses = [
  {
    id: 'fe-1',
    name: 'Aluguel',
    estimatedAmount: '1500.00',
    dueDay: 10,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'fe-2',
    name: 'Internet',
    estimatedAmount: '120.00',
    dueDay: 15,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
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

describe('useFixedExpenses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch fixed expenses list', async () => {
    vi.mocked(apiService.get).mockResolvedValueOnce(mockExpenses)

    const { result } = renderHook(() => useFixedExpenses(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.fixedExpenses).toEqual(mockExpenses)
    })

    expect(apiService.get).toHaveBeenCalledWith('/fixed-expenses')
  })

  it('should return loading state initially', () => {
    vi.mocked(apiService.get).mockReturnValueOnce(new Promise(() => {}))

    const { result } = renderHook(() => useFixedExpenses(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
  })

  it('should create a fixed expense', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockExpenses)
    vi.mocked(apiService.post).mockResolvedValueOnce({
      id: 'fe-3',
      name: 'Energia',
      estimatedAmount: '200.00',
      dueDay: 20,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    const { result } = renderHook(() => useFixedExpenses(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.fixedExpenses).toBeDefined()
    })

    await act(async () => {
      await result.current.createFixedExpense({
        name: 'Energia',
        estimatedAmount: '200.00',
        dueDay: 20,
      })
    })

    expect(apiService.post).toHaveBeenCalledWith('/fixed-expenses', {
      name: 'Energia',
      estimatedAmount: '200.00',
      dueDay: 20,
    })
  })

  it('should update a fixed expense', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockExpenses)
    vi.mocked(apiService.put).mockResolvedValueOnce({
      ...mockExpenses[0],
      name: 'Aluguel Atualizado',
    })

    const { result } = renderHook(() => useFixedExpenses(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.fixedExpenses).toBeDefined()
    })

    await act(async () => {
      await result.current.updateFixedExpense({
        id: 'fe-1',
        data: { name: 'Aluguel Atualizado' },
      })
    })

    expect(apiService.put).toHaveBeenCalledWith('/fixed-expenses/fe-1', {
      name: 'Aluguel Atualizado',
    })
  })

  it('should remove (soft-delete) a fixed expense', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockExpenses)
    vi.mocked(apiService.delete).mockResolvedValueOnce({ ...mockExpenses[0], isActive: false })

    const { result } = renderHook(() => useFixedExpenses(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.fixedExpenses).toBeDefined()
    })

    await act(async () => {
      await result.current.removeFixedExpense('fe-1')
    })

    expect(apiService.delete).toHaveBeenCalledWith('/fixed-expenses/fe-1')
  })
})
