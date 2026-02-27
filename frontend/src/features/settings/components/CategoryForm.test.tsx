import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { CategoryFormDialog } from './CategoryForm'

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

function renderForm(props: { category?: any; open?: boolean; onClose?: () => void } = {}) {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const onClose = props.onClose ?? vi.fn()
  return render(
    <QueryClientProvider client={qc}>
      <CategoryFormDialog
        open={props.open ?? true}
        onClose={onClose}
        category={props.category ?? null}
      />
    </QueryClientProvider>,
  )
}

describe('CategoryFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render name input field', () => {
    renderForm()
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
  })

  it('should render color input field', () => {
    renderForm()
    expect(screen.getByLabelText('Cor')).toBeInTheDocument()
  })

  it('should render submit button with "Criar" for new category', () => {
    renderForm()
    expect(screen.getByRole('button', { name: 'Criar' })).toBeInTheDocument()
  })

  it('should render submit button with "Salvar" for editing', () => {
    renderForm({
      category: {
        id: 'cat-1',
        name: 'Alimentação',
        icon: 'utensils',
        color: '#f97316',
        isActive: true,
      },
    })
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })

  it('should pre-fill form when editing a category', () => {
    renderForm({
      category: {
        id: 'cat-1',
        name: 'Alimentação',
        icon: 'utensils',
        color: '#f97316',
        isActive: true,
      },
    })
    expect(screen.getByLabelText('Nome')).toHaveValue('Alimentação')
  })

  it('should show validation error for empty name', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: 'Criar' }))

    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument()
    })
  })

  it('should call create API on valid submit for new category', async () => {
    vi.mocked(apiService.post).mockResolvedValueOnce({
      id: 'cat-new',
      name: 'Saúde',
      icon: null,
      color: '#ef4444',
      isActive: true,
    })
    const onClose = vi.fn()
    const user = userEvent.setup()
    renderForm({ onClose })

    await user.type(screen.getByLabelText('Nome'), 'Saúde')
    await user.click(screen.getByRole('button', { name: 'Criar' }))

    await waitFor(() => {
      expect(apiService.post).toHaveBeenCalledWith('/api/categories', expect.objectContaining({ name: 'Saúde' }))
    })
  })

  it('should call update API on valid submit for existing category', async () => {
    vi.mocked(apiService.put).mockResolvedValueOnce({
      id: 'cat-1',
      name: 'Alimentação Atualizada',
      icon: 'utensils',
      color: '#f97316',
      isActive: true,
    })
    const onClose = vi.fn()
    const user = userEvent.setup()
    renderForm({
      onClose,
      category: {
        id: 'cat-1',
        name: 'Alimentação',
        icon: 'utensils',
        color: '#f97316',
        isActive: true,
      },
    })

    await user.clear(screen.getByLabelText('Nome'))
    await user.type(screen.getByLabelText('Nome'), 'Alimentação Atualizada')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(apiService.put).toHaveBeenCalledWith(
        '/api/categories/cat-1',
        expect.objectContaining({ name: 'Alimentação Atualizada' }),
      )
    })
  })
})
