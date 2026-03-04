import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, useRoutes } from 'react-router'
import { Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routes } from './index'
import { useAuthStore } from '@/shared/stores/auth.store'
import { clearAccessToken } from '@/shared/services/api.service'

vi.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: () => null,
  Cell: () => null,
  Tooltip: () => null,
  Legend: () => null,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

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

function TestRouter({ initialEntry }: { initialEntry: string }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function Routes() {
    return useRoutes(routes)
  }
  return (
    <QueryClientProvider client={queryClient}>
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
      expect(await screen.findByText('Nenhum ciclo encontrado', {}, { timeout: 3000 })).toBeInTheDocument()
    })

    it('should render DashboardPage at /dashboard', async () => {
      render(<TestRouter initialEntry="/dashboard" />)
      expect(await screen.findByText('Nenhum ciclo encontrado')).toBeInTheDocument()
    })

    it('should render TransacoesPage at /transacoes', async () => {
      render(<TestRouter initialEntry="/transacoes" />)
      expect(await screen.findByText(/Transações/i)).toBeInTheDocument()
    })

    it('should render AReceberPage at /a-receber', async () => {
      render(<TestRouter initialEntry="/a-receber" />)
      expect(await screen.findByText('A Receber — Em breve')).toBeInTheDocument()
    })

    it('should render PatrimonioPage at /patrimonio', async () => {
      render(<TestRouter initialEntry="/patrimonio" />)
      expect(await screen.findByText('Patrimônio')).toBeInTheDocument()
    })

    it('should render ConfigPage at /config', async () => {
      render(<TestRouter initialEntry="/config" />)
      expect(await screen.findByText('Configurações')).toBeInTheDocument()
    })
  })
})
