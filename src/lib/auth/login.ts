import { supabase } from '../supabase/client'

import type { LoginCredentials, LoginResult } from '@/types/auth'

export async function loginAction(credentials: LoginCredentials): Promise<LoginResult> {
  try {
    // 1. Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email.trim(),
      password: credentials.password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data.user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    // 2. Fetch user data from saas_user table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        role_id
      `)
      .eq('auth_user_id', data.user.id)
      .single()

    if (userError || !userData) {
      return { success: false, error: 'Usuário não encontrado no sistema' }
    }

    // 3. Determine redirect based on role_id (numeric)
    // role_id: 1 = Super Admin, 2 = Org Admin, 3 = Org Miner
    const redirectMap: Record<number, string> = {
      1: '/super-admin',    // Super Admin
      2: '/org-admin',      // Org Admin
      3: '/dashboard',      // Org Miner
    }

    const redirectTo = redirectMap[userData.role_id] || '/dashboard'

    return {
      success: true,
      redirectTo,
      user: {
        id: userData.id,
        email: userData.email,
        role_id: userData.role_id,
      },
    }
  } catch {
    return { success: false, error: 'Erro ao fazer login' }
  }
}
