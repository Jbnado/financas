import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { BottomNav } from './BottomNav'
import { useUIStore } from '@/shared/stores/ui.store'

function renderWithRouter(initialEntry = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <BottomNav />
    </MemoryRouter>,
  )
}

describe('BottomNav', () => {
  beforeEach(() => {
    useUIStore.setState({ activeTab: 'dashboard' })
  })

  it('should render 5 navigation tabs', () => {
    renderWithRouter()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Transações')).toBeInTheDocument()
    expect(screen.getByText('A Receber')).toBeInTheDocument()
    expect(screen.getByText('Patrimônio')).toBeInTheDocument()
    expect(screen.getByText('Config')).toBeInTheDocument()
  })

  it('should render as a nav element with role navigation', () => {
    renderWithRouter()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('should have 5 link elements', () => {
    renderWithRouter()
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(5)
  })

  it('should highlight the active tab with nav-active color', () => {
    renderWithRouter('/dashboard')
    const dashboardLink = screen.getByRole('link', { name: /Dashboard/ })
    expect(dashboardLink.className).toContain('text-nav-active')
  })

  it('should update active tab on click', async () => {
    const user = userEvent.setup()
    renderWithRouter('/dashboard')
    const transacoesLink = screen.getByRole('link', { name: /Transações/ })
    await user.click(transacoesLink)
    expect(useUIStore.getState().activeTab).toBe('transacoes')
  })
})
