/**
 * Types para o módulo Super Admin
 */

// ============================================
// Organizações
// ============================================

export interface Organization {
  id: number
  name: string
  cnpj?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  timezone?: string
  kwh_rate?: number
  base_currency?: string
  status: 'ativo' | 'inativo'
  created_at: string
  updated_at?: string
  users_count: number
}

export interface CreateOrganizationInput {
  name: string
  cnpj?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  timezone?: string
  kwh_rate?: number
  base_currency?: string
  status?: 'ativo' | 'inativo'
  // Admin inicial
  admin_name?: string
  admin_email?: string
  admin_phone?: string
}

export interface UpdateOrganizationInput extends Partial<CreateOrganizationInput> {
  id: number
}

// ============================================
// Usuários
// ============================================

export interface User {
  id: string // UUID
  auth_user_id: string // UUID - FK para auth.users
  name: string
  email: string
  phone?: string
  avatar_url?: string
  organization_id?: number
  organization_name?: string
  role_id: number
  role_name: string
  role_level: number
  role_badge_color?: string
  status: 'ativo' | 'inativo'
  created_at: string
  updated_at?: string
}

export interface CreateUserInput {
  name: string
  email: string
  password: string // Necessário para criar o usuário no auth.users
  phone?: string
  avatar_url?: string
  organization_id?: number
  role_id: number
  status?: 'ativo' | 'inativo'
}

export interface UpdateUserInput {
  id: string // UUID
  name?: string
  email?: string
  phone?: string
  avatar_url?: string
  organization_id?: number
  role_id?: number
  status?: 'ativo' | 'inativo'
}

// ============================================
// Pools
// ============================================

export type PayoutModel = 'PPS' | 'PPLNS' | 'PROP'

export interface Pool {
  id: number
  name: string
  organization_id: number
  organization_name: string
  payout_model_id: number
  payout_model_name: string
  pool_fee_percent: number
  created_at: string
  updated_at?: string
}

export interface CreatePoolInput {
  name: string
  organization_id: number
  payout_model_id: number
  pool_fee_percent: number
}

export interface UpdatePoolInput extends Partial<CreatePoolInput> {
  id: number
}

// ============================================
// Carteiras
// ============================================

export interface Wallet {
  id: number
  address: string
  label: string
  organization_id: number
  organization_name: string
  currency_id: number
  currency_symbol: string
  currency_name: string
  created_at: string
  updated_at?: string
}

export interface CreateWalletInput {
  address: string
  label: string
  organization_id: number
  currency_id: number
}

export interface UpdateWalletInput extends Partial<CreateWalletInput> {
  id: number
}

// ============================================
// Moedas
// ============================================

export interface Currency {
  id: number
  name: string
  symbol: string
  type: 'crypto' | 'fiat'
  decimals: number
  created_at: string
}

// ============================================
// Hardware
// ============================================

export interface Hardware {
  id: number
  name: string
  model: string
  manufacturer: string
  hashrate: number
  power_consumption: number
  efficiency: number
  organization_id: number
  organization_name: string
  status: 'ativo' | 'inativo' | 'manutencao'
  created_at: string
}

// ============================================
// Workers
// ============================================

export type WorkerStatus = 'online' | 'offline' | 'idle'

export interface Worker {
  id: number
  name: string
  hardware_id: number
  hardware_name: string
  organization_id: number
  organization_name: string
  pool_id: number
  pool_name: string
  hashrate: number
  shares_accepted: number
  shares_rejected: number
  status: WorkerStatus
  last_seen: string
  created_at: string
}

// ============================================
// Pagamentos
// ============================================

export type PaymentStatus = 'pendente' | 'processando' | 'concluido' | 'falhou'

export interface Payment {
  id: number
  organization_id: number
  organization_name: string
  wallet_id: number
  wallet_address: string
  amount: number
  currency_id: number
  currency_symbol: string
  tx_hash?: string
  status: PaymentStatus
  created_at: string
  processed_at?: string
}

// ============================================
// Auditoria
// ============================================

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'ACCESS'

export interface AuditLog {
  id: number
  organization_id?: number
  organization_name?: string
  user_id?: number
  user_name?: string
  user_email?: string
  action: AuditAction
  entity_type?: string
  entity_id?: number
  before_data?: Record<string, unknown>
  after_data?: Record<string, unknown>
  changes?: Record<string, unknown>
  correlation_id: string
  created_at: string
}

export interface AuditFilters {
  search?: string
  action?: AuditAction | ''
  entity_type?: string
  user_id?: number
  date_from?: Date
  date_to?: Date
}

// ============================================
// Endpoints
// ============================================

export interface Endpoint {
  id: number
  name: string
  url: string
  type: 'stratum' | 'api' | 'webhook'
  organization_id: number
  organization_name: string
  status: 'ativo' | 'inativo'
  created_at: string
}

// ============================================
// Rounds
// ============================================

export interface Round {
  id: number
  pool_id: number
  pool_name: string
  height: number
  hash: string
  reward: number
  shares: number
  status: 'pendente' | 'confirmado' | 'orfao'
  found_at: string
  confirmed_at?: string
}

// ============================================
// Webhooks
// ============================================

export interface Webhook {
  id: number
  name: string
  url: string
  events: string[]
  organization_id: number
  organization_name: string
  secret?: string
  status: 'ativo' | 'inativo'
  created_at: string
  last_triggered?: string
}

// ============================================
// Permissões
// ============================================

export interface Role {
  id: number
  name: string
  description?: string
  role_type_id: number
  badge_color?: string
  permissions: string[]
  created_at: string
}

export interface Permission {
  id: number
  name: string
  description?: string
  module: string
  action: string
}

// ============================================
// Stats do Sistema
// ============================================

export interface SystemStats {
  totalOrganizations: number
  totalUsers: number
  activeEndpoints: number
  systemHealth: 'healthy' | 'degraded' | 'critical'
  uptime: number
}

export interface CkpoolStats {
  id: number
  collected_at: string
  hashrate_1m: number
  hashrate_5m: number
  hashrate_15m: number
  hashrate_1h: number
  hashrate_1d: number
  hashrate_7d: number
  workers_total: number
  workers_active: number
  workers_idle: number
  workers_off: number
  shares_accepted: number
  shares_rejected: number
  best_share: number
  difficulty: number
}

export interface HashrateChartData {
  time: string
  hashrate: number
  hashrate1h?: number
  hashrate1d?: number
}

// ============================================
// Paginação
// ============================================

export interface PaginationParams {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================
// API Response
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
