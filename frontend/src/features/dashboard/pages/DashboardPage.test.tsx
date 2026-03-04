import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
import type { ReactNode } from 'react'
import DashboardPage from './DashboardPage'
import { useBillingCycles, useBillingCycle } from '@/features/billing-cycle/hooks/use-billing-cycles'

vi.mock('@/features/billing-cycle/hooks/use-billing-cycles', () => ({
  useBillingCycles: vi.fn(),
  useBillingCycle: vi.fn(),
  useCreateBillingCycle: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useUpdateBillingCycle: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}))

const mockSummary = {
  salary: '7300.00',
  totalCards: '3000.00',
  totalFixed: '1500.00',
  totalTaxes: '500.00',
  totalExpenses: '5000.00',
  totalReceivables: '200.00',
  netResult: '2500.00',
}

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
  beforeEach(() => {
    vi.mocked(useBillingCycle).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof useBillingCycle>)
  })

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

  it('should show CycleSelector and dashboard content when cycles exist', () => {
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

    vi.mocked(useBillingCycle).mockReturnValue({
      data: {
        id: 'cycle-1',
        name: 'Fevereiro 2026',
        startDate: '2026-01-25T00:00:00.000Z',
        endDate: '2026-02-24T00:00:00.000Z',
        salary: '7300.00',
        status: 'open',
        createdAt: '2026-01-20T00:00:00.000Z',
        updatedAt: '2026-01-20T00:00:00.000Z',
        summary: mockSummary,
        categoryBreakdown: [
          { categoryId: 'c1', categoryName: 'Alimentação', categoryColor: '#f97316', total: '2000.00' },
        ],
        recentTransactions: [
          {
            id: 't1',
            description: 'Supermercado',
            amount: '150.00',
            userAmount: '100.00',
            date: '2026-02-10T00:00:00.000Z',
            isPaid: true,
            category: { id: 'c1', name: 'Alimentação', color: '#f97316' },
            paymentMethod: { id: 'pm1', name: 'Nubank' },
          },
        ],
      },
      isLoading: false,
    } as ReturnType<typeof useBillingCycle>)

    render(<DashboardPage />, { wrapper: createWrapper() })

    expect(screen.getByText(/25\/jan/i)).toBeInTheDocument()
    expect(screen.queryByText(/nenhum ciclo encontrado/i)).not.toBeInTheDocument()
    // Dashboard content rendered
    expect(screen.getByText('Resultado líquido')).toBeInTheDocument()
    expect(screen.getByText('Receita')).toBeInTheDocument()
    expect(screen.getByText('Despesa')).toBeInTheDocument()
    expect(screen.getByText('Alimentação')).toBeInTheDocument()
    expect(screen.getByText('Supermercado')).toBeInTheDocument()
  })

  it('should show empty transactions message when cycle has no transactions', () => {
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

    vi.mocked(useBillingCycle).mockReturnValue({
      data: {
        id: 'cycle-1',
        name: 'Fevereiro 2026',
        startDate: '2026-01-25T00:00:00.000Z',
        endDate: '2026-02-24T00:00:00.000Z',
        salary: '7300.00',
        status: 'open',
        createdAt: '2026-01-20T00:00:00.000Z',
        updatedAt: '2026-01-20T00:00:00.000Z',
        summary: { ...mockSummary, totalCards: '0.00', totalExpenses: '0.00', netResult: '7300.00' },
        categoryBreakdown: [],
        recentTransactions: [],
      },
      isLoading: false,
    } as ReturnType<typeof useBillingCycle>)

    render(<DashboardPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Registre seu primeiro gasto')).toBeInTheDocument()
  })
})
