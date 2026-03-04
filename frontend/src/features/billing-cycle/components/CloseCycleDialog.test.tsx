import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CloseCycleDialog } from './CloseCycleDialog'

const mockOnConfirm = vi.fn()
const mockOnCancel = vi.fn()

const defaultProps = {
  open: true,
  cycleName: 'Fevereiro 2026',
  onConfirm: mockOnConfirm,
  onCancel: mockOnCancel,
  isClosing: false,
}

describe('CloseCycleDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show confirmation message with cycle name', () => {
    render(<CloseCycleDialog {...defaultProps} />)

    expect(
      screen.getByText(/fechar ciclo fevereiro 2026/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/será marcado como fechado/i),
    ).toBeInTheDocument()
  })

  it('should call onConfirm when Fechar button is clicked', async () => {
    const user = userEvent.setup()
    render(<CloseCycleDialog {...defaultProps} />)

    const confirmBtn = screen.getByRole('button', { name: /^fechar$/i })
    await user.click(confirmBtn)

    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
  })

  it('should call onCancel when Cancelar button is clicked', async () => {
    const user = userEvent.setup()
    render(<CloseCycleDialog {...defaultProps} />)

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i })
    await user.click(cancelBtn)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('should disable Fechar button when isClosing', () => {
    render(<CloseCycleDialog {...defaultProps} isClosing={true} />)

    const confirmBtn = screen.getByRole('button', { name: /fechando/i })
    expect(confirmBtn).toBeDisabled()
  })

  it('should not render when open is false', () => {
    render(<CloseCycleDialog {...defaultProps} open={false} />)

    expect(
      screen.queryByText(/fechar ciclo fevereiro 2026/i),
    ).not.toBeInTheDocument()
  })
})
