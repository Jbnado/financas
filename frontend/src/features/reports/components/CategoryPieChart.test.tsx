import { render, screen } from '@testing-library/react'
import { CategoryPieChart } from './CategoryPieChart'
import type { CategoryDistributionItem } from '../types'

// Mock recharts to avoid rendering issues in test env
vi.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => <div />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tooltip: () => <div />,
}))

const items: CategoryDistributionItem[] = [
  { categoryId: 'c1', categoryName: 'Alimentação', categoryColor: '#f97316', total: '800.00', percentage: 80 },
  { categoryId: 'c2', categoryName: 'Transporte', categoryColor: '#3b82f6', total: '200.00', percentage: 20 },
]

describe('CategoryPieChart', () => {
  it('should show skeleton when loading', () => {
    const { container } = render(<CategoryPieChart items={[]} isLoading />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('should show empty state when no items', () => {
    render(<CategoryPieChart items={[]} />)
    expect(screen.getByText('Sem dados de categoria neste ciclo')).toBeInTheDocument()
  })

  it('should show section heading', () => {
    render(<CategoryPieChart items={items} />)
    expect(screen.getByText('Distribuição por categoria')).toBeInTheDocument()
  })

  it('should show legend with category names and percentages', () => {
    render(<CategoryPieChart items={items} />)
    expect(screen.getByText('Alimentação')).toBeInTheDocument()
    expect(screen.getByText('Transporte')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('20%')).toBeInTheDocument()
  })

  it('should render pie chart', () => {
    render(<CategoryPieChart items={items} />)
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
  })
})
