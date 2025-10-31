export type RoleId = 'super_admin' | 'org_admin' | 'org_miner'

export interface User {
  id: string
  auth_user_id: string
  email: string
  name: string
  phone?: string
  avatar_url?: string
  organization_id?: string
  role_id: RoleId
  timezone: string
  created_at: string
  updated_at: string
}

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
