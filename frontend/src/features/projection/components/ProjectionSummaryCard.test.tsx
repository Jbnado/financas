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

  it('should show worst month in red when negative', () => {
    const { container } = render(<ProjectionSummaryCard projections={projections} />)
    // Worst month is Junho 2026 with -1500.00 — should be red
    const worstCard = container.querySelectorAll('.rounded-xl')[1]
    const worstValue = worstCard.querySelector('.text-lg') as HTMLElement
    expect(worstValue.style.color).toBe('rgb(252, 165, 165)') // #fca5a5
  })

  it('should show worst month in green when all positive', () => {
    const allPositive: ProjectionEntry[] = [
      { cycleName: 'Abril 2026', projectedSalary: '7000.00', projectedFixedExpenses: '2000.00', projectedTaxes: '500.00', projectedInstallments: '300.00', projectedNetResult: '4200.00' },
      { cycleName: 'Maio 2026', projectedSalary: '7000.00', projectedFixedExpenses: '3000.00', projectedTaxes: '500.00', projectedInstallments: '500.00', projectedNetResult: '3000.00' },
    ]
    const { container } = render(<ProjectionSummaryCard projections={allPositive} />)
    // Both are positive — worst (3000) should still be green
    const worstCard = container.querySelectorAll('.rounded-xl')[1]
    const worstValue = worstCard.querySelector('.text-lg') as HTMLElement
    expect(worstValue.style.color).toBe('rgb(110, 231, 160)') // #6ee7a0
  })

  it('should show best month in red when all negative', () => {
    const allNegative: ProjectionEntry[] = [
      { cycleName: 'Abril 2026', projectedSalary: '3000.00', projectedFixedExpenses: '4000.00', projectedTaxes: '500.00', projectedInstallments: '300.00', projectedNetResult: '-1800.00' },
      { cycleName: 'Maio 2026', projectedSalary: '3000.00', projectedFixedExpenses: '5000.00', projectedTaxes: '500.00', projectedInstallments: '500.00', projectedNetResult: '-3000.00' },
    ]
    const { container } = render(<ProjectionSummaryCard projections={allNegative} />)
    // Best is -1800 — still negative, should be red
    const bestCard = container.querySelectorAll('.rounded-xl')[2]
    const bestValue = bestCard.querySelector('.text-lg') as HTMLElement
    expect(bestValue.style.color).toBe('rgb(252, 165, 165)') // #fca5a5
  })
})
