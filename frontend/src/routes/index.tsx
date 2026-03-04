import { lazy } from 'react'
import { Navigate, type RouteObject } from 'react-router'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const TransacoesPage = lazy(() => import('@/features/transaction/pages/TransacoesPage'))
const AReceberPage = lazy(() => import('@/features/receivable/pages/AReceberPage'))
const PatrimonioPage = lazy(() => import('@/features/patrimony/pages/PatrimonioPage'))
const ConfigPage = lazy(() => import('@/features/settings/pages/ConfigPage'))

function Protected({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/dashboard',
    element: <Protected><DashboardPage /></Protected>,
  },
  {
    path: '/transacoes',
    element: <Protected><TransacoesPage /></Protected>,
  },
  {
    path: '/a-receber',
    element: <Protected><AReceberPage /></Protected>,
  },
  {
    path: '/patrimonio',
    element: <Protected><PatrimonioPage /></Protected>,
  },
  {
    path: '/config',
    element: <Protected><ConfigPage /></Protected>,
  },
]
