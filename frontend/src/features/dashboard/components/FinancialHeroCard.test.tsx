import { render, screen } from '@testing-library/react'
import { FinancialHeroCard } from './FinancialHeroCard'

describe('FinancialHeroCard', () => {
  it('should show skeleton when loading', () => {
    const { container } = render(
      <FinancialHeroCard netResult="0.00" salary="0.00" totalExpenses="0.00" isLoading />,
    )
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('should show positive net result in green with + prefix', () => {
    render(
      <FinancialHeroCard netResult="1500.00" salary="7300.00" totalExpenses="5800.00" />,
    )
    const result = screen.getByText(/\+R\$\s*1\.500,00/)
    expect(result).toBeInTheDocument()
    expect(result).toHaveStyle({ color: '#6ee7a0' })
  })

  it('should show negative net result in red without + prefix', () => {
    render(
      <FinancialHeroCard netResult="-500.00" salary="5000.00" totalExpenses="5500.00" />,
    )
    const result = screen.getByText(/-R\$\s*500,00/)
    expect(result).toBeInTheDocument()
    expect(result).toHaveStyle({ color: '#fca5a5' })
  })

  it('should show zero net result in green', () => {
    render(
      <FinancialHeroCard netResult="0.00" salary="5000.00" totalExpenses="5000.00" />,
    )
    const result = screen.getByText(/\+R\$\s*0,00/)
    expect(result).toHaveStyle({ color: '#6ee7a0' })
  })

  it('should show receita and despesa labels', () => {
    render(
      <FinancialHeroCard netResult="1000.00" salary="7300.00" totalExpenses="6300.00" />,
    )
    expect(screen.getByText(/Receita/)).toBeInTheDocument()
    expect(screen.getByText(/Despesas/)).toBeInTheDocument()
  })
})
