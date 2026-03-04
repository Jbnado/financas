import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { RecentTransactions } from './RecentTransactions'
import type { RecentTransaction } from '@/features/billing-cycle/types'

const transactions: RecentTransaction[] = [
  {
    id: 't1',
    description: 'Supermercado',
    amount: '150.00',
    userAmount: '100.00',
    date: '2026-03-01T00:00:00.000Z',
    isPaid: true,
    category: { id: 'c1', name: 'Alimentação', color: '#f97316' },
    paymentMethod: { id: 'pm1', name: 'Nubank' },
  },
  {
    id: 't2',
    description: 'Uber',
    amount: '30.00',
    userAmount: '30.00',
    date: '2026-03-02T00:00:00.000Z',
    isPaid: false,
    category: { id: 'c2', name: 'Transporte', color: '#3b82f6' },
    paymentMethod: { id: 'pm1', name: 'Nubank' },
  },
]

function Wrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>
}

describe('RecentTransactions', () => {
  it('should show skeleton when loading', () => {
    const { container } = render(
      <Wrapper><RecentTransactions transactions={[]} isLoading /></Wrapper>,
    )
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('should show empty state when no transactions', () => {
    render(<Wrapper><RecentTransactions transactions={[]} /></Wrapper>)
    expect(screen.getByText('Registre seu primeiro gasto')).toBeInTheDocument()
  })

  it('should show transaction descriptions', () => {
    render(<Wrapper><RecentTransactions transactions={transactions} /></Wrapper>)
    expect(screen.getByText('Supermercado')).toBeInTheDocument()
    expect(screen.getByText('Uber')).toBeInTheDocument()
  })

  it('should show userAmount not total amount', () => {
    render(<Wrapper><RecentTransactions transactions={transactions} /></Wrapper>)
    expect(screen.getByText('R$ 100,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 30,00')).toBeInTheDocument()
  })

  it('should show "Ver todas" link to /transacoes', () => {
    render(<Wrapper><RecentTransactions transactions={transactions} /></Wrapper>)
    const link = screen.getByText('Ver todas')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/transacoes')
  })

  it('should show payment method and category', () => {
    render(<Wrapper><RecentTransactions transactions={transactions} /></Wrapper>)
    expect(screen.getByText('Nubank · Alimentação')).toBeInTheDocument()
    expect(screen.getByText('Nubank · Transporte')).toBeInTheDocument()
  })
})
