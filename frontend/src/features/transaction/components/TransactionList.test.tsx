import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TransactionList } from './TransactionList'
import type { Transaction } from '../types'

const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    description: 'Supermercado',
    amount: '125.50',
    date: '2026-03-01T00:00:00.000Z',
    isPaid: false,
    installmentNumber: null,
    totalInstallments: null,
    userId: 'user-1',
    billingCycleId: 'cycle-1',
    categoryId: 'cat-1',
    paymentMethodId: 'pm-1',
    parentTransactionId: null,
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
    category: { id: 'cat-1', name: 'Alimentação', icon: null, color: '#22c55e' },
    paymentMethod: { id: 'pm-1', name: 'Nubank', type: 'credit' },
  },
  {
    id: 'tx-2',
    description: 'TV Parcelada',
    amount: '333.33',
    date: '2026-03-01T00:00:00.000Z',
    isPaid: false,
    installmentNumber: 2,
    totalInstallments: 10,
    userId: 'user-1',
    billingCycleId: 'cycle-1',
    categoryId: 'cat-2',
    paymentMethodId: 'pm-1',
    parentTransactionId: 'tx-parent',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
    category: { id: 'cat-2', name: 'Eletrônicos', icon: null, color: '#3b82f6' },
    paymentMethod: { id: 'pm-1', name: 'Nubank', type: 'credit' },
  },
]

describe('TransactionList', () => {
  const noop = vi.fn()

  it('should render transaction descriptions', () => {
    render(
      <TransactionList
        transactions={mockTransactions}
        isLoading={false}
        onTogglePaid={noop}
        onDelete={noop}
        onAddClick={noop}
      />,
    )

    expect(screen.getByText('Supermercado')).toBeInTheDocument()
    expect(screen.getByText('TV Parcelada')).toBeInTheDocument()
  })

  it('should show installment badge for installment transactions', () => {
    render(
      <TransactionList
        transactions={mockTransactions}
        isLoading={false}
        onTogglePaid={noop}
        onDelete={noop}
        onAddClick={noop}
      />,
    )

    expect(screen.getByText('2/10')).toBeInTheDocument()
  })

  it('should show empty state when no transactions', () => {
    render(
      <TransactionList
        transactions={[]}
        isLoading={false}
        onTogglePaid={noop}
        onDelete={noop}
        onAddClick={noop}
      />,
    )

    expect(screen.getByText('Nenhuma transação neste ciclo')).toBeInTheDocument()
    expect(screen.getByText('Registrar')).toBeInTheDocument()
  })

  it('should show loading skeleton', () => {
    const { container } = render(
      <TransactionList
        transactions={[]}
        isLoading={true}
        onTogglePaid={noop}
        onDelete={noop}
        onAddClick={noop}
      />,
    )

    const skeletons = container.querySelectorAll('[class*="animate-pulse"], [data-slot="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should display formatted currency values', () => {
    render(
      <TransactionList
        transactions={mockTransactions}
        isLoading={false}
        onTogglePaid={noop}
        onDelete={noop}
        onAddClick={noop}
      />,
    )

    expect(screen.getByText('R$ 125,50')).toBeInTheDocument()
  })
})
