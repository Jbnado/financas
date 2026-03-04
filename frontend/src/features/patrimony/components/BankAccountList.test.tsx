import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { BankAccountList } from './BankAccountList'

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

const mockAccounts = [
  {
    id: 'acc-1',
    name: 'Conta Principal',
    institution: 'Nubank',
    type: 'checking',
    balance: '5000.00',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'acc-2',
    name: 'Poupança',
    institution: 'Itaú',
    type: 'savings',
    balance: '12000.50',
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
      <BankAccountList />
    </QueryClientProvider>,
  )
}

describe('BankAccountList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiService.get).mockResolvedValue(mockAccounts)
  })

  it('should render account names after loading', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Conta Principal')).toBeInTheDocument()
      expect(screen.getByText('Poupança')).toBeInTheDocument()
    })
  })

  it('should render "Adicionar" button', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /adicionar/i })).toBeInTheDocument()
    })
  })

  it('should render edit buttons for each account', async () => {
    renderComponent()

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /editar/i })
      expect(editButtons).toHaveLength(2)
    })
  })

  it('should render delete buttons for each account', async () => {
    renderComponent()

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /excluir/i })
      expect(deleteButtons).toHaveLength(2)
    })
  })

  it('should show empty state when no accounts', async () => {
    vi.mocked(apiService.get).mockResolvedValue([])
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Nenhuma conta bancária cadastrada')).toBeInTheDocument()
    })
  })

  it('should show type badges', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('CC')).toBeInTheDocument()
      expect(screen.getByText('Poup.')).toBeInTheDocument()
    })
  })

  it('should show institution names', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Nubank')).toBeInTheDocument()
      expect(screen.getByText('Itaú')).toBeInTheDocument()
    })
  })
})
