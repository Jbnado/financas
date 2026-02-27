import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/shared/stores/auth.store'
import { apiService, ApiError } from '@/shared/services/api.service'
import { toast } from 'sonner'

interface LoginResponse {
  accessToken: string
}

export function useAuth() {
  const navigate = useNavigate()
  const { isAuthenticated, setAuthenticated, clearAuth } = useAuthStore()

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const data = await apiService.post<LoginResponse>('/auth/login', { email, password })
        setAuthenticated(data.accessToken)
        navigate('/dashboard', { replace: true })
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          toast.error('Email ou senha incorretos', { duration: Infinity })
        } else {
          toast.error('Erro ao conectar. Tente novamente.', { duration: Infinity })
        }
        throw error
      }
    },
    [navigate, setAuthenticated],
  )

  const logout = useCallback(async () => {
    try {
      await apiService.post('/auth/logout')
    } catch {
      // ignore — clear local state regardless
    }
    clearAuth()
    navigate('/login', { replace: true })
  }, [navigate, clearAuth])

  return { login, logout, isAuthenticated }
}
