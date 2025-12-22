import { useState, FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { AuthForm } from './AuthForm'
import { AuthHeader } from './AuthHeader'
import { loginAction } from '@/lib/auth/login'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

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
      setIsLoading(false)
    }
  }

  return (
    <AuthForm>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <AuthHeader title="Est3lar" subtitle="Faça login para acessar o painel" />

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
            disabled={isLoading}
          />
        </div>

        {/* Password Field */}
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link
              to="/forgot-password"
              className="text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              Esqueci a senha
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="pr-10"
              disabled={isLoading}
            />
            {showPassword ? (
              <EyeOff
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary cursor-pointer hover:text-text-primary"
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <Eye
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary cursor-pointer hover:text-text-primary"
                onClick={() => setShowPassword(true)}
              />
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="gradient"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </AuthForm>
  )
}
