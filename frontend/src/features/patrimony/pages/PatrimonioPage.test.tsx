import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import PatrimonioPage from './PatrimonioPage'

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

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  Tooltip: () => null,
  Legend: () => null,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

import { apiService } from '@/shared/services/api.service'

const mockSummary = {
  totalBankAccounts: '5000',
  totalInvestments: '10000',
  totalAssets: '15000',
  futureInstallments: '1000',
  netPatrimony: '14000',
}

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={qc}>
      <PatrimonioPage />
    </QueryClientProvider>,
  )
}

describe('PatrimonioPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiService.get).mockImplementation((path: string) => {
      if (path.includes('summary')) return Promise.resolve(mockSummary)
      if (path.includes('distribution')) return Promise.resolve({ items: [], grandTotal: '0' })
      if (path.includes('evolution')) return Promise.resolve({ snapshots: [] })
      if (path.includes('bank-accounts')) return Promise.resolve([])
      if (path.includes('investments')) return Promise.resolve([])
      return Promise.resolve([])
    })
  })

  it('should render page title', () => {
    renderPage()
    expect(screen.getByText('Patrimônio')).toBeInTheDocument()
  })

  it('should render three tab buttons', () => {
    renderPage()
    expect(screen.getByText('Contas')).toBeInTheDocument()
    expect(screen.getByText('Investimentos')).toBeInTheDocument()
    expect(screen.getByText('Gráficos')).toBeInTheDocument()
  })

  it('should show Contas tab content by default', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Contas Bancárias')).toBeInTheDocument()
    })
  })

  it('should switch to Investimentos tab', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByText('Investimentos'))

    await waitFor(() => {
      expect(screen.getByText('Nenhum investimento cadastrado')).toBeInTheDocument()
    })
  })

  it('should switch to Gráficos tab', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByText('Gráficos'))

    await waitFor(() => {
      expect(screen.getByText('Distribuição')).toBeInTheDocument()
      expect(screen.getByText('Evolução')).toBeInTheDocument()
    })
  })

  it('should show hero card with summary data', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('total-assets')).toBeInTheDocument()
      expect(screen.getByTestId('net-patrimony')).toBeInTheDocument()
    })
  })
})
