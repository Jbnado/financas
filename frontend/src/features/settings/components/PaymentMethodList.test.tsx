import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PaymentMethodList } from './PaymentMethodList'
import type { PaymentMethod } from '../types'

const mockMethods: PaymentMethod[] = [
  {
    id: 'pm-1',
    name: 'Nubank',
    type: 'credit',
    dueDay: 15,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'pm-2',
    name: 'Conta Corrente',
    type: 'debit',
    dueDay: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

describe('PaymentMethodList', () => {
  it('should render list of payment methods', () => {
    render(
      <PaymentMethodList
        paymentMethods={mockMethods}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
      />,
    )

    expect(screen.getByText('Nubank')).toBeInTheDocument()
    expect(screen.getByText('Conta Corrente')).toBeInTheDocument()
  })

  it('should display type badges (credit=Crédito, debit=Débito)', () => {
    render(
      <PaymentMethodList
        paymentMethods={mockMethods}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
      />,
    )

    expect(screen.getByText('Crédito')).toBeInTheDocument()
    expect(screen.getByText('Débito')).toBeInTheDocument()
  })

  it('should display due day when present', () => {
    render(
      <PaymentMethodList
        paymentMethods={mockMethods}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
      />,
    )

    expect(screen.getByText('Dia 15')).toBeInTheDocument()
  })

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = vi.fn()
    render(
      <PaymentMethodList
        paymentMethods={mockMethods}
        onEdit={onEdit}
        onRemove={vi.fn()}
      />,
    )

    const editButtons = screen.getAllByRole('button', { name: /editar/i })
    fireEvent.click(editButtons[0])
    expect(onEdit).toHaveBeenCalledWith(mockMethods[0])
  })

  it('should call onRemove when remove button is clicked', () => {
    const onRemove = vi.fn()
    render(
      <PaymentMethodList
        paymentMethods={mockMethods}
        onEdit={vi.fn()}
        onRemove={onRemove}
      />,
    )

    const removeButtons = screen.getAllByRole('button', { name: /desativar/i })
    fireEvent.click(removeButtons[0])
    expect(onRemove).toHaveBeenCalledWith('pm-1')
  })

  it('should show empty state when no payment methods', () => {
    render(
      <PaymentMethodList
        paymentMethods={[]}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
      />,
    )

    expect(screen.getByText(/nenhum meio de pagamento/i)).toBeInTheDocument()
  })
})
