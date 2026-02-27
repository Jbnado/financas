import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useAuth } from '@/features/auth/hooks/use-auth'

interface LoginFormData {
  email: string
  password: string
}

export function LoginForm() {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
    } catch {
      // error handled via toast in useAuth
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          className="h-11 rounded-xl border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
          {...register('email', {
            required: 'Email é obrigatório',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Email inválido',
            },
          })}
        />
        {errors.email && (
          <span className="text-xs text-negative" role="alert">
            {errors.email.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Senha
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="h-11 rounded-xl border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
          {...register('password', {
            required: 'Senha é obrigatória',
            minLength: {
              value: 8,
              message: 'Mínimo 8 caracteres',
            },
          })}
        />
        {errors.password && (
          <span className="text-xs text-negative" role="alert">
            {errors.password.message}
          </span>
        )}
      </div>

      <Button type="submit" variant="gradient" className="mt-2 h-11 w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          'Entrar'
        )}
      </Button>
    </form>
  )
}
