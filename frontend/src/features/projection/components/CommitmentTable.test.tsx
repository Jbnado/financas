import { render, screen } from '@testing-library/react'
import { CommitmentTable } from './CommitmentTable'
import type { InstallmentCommitment } from '../types'

const commitments: InstallmentCommitment[] = [
  { cycleName: 'Abril 2026', totalCommitted: '1500.00', installmentCount: 3 },
  { cycleName: 'Maio 2026', totalCommitted: '1000.00', installmentCount: 2 },
]

describe('CommitmentTable', () => {
  it('should show skeleton when loading', () => {
    const { container } = render(<CommitmentTable commitments={[]} isLoading />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('should show empty state when no commitments', () => {
    render(<CommitmentTable commitments={[]} />)
    expect(screen.getByText('Nenhuma parcela futura')).toBeInTheDocument()
  })

  it('should show heading', () => {
    render(<CommitmentTable commitments={commitments} />)
    expect(screen.getByText('Comprometimento Futuro')).toBeInTheDocument()
  })

  it('should render each commitment with cycle and count', () => {
    render(<CommitmentTable commitments={commitments} />)
    expect(screen.getByText('Abril 2026')).toBeInTheDocument()
    expect(screen.getByText('3 parcelas')).toBeInTheDocument()
    expect(screen.getByText('Maio 2026')).toBeInTheDocument()
    expect(screen.getByText('2 parcelas')).toBeInTheDocument()
  })

  it('should show singular "parcela" for count of 1', () => {
    render(<CommitmentTable commitments={[{ cycleName: 'Junho 2026', totalCommitted: '500.00', installmentCount: 1 }]} />)
    expect(screen.getByText('1 parcela')).toBeInTheDocument()
  })
})
