import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  useBillingCycles,
  useBillingCycle,
  useCreateBillingCycle,
  useUpdateBillingCycle,
  useReopenBillingCycle,
} from './use-billing-cycles'
import { apiService } from '@/shared/services/api.service'
import type { BillingCycle, BillingCycleDetail } from '../types'

vi.mock('@/shared/services/api.service', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

const mockCycles: BillingCycle[] = [
  {
    id: 'cycle-1',
    name: 'Fevereiro 2026',
    startDate: '2026-01-25T00:00:00.000Z',
    endDate: '2026-02-24T00:00:00.000Z',
    salary: '7300.00',
    status: 'open',
    createdAt: '2026-01-20T00:00:00.000Z',
    updatedAt: '2026-01-20T00:00:00.000Z',
  },
  {
    id: 'cycle-2',
    name: 'Janeiro 2026',
    startDate: '2025-12-25T00:00:00.000Z',
    endDate: '2026-01-24T00:00:00.000Z',
    salary: '7300.00',
    status: 'closed',
    createdAt: '2025-12-20T00:00:00.000Z',
    updatedAt: '2025-12-20T00:00:00.000Z',
  },
]

const mockDetail: BillingCycleDetail = {
  ...mockCycles[0],
  summary: {
    salary: '7300.00',
    totalCards: '1500.00',
    totalFixed: '800.00',
    totalTaxes: '200.00',
    totalReceivables: '300.00',
    netResult: '5100.00',
  },
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useBillingCycles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch all billing cycles', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockCycles)

    const { result } = renderHook(() => useBillingCycles(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockCycles)
    expect(apiService.get).toHaveBeenCalledWith('/billing-cycles')
  })
})

describe('useBillingCycle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch a single billing cycle by id', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockDetail)

    const { result } = renderHook(() => useBillingCycle('cycle-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockDetail)
    expect(apiService.get).toHaveBeenCalledWith('/billing-cycles/cycle-1')
  })

  it('should not fetch when id is undefined', () => {
    const { result } = renderHook(() => useBillingCycle(undefined), {
      wrapper: createWrapper(),
    })

    expect(result.current.isFetching).toBe(false)
    expect(apiService.get).not.toHaveBeenCalled()
  })
})

describe('useCreateBillingCycle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a billing cycle', async () => {
    const newCycle = mockCycles[0]
    vi.mocked(apiService.post).mockResolvedValue(newCycle)

    const { result } = renderHook(() => useCreateBillingCycle(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      name: 'Fevereiro 2026',
      startDate: '2026-01-25T00:00:00.000Z',
      endDate: '2026-02-24T00:00:00.000Z',
      salary: '7300.00',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiService.post).toHaveBeenCalledWith('/billing-cycles', {
      name: 'Fevereiro 2026',
      startDate: '2026-01-25T00:00:00.000Z',
      endDate: '2026-02-24T00:00:00.000Z',
      salary: '7300.00',
    })
  })
})

describe('useUpdateBillingCycle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update a billing cycle', async () => {
    const updatedCycle = { ...mockCycles[0], name: 'Março 2026' }
    vi.mocked(apiService.put).mockResolvedValue(updatedCycle)

    const { result } = renderHook(() => useUpdateBillingCycle(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      id: 'cycle-1',
      dto: { name: 'Março 2026' },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiService.put).toHaveBeenCalledWith('/billing-cycles/cycle-1', {
      name: 'Março 2026',
    })
  })
})

describe('useReopenBillingCycle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should reopen a billing cycle', async () => {
    const reopenedCycle = { ...mockCycles[1], status: 'open', closedAt: null }
    vi.mocked(apiService.post).mockResolvedValue(reopenedCycle)

    const { result } = renderHook(() => useReopenBillingCycle(), {
      wrapper: createWrapper(),
    })

    result.current.mutate('cycle-2')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiService.post).toHaveBeenCalledWith('/billing-cycles/cycle-2/reopen')
  })
})
