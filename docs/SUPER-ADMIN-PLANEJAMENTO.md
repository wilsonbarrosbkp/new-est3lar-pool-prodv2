# Planejamento: Implementação Super Admin - Est3lar Pool v2

> Guia de implementação da área de Super Admin usando a stack atual do projeto v2.

---

## Stack Atual do Projeto v2

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 19.2 | Framework UI |
| Vite | 7.3 | Build tool |
| TypeScript | 5.9 | Tipagem |
| React Router DOM | 7.10 | Roteamento |
| TanStack Query | 5.90 | Server state |
| TanStack Table | 8.21 | Tabelas |
| Supabase JS | 2.88 | Backend |
| React Hook Form | 7.68 | Formulários |
| Zod | 4.2 | Validação |
| Recharts | 3.6 | Gráficos |
| Tailwind CSS | 4.1 | Estilos |
| Radix UI | * | Primitivos UI |
| Lucide React | 0.561 | Ícones |
| Sonner | 2.0 | Toasts |
| date-fns | 4.1 | Datas |

---

## Estrutura de Pastas Proposta

```
src/
├── components/
│   ├── ui/                       # Componentes base (já existe)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Label.tsx
│   │   ├── Card.tsx              # CRIAR
│   │   ├── Badge.tsx             # CRIAR
│   │   ├── Table.tsx             # CRIAR
│   │   ├── Select.tsx            # CRIAR
│   │   ├── Sheet.tsx             # CRIAR
│   │   ├── Dropdown.tsx          # CRIAR
│   │   ├── Avatar.tsx            # CRIAR
│   │   ├── Skeleton.tsx          # CRIAR
│   │   ├── Popover.tsx           # CRIAR
│   │   └── Separator.tsx         # CRIAR
│   │
│   ├── layout/
│   │   ├── Sidebar.tsx           # CRIAR - Sidebar colapsável
│   │   ├── SidebarNav.tsx        # CRIAR - Navegação do sidebar
│   │   ├── SidebarUser.tsx       # CRIAR - Info do usuário
│   │   ├── Topbar.tsx            # CRIAR - Barra superior
│   │   ├── Breadcrumb.tsx        # CRIAR - Navegação breadcrumb
│   │   └── AppShell.tsx          # CRIAR - Layout wrapper
│   │
│   ├── super-admin/
│   │   ├── Dashboard.tsx         # CRIAR - Dashboard principal
│   │   ├── DataTable.tsx         # CRIAR - Tabela reutilizável
│   │   ├── StatsCard.tsx         # CRIAR - Card de estatística
│   │   ├── HashrateChart.tsx     # CRIAR - Gráfico de hashrate
│   │   └── QuickActions.tsx      # CRIAR - Cards de ação rápida
│   │
│   └── auth/                     # (já existe)
│
├── pages/
│   ├── super-admin/
│   │   ├── index.tsx             # CRIAR - /super-admin (dashboard)
│   │   ├── Organizations.tsx     # CRIAR - /super-admin/organizations
│   │   ├── Users.tsx             # CRIAR - /super-admin/users
│   │   ├── Permissions.tsx       # CRIAR - /super-admin/permissions
│   │   ├── Currencies.tsx        # CRIAR - /super-admin/currencies
│   │   ├── Pools.tsx             # CRIAR - /super-admin/pools
│   │   ├── Wallets.tsx           # CRIAR - /super-admin/wallets
│   │   ├── Hardware.tsx          # CRIAR - /super-admin/hardware
│   │   ├── Workers.tsx           # CRIAR - /super-admin/workers
│   │   ├── Payments.tsx          # CRIAR - /super-admin/payments
│   │   ├── Revenue.tsx           # CRIAR - /super-admin/revenue
│   │   ├── Audit.tsx             # CRIAR - /super-admin/audit
│   │   ├── Endpoints.tsx         # CRIAR - /super-admin/endpoints
│   │   ├── Rounds.tsx            # CRIAR - /super-admin/rounds
│   │   └── Webhooks.tsx          # CRIAR - /super-admin/webhooks
│   │
│   └── (outras páginas existentes)
│
├── hooks/
│   ├── useAuth.ts                # CRIAR - Autenticação
│   ├── useSuperAdmin.ts          # CRIAR - Dados super admin
│   ├── useCkpoolStats.ts         # CRIAR - Stats do pool
│   └── useSystemStats.ts         # CRIAR - Stats do sistema
│
├── lib/
│   ├── supabase/
│   │   └── client.ts             # (já existe)
│   │
│   ├── api/
│   │   ├── organizations.ts      # CRIAR - API organizações
│   │   ├── users.ts              # CRIAR - API usuários
│   │   ├── pools.ts              # CRIAR - API pools
│   │   ├── wallets.ts            # CRIAR - API carteiras
│   │   ├── audit.ts              # CRIAR - API auditoria
│   │   └── stats.ts              # CRIAR - API estatísticas
│   │
│   ├── validations/
│   │   ├── organization.ts       # CRIAR - Schema Zod
│   │   ├── user.ts               # CRIAR - Schema Zod
│   │   └── pool.ts               # CRIAR - Schema Zod
│   │
│   └── formatters.ts             # CRIAR - Formatação (hashrate, números)
│
├── types/
│   ├── super-admin.ts            # CRIAR - Types das entidades
│   └── database.ts               # CRIAR - Types do Supabase
│
└── App.tsx                       # ATUALIZAR - Adicionar rotas
```

---

## Fases de Implementação

### Fase 1: Infraestrutura Base
**Prioridade: Alta | Estimativa: Fundação**

#### 1.1 Componentes UI Faltantes
Criar componentes shadcn/ui que ainda não existem:

```bash
# Componentes a criar (baseados em Radix UI já instalado)
- Card (CardHeader, CardTitle, CardContent, CardDescription)
- Badge
- Table (TableHeader, TableBody, TableRow, TableHead, TableCell)
- Select (SelectTrigger, SelectContent, SelectItem, SelectValue)
- Sheet (SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter)
- DropdownMenu (DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem)
- Avatar (AvatarImage, AvatarFallback)
- Skeleton
- Popover (PopoverTrigger, PopoverContent)
- Separator
```

#### 1.2 Types Base
```typescript
// src/types/super-admin.ts
export interface Organization {
  id: number
  name: string
  cnpj?: string
  email?: string
  phone?: string
  status: 'ativo' | 'inativo'
  created_at: string
  users_count: number
}

export interface User {
  id: number
  name: string
  email: string
  phone?: string
  avatar_url?: string
  organization_id: number
  organization_name: string
  role_name: string
  status: 'ativo' | 'inativo'
  created_at: string
}

export interface Pool {
  id: number
  name: string
  organization_id: number
  organization_name: string
  payout_model: 'PPS' | 'PPLNS' | 'PROP'
  pool_fee_percent: number
  created_at: string
}

// ... demais types
```

#### 1.3 Formatters
```typescript
// src/lib/formatters.ts
export function formatHashrate(hashrate: number): string
export function formatNumber(num: number): string
export function formatCurrency(value: number, currency?: string): string
export function formatDate(date: string | Date): string
```

---

### Fase 2: Layout e Navegação
**Prioridade: Alta | Dependência: Fase 1**

#### 2.1 Sidebar Component
```typescript
// src/components/layout/Sidebar.tsx
interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

// Features:
// - Logo Est3lar (normal/collapsed)
// - Menu de navegação com ícones
// - Info do usuário no footer
// - Toggle collapse/expand
// - Responsive (drawer no mobile)
```

#### 2.2 Topbar Component
```typescript
// src/components/layout/Topbar.tsx

// Features:
// - Botão toggle sidebar
// - Breadcrumb dinâmico
// - Busca global (futuro)
// - Notificações (futuro)
```

#### 2.3 AppShell (Layout Wrapper)
```typescript
// src/components/layout/AppShell.tsx
interface AppShellProps {
  children: React.ReactNode
}

// Estrutura:
// <div className="flex h-screen">
//   <Sidebar />
//   <div className="flex-1 flex flex-col">
//     <Topbar />
//     <main className="flex-1 overflow-auto p-6">
//       {children}
//     </main>
//   </div>
// </div>
```

#### 2.4 Rotas no App.tsx
```typescript
// src/App.tsx
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout'

// Adicionar rotas:
<Route path="/super-admin" element={<SuperAdminLayout />}>
  <Route index element={<SuperAdminDashboard />} />
  <Route path="organizations" element={<OrganizationsPage />} />
  <Route path="users" element={<UsersPage />} />
  <Route path="permissions" element={<PermissionsPage />} />
  <Route path="currencies" element={<CurrenciesPage />} />
  <Route path="pools" element={<PoolsPage />} />
  <Route path="wallets" element={<WalletsPage />} />
  <Route path="hardware" element={<HardwarePage />} />
  <Route path="workers" element={<WorkersPage />} />
  <Route path="payments" element={<PaymentsPage />} />
  <Route path="revenue" element={<RevenuePage />} />
  <Route path="audit" element={<AuditPage />} />
  <Route path="endpoints" element={<EndpointsPage />} />
  <Route path="rounds" element={<RoundsPage />} />
  <Route path="webhooks" element={<WebhooksPage />} />
</Route>
```

---

### Fase 3: Dashboard Principal
**Prioridade: Alta | Dependência: Fase 2**

#### 3.1 Hook de Stats
```typescript
// src/hooks/useSystemStats.ts
import { useQuery } from '@tanstack/react-query'

export function useSystemStats() {
  return useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      // Buscar de saas_organization, saas_user, etc
    },
    refetchInterval: 30000 // 30 segundos
  })
}

// src/hooks/useCkpoolStats.ts
export function useCkpoolStats(period: '1h' | '6h' | '24h' | '7d') {
  return useQuery({
    queryKey: ['ckpool-stats', period],
    queryFn: async () => {
      // Buscar de ckpool_stats
    }
  })
}
```

#### 3.2 Componentes do Dashboard
```typescript
// StatsCard - Card de KPI
// HashrateChart - Gráfico com Recharts
// QuickActions - Cards de ação rápida
// WorkersOverview - Resumo de workers
```

#### 3.3 Dashboard Page
```typescript
// src/pages/super-admin/index.tsx
export function SuperAdminDashboard() {
  const { data: systemStats } = useSystemStats()
  const { data: ckpoolStats } = useCkpoolStats('24h')

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* KPIs Grid (6 colunas) */}
      {/* Gráfico de Hashrate */}
      {/* Ações Rápidas */}
    </div>
  )
}
```

---

### Fase 4: DataTable Reutilizável
**Prioridade: Alta | Dependência: Fase 1**

#### 4.1 DataTable com TanStack Table
```typescript
// src/components/super-admin/DataTable.tsx
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
  }
  onPageChange?: (page: number) => void
  onCreate?: () => void
  onExport?: () => void
  searchPlaceholder?: string
}

// Features:
// - Paginação
// - Ordenação por coluna
// - Busca global
// - Loading state (Skeleton)
// - Empty state
// - Ações por linha (dropdown)
```

---

### Fase 5: CRUD de Organizações
**Prioridade: Alta | Dependência: Fase 4**

#### 5.1 API Layer
```typescript
// src/lib/api/organizations.ts
import { supabase } from '@/lib/supabase/client'

export async function getOrganizations(params: { page: number, limit: number, search?: string }) {
  // Query com paginação
}

export async function createOrganization(data: CreateOrganizationInput) {
  // Insert + criar admin
}

export async function updateOrganization(id: number, data: UpdateOrganizationInput) {
  // Update
}

export async function deleteOrganization(id: number) {
  // Soft delete (deleted = true)
}
```

#### 5.2 Hook
```typescript
// src/hooks/useSuperAdmin.ts
export function useOrganizations(params) {
  return useQuery({
    queryKey: ['organizations', params],
    queryFn: () => getOrganizations(params)
  })
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Organização criada!')
    }
  })
}
```

#### 5.3 Validação Zod
```typescript
// src/lib/validations/organization.ts
import { z } from 'zod'

export const organizationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum(['ativo', 'inativo']),
})
```

#### 5.4 Página
```typescript
// src/pages/super-admin/Organizations.tsx
// - DataTable com organizações
// - Sheet para criar/editar
// - Formulário com React Hook Form + Zod
// - Ações: Editar, Excluir
```

---

### Fase 6: CRUD de Usuários
**Prioridade: Alta | Dependência: Fase 5**

Similar à Fase 5, com adições:
- Upload de avatar
- Seleção de organização (dropdown)
- Seleção de role
- Convite por email

---

### Fase 7: Demais Páginas CRUD
**Prioridade: Média | Dependência: Fase 6**

Implementar seguindo o mesmo padrão:

| Ordem | Página | Complexidade |
|-------|--------|--------------|
| 7.1 | Pools | Baixa |
| 7.2 | Wallets | Baixa |
| 7.3 | Currencies | Baixa |
| 7.4 | Audit | Média (filtros) |
| 7.5 | Permissions | Média |
| 7.6 | Hardware | Baixa |
| 7.7 | Workers | Baixa |
| 7.8 | Payments | Média |
| 7.9 | Revenue | Média |
| 7.10 | Endpoints | Baixa |
| 7.11 | Rounds | Baixa |
| 7.12 | Webhooks | Média |

---

### Fase 8: Proteção de Rotas
**Prioridade: Alta | Dependência: Fase 2**

#### 8.1 Hook de Autenticação
```typescript
// src/hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verificar sessão Supabase
  // Buscar dados do saas_user
  // Verificar role

  return { user, role, loading, isSuperAdmin: role === 'super_admin' }
}
```

#### 8.2 Componente de Proteção
```typescript
// src/components/auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode
  requireSuperAdmin?: boolean
}

export function ProtectedRoute({ children, requireSuperAdmin }: ProtectedRouteProps) {
  const { user, isSuperAdmin, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" />
  if (requireSuperAdmin && !isSuperAdmin) return <Navigate to="/dashboard" />

  return children
}
```

---

## Ordem de Execução Recomendada

```
SEMANA 1: Fundação
├── Fase 1.1: Componentes UI (Card, Badge, Table, etc)
├── Fase 1.2: Types base
├── Fase 1.3: Formatters
└── Fase 2: Layout (Sidebar, Topbar, AppShell)

SEMANA 2: Core
├── Fase 3: Dashboard Principal
├── Fase 4: DataTable reutilizável
└── Fase 8: Proteção de rotas

SEMANA 3: CRUD Principal
├── Fase 5: Organizations
└── Fase 6: Users

SEMANA 4+: Expansão
└── Fase 7: Demais páginas (1-2 por dia)
```

---

## Decisões Técnicas

### 1. Server State
Usar **TanStack Query** para todo gerenciamento de dados:
- Cache automático
- Revalidação em background
- Optimistic updates
- Loading/error states

### 2. Formulários
Usar **React Hook Form + Zod**:
- Validação type-safe
- Performance otimizada
- Integração com shadcn/ui

### 3. Tabelas
Usar **TanStack Table**:
- Headless (controle total do UI)
- Sorting, filtering, pagination built-in
- TypeScript first

### 4. Gráficos
Usar **Recharts** (já instalado):
- AreaChart para hashrate
- LineChart para tendências
- Tooltips customizados

### 5. Estado Global
**Não usar Redux/Zustand**:
- TanStack Query para server state
- Context API para UI state (sidebar collapsed, tema)
- Props drilling para componentes simples

### 6. API
Usar **Supabase JS diretamente**:
- Sem backend intermediário
- RLS para segurança
- Realtime para updates (futuro)

---

## Componentes UI a Criar (Detalhado)

### Card
```typescript
// Baseado em div com classes Tailwind
export function Card({ className, ...props })
export function CardHeader({ className, ...props })
export function CardTitle({ className, ...props })
export function CardDescription({ className, ...props })
export function CardContent({ className, ...props })
export function CardFooter({ className, ...props })
```

### Badge
```typescript
// Variantes: default, secondary, destructive, outline
export function Badge({ variant, className, ...props })
```

### Table
```typescript
// Wrapper para table nativa com estilos
export function Table({ className, ...props })
export function TableHeader({ className, ...props })
export function TableBody({ className, ...props })
export function TableRow({ className, ...props })
export function TableHead({ className, ...props })
export function TableCell({ className, ...props })
```

### Select (já tem @radix-ui/react-select)
```typescript
// Wrapper para Radix Select
export function Select({ ...props })
export function SelectTrigger({ className, ...props })
export function SelectContent({ className, ...props })
export function SelectItem({ className, ...props })
export function SelectValue({ ...props })
```

### Sheet (já tem @radix-ui/react-dialog)
```typescript
// Baseado em Radix Dialog, estilizado como painel lateral
export function Sheet({ ...props })
export function SheetTrigger({ ...props })
export function SheetContent({ side, className, ...props }) // side: 'left' | 'right'
export function SheetHeader({ className, ...props })
export function SheetTitle({ className, ...props })
export function SheetDescription({ className, ...props })
export function SheetFooter({ className, ...props })
```

### DropdownMenu (já tem @radix-ui/react-dropdown-menu)
```typescript
// Wrapper para Radix DropdownMenu
export function DropdownMenu({ ...props })
export function DropdownMenuTrigger({ ...props })
export function DropdownMenuContent({ className, ...props })
export function DropdownMenuItem({ className, ...props })
export function DropdownMenuSeparator({ className, ...props })
```

---

## Checklist de Implementação

### Fase 1: Infraestrutura
- [ ] Card component
- [ ] Badge component
- [ ] Table component
- [ ] Select component
- [ ] Sheet component
- [ ] DropdownMenu component
- [ ] Avatar component
- [ ] Skeleton component
- [ ] Separator component
- [ ] Types base (super-admin.ts)
- [ ] Formatters (formatHashrate, formatNumber, etc)

### Fase 2: Layout
- [ ] Sidebar component
- [ ] SidebarNav component
- [ ] SidebarUser component
- [ ] Topbar component
- [ ] Breadcrumb component
- [ ] AppShell component
- [ ] SuperAdminLayout component
- [ ] Rotas no App.tsx

### Fase 3: Dashboard
- [ ] useSystemStats hook
- [ ] useCkpoolStats hook
- [ ] StatsCard component
- [ ] HashrateChart component
- [ ] QuickActions component
- [ ] Dashboard page

### Fase 4: DataTable
- [ ] DataTable component com TanStack Table
- [ ] Paginação
- [ ] Ordenação
- [ ] Busca
- [ ] Loading/Empty states

### Fase 5: Organizations
- [ ] API layer (lib/api/organizations.ts)
- [ ] Hooks (useOrganizations, useCreateOrganization, etc)
- [ ] Validação Zod
- [ ] Página Organizations.tsx
- [ ] Formulário Sheet

### Fase 6: Users
- [ ] API layer
- [ ] Hooks
- [ ] Validação
- [ ] Página Users.tsx
- [ ] Upload de avatar

### Fase 7: Demais Páginas
- [ ] Pools
- [ ] Wallets
- [ ] Currencies
- [ ] Audit
- [ ] Permissions
- [ ] Hardware
- [ ] Workers
- [ ] Payments
- [ ] Revenue
- [ ] Endpoints
- [ ] Rounds
- [ ] Webhooks

### Fase 8: Proteção
- [ ] useAuth hook
- [ ] ProtectedRoute component
- [ ] Integração nas rotas

---

## Referências

- [TanStack Table Docs](https://tanstack.com/table/latest)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Recharts](https://recharts.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)

---

*Documento criado em: 17/12/2025*
*Projeto: Est3lar Pool v2*
