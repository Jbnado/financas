import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import ConfigPage from './ConfigPage'

vi.mock('@/shared/services/api.service', async () => {
  const actual = await vi.importActual<typeof import('@/shared/services/api.service')>('@/shared/services/api.service')
  return {
    ...actual,
    apiService: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  }
})

import { apiService } from '@/shared/services/api.service'

const mockCategories = [
  { id: 'cat-1', name: 'Alimentação', icon: 'utensils', color: '#f97316', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
]

const mockPaymentMethods = [
  { id: 'pm-1', name: 'Nubank', type: 'credit', dueDay: 10, isActive: true, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
]

const mockPersons = [
  { id: 'person-1', name: 'Fulano', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
]

const mockBillingCycles = [
  { id: 'cycle-1', name: 'Março 2026', startDate: '2026-02-25T00:00:00.000Z', endDate: '2026-03-24T00:00:00.000Z', salary: '7300.00', status: 'open', createdAt: '2026-02-20T00:00:00.000Z', updatedAt: '2026-02-20T00:00:00.000Z' },
]

function renderConfigPage() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={qc}>
      <ConfigPage />
    </QueryClientProvider>,
  )
}

describe('ConfigPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiService.get).mockImplementation((url: string) => {
      if (url === '/categories') return Promise.resolve(mockCategories)
      if (url === '/payment-methods') return Promise.resolve(mockPaymentMethods)
      if (url === '/persons') return Promise.resolve(mockPersons)
      if (url === '/billing-cycles') return Promise.resolve(mockBillingCycles)
      return Promise.resolve([])
    })
  })

  it('should render page title "Configurações"', () => {
    renderConfigPage()
    expect(screen.getByText('Configurações')).toBeInTheDocument()
  })

  it('should render Categorias section with items', async () => {
    renderConfigPage()
    await waitFor(() => {
      expect(screen.getByText('Categorias')).toBeInTheDocument()
      expect(screen.getByText('Alimentação')).toBeInTheDocument()
    })
  })

  it('should render Meios de Pagamento section with items', async () => {
    renderConfigPage()
    await waitFor(() => {
      expect(screen.getByText('Meios de Pagamento')).toBeInTheDocument()
      expect(screen.getByText('Nubank')).toBeInTheDocument()
    })
  })

  it('should render Pessoas section with items', async () => {
    renderConfigPage()
    await waitFor(() => {
      expect(screen.getByText('Pessoas')).toBeInTheDocument()
      expect(screen.getByText('Fulano')).toBeInTheDocument()
    })
  })

  it('should render Ciclos de Cobrança section with items', async () => {
    renderConfigPage()
    await waitFor(() => {
      expect(screen.getByText('Ciclos de Cobrança')).toBeInTheDocument()
      expect(screen.getByText('Março 2026')).toBeInTheDocument()
    })
  })

  it('should render all sections together', async () => {
    renderConfigPage()
    await waitFor(() => {
      expect(screen.getByText('Ciclos de Cobrança')).toBeInTheDocument()
      expect(screen.getByText('Categorias')).toBeInTheDocument()
      expect(screen.getByText('Meios de Pagamento')).toBeInTheDocument()
      expect(screen.getByText('Pessoas')).toBeInTheDocument()
    })
  })
})
