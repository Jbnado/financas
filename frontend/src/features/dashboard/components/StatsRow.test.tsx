import { render, screen } from '@testing-library/react'
import { StatsRow } from './StatsRow'

describe('StatsRow', () => {
  it('should show skeleton when loading', () => {
    const { container } = render(
      <StatsRow salary="0.00" totalExpenses="0.00" totalReceivables="0.00" isLoading />,
    )
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('should show three stat cards with correct labels', () => {
    render(
      <StatsRow salary="7300.00" totalExpenses="5000.00" totalReceivables="200.00" />,
    )
    expect(screen.getByText('Receita')).toBeInTheDocument()
    expect(screen.getByText('Despesa')).toBeInTheDocument()
    expect(screen.getByText('A Receber')).toBeInTheDocument()
  })

  it('should display formatted currency values', () => {
    render(
      <StatsRow salary="7300.00" totalExpenses="5000.00" totalReceivables="200.00" />,
    )
    expect(screen.getByText('R$ 7.300,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 200,00')).toBeInTheDocument()
  })
})
