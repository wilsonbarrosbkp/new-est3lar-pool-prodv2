/**
 * Types para autenticação
 *
 * NOTA: O tipo User principal está em @/types/super-admin.ts
 * O contexto de auth usa UserData definido localmente em AuthContext.tsx
 * O Supabase Auth usa seu próprio tipo User de @supabase/supabase-js
 */

export type RoleId = 'super_admin' | 'org_admin' | 'org_miner'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResult {
  success: boolean
  error?: string
  redirectTo?: string
  user?: {
    id: string
    email: string
    role_id: RoleId
  }
}
