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
})
