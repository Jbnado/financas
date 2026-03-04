import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BillingCycleForm } from './BillingCycleForm'

const mockOnSubmit = vi.fn()
const mockOnCancel = vi.fn()

const defaultProps = {
  onSubmit: mockOnSubmit,
  onCancel: mockOnCancel,
  isSubmitting: false,
}

describe('BillingCycleForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all form fields', () => {
    render(<BillingCycleForm {...defaultProps} />)

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/data início/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/data fim/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/salário/i)).toBeInTheDocument()
  })

  it('should show validation errors when submitting empty form', async () => {
    const user = userEvent.setup()
    render(<BillingCycleForm {...defaultProps} />)

    const submitBtn = screen.getByRole('button', { name: /criar/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should call onSubmit with valid data', async () => {
    const user = userEvent.setup()
    render(<BillingCycleForm {...defaultProps} />)

    await user.type(screen.getByLabelText(/nome/i), 'Fevereiro 2026')
    await user.type(screen.getByLabelText(/data início/i), '2026-01-25')
    await user.type(screen.getByLabelText(/data fim/i), '2026-02-24')

    const salaryInput = screen.getByLabelText(/salário/i)
    await user.type(salaryInput, '7300')

    const submitBtn = screen.getByRole('button', { name: /criar/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Fevereiro 2026',
        startDate: expect.any(String),
        endDate: expect.any(String),
        salary: expect.any(String),
      }),
    )
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<BillingCycleForm {...defaultProps} />)

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i })
    await user.click(cancelBtn)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('should disable submit button when isSubmitting', () => {
    render(<BillingCycleForm {...defaultProps} isSubmitting={true} />)

    const submitBtn = screen.getByRole('button', { name: /criando/i })
    expect(submitBtn).toBeDisabled()
  })

  it('should have inputMode decimal on salary field', () => {
    render(<BillingCycleForm {...defaultProps} />)

    const salaryInput = screen.getByLabelText(/salário/i)
    expect(salaryInput).toHaveAttribute('inputMode', 'decimal')
  })

  describe('edit mode', () => {
    const mockCycle = {
      id: 'cycle-1',
      name: 'Fevereiro 2026',
      startDate: '2026-01-25T00:00:00.000Z',
      endDate: '2026-02-24T00:00:00.000Z',
      salary: '7300.00',
      status: 'open' as const,
      createdAt: '2026-01-20T00:00:00.000Z',
      updatedAt: '2026-01-20T00:00:00.000Z',
    }

    it('should pre-fill form fields in edit mode', () => {
      render(<BillingCycleForm {...defaultProps} cycle={mockCycle} />)

      expect(screen.getByLabelText(/nome/i)).toHaveValue('Fevereiro 2026')
      expect(screen.getByLabelText(/data início/i)).toHaveValue('2026-01-25')
      expect(screen.getByLabelText(/data fim/i)).toHaveValue('2026-02-24')
      expect(screen.getByLabelText(/salário/i)).toHaveValue('7300,00')
    })

    it('should show "Salvar" button in edit mode', () => {
      render(<BillingCycleForm {...defaultProps} cycle={mockCycle} />)

      expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument()
    })

    it('should show "Salvando..." when submitting in edit mode', () => {
      render(<BillingCycleForm {...defaultProps} cycle={mockCycle} isSubmitting={true} />)

      expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled()
    })
  })
})
