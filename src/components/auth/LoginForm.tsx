import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { AuthForm } from './AuthForm'
import { AuthHeader } from './AuthHeader'
import { loginAction } from '@/lib/auth/login'
import { typography } from '@/design-system/tokens'

export function LoginForm() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await loginAction({ email, password })

      if (!result.success) {
        // Handle different error types
        if (result.error?.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos')
        } else if (result.error?.includes('Email not confirmed')) {
          toast.error('Por favor, confirme seu email antes de fazer login')
        } else {
          toast.error(result.error || 'Erro ao fazer login. Tente novamente')
        }
        return
      }

      // Login successful
      toast.success('Login realizado com sucesso!')
      window.location.href = result.redirectTo || '/dashboard'
    } catch {
      toast.error('Erro inesperado ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthForm>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <AuthHeader title="Genesis Pool" subtitle="Faça login para acessar o painel" />

        {/* Email Field */}
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            required
            autoComplete="email"
            disabled={loading}
          />
        </div>

        {/* Password Field */}
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link
              to="/forgot-password"
              className={`${typography.body.tiny} text-text-secondary hover:text-text-primary transition-colors`}
            >
              Esqueci a senha
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="gradient"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </AuthForm>
  )
}
