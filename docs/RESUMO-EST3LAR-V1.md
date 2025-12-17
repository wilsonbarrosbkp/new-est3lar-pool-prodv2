Resumo do Projeto v1 (Est3lar Pool)

  Stack

  - Next.js 15.5.4 (App Router) → migrar para Vite + React 19
  - Supabase (Auth + DB + Realtime)
  - TanStack Query para state
  - shadcn/ui + Tailwind 4
  - React Hook Form + Zod

  Estrutura de Páginas (40+ rotas)

  | Área        | Rotas                                                                                                                                                                 |
  |-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | Auth        | /login, /forgot-password, /update-password, /create-password, /accept-invite, /auth-code-error                                                                        |
  | Dashboards  | /dashboard-user, /dashboard-admin, /dashboard-financial, /dashboard-organization, /dashboard-revenue, /dashboard-wallets, /dashboard-workers                          |
  | Features    | /workers-user, /payouts, /payouts/[id], /payouts/analytics, /payout-rules, /mining, /settings, /account                                                               |
  | Super Admin | /super-admin + 15 sub-rotas (organizations, users, permissions, audit, endpoints, hardware, pools, currencies, payments, wallets, webhooks, workers, rounds, revenue) |

  Componentes Principais (110+)

  - Layout: AppShell, Topbar, Sidebar, Breadcrumb
  - Dashboard: DashboardUser, DashboardOrganization, widgets (Hashrate, Metrics, WorkerStatus)
  - Workers: 20+ componentes (tabelas, detalhes, métricas, telemetria)
  - Payouts: 7 componentes (tabela, analytics, timeline, dialogs)
  - Wallets: 4 componentes
  - Organization: 7 componentes (forms, tables, dialogs)
  - Permissions: 4 componentes (manager, dialogs, tables)
  - UI shadcn: 50+ componentes base

  Hooks Customizados (15)

  - useAuth, usePermission, usePermissions
  - useRealtimeDashboard, useRealtimeWorkers, useRealtimeAlerts, useRealtimePayouts
  - useCkpoolStats, useCkpoolTopWorkers
  - useNotifications, useGlobalSearch
  - useSmartCache, useSuperAdminData

  Sistema RBAC

  - 3 Roles: super_admin, org_admin, org_miner
  - 20+ Permissões: org:, user:, worker:, alert:, payout:, wallet:, webhook:, audit:, billing:, settings:
  - Gates: <PermissionGate>, <AdminGate>, <RoleGate>

  Design System (Dark Mode padrão)

  - Background: #0B0F14
  - Cards/Panels: #0F1720
  - Texto: #FFFFFF / #94A3B8
  - Status: online #10B981, warning #F59E0B, offline #EF4444

  Tabelas Supabase

  saas_user, saas_organization, saas_user_role, saas_role, saas_permission, saas_worker, saas_worker_minute_aggregate, saas_payment, saas_wallet, saas_endpoint, saas_currency, saas_equipment, saas_alert_event, saas_round, saas_audit_event