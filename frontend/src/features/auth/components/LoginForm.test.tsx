import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { LoginForm } from './LoginForm'
import { useAuthStore } from '@/shared/stores/auth.store'
import { clearAccessToken } from '@/shared/services/api.service'

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

function renderLoginForm() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LoginForm', () => {
  beforeEach(() => {
    clearAccessToken()
    useAuthStore.setState({ isAuthenticated: false })
    vi.clearAllMocks()
  })

  it('should render email and password fields with labels', () => {
    renderLoginForm()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
  })

  it('should render "Entrar" submit button', () => {
    renderLoginForm()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument()
      expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument()
    })
  })

  it('should show validation error for invalid email', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText('Email'), 'notanemail')
    await user.type(screen.getByLabelText('Senha'), '12345678')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument()
    })
  })

  it('should show validation error for short password', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText('Email'), 'a@b.com')
    await user.type(screen.getByLabelText('Senha'), '1234567')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument()
    })
  })

  it('should call login API on valid submit', async () => {
    vi.mocked(apiService.post).mockResolvedValueOnce({ accessToken: 'token' })
    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText('Email'), 'admin@financas.local')
    await user.type(screen.getByLabelText('Senha'), '12345678')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(apiService.post).toHaveBeenCalledWith('/auth/login', {
        email: 'admin@financas.local',
        password: '12345678',
      })
    })
  })

  it('should show loading state while submitting', async () => {
    let resolveLogin: (v: unknown) => void
    vi.mocked(apiService.post).mockReturnValueOnce(
      new Promise((resolve) => { resolveLogin = resolve }),
    )
    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText('Email'), 'a@b.com')
    await user.type(screen.getByLabelText('Senha'), '12345678')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled()
      expect(screen.getByText('Entrando...')).toBeInTheDocument()
    })

    resolveLogin!({ accessToken: 'token' })
  })

  it('should keep form data on failed login', async () => {
    const { ApiError } = await import('@/shared/services/api.service')
    vi.mocked(apiService.post).mockRejectedValueOnce(new ApiError(401, { message: 'Unauthorized' }))
    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText('Email'), 'admin@financas.local')
    await user.type(screen.getByLabelText('Senha'), 'wrongpass1')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toHaveValue('admin@financas.local')
      expect(screen.getByLabelText('Senha')).toHaveValue('wrongpass1')
    })
  })
})
