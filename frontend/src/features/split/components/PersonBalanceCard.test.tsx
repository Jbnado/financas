import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PersonBalanceCard } from './PersonBalanceCard'

describe('PersonBalanceCard', () => {
  it('should render person name and pending amount', () => {
    render(
      <PersonBalanceCard
        personName="Joao Silva"
        totalPending="150.00"
        onClick={vi.fn()}
      />,
    )

    expect(screen.getByText('Joao Silva')).toBeInTheDocument()
    expect(screen.getByText('R$ 150,00')).toBeInTheDocument()
  })

  it('should show initials in avatar', () => {
    render(
      <PersonBalanceCard
        personName="Joao Silva"
        totalPending="100.00"
        onClick={vi.fn()}
      />,
    )

    expect(screen.getByText('JS')).toBeInTheDocument()
  })

  it('should apply green color when pending > 0', () => {
    render(
      <PersonBalanceCard
        personName="Maria"
        totalPending="50.00"
        onClick={vi.fn()}
      />,
    )

    const amount = screen.getByText('R$ 50,00')
    expect(amount.className).toContain('#6ee7a0')
  })

  it('should apply muted color when pending is 0', () => {
    render(
      <PersonBalanceCard
        personName="Pedro"
        totalPending="0.00"
        onClick={vi.fn()}
      />,
    )

    const amount = screen.getByText('R$ 0,00')
    expect(amount.className).toContain('muted-foreground')
  })

  it('should call onClick when clicked', () => {
    const onClick = vi.fn()
    render(
      <PersonBalanceCard
        personName="Ana"
        totalPending="75.00"
        onClick={onClick}
      />,
    )

    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
