import { supabase } from '../supabase/client'

export interface ForgotPasswordCredentials {
  email: string
}

export interface ForgotPasswordResult {
  success: boolean
  error?: string
  message?: string
}

export interface ResetPasswordCredentials {
  password: string
  confirmPassword: string
}

export interface ResetPasswordResult {
  success: boolean
  error?: string
  message?: string
}

export async function forgotPasswordAction(
  credentials: ForgotPasswordCredentials
): Promise<ForgotPasswordResult> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      credentials.email.trim(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    )

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      message: 'Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.',
    }
  } catch {
    return { success: false, error: 'Erro ao enviar email de recuperação' }
  }
}

export async function resetPasswordAction(
  credentials: ResetPasswordCredentials
): Promise<ResetPasswordResult> {
  try {
    // Validate passwords match
    if (credentials.password !== credentials.confirmPassword) {
      return { success: false, error: 'As senhas não coincidem' }
    }

    // Validate password length
    if (credentials.password.length < 6) {
      return { success: false, error: 'A senha deve ter no mínimo 6 caracteres' }
    }

    const { error } = await supabase.auth.updateUser({
      password: credentials.password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      message: 'Senha redefinida com sucesso!',
    }
  } catch {
    return { success: false, error: 'Erro ao redefinir senha' }
  }
}
