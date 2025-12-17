# Análise da Área Super Admin - Est3lar Pool v1

> Documento de referência para migração do módulo Super Admin do projeto v1 para v2.

---

## Visão Geral

A área de Super Admin no Est3lar Pool v1 é um painel administrativo completo para gestão do sistema de mineração de Bitcoin. É protegida por autenticação e autorização específica para usuários com role `super_admin`.

### Localização no v1
```
/Users/youapp/GitHubProd/est3lar-pool-prodv1/app/super-admin/
```

### Status no v2
**Atualmente:** Apenas um placeholder simples (linha 61 do `App.tsx`)
```tsx
<Route path="/super-admin" element={<div>Super Admin - Em desenvolvimento</div>} />
```

---

## Estrutura de Arquivos (v1)

```
app/super-admin/
├── layout.tsx                    # Layout wrapper com SuperAdminAppShell
├── page.tsx                      # Página principal com dashboard
├── organizations/
│   ├── page.tsx
│   └── content.tsx               # CRUD de organizações
├── users/
│   ├── page.tsx
│   └── content.tsx               # CRUD de usuários
├── permissions/
│   ├── page.tsx
│   └── content.tsx               # Gerenciamento de permissões
├── currencies/
│   ├── page.tsx
│   └── content.tsx               # Moedas suportadas
├── pools/
│   ├── page.tsx
│   └── content.tsx               # Configuração de pools
├── wallets/
│   ├── page.tsx
│   └── content.tsx               # Carteiras de criptomoedas
├── hardware/
│   ├── page.tsx
│   └── content.tsx               # Hardware de mineração
├── workers/
│   ├── page.tsx
│   └── content.tsx               # Workers (máquinas)
├── payments/
│   ├── page.tsx
│   └── content.tsx               # Pagamentos/transações
├── revenue/
│   ├── page.tsx
│   └── content.tsx               # Receitas/faturamento
├── audit/
│   ├── page.tsx
│   └── content.tsx               # Logs de auditoria
├── endpoints/
│   ├── page.tsx
│   └── content.tsx               # Endpoints de API
├── rounds/
│   ├── page.tsx
│   └── content.tsx               # Rounds de mineração
└── webhooks/
    ├── page.tsx
    └── content.tsx               # Configuração de webhooks
```

---

## Componentes Principais

### 1. Layout (`SuperAdminAppShell.tsx`)

**Caminho:** `components/layout/SuperAdminAppShell.tsx`

**Responsabilidades:**
- Wrapper principal para todas as páginas do super admin
- Gerencia sidebar com navegação
- Carrega dados do usuário autenticado
- Integra com Supabase para autenticação

**Estrutura:**
```tsx
<SidebarProvider>
  <AppSidebar user={currentUser} navItems={superAdminNavItems} />
  <SidebarInset>
    <Topbar />
    <main>{children}</main>
  </SidebarInset>
  <ToastContainer />
</SidebarProvider>
```

### 2. Sidebar (`AppSidebar.tsx`)

**Caminho:** `components/app-sidebar.tsx`

**Componentes:**
- `SidebarHeader` - Logo Est3lar (colapsa para ícone)
- `NavMain` - Itens de navegação principal
- `NavUser` - Info do usuário logado no footer
- `SidebarRail` - Barra lateral para colapsar/expandir

### 3. Topbar (`Topbar.tsx`)

**Caminho:** `components/layout/Topbar.tsx`

**Funcionalidades:**
- `SidebarTrigger` - Botão para toggle do sidebar
- `DynamicBreadcrumb` - Breadcrumb dinâmico baseado na rota
- `GlobalSearch` - Busca global (desktop)
- `SearchModal` - Modal de busca (mobile)
- `NotificationCenterClientWrapper` - Central de notificações

---

## Navegação (Menu Items)

O sidebar contém **14 itens de navegação**:

| Título | URL | Ícone | Descrição |
|--------|-----|-------|-----------|
| Dashboard | `/super-admin` | `LayoutDashboard` | Visão geral do sistema |
| Organizações | `/super-admin/organizations` | `Building` | Gestão de empresas/clientes |
| Usuários | `/super-admin/users` | `UserCog` | Gestão de usuários do sistema |
| Permissões | `/super-admin/permissions` | `Shield` | Roles e permissões |
| Moedas | `/super-admin/currencies` | `Coins` | BTC, BRL, USD, etc |
| Pools | `/super-admin/pools` | `Database` | Pools de mineração |
| Carteiras | `/super-admin/wallets` | `Wallet` | Endereços de cripto |
| Hardware | `/super-admin/hardware` | `BarChart3` | Equipamentos de mineração |
| Workers | `/super-admin/workers` | `Users` | Máquinas/workers |
| Pagamentos | `/super-admin/payments` | `CreditCard` | Transações e payouts |
| Revenue | `/super-admin/revenue` | `TrendingUp` | Receitas e faturamento |
| Auditoria | `/super-admin/audit` | `FileText` | Logs de ações |
| Endpoints | `/super-admin/endpoints` | `Globe` | APIs configuradas |
| Rounds | `/super-admin/rounds` | `RotateCcw` | Rodadas de mineração |
| Webhooks | `/super-admin/webhooks` | `Webhook` | Integrações externas |

---

## Página Principal: Dashboard

**Arquivo:** `components/super-admin/SuperAdminDashboard.tsx`

### KPIs Exibidos (Grid 6 colunas)

| KPI | Descrição | Dados |
|-----|-----------|-------|
| Organizações | Total de orgs ativas | `saas_organization` |
| Usuários | Total de usuários | `saas_user` |
| Hashrate Global | Taxa atual de mineração | `ckpool_stats.hashrate_1m` |
| Workers Globais | Ativos/Total/Idle | `ckpool_stats` |
| Endpoints | Endpoints configurados | `saas_pool_endpoint` |
| Sistema | Uptime e health status | Calculado |

### Gráfico de Hashrate

- Tipo: AreaChart (Recharts)
- Períodos: 1h, 6h, 24h, 7d
- Dados: `ckpool_stats` histórico
- Formatação: PH/s (Petahash/segundo)

### Ações Rápidas (Cards)

1. **Gerenciar Usuários** - Criar admins, editar permissões
2. **Configurações** - Parâmetros do sistema
3. **Auditoria** - Logs e segurança
4. **Sistema** - Endpoints, hardware, webhooks

---

## Páginas de CRUD

### Padrão Comum

Todas as páginas de listagem seguem o padrão:

1. **DataTable** - Componente reutilizável de tabela
2. **Sheet** - Formulário lateral para criar/editar
3. **useSuperAdminData** - Hook para CRUD genérico
4. **Filtros** - Busca e filtros específicos
5. **Ações** - Menu dropdown por linha (Editar, Excluir)

### Organizações (`organizations/content.tsx`)

**Interface:**
```typescript
interface Organization {
  id: number
  name: string
  cnpj?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  status: 'ativo' | 'inativo'
  created_at: string
  users_count: number
}
```

**Campos do Formulário:**
- Nome/Razão Social (obrigatório)
- CNPJ (com máscara)
- E-mail
- Telefone (com máscara)
- Endereço completo (CEP, logradouro, cidade, UF)
- Timezone
- Tarifa kWh
- Moeda base
- Status
- Dados do admin inicial (nome, email, telefone)

**Funcionalidades:**
- Ordenação por nome, status, usuários, data
- Exportação (em desenvolvimento)
- CRUD completo

### Usuários (`users/content.tsx`)

**Interface:**
```typescript
interface SuperAdminUser {
  id: number
  name: string
  email: string
  phone?: string
  avatar_url?: string
  organization_id: number
  organization_name: string
  role_name: string
  role_type_id: number | null
  status: 'ativo' | 'inativo'
  created_at: string
}
```

**Funcionalidades:**
- Avatar upload (máx 2MB)
- Convite de usuário via email
- Seleção de organização
- Atribuição de role
- Status ativo/inativo

### Pools (`pools/content.tsx`)

**Interface:**
```typescript
interface Pool {
  id: number
  name: string
  organization_id: number
  organization_name: string
  payout_model_id: number
  payout_model_name: string
  pool_fee_percent: number
  created_at: string
  updated_at: string
}
```

**Modelos de Payout:**
- PPS (Pay Per Share)
- PPLNS (Pay Per Last N Shares)
- PROP (Proportional)

### Carteiras (`wallets/content.tsx`)

**Interface:**
```typescript
interface Wallet {
  id: number
  address: string
  label: string
  organization_id: number
  organization_name: string
  currency_id: number
  currency_symbol: string
  currency_name: string
  created_at: string
  updated_at: string
}
```

**Funcionalidades:**
- Copiar endereço para clipboard
- Validação de endereço Bitcoin
- Associação com organização e moeda

### Auditoria (`audit/content.tsx`)

**Interface:**
```typescript
interface AuditLog {
  id: number
  organization_id: number | null
  user_id: number | null
  action: string
  entity_type: string | null
  entity_id: number | null
  changes: any
  created_at: string
  after_data: any
  before_data: any
  correlation_id: string
  user?: { name: string, email: string }
  organization?: { name: string }
}
```

**Filtros:**
- Busca textual
- Ação (CREATE, UPDATE, DELETE, LOGIN, LOGOUT, ACCESS)
- Tipo de entidade (user, organization, worker, wallet, payment)
- Usuário
- Data inicial/final

**Funcionalidades:**
- Exportação CSV
- Visualização de detalhes
- Ordenação por múltiplas colunas

---

## Hooks Customizados

### `useSuperAdminData<T>`

**Caminho:** `hooks/useSuperAdminData.ts`

**Funcionalidades:**
- Fetch paginado
- Busca e filtros
- CRUD operations
- Loading states
- Auto-refresh

**Uso:**
```typescript
const {
  data,
  pagination,
  loading,
  isRefreshing,
  refresh,
  setPage,
  setLimit,
  setSearch,
  setFilterValues,
  createItem,
  updateItem,
  deleteItem
} = useSuperAdminData<T>({ endpoint: 'users', initialLimit: 20 })
```

### `useSuperAdminUserManagement`

**Caminho:** `hooks/useSuperAdminUserManagement.ts`

**Funcionalidades:**
- Convite de usuários
- Gestão de permissões específicas

### `useSuperAdminOrganizations`

**Caminho:** `hooks/useSuperAdminOrganizations.ts`

**Funcionalidades:**
- Operações específicas de organizações

---

## APIs (Backend)

### Endpoints do Super Admin

```
/api/super-admin/organizations          GET, POST
/api/super-admin/organizations/[id]     GET, PUT, DELETE
/api/super-admin/users                  GET, POST
/api/super-admin/users/[id]             GET, PUT, DELETE
/api/super-admin/users/options          GET (organizações + roles)
/api/super-admin/users/search           GET
/api/super-admin/users/invite           POST
/api/super-admin/users/generate-link    POST
/api/super-admin/users/reset-password   POST
/api/super-admin/users/create           POST
/api/super-admin/currencies             GET, POST
/api/super-admin/pools                  GET, POST
/api/super-admin/wallets                GET, POST
/api/super-admin/hardware               GET, POST
/api/super-admin/workers                GET
/api/super-admin/payments               GET
/api/super-admin/revenue                GET
/api/super-admin/audit                  GET
/api/super-admin/endpoints              GET, POST
/api/super-admin/rounds                 GET
/api/super-admin/webhooks               GET, POST
```

---

## Componentes de UI Utilizados

### shadcn/ui
- `Button`, `Input`, `Label`, `Textarea`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardDescription`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- `Badge`
- `Avatar`, `AvatarImage`, `AvatarFallback`
- `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter`
- `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuTrigger`
- `Sidebar`, `SidebarProvider`, `SidebarContent`, `SidebarHeader`, `SidebarFooter`, `SidebarRail`, `SidebarInset`, `SidebarTrigger`
- `Popover`, `PopoverContent`, `PopoverTrigger`
- `Skeleton`

### Customizados
- `DataTable` - Tabela com paginação, filtros, busca
- `MaskedInput` - Input com máscara (CNPJ, CEP, telefone)
- `GlobalSearch` - Busca global com atalho de teclado
- `SearchModal` - Modal de busca para mobile
- `NotificationCenterClientWrapper` - Central de notificações
- `DynamicBreadcrumb` - Breadcrumb baseado em rota
- `StatCard` - Card de estatística
- `FreshnessBadge` - Badge de atualização de dados

### Recharts
- `AreaChart`, `LineChart`
- `Area`, `Line`
- `XAxis`, `YAxis`
- `CartesianGrid`
- `Tooltip`
- `ResponsiveContainer`

### Lucide Icons
- `LayoutDashboard`, `Building`, `UserCog`, `Shield`, `Coins`, `Database`
- `Wallet`, `BarChart3`, `Users`, `CreditCard`, `TrendingUp`, `FileText`
- `Globe`, `RotateCcw`, `Webhook`, `Search`, `Download`, `Plus`, `MoreHorizontal`
- `Eye`, `EyeOff`, `Calendar`, `Clock`, `User`, `Mail`, `Copy`, `Upload`, `X`
- `ArrowUpDown`, `ArrowUp`, `ArrowDown`, `RefreshCw`, `Filter`
- `Activity`, `TrendingDown`, `Zap`, `Target`, `CheckCircle`, `AlertTriangle`, `XCircle`
- `Minus`, `Settings`, `Network`, `UserCheck`

---

## Dependências Principais

```json
{
  "next": "15.x",
  "@supabase/supabase-js": "2.x",
  "recharts": "2.x",
  "date-fns": "3.x",
  "sonner": "1.x",
  "lucide-react": "0.x",
  "@radix-ui/react-*": "varios"
}
```

---

## Considerações para Migração v2

### O que precisa ser criado no v2:

1. **Layout Base**
   - Criar `SuperAdminAppShell` com Sidebar
   - Adaptar para React Router (não Next.js)
   - Implementar Topbar com breadcrumb

2. **Páginas**
   - 14 páginas de conteúdo
   - Dashboard principal com gráficos
   - Padrão CRUD para todas as entidades

3. **Hooks**
   - `useSuperAdminData` adaptado para fetch API
   - Hooks específicos de gestão

4. **Componentes**
   - DataTable reutilizável
   - Formulários em Sheet
   - Todos componentes shadcn/ui já instalados

5. **APIs**
   - Endpoints de backend (pode ser Supabase direto ou Edge Functions)
   - Proteção de rotas

### Diferenças Next.js vs Vite

| Aspecto | Next.js (v1) | Vite (v2) |
|---------|--------------|-----------|
| Routing | App Router | React Router |
| Server Components | Sim | Não |
| API Routes | `/api/*` | Supabase Functions ou externo |
| Layout | `layout.tsx` | Componente wrapper |
| Metadata | `export const metadata` | React Helmet ou título dinâmico |

---

## Próximos Passos Recomendados

1. [ ] Criar estrutura de pastas para super-admin
2. [ ] Implementar SuperAdminAppShell
3. [ ] Criar rotas no React Router
4. [ ] Migrar Dashboard principal
5. [ ] Implementar DataTable genérico
6. [ ] Migrar páginas na ordem:
   - Organizations
   - Users
   - Pools
   - Wallets
   - Audit
   - (demais páginas)
7. [ ] Conectar com Supabase
8. [ ] Implementar proteção de rotas (PrivateRoute)

---

## Arquivos de Referência v1

| Componente | Caminho v1 |
|------------|------------|
| Layout | `app/super-admin/layout.tsx` |
| Dashboard | `components/super-admin/SuperAdminDashboard.tsx` |
| AppShell | `components/layout/SuperAdminAppShell.tsx` |
| Sidebar | `components/app-sidebar.tsx` |
| Topbar | `components/layout/Topbar.tsx` |
| NavMain | `components/nav-main.tsx` |
| NavUser | `components/nav-user.tsx` |
| DataTable | `components/super-admin/tables/DataTable.tsx` |
| Hook | `hooks/useSuperAdminData.ts` |

---

*Documento gerado em: 17/12/2025*
*Projeto: Est3lar Pool v2*
