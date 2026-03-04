import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { PersonFormDialog } from './PersonForm'

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

function renderForm(props: { person?: any; open?: boolean; onClose?: () => void } = {}) {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const onClose = props.onClose ?? vi.fn()
  return render(
    <QueryClientProvider client={qc}>
      <PersonFormDialog
        open={props.open ?? true}
        onClose={onClose}
        person={props.person ?? null}
      />
    </QueryClientProvider>,
  )
}

describe('PersonFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render name input field', () => {
    renderForm()
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
  })

  it('should render submit button with "Criar" for new person', () => {
    renderForm()
    expect(screen.getByRole('button', { name: 'Criar' })).toBeInTheDocument()
  })

  it('should render submit button with "Salvar" for editing', () => {
    renderForm({
      person: {
        id: 'person-1',
        name: 'Fulano',
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    })
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })

  it('should pre-fill form when editing a person', () => {
    renderForm({
      person: {
        id: 'person-1',
        name: 'Fulano',
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    })
    expect(screen.getByLabelText('Nome')).toHaveValue('Fulano')
  })

  it('should show validation error for empty name', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: 'Criar' }))

    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument()
    })
  })

  it('should call create API on valid submit for new person', async () => {
    vi.mocked(apiService.post).mockResolvedValueOnce({
      id: 'person-new',
      name: 'Beltrano',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    const onClose = vi.fn()
    const user = userEvent.setup()
    renderForm({ onClose })

    await user.type(screen.getByLabelText('Nome'), 'Beltrano')
    await user.click(screen.getByRole('button', { name: 'Criar' }))

    await waitFor(() => {
      expect(apiService.post).toHaveBeenCalledWith('/persons', { name: 'Beltrano' })
    })
  })

  it('should call update API on valid submit for existing person', async () => {
    vi.mocked(apiService.put).mockResolvedValueOnce({
      id: 'person-1',
      name: 'Fulano Atualizado',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    const onClose = vi.fn()
    const user = userEvent.setup()
    renderForm({
      onClose,
      person: {
        id: 'person-1',
        name: 'Fulano',
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    })

    await user.clear(screen.getByLabelText('Nome'))
    await user.type(screen.getByLabelText('Nome'), 'Fulano Atualizado')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(apiService.put).toHaveBeenCalledWith(
        '/persons/person-1',
        { name: 'Fulano Atualizado' },
      )
    })
  })

  it('should render cancel button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })
})
