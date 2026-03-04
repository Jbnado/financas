import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { Sidebar } from './Sidebar'
import { useUIStore } from '@/shared/stores/ui.store'

function renderWithRouter(initialEntry = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Sidebar />
    </MemoryRouter>,
  )
}

describe('Sidebar', () => {
  beforeEach(() => {
    useUIStore.setState({ activeTab: 'dashboard' })
  })

  it('should render 5 navigation items', () => {
    renderWithRouter()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Transações')).toBeInTheDocument()
    expect(screen.getByText('A Receber')).toBeInTheDocument()
    expect(screen.getByText('Patrimônio')).toBeInTheDocument()
    expect(screen.getByText('Config')).toBeInTheDocument()
  })

  it('should render as a nav element', () => {
    renderWithRouter()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('should have 5 link elements', () => {
    renderWithRouter()
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(5)
  })

  it('should highlight active link', () => {
    renderWithRouter('/dashboard')
    const dashboardLink = screen.getByRole('link', { name: /Dashboard/ })
    expect(dashboardLink.className).toContain('text-nav-active')
  })

  it('should update active tab on click', async () => {
    const user = userEvent.setup()
    renderWithRouter('/dashboard')
    const configLink = screen.getByRole('link', { name: /Config/ })
    await user.click(configLink)
    expect(useUIStore.getState().activeTab).toBe('config')
  })

  it('should have hidden class for mobile (md:flex)', () => {
    renderWithRouter()
    const nav = screen.getByRole('navigation')
    expect(nav.className).toContain('hidden')
    expect(nav.className).toContain('md:flex')
  })
})
