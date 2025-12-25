/**
 * Types para o módulo Super Admin
 */

// ============================================
// Tipos Utilitários para Selects/Dropdowns
// ============================================

/** Tipo simplificado de Organization para uso em selects */
export type OrganizationOption = Pick<Organization, 'id' | 'name'>

/** Tipo simplificado de Currency para uso em selects */
export type CurrencyOption = Pick<Currency, 'id' | 'name' | 'symbol'>

/** Tipo simplificado de Pool para uso em selects */
export type PoolOption = Pick<Pool, 'id' | 'name' | 'organization_id'>

/** Tipo simplificado de Hardware para uso em selects */
export type HardwareOption = Pick<Hardware, 'id' | 'name' | 'organization_id'>

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

/**
 * Tipo User para o painel de administração
 *
 * Inclui dados de relacionamento (organization_name, role_name, etc.)
 * Para o contexto de autenticação, veja UserData em AuthContext.tsx
 * Para o User do Supabase Auth, veja @supabase/supabase-js
 */
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

export type PayoutModelType = 'PPS' | 'PPLNS' | 'PROP'

export interface PayoutModel {
  id: number
  name: string
  description?: string
}

export interface Pool {
  id: number
  name: string
  organization_id: number
  organization_name?: string
  currency_id?: number
  currency_symbol?: string
  payout_model_id: number
  payout_model_name?: string
  pool_fee_percent: number
  min_payout?: number
  stratum_url?: string | null
  stratum_port?: number | null
  stratum_difficulty?: number | null
  is_active?: boolean
  created_at: string
  updated_at?: string
}

export interface CreatePoolInput {
  name: string
  organization_id: number
  currency_id?: number
  payout_model_id: number
  pool_fee_percent: number
  min_payout?: number
  stratum_url?: string
  stratum_port?: number
  stratum_difficulty?: number
  is_active?: boolean
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
  organization_name?: string
  currency_id: number
  currency_symbol?: string
  currency_name?: string
  is_primary?: boolean
  is_active?: boolean
  created_at: string
  updated_at?: string
}

export interface CreateWalletInput {
  address: string
  label: string
  organization_id: number
  currency_id: number
  is_primary?: boolean
  is_active?: boolean
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
  decimals?: number
  is_active?: boolean
  created_at?: string
}

// ============================================
// Hardware
// ============================================

export type HardwareStatus = 'ativo' | 'inativo' | 'manutencao'

export interface Hardware {
  id: number
  name: string
  model: string
  manufacturer: string
  hashrate: number
  hashrate_unit?: string
  power_consumption: number
  efficiency?: number | null
  organization_id: number
  organization_name?: string
  serial_number?: string | null
  purchase_date?: string | null
  warranty_until?: string | null
  status: HardwareStatus
  created_at: string
  updated_at?: string
}

export interface CreateHardwareInput {
  name: string
  model: string
  manufacturer: string
  hashrate: number
  hashrate_unit?: string
  power_consumption: number
  efficiency?: number
  organization_id: number
  serial_number?: string
  purchase_date?: string
  warranty_until?: string
  status?: HardwareStatus
}

export interface UpdateHardwareInput extends Partial<CreateHardwareInput> {
  id: number
}

// ============================================
// Servidores (Infrastructure)
// ============================================

export interface Server {
  id: number
  name: string
  hostname: string
  ip_address: string
  role: string
  status: string
  os: string
  location?: string | null
  cpu_usage: number
  memory_usage: number
  memory_total: string
  disk_usage: number
  disk_total: string
  network_in: string
  network_out: string
  uptime_seconds: number
  connections?: number | null
  requests_per_sec?: number | null
  latency_ms?: number | null
  last_metrics_at?: string | null
  created_at: string
}

// ============================================
// Workers
// ============================================

export type WorkerStatus = 'online' | 'offline' | 'idle'

export interface Worker {
  id: number
  name: string
  hardware_id?: number | null
  hardware_name?: string
  organization_id: number
  organization_name?: string
  pool_id: number
  pool_name?: string
  hashrate: number
  hashrate_1h?: number
  hashrate_24h?: number
  shares_accepted: number
  shares_rejected: number
  shares_stale?: number
  difficulty?: number
  status: WorkerStatus
  last_share_at?: string | null
  last_seen?: string | null
  ip_address?: string | null
  user_agent?: string | null
  created_at: string
}

export interface CreateWorkerInput {
  name: string
  organization_id: number
  pool_id: number
  hardware_id?: number
  status?: WorkerStatus
}

export interface UpdateWorkerInput extends Partial<CreateWorkerInput> {
  id: number
}

// ============================================
// Pagamentos
// ============================================

export type PaymentStatus = 'pendente' | 'processando' | 'concluido' | 'falhou' | 'cancelado'
export type PaymentType = 'block_reward' | 'transaction_fee' | 'withdrawal' | 'manual' | 'adjustment'

export interface Payment {
  id: number
  organization_id: number
  organization_name?: string
  pool_id?: number | null
  pool_name?: string
  wallet_id: number
  wallet_address?: string
  wallet_label?: string
  amount: number
  currency_id: number
  currency_symbol?: string
  type?: PaymentType
  fee?: number
  tx_hash?: string | null
  block_height?: number | null
  confirmations?: number
  status: PaymentStatus
  notes?: string | null
  created_at: string
  processed_at?: string | null
  confirmed_at?: string | null
}

export interface CreatePaymentInput {
  organization_id: number
  pool_id?: number
  wallet_id: number
  amount: number
  currency_id: number
  type?: PaymentType
  fee?: number
  tx_hash?: string
  block_height?: number
  status?: PaymentStatus
  notes?: string
}

export interface UpdatePaymentInput extends Partial<CreatePaymentInput> {
  id: number
}

// ============================================
// Revenue Reports
// ============================================

export interface RevenueReport {
  id: number
  organization_id: number
  organization_name?: string
  pool_id?: number | null
  pool_name?: string
  period_start: string
  period_end: string
  total_hashrate: number
  total_shares: number
  blocks_found: number
  gross_revenue: number
  pool_fees: number
  net_revenue: number
  energy_cost: number
  profit: number
  currency_id?: number | null
  currency_symbol?: string
  created_at: string
}

export interface CreateRevenueReportInput {
  organization_id: number
  pool_id?: number
  period_start: string
  period_end: string
  total_hashrate: number
  total_shares: number
  blocks_found: number
  gross_revenue: number
  pool_fees: number
  net_revenue: number
  energy_cost: number
  profit: number
  currency_id?: number
}

export interface UpdateRevenueReportInput extends Partial<CreateRevenueReportInput> {
  id: number
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

export type EndpointType = 'stratum' | 'api' | 'webhook'

export interface Endpoint {
  id: number
  name: string
  url: string
  type: EndpointType
  organization_id?: number | null
  organization_name?: string
  port?: number | null
  difficulty?: number | null
  is_ssl?: boolean
  status: 'ativo' | 'inativo'
  created_at: string
}

export interface CreateEndpointInput {
  name: string
  url: string
  type: EndpointType
  organization_id?: number
  port?: number
  difficulty?: number
  is_ssl?: boolean
  status?: 'ativo' | 'inativo'
}

export interface UpdateEndpointInput extends Partial<CreateEndpointInput> {
  id: number
}

// ============================================
// Rounds
// ============================================

export type RoundStatus = 'pendente' | 'confirmado' | 'orfao'

export interface Round {
  id: number
  pool_id: number
  pool_name?: string
  height: number
  hash: string
  reward: number
  shares: number
  status: RoundStatus
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
  organization_name?: string
  secret?: string | null
  headers?: Record<string, string> | null
  retry_count?: number
  timeout_ms?: number
  status: 'ativo' | 'inativo'
  created_at: string
  last_triggered?: string | null
}

export interface CreateWebhookInput {
  name: string
  url: string
  events: string[]
  organization_id: number
  secret?: string
  retry_count?: number
  timeout_ms?: number
  status?: 'ativo' | 'inativo'
}

export interface UpdateWebhookInput extends Partial<CreateWebhookInput> {
  id: number
}

// ============================================
// Permissões
// ============================================

export interface Role {
  id: number
  name: string
  description?: string
  role_type_id: number
  level?: number
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
