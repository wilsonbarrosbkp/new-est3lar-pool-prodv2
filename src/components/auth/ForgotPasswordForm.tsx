import { FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { AuthHeader } from './AuthHeader'
import { AuthForm } from './AuthForm'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { forgotPasswordAction } from '@/lib/auth/reset-password'

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string

    const result = await forgotPasswordAction({ email })

    setIsLoading(false)

    if (!result.success) {
      toast.error(result.error || 'Erro ao enviar email de recuperação')
      return
    }

    toast.success(result.message || 'Email enviado com sucesso!')
    setEmailSent(true)
  }

  if (emailSent) {
    return (
      <AuthForm>
        <div className="flex flex-col gap-6">
          <AuthHeader subtitle="Email de recuperação enviado" />

          <div className="rounded-lg border border-border bg-card/50 p-4">
            <p className="text-sm text-text-secondary text-center">
              Enviamos um link de recuperação para seu email.
              Verifique sua caixa de entrada e clique no link para redefinir sua senha.
            </p>
          </div>

          <Link to="/login">
            <Button variant="outline" className="w-full">
              Voltar para login
            </Button>
          </Link>
        </div>
      </AuthForm>
    )
  }

  return (
    <AuthForm>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <AuthHeader subtitle="Recuperar senha" />

        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-secondary text-center">
            Digite seu email para receber um link de recuperação de senha.
          </p>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button type="submit" variant="gradient" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
          </Button>

          <Link to="/login">
            <Button variant="ghost" className="w-full" type="button">
              Voltar para login
            </Button>
          </Link>
        </div>
      </form>
    </AuthForm>
  )
}
