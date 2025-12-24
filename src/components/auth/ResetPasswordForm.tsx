import { FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AuthHeader } from './AuthHeader'
import { AuthForm } from './AuthForm'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { resetPasswordAction } from '@/lib/auth/reset-password'
import { typography } from '@/design-system/tokens'

export function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres')
      return
    }

    setIsLoading(true)

    const result = await resetPasswordAction({ password, confirmPassword })

    setIsLoading(false)

    if (!result.success) {
      toast.error(result.error || 'Erro ao redefinir senha')
      return
    }

    toast.success('Senha atualizada com sucesso!')

    // Redirect to login after 1.5 seconds
    setTimeout(() => {
      navigate('/login')
    }, 1500)
  }

  return (
    <AuthForm>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <AuthHeader subtitle="Digite sua nova senha" />

        <div className="grid gap-3">
          <Label htmlFor="password">Nova Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="pr-10"
              minLength={8}
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
          <p className={`${typography.body.tiny} text-white/60`}>
            Mínimo de 8 caracteres
          </p>
        </div>

        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="pr-10"
              minLength={8}
            />
            {showConfirmPassword ? (
              <EyeOff
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary cursor-pointer hover:text-text-primary"
                onClick={() => setShowConfirmPassword(false)}
              />
            ) : (
              <Eye
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary cursor-pointer hover:text-text-primary"
                onClick={() => setShowConfirmPassword(true)}
              />
            )}
          </div>
        </div>

        <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
          {isLoading ? 'Atualizando...' : 'Atualizar Senha'}
        </Button>
      </form>
    </AuthForm>
  )
}
