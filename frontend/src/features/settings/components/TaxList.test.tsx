import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaxList } from './TaxList'
import { useTaxes } from '../hooks/use-taxes'

vi.mock('../hooks/use-taxes', () => ({
  useTaxes: vi.fn(),
}))

const mockTaxes = [
  {
    id: 'tax-1',
    name: 'DAS',
    rate: '6.00',
    estimatedAmount: '500.00',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

describe('TaxList', () => {
  beforeEach(() => {
    vi.mocked(useTaxes).mockReturnValue({
      taxes: mockTaxes,
      isLoading: false,
      removeTax: vi.fn(),
      isRemoving: false,
      createTax: vi.fn(),
      updateTax: vi.fn(),
      isCreating: false,
      isUpdating: false,
    })
  })

  it('should render the list title', () => {
    render(<TaxList />)
    expect(screen.getByText('Impostos')).toBeInTheDocument()
  })

  it('should render tax items', () => {
    render(<TaxList />)
    expect(screen.getByText('DAS')).toBeInTheDocument()
  })

  it('should render add button', () => {
    render(<TaxList />)
    expect(screen.getByLabelText('Adicionar imposto')).toBeInTheDocument()
  })

  it('should show empty state when no taxes', () => {
    vi.mocked(useTaxes).mockReturnValue({
      taxes: [],
      isLoading: false,
      removeTax: vi.fn(),
      isRemoving: false,
      createTax: vi.fn(),
      updateTax: vi.fn(),
      isCreating: false,
      isUpdating: false,
    })

    render(<TaxList />)
    expect(screen.getByText('Nenhum imposto cadastrado')).toBeInTheDocument()
  })
})
