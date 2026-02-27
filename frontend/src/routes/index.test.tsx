import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, useRoutes } from 'react-router'
import { Suspense } from 'react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { routes } from './index'
import { useAuthStore } from '@/shared/stores/auth.store'
import { clearAccessToken } from '@/shared/services/api.service'

vi.mock('@/shared/services/api.service', async () => {
  const actual = await vi.importActual<typeof import('@/shared/services/api.service')>('@/shared/services/api.service')
  return {
    ...actual,
    apiService: {
      get: vi.fn().mockResolvedValue([]),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  }
})

function TestRouter({ initialEntry }: { initialEntry: string }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  function Routes() {
    return useRoutes(routes)
  }
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes />
        </Suspense>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Routes', () => {
  beforeEach(() => {
    clearAccessToken()
    useAuthStore.setState({ isAuthenticated: false })
  })

  describe('when not authenticated', () => {
    it('should redirect /dashboard to /login', async () => {
      render(<TestRouter initialEntry="/dashboard" />)
      expect(await screen.findByText('Faça login para continuar')).toBeInTheDocument()
    })

    it('should show login page at /login', async () => {
      render(<TestRouter initialEntry="/login" />)
      expect(await screen.findByText('Faça login para continuar')).toBeInTheDocument()
    })
  })

  describe('when authenticated', () => {
    beforeEach(() => {
      useAuthStore.getState().setAuthenticated('test-token')
    })

    it('should redirect / to /dashboard', async () => {
      render(<TestRouter initialEntry="/" />)
      expect(await screen.findByText(/Dashboard/)).toBeInTheDocument()
    })

    it('should render DashboardPage at /dashboard', async () => {
      render(<TestRouter initialEntry="/dashboard" />)
      expect(await screen.findByText('Dashboard — Em breve')).toBeInTheDocument()
    })

    it('should render TransacoesPage at /transacoes', async () => {
      render(<TestRouter initialEntry="/transacoes" />)
      expect(await screen.findByText('Transações — Em breve')).toBeInTheDocument()
    })

    it('should render AReceberPage at /a-receber', async () => {
      render(<TestRouter initialEntry="/a-receber" />)
      expect(await screen.findByText('A Receber — Em breve')).toBeInTheDocument()
    })

    it('should render ConfigPage at /config', async () => {
      render(<TestRouter initialEntry="/config" />)
      expect(await screen.findByText('Configurações')).toBeInTheDocument()
    })
  })
})
