import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import ProjecoesPage from './ProjecoesPage'

vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => <div />,
  Legend: () => <div />,
}))

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
  commitments: [],
}

vi.mock('../hooks/use-projection', () => ({
  useProjection: vi.fn(() => ({
    data: mockProjection,
    isLoading: false,
  })),
  useInstallmentCommitments: vi.fn(() => ({
    data: mockCommitments,
    isLoading: false,
  })),
}))

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

describe('ProjecoesPage', () => {
  it('should render page title', () => {
    render(<ProjecoesPage />, { wrapper: createWrapper() })
    expect(screen.getByText('Projeção Financeira')).toBeInTheDocument()
  })

  it('should render horizon selector with default 6 meses', () => {
    render(<ProjecoesPage />, { wrapper: createWrapper() })
    const select = screen.getByLabelText('Horizonte') as HTMLSelectElement
    expect(select.value).toBe('6')
  })

  it('should render all sections', () => {
    render(<ProjecoesPage />, { wrapper: createWrapper() })
    expect(screen.getByText('Resumo da Projeção')).toBeInTheDocument()
    expect(screen.getByText('Projeção de Receita vs Despesas')).toBeInTheDocument()
    expect(screen.getByText('Alertas')).toBeInTheDocument()
    expect(screen.getByText('Comprometimento Futuro')).toBeInTheDocument()
  })

  it('should show positive alert message when no alerts', () => {
    render(<ProjecoesPage />, { wrapper: createWrapper() })
    expect(screen.getByText('Nenhum alerta — projeção positiva')).toBeInTheDocument()
  })

  it('should show empty commitments message', () => {
    render(<ProjecoesPage />, { wrapper: createWrapper() })
    expect(screen.getByText('Nenhuma parcela futura')).toBeInTheDocument()
  })

  it('should have horizon options 3, 6, 12', () => {
    render(<ProjecoesPage />, { wrapper: createWrapper() })
    const select = screen.getByLabelText('Horizonte')
    const options = select.querySelectorAll('option')
    expect(options).toHaveLength(3)
    expect(options[0].value).toBe('3')
    expect(options[1].value).toBe('6')
    expect(options[2].value).toBe('12')
  })

  it('should allow changing horizon', async () => {
    const user = userEvent.setup()
    render(<ProjecoesPage />, { wrapper: createWrapper() })
    const select = screen.getByLabelText('Horizonte')
    await user.selectOptions(select, '12')
    expect((select as HTMLSelectElement).value).toBe('12')
  })
})
