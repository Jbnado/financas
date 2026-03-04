import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useProjection, useInstallmentCommitments } from './use-projection'

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

const mockProjection = {
  projections: [
    {
      cycleName: 'Abril 2026',
      projectedSalary: '7000.00',
      projectedFixedExpenses: '2000.00',
      projectedTaxes: '500.00',
      projectedInstallments: '300.00',
      projectedNetResult: '4200.00',
    },
  ],
  alerts: [],
}

const mockCommitments = {
  commitments: [
    { cycleName: 'Abril 2026', totalCommitted: '1500.00', installmentCount: 3 },
  ],
}

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

describe('useProjection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch projection data with default 6 months', async () => {
    vi.mocked(apiService.get).mockResolvedValueOnce(mockProjection)

    const { result } = renderHook(() => useProjection(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.data).toEqual(mockProjection)
    })

    expect(apiService.get).toHaveBeenCalledWith('/projections?months=6')
  })

  it('should fetch projection with custom months', async () => {
    vi.mocked(apiService.get).mockResolvedValueOnce(mockProjection)

    const { result } = renderHook(() => useProjection(3), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.data).toEqual(mockProjection)
    })

    expect(apiService.get).toHaveBeenCalledWith('/projections?months=3')
  })

  it('should return loading state initially', () => {
    vi.mocked(apiService.get).mockReturnValueOnce(new Promise(() => {}))

    const { result } = renderHook(() => useProjection(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
  })
})

describe('useInstallmentCommitments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch installment commitments', async () => {
    vi.mocked(apiService.get).mockResolvedValueOnce(mockCommitments)

    const { result } = renderHook(() => useInstallmentCommitments(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.data).toEqual(mockCommitments)
    })

    expect(apiService.get).toHaveBeenCalledWith('/projections/installment-commitments')
  })
})
