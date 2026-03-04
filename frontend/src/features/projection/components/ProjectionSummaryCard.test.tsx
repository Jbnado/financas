import { render, screen } from '@testing-library/react'
import { ProjectionSummaryCard } from './ProjectionSummaryCard'
import type { ProjectionEntry } from '../types'

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
    projectedFixedExpenses: '3000.00',
    projectedTaxes: '500.00',
    projectedInstallments: '500.00',
    projectedNetResult: '3000.00',
  },
  {
    cycleName: 'Junho 2026',
    projectedSalary: '7000.00',
    projectedFixedExpenses: '4000.00',
    projectedTaxes: '1000.00',
    projectedInstallments: '3500.00',
    projectedNetResult: '-1500.00',
  },
]

describe('ProjectionSummaryCard', () => {
  it('should show skeleton when loading', () => {
    const { container } = render(<ProjectionSummaryCard projections={[]} isLoading />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('should render nothing when no projections', () => {
    const { container } = render(<ProjectionSummaryCard projections={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('should show heading', () => {
    render(<ProjectionSummaryCard projections={projections} />)
    expect(screen.getByText('Resumo da Projeção')).toBeInTheDocument()
  })

  it('should display average, worst and best months', () => {
    render(<ProjectionSummaryCard projections={projections} />)
    expect(screen.getByText('Média Resultado')).toBeInTheDocument()
    expect(screen.getByText('Pior Mês')).toBeInTheDocument()
    expect(screen.getByText('Melhor Mês')).toBeInTheDocument()
    expect(screen.getByText('Junho 2026')).toBeInTheDocument() // worst
    expect(screen.getByText('Abril 2026')).toBeInTheDocument() // best
  })
})
