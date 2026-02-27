import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { CategoryList } from './CategoryList'

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
  {
    id: 'cat-1',
    name: 'Alimentação',
    icon: 'utensils',
    color: '#f97316',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-2',
    name: 'Transporte',
    icon: 'car',
    color: '#3b82f6',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

function renderCategoryList() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={qc}>
      <CategoryList />
    </QueryClientProvider>,
  )
}

describe('CategoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiService.get).mockResolvedValue(mockCategories)
  })

  it('should render category names after loading', async () => {
    renderCategoryList()

    await waitFor(() => {
      expect(screen.getByText('Alimentação')).toBeInTheDocument()
      expect(screen.getByText('Transporte')).toBeInTheDocument()
    })
  })

  it('should render "Adicionar" button', async () => {
    renderCategoryList()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /adicionar/i })).toBeInTheDocument()
    })
  })

  it('should render edit buttons for each category', async () => {
    renderCategoryList()

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /editar/i })
      expect(editButtons).toHaveLength(2)
    })
  })

  it('should render deactivate buttons for each category', async () => {
    renderCategoryList()

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /desativar/i })
      expect(deleteButtons).toHaveLength(2)
    })
  })

  it('should show color indicator for each category', async () => {
    renderCategoryList()

    await waitFor(() => {
      const colorDots = screen.getAllByTestId('category-color')
      expect(colorDots).toHaveLength(2)
    })
  })
})
