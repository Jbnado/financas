import { LoginForm } from '@/features/auth/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">financas</h1>
        <p className="mt-1 text-sm text-muted-foreground">Faça login para continuar</p>
      </div>
      <LoginForm />
    </div>
  )
}
