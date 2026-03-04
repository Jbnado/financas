import { render, screen } from '@testing-library/react'
import { DeficitAlerts } from './DeficitAlerts'
import type { Alert } from '../types'

const alerts: Alert[] = [
  { month: 'Julho 2026', deficit: '-1200.00' },
  { month: 'Setembro 2026', deficit: '-500.00' },
]

describe('DeficitAlerts', () => {
  it('should show skeleton when loading', () => {
    const { container } = render(<DeficitAlerts alerts={[]} isLoading />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('should show positive message when no alerts', () => {
    render(<DeficitAlerts alerts={[]} />)
    expect(screen.getByText('Nenhum alerta — projeção positiva')).toBeInTheDocument()
  })

  it('should show heading', () => {
    render(<DeficitAlerts alerts={alerts} />)
    expect(screen.getByText('Alertas')).toBeInTheDocument()
  })

  it('should render each alert with month and deficit', () => {
    render(<DeficitAlerts alerts={alerts} />)
    expect(screen.getByText('Julho 2026')).toBeInTheDocument()
    expect(screen.getByText('Setembro 2026')).toBeInTheDocument()
  })
})
