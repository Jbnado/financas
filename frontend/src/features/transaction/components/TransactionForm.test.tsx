import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { TransactionForm } from './TransactionForm'

vi.mock('@/shared/services/api.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services/api.service')>()
  return {
    ...actual,
    apiService: {
      get: vi.fn().mockResolvedValue([]),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  }
})

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

describe('TransactionForm', () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all required fields', () => {
    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <TransactionForm onSubmit={onSubmit} isSubmitting={false} />
      </Wrapper>,
    )

    expect(screen.getByLabelText(/Descrição/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Valor/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Cartão/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Categoria/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Registrar' })).toBeInTheDocument()
  })

  it('should show collapsible toggles', () => {
    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <TransactionForm onSubmit={onSubmit} isSubmitting={false} />
      </Wrapper>,
    )

    expect(screen.getByRole('button', { name: /Parcelar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Dividir \/ Emprestar cartão/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Observação/i })).toBeInTheDocument()
  })

  it('should show validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <TransactionForm onSubmit={onSubmit} isSubmitting={false} />
      </Wrapper>,
    )

    await user.click(screen.getByRole('button', { name: 'Registrar' }))

    await waitFor(() => {
      expect(screen.getByText('Descrição é obrigatória')).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('should expand installments section when toggle is clicked', async () => {
    const user = userEvent.setup()
    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <TransactionForm onSubmit={onSubmit} isSubmitting={false} />
      </Wrapper>,
    )

    await user.click(screen.getByRole('button', { name: /Parcelar/i }))

    expect(screen.getByLabelText(/Número de parcelas/i)).toBeInTheDocument()
  })

  it('should show loading state when submitting', () => {
    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <TransactionForm onSubmit={onSubmit} isSubmitting={true} />
      </Wrapper>,
    )

    expect(screen.getByRole('button', { name: /Registrando/i })).toBeDisabled()
  })

  it('should show split section with "Adicionar pessoa" when expanded', async () => {
    const user = userEvent.setup()
    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <TransactionForm onSubmit={onSubmit} isSubmitting={false} />
      </Wrapper>,
    )

    await user.click(screen.getByRole('button', { name: /Dividir \/ Emprestar cartão/i }))

    expect(screen.getByText(/Adicionar pessoa/i)).toBeInTheDocument()
  })
})
