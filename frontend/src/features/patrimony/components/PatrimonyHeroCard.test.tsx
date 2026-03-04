import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PatrimonyHeroCard } from './PatrimonyHeroCard'
import type { PatrimonySummary } from '../types'

const mockSummary: PatrimonySummary = {
  totalBankAccounts: '17000.50',
  totalInvestments: '15300.00',
  totalAssets: '32300.50',
  futureInstallments: '2500.00',
  netPatrimony: '29800.50',
}

describe('PatrimonyHeroCard', () => {
  it('should show loading skeleton when isLoading', () => {
    render(<PatrimonyHeroCard summary={undefined} isLoading={true} />)
    // Skeleton should render (no specific text)
    expect(screen.queryByTestId('total-assets')).not.toBeInTheDocument()
  })

  it('should render nothing when no summary and not loading', () => {
    const { container } = render(<PatrimonyHeroCard summary={undefined} isLoading={false} />)
    expect(container.innerHTML).toBe('')
  })

  it('should display total assets', () => {
    render(<PatrimonyHeroCard summary={mockSummary} isLoading={false} />)
    expect(screen.getByTestId('total-assets')).toBeInTheDocument()
  })

  it('should display net patrimony', () => {
    render(<PatrimonyHeroCard summary={mockSummary} isLoading={false} />)
    expect(screen.getByTestId('net-patrimony')).toBeInTheDocument()
  })

  it('should display future installments text when > 0', () => {
    render(<PatrimonyHeroCard summary={mockSummary} isLoading={false} />)
    expect(screen.getByText(/parcelas comprometidas/i)).toBeInTheDocument()
  })

  it('should not display future installments when 0', () => {
    const summaryNoInstallments = { ...mockSummary, futureInstallments: '0' }
    render(<PatrimonyHeroCard summary={summaryNoInstallments} isLoading={false} />)
    expect(screen.queryByText(/parcelas comprometidas/i)).not.toBeInTheDocument()
  })
})
