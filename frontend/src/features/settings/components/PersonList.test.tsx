import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { PersonList } from './PersonList'

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

const mockPersons = [
  {
    id: 'person-1',
    name: 'Fulano',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'person-2',
    name: 'Ciclano',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

function renderPersonList() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={qc}>
      <PersonList />
    </QueryClientProvider>,
  )
}

describe('PersonList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiService.get).mockResolvedValue(mockPersons)
  })

  it('should render person names after loading', async () => {
    renderPersonList()

    await waitFor(() => {
      expect(screen.getByText('Fulano')).toBeInTheDocument()
      expect(screen.getByText('Ciclano')).toBeInTheDocument()
    })
  })

  it('should render "Adicionar" button', async () => {
    renderPersonList()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /adicionar/i })).toBeInTheDocument()
    })
  })

  it('should render edit buttons for each person', async () => {
    renderPersonList()

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /editar/i })
      expect(editButtons).toHaveLength(2)
    })
  })

  it('should render deactivate buttons for each person', async () => {
    renderPersonList()

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /desativar/i })
      expect(deleteButtons).toHaveLength(2)
    })
  })

  it('should show empty state when no persons', async () => {
    vi.mocked(apiService.get).mockResolvedValue([])
    renderPersonList()

    await waitFor(() => {
      expect(screen.getByText('Nenhuma pessoa encontrada')).toBeInTheDocument()
    })
  })
})
