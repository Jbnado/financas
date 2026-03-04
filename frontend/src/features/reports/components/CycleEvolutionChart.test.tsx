import { render, screen } from '@testing-library/react'
import { CycleEvolutionChart } from './CycleEvolutionChart'
import type { CycleEvolutionEntry } from '../types'

vi.mock('recharts', () => ({
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const cycles: CycleEvolutionEntry[] = [
  { cycleId: 'c1', cycleName: 'Ciclo Janeiro/2026', salary: '7300.00', totalExpenses: '5000.00', netResult: '2300.00' },
  { cycleId: 'c2', cycleName: 'Ciclo Fevereiro/2026', salary: '7300.00', totalExpenses: '6000.00', netResult: '1300.00' },
]

describe('CycleEvolutionChart', () => {
  it('should show skeleton when loading', () => {
    const { container } = render(<CycleEvolutionChart cycles={[]} isLoading />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('should show empty state when no cycles', () => {
    render(<CycleEvolutionChart cycles={[]} />)
    expect(screen.getByText('Sem dados de evolução')).toBeInTheDocument()
  })

  it('should show section heading', () => {
    render(<CycleEvolutionChart cycles={cycles} />)
    expect(screen.getByText('Evolução do resultado líquido')).toBeInTheDocument()
  })

  it('should render area chart', () => {
    render(<CycleEvolutionChart cycles={cycles} />)
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
  })
})
