import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FixedExpenseList } from './FixedExpenseList'
import { useFixedExpenses } from '../hooks/use-fixed-expenses'

vi.mock('../hooks/use-fixed-expenses', () => ({
  useFixedExpenses: vi.fn(),
}))

const mockExpenses = [
  {
    id: 'fe-1',
    name: 'Aluguel',
    estimatedAmount: '1500.00',
    dueDay: 10,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

describe('FixedExpenseList', () => {
  beforeEach(() => {
    vi.mocked(useFixedExpenses).mockReturnValue({
      fixedExpenses: mockExpenses,
      isLoading: false,
      removeFixedExpense: vi.fn(),
      isRemoving: false,
      createFixedExpense: vi.fn(),
      updateFixedExpense: vi.fn(),
      isCreating: false,
      isUpdating: false,
    })
  })

  it('should render the list title', () => {
    render(<FixedExpenseList />)
    expect(screen.getByText('Gastos Fixos')).toBeInTheDocument()
  })

  it('should render expense items', () => {
    render(<FixedExpenseList />)
    expect(screen.getByText('Aluguel')).toBeInTheDocument()
  })

  it('should render add button', () => {
    render(<FixedExpenseList />)
    expect(screen.getByLabelText('Adicionar gasto fixo')).toBeInTheDocument()
  })

  it('should show empty state when no expenses', () => {
    vi.mocked(useFixedExpenses).mockReturnValue({
      fixedExpenses: [],
      isLoading: false,
      removeFixedExpense: vi.fn(),
      isRemoving: false,
      createFixedExpense: vi.fn(),
      updateFixedExpense: vi.fn(),
      isCreating: false,
      isUpdating: false,
    })

    render(<FixedExpenseList />)
    expect(screen.getByText('Nenhum gasto fixo cadastrado')).toBeInTheDocument()
  })
})
