import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CycleSelector } from './CycleSelector'

const mockGoNext = vi.fn()
const mockGoPrev = vi.fn()

const defaultProps = {
  startDate: '2026-01-25T00:00:00.000Z',
  endDate: '2026-02-24T00:00:00.000Z',
  isFirst: false,
  isLast: false,
  isLoading: false,
  onPrev: mockGoPrev,
  onNext: mockGoNext,
}

describe('CycleSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render formatted dates', () => {
    render(<CycleSelector {...defaultProps} />)

    expect(screen.getByText(/25\/jan/i)).toBeInTheDocument()
    expect(screen.getByText(/24\/fev/i)).toBeInTheDocument()
  })

  it('should call onPrev when left arrow is clicked', async () => {
    const user = userEvent.setup()
    render(<CycleSelector {...defaultProps} />)

    const prevButton = screen.getByRole('button', { name: /anterior/i })
    await user.click(prevButton)

    expect(mockGoPrev).toHaveBeenCalledTimes(1)
  })

  it('should call onNext when right arrow is clicked', async () => {
    const user = userEvent.setup()
    render(<CycleSelector {...defaultProps} />)

    const nextButton = screen.getByRole('button', { name: /próximo/i })
    await user.click(nextButton)

    expect(mockGoNext).toHaveBeenCalledTimes(1)
  })

  it('should disable prev button when isFirst is true', () => {
    render(<CycleSelector {...defaultProps} isFirst={true} />)

    const prevButton = screen.getByRole('button', { name: /anterior/i })
    expect(prevButton).toBeDisabled()
  })

  it('should disable next button when isLast is true', () => {
    render(<CycleSelector {...defaultProps} isLast={true} />)

    const nextButton = screen.getByRole('button', { name: /próximo/i })
    expect(nextButton).toBeDisabled()
  })

  it('should show skeleton when loading', () => {
    render(<CycleSelector {...defaultProps} isLoading={true} />)

    expect(screen.queryByText(/25\/jan/i)).not.toBeInTheDocument()
    expect(screen.getByTestId('cycle-selector-skeleton')).toBeInTheDocument()
  })

  it('should render without popover when no onEdit/onNew provided', () => {
    render(<CycleSelector {...defaultProps} />)

    // Badge should not be clickable/interactive
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /novo ciclo/i })).not.toBeInTheDocument()
  })

  it('should show popover with edit and new buttons when props provided', async () => {
    const mockOnEdit = vi.fn()
    const mockOnNew = vi.fn()
    const user = userEvent.setup()

    render(
      <CycleSelector
        {...defaultProps}
        cycleName="Fevereiro 2026"
        cycleStatus="open"
        onEdit={mockOnEdit}
        onNew={mockOnNew}
      />,
    )

    // Click the badge to open popover
    const badge = screen.getByText(/25\/jan/i).closest('div[class*="rounded"]')!
    await user.click(badge)

    // Popover should show cycle name, edit and new buttons
    expect(await screen.findByText('Fevereiro 2026')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /novo ciclo/i })).toBeInTheDocument()
  })

  it('should hide edit button when cycle is closed', async () => {
    const mockOnEdit = vi.fn()
    const mockOnNew = vi.fn()
    const user = userEvent.setup()

    render(
      <CycleSelector
        {...defaultProps}
        cycleName="Janeiro 2026"
        cycleStatus="closed"
        onEdit={mockOnEdit}
        onNew={mockOnNew}
      />,
    )

    const badge = screen.getByText(/25\/jan/i).closest('div[class*="rounded"]')!
    await user.click(badge)

    expect(await screen.findByText('Janeiro 2026')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /novo ciclo/i })).toBeInTheDocument()
  })
})
