import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useTaxes } from './use-taxes'

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

const mockTaxes = [
  {
    id: 'tax-1',
    name: 'DAS',
    rate: '6.00',
    estimatedAmount: '500.00',
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

describe('useTaxes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch taxes list', async () => {
    vi.mocked(apiService.get).mockResolvedValueOnce(mockTaxes)

    const { result } = renderHook(() => useTaxes(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.taxes).toEqual(mockTaxes)
    })

    expect(apiService.get).toHaveBeenCalledWith('/taxes')
  })

  it('should return loading state initially', () => {
    vi.mocked(apiService.get).mockReturnValueOnce(new Promise(() => {}))

    const { result } = renderHook(() => useTaxes(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
  })

  it('should create a tax', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockTaxes)
    vi.mocked(apiService.post).mockResolvedValueOnce({
      id: 'tax-2',
      name: 'ISS',
      rate: '5.00',
      estimatedAmount: '300.00',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    const { result } = renderHook(() => useTaxes(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.taxes).toBeDefined()
    })

    await act(async () => {
      await result.current.createTax({
        name: 'ISS',
        rate: '5.00',
        estimatedAmount: '300.00',
      })
    })

    expect(apiService.post).toHaveBeenCalledWith('/taxes', {
      name: 'ISS',
      rate: '5.00',
      estimatedAmount: '300.00',
    })
  })

  it('should update a tax', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockTaxes)
    vi.mocked(apiService.put).mockResolvedValueOnce({
      ...mockTaxes[0],
      name: 'DAS Atualizado',
    })

    const { result } = renderHook(() => useTaxes(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.taxes).toBeDefined()
    })

    await act(async () => {
      await result.current.updateTax({
        id: 'tax-1',
        data: { name: 'DAS Atualizado' },
      })
    })

    expect(apiService.put).toHaveBeenCalledWith('/taxes/tax-1', {
      name: 'DAS Atualizado',
    })
  })

  it('should remove (soft-delete) a tax', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockTaxes)
    vi.mocked(apiService.delete).mockResolvedValueOnce({ ...mockTaxes[0], isActive: false })

    const { result } = renderHook(() => useTaxes(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.taxes).toBeDefined()
    })

    await act(async () => {
      await result.current.removeTax('tax-1')
    })

    expect(apiService.delete).toHaveBeenCalledWith('/taxes/tax-1')
  })
})
