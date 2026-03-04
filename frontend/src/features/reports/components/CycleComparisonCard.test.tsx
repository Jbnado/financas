import { render, screen } from '@testing-library/react'
import { CycleComparisonCard } from './CycleComparisonCard'
import type { CycleComparison } from '../types'

const comparison: CycleComparison = {
  current: {
    cycleName: 'Fev 2026',
    salary: '7300.00',
    totalExpenses: '5000.00',
    netResult: '2300.00',
    categories: [
      { categoryName: 'Alimentação', categoryColor: '#f97316', total: '3000.00' },
      { categoryName: 'Transporte', categoryColor: '#3b82f6', total: '2000.00' },
    ],
  },
  previous: {
    cycleName: 'Jan 2026',
    salary: '7300.00',
    totalExpenses: '4000.00',
    netResult: '3300.00',
    categories: [
      { categoryName: 'Alimentação', categoryColor: '#f97316', total: '2500.00' },
      { categoryName: 'Transporte', categoryColor: '#3b82f6', total: '1500.00' },
    ],
  },
  diff: {
    expensesDiff: '1000.00',
    netResultDiff: '-1000.00',
  },
}

describe('CycleComparisonCard', () => {
  it('should show skeleton when loading', () => {
    const { container } = render(<CycleComparisonCard data={undefined} isLoading />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('should show empty state when no previous cycle', () => {
    const noPrev: CycleComparison = {
      current: comparison.current,
      previous: null,
      diff: null,
    }
    render(<CycleComparisonCard data={noPrev} />)
    expect(screen.getByText('Sem ciclo anterior para comparação')).toBeInTheDocument()
  })

  it('should show comparison heading with cycle names', () => {
    render(<CycleComparisonCard data={comparison} />)
    expect(screen.getByText('Fev 2026 vs Jan 2026')).toBeInTheDocument()
  })

  it('should show expenses and result rows', () => {
    render(<CycleComparisonCard data={comparison} />)
    expect(screen.getByText('Despesas')).toBeInTheDocument()
    expect(screen.getByText('Resultado')).toBeInTheDocument()
  })

  it('should show current expenses value', () => {
    render(<CycleComparisonCard data={comparison} />)
    // Current expenses: R$ 5.000,00
    expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument()
  })

  it('should show top categories', () => {
    render(<CycleComparisonCard data={comparison} />)
    expect(screen.getByText('Alimentação')).toBeInTheDocument()
    expect(screen.getByText('Transporte')).toBeInTheDocument()
  })
})
