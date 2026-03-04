import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { InvestmentList } from './InvestmentList'

vi.mock('@/shared/services/api.service', async () => {
  const actual = await vi.importActual<typeof import('@/shared/services/api.service')>('@/shared/services/api.service')
  return {
    ...actual,
    apiService: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  }
})

import { apiService } from '@/shared/services/api.service'

const mockInvestments = [
  {
    id: 'inv-1',
    name: 'CDB Nubank',
    type: 'fixed_income',
    institution: 'Nubank',
    appliedAmount: '10000.00',
    currentValue: '10500.00',
    liquidity: 'daily',
    maturityDate: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'inv-2',
    name: 'Ações PETR4',
    type: 'variable_income',
    institution: 'XP',
    appliedAmount: '5000.00',
    currentValue: '4800.00',
    liquidity: 'daily',
    maturityDate: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

function renderComponent() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={qc}>
      <InvestmentList />
    </QueryClientProvider>,
  )
}

describe('InvestmentList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiService.get).mockResolvedValue(mockInvestments)
  })

  it('should render investment names after loading', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('CDB Nubank')).toBeInTheDocument()
      expect(screen.getByText('Ações PETR4')).toBeInTheDocument()
    })
  })

  it('should render "Adicionar" button', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /adicionar/i })).toBeInTheDocument()
    })
  })

  it('should render edit buttons for each investment', async () => {
    renderComponent()

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /editar/i })
      expect(editButtons).toHaveLength(2)
    })
  })

  it('should render delete buttons for each investment', async () => {
    renderComponent()

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /excluir/i })
      expect(deleteButtons).toHaveLength(2)
    })
  })

  it('should show empty state when no investments', async () => {
    vi.mocked(apiService.get).mockResolvedValue([])
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Nenhum investimento cadastrado')).toBeInTheDocument()
    })
  })

  it('should show type badges', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('RF')).toBeInTheDocument()
      expect(screen.getByText('RV')).toBeInTheDocument()
    })
  })

  it('should show institution names', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Nubank')).toBeInTheDocument()
      expect(screen.getByText('XP')).toBeInTheDocument()
    })
  })
})
