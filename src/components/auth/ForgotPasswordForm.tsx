import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { AuthHeader } from './AuthHeader'
import { AuthForm } from './AuthForm'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { forgotPasswordAction } from '@/lib/auth/reset-password'

export function ForgotPasswordForm() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email) {
      toast.error('Por favor, digite seu e-mail')
      return
    }

    if (!email.includes('@')) {
      toast.error('Por favor, digite um e-mail válido')
      return
    }

    setIsLoading(true)

    const result = await forgotPasswordAction({ email: email.trim() })

    setIsLoading(false)

    if (!result.success) {
      toast.error(result.error || 'Erro ao enviar e-mail. Tente novamente')
      return
    }

    toast.success('E-mail de recuperação enviado!')
    setEmailSent(true)
  }

  if (emailSent) {
    return (
      <AuthForm>
        <div className="flex flex-col gap-6">
          <AuthHeader subtitle="E-mail enviado com sucesso!" />

          <div className="grid gap-3">
            <div className="text-center space-y-2">
              <p className="text-sm text-text-secondary">
                E-mail enviado para:
              </p>
              <p className="text-sm font-medium break-all">
                {email}
              </p>
              <p className="text-sm text-text-secondary">
                Verifique sua caixa de entrada e clique no link para redefinir sua senha
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setEmailSent(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tentar outro e-mail
            </Button>

            <Button
              type="button"
              variant="gradient"
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Voltar ao Login
            </Button>
          </div>
        </div>
      </AuthForm>
    )
  }

  return (
    <AuthForm>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <AuthHeader subtitle="Recupere sua senha de acesso" />

        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-col gap-3">
          <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar E-mail'}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate('/login')}
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Login
          </Button>
        </div>
      </form>
    </AuthForm>
  )
}
