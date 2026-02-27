import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaymentMethodForm } from './PaymentMethodForm'
import type { PaymentMethod } from '../types'

describe('PaymentMethodForm', () => {
  it('should render form fields for creating', () => {
    render(<PaymentMethodForm onSubmit={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/dia de vencimento/i)).toBeInTheDocument()
  })

  it('should submit valid form data', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<PaymentMethodForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await user.type(screen.getByLabelText(/nome/i), 'Nubank')
    await user.selectOptions(screen.getByLabelText(/tipo/i), 'credit')
    await user.type(screen.getByLabelText(/dia de vencimento/i), '15')

    fireEvent.submit(screen.getByRole('form'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Nubank',
        type: 'credit',
        dueDay: 15,
      })
    })
  })

  it('should submit without dueDay when empty', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<PaymentMethodForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await user.type(screen.getByLabelText(/nome/i), 'Conta Corrente')
    await user.selectOptions(screen.getByLabelText(/tipo/i), 'debit')

    fireEvent.submit(screen.getByRole('form'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Conta Corrente',
        type: 'debit',
      })
    })
  })

  it('should show validation error when name is empty', async () => {
    render(<PaymentMethodForm onSubmit={vi.fn()} onCancel={vi.fn()} />)

    fireEvent.submit(screen.getByRole('form'))

    await waitFor(() => {
      expect(screen.getByText(/nome.*obrigatório/i)).toBeInTheDocument()
    })
  })

  it('should pre-fill form when editing', () => {
    const method: PaymentMethod = {
      id: 'pm-1',
      name: 'Nubank',
      type: 'credit',
      dueDay: 15,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }

    render(<PaymentMethodForm onSubmit={vi.fn()} onCancel={vi.fn()} editingMethod={method} />)

    expect(screen.getByLabelText(/nome/i)).toHaveValue('Nubank')
    expect(screen.getByLabelText(/tipo/i)).toHaveValue('credit')
    expect(screen.getByLabelText(/dia de vencimento/i)).toHaveValue(15)
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()

    render(<PaymentMethodForm onSubmit={vi.fn()} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })
})
