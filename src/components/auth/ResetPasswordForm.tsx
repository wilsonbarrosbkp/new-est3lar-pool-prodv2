import { FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { AuthHeader } from './AuthHeader'
import { AuthForm } from './AuthForm'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Label } from '@/components/ui/Label'
import { resetPasswordAction } from '@/lib/auth/reset-password'
import { typography } from '@/design-system/tokens'

export function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
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

    setLoading(true)

    const result = await resetPasswordAction({ password, confirmPassword })

    setLoading(false)

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
          <PasswordInput
            id="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            minLength={8}
          />
          <p className={`${typography.body.tiny} text-white/60`}>
            Mínimo de 8 caracteres
          </p>
        </div>

        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="••••••••"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            minLength={8}
          />
        </div>

        <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
          {loading ? 'Atualizando...' : 'Atualizar Senha'}
        </Button>
      </form>
    </AuthForm>
  )
}
