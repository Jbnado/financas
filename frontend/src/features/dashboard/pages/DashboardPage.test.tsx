import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
import type { ReactNode } from 'react'
import DashboardPage from './DashboardPage'
import { useBillingCycles } from '@/features/billing-cycle/hooks/use-billing-cycles'

vi.mock('@/features/billing-cycle/hooks/use-billing-cycles', () => ({
  useBillingCycles: vi.fn(),
  useCreateBillingCycle: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('DashboardPage', () => {
  it('should show empty state when no cycles exist', () => {
    vi.mocked(useBillingCycles).mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
    } as ReturnType<typeof useBillingCycles>)

    render(<DashboardPage />, { wrapper: createWrapper() })

    expect(screen.getByText(/nenhum ciclo encontrado/i)).toBeInTheDocument()
    expect(screen.getByText(/crie seu primeiro ciclo/i)).toBeInTheDocument()
  })

  it('should show CycleSelector when cycles exist', () => {
    vi.mocked(useBillingCycles).mockReturnValue({
      data: [
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
      ],
      isLoading: false,
      isSuccess: true,
    } as ReturnType<typeof useBillingCycles>)

    render(<DashboardPage />, { wrapper: createWrapper() })

    expect(screen.getByText(/25\/jan/i)).toBeInTheDocument()
    expect(screen.queryByText(/nenhum ciclo encontrado/i)).not.toBeInTheDocument()
  })
})
