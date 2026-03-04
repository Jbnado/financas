import { render, screen } from '@testing-library/react'
import { ProjectionChart } from './ProjectionChart'
import type { ProjectionEntry } from '../types'

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

const projections: ProjectionEntry[] = [
  {
    cycleName: 'Abril 2026',
    projectedSalary: '7000.00',
    projectedFixedExpenses: '2000.00',
    projectedTaxes: '500.00',
    projectedInstallments: '300.00',
    projectedNetResult: '4200.00',
  },
  {
    cycleName: 'Maio 2026',
    projectedSalary: '7000.00',
    projectedFixedExpenses: '2000.00',
    projectedTaxes: '500.00',
    projectedInstallments: '300.00',
    projectedNetResult: '4200.00',
  },
]

describe('ProjectionChart', () => {
  it('should show skeleton when loading', () => {
    const { container } = render(<ProjectionChart projections={[]} isLoading />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('should show empty state when no projections', () => {
    render(<ProjectionChart projections={[]} />)
    expect(screen.getByText('Sem dados para projeção')).toBeInTheDocument()
  })

  it('should show section heading', () => {
    render(<ProjectionChart projections={projections} />)
    expect(screen.getByText('Projeção de Receita vs Despesas')).toBeInTheDocument()
  })

  it('should render bar chart', () => {
    render(<ProjectionChart projections={projections} />)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })
})
