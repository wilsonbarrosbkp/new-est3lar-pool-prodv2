# Sistema de Permissões Simplificado - Est3lar Pool v2

## Objetivo

Simplificar o sistema RBAC mantendo a mesma lógica de negócio, mas com **menos tabelas, menos queries e código mais limpo**.

---

## Problema no Sistema Atual (v1)

### Estrutura Complexa (8 Tabelas)
```
saas_user
  ↓
saas_user_role (pivot)
  ↓
saas_role
  ↓
saas_role_permission (pivot)
  ↓
saas_permission
  ↓
saas_user_permission (cache/denormalized)
  ↓
saas_role_type (lookup)
  ↓
permission_type (lookup)
```

### Problemas Identificados:
1. **Over-normalization**: 8 tabelas para algo que pode ser 2-3
2. **Queries complexas**: JOINs múltiplos para buscar permissões
3. **Denormalização manual**: `saas_user_permission` precisa ser sincronizada via Edge Function
4. **Manutenção difícil**: Alterar uma permissão requer atualizar múltiplas tabelas
5. **Performance**: Cache de 5 minutos necessário devido à complexidade

---

## Solução Simplificada

### Nova Estrutura (3 Tabelas)

```
users
  ↓
roles (3 roles fixos + JSON de permissões)
```

**Tabelas:**
1. `users` - Usuários do sistema
2. `roles` - Apenas 3 roles fixos (seed data)
3. `organizations` - Organizações (multi-tenant)

---

## Modelo de Dados Simplificado

### 1. Tabela `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,

  -- Relacionamentos diretos (sem pivot)
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role_id VARCHAR(20) NOT NULL CHECK (role_id IN ('super_admin', 'org_admin', 'org_miner')),

  -- Timezone do usuário (herdado da org ou customizado)
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_email ON users(email);
```

**Mudanças:**
- ✅ `role_id` é uma string ENUM diretamente na tabela
- ✅ Sem tabela pivot `saas_user_role`
- ✅ Relacionamento direto com `organization`

---

### 2. Tabela `roles` (Seed Data - 3 Registros)

```sql
CREATE TABLE roles (
  id VARCHAR(20) PRIMARY KEY CHECK (id IN ('super_admin', 'org_admin', 'org_miner')),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL, -- Array de strings
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Data (inserido via migration)
INSERT INTO roles (id, name, description, permissions) VALUES
(
  'super_admin',
  'Super Admin',
  'Acesso completo ao sistema',
  '["users:manage", "organizations:manage", "roles:view", "audit:view", "endpoints:manage", "rounds:view", "hardware:manage", "webhooks:manage", "dashboard:view", "workers:manage", "financial:manage", "wallets:manage", "pools:manage", "currencies:manage"]'::jsonb
),
(
  'org_admin',
  'Administrador da Organização',
  'Gerencia organização e usuários',
  '["dashboard:view", "workers:manage", "financial:manage", "wallets:manage", "users:manage", "organization:manage"]'::jsonb
),
(
  'org_miner',
  'Minerador',
  'Visualiza dados próprios',
  '["dashboard:view", "workers:view", "financial:view", "wallets:view"]'::jsonb
);
```

**Mudanças:**
- ✅ Apenas **3 roles fixos** (não há criação dinâmica)
- ✅ Permissões são **JSON array** diretamente na role
- ✅ Sem tabelas `saas_role_permission`, `saas_permission`, `permission_type`
- ✅ Seed data via migration (não muda em runtime)

---

### 3. Tabela `organizations` (Sem mudanças)

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18),
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

---

## Sistema de Permissões

### Formato de Permissões (String)

```typescript
type Permission = `${Resource}:${Action}`

type Resource =
  | 'users' | 'organizations' | 'roles' | 'audit'
  | 'endpoints' | 'rounds' | 'hardware' | 'webhooks'
  | 'dashboard' | 'workers' | 'financial' | 'wallets'
  | 'pools' | 'currencies'

type Action = 'view' | 'manage'
```

**Exemplos:**
- `users:manage` - Criar, editar, deletar usuários
- `workers:view` - Apenas visualizar workers
- `financial:manage` - Gerenciar transações e payouts

### Granularidade Binária

**Antes (v1):** 4 níveis (create, read, update, delete)
**Agora (v2):** 2 níveis (view, manage)

| Ação | `view` | `manage` |
|------|--------|----------|
| **Listar** | ✅ | ✅ |
| **Ver detalhes** | ✅ | ✅ |
| **Criar** | ❌ | ✅ |
| **Editar** | ❌ | ✅ |
| **Deletar** | ❌ | ✅ |

**Lógica:**
```typescript
function hasPermission(userRole: Role, resource: string, action: 'view' | 'manage'): boolean {
  const permission = `${resource}:${action}`
  return userRole.permissions.includes(permission)
}

// Se tem 'manage', automaticamente tem 'view'
function canView(userRole: Role, resource: string): boolean {
  return hasPermission(userRole, resource, 'view') || hasPermission(userRole, resource, 'manage')
}
```

---

## Comparação: Query Complexity

### v1 (Atual) - 6 JOINs
```sql
SELECT
  u.*,
  r.id as role_id,
  r.name as role_name,
  rt.id as role_type_id,
  array_agg(p.key) as permissions
FROM saas_user u
  INNER JOIN saas_user_role ur ON u.id = ur.user_id
  INNER JOIN saas_role r ON ur.role_id = r.id
  INNER JOIN saas_role_type rt ON r.role_type_id = rt.id
  LEFT JOIN saas_role_permission rp ON r.id = rp.role_id
  LEFT JOIN saas_permission p ON rp.permission_id = p.id
WHERE u.auth_user_id = $1
GROUP BY u.id, r.id, rt.id;
```

### v2 (Novo) - 2 JOINs
```sql
SELECT
  u.*,
  o.name as organization_name,
  r.permissions
FROM users u
  LEFT JOIN organizations o ON u.organization_id = o.id
  INNER JOIN roles r ON u.role_id = r.id
WHERE u.auth_user_id = $1;
```

**Ganho de Performance:** ~70% menos complexidade

---

## TypeScript Types

### Arquivo: `src/types/auth.ts`

```typescript
// Roles fixos
export type RoleId = 'super_admin' | 'org_admin' | 'org_miner'

// Recursos do sistema
export type Resource =
  | 'users'
  | 'organizations'
  | 'roles'
  | 'audit'
  | 'endpoints'
  | 'rounds'
  | 'hardware'
  | 'webhooks'
  | 'dashboard'
  | 'workers'
  | 'financial'
  | 'wallets'
  | 'pools'
  | 'currencies'

// Ações possíveis
export type Action = 'view' | 'manage'

// Formato de permissão
export type Permission = `${Resource}:${Action}`

// Role completa (do banco)
export interface Role {
  id: RoleId
  name: string
  description: string
  permissions: Permission[]
}

// User completo
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

// Contexto de autenticação (usado no app)
export interface AuthContext {
  user: User | null
  role: Role | null
  organization: {
    id: string
    name: string
  } | null
  permissions: Permission[]
  hasPermission: (resource: Resource, action: Action) => boolean
  canView: (resource: Resource) => boolean
  canManage: (resource: Resource) => boolean
  isSuperAdmin: boolean
  isOrgAdmin: boolean
  isOrgMiner: boolean
}
```

---

## Funções de Permissão

### Arquivo: `src/lib/permissions.ts`

```typescript
import type { Permission, Resource, Action, Role } from '@/types/auth'

/**
 * Verifica se uma role tem uma permissão específica
 */
export function hasPermission(
  role: Role | null,
  resource: Resource,
  action: Action
): boolean {
  if (!role) return false

  const permission: Permission = `${resource}:${action}`
  return role.permissions.includes(permission)
}

/**
 * Verifica se pode visualizar (view OU manage)
 */
export function canView(role: Role | null, resource: Resource): boolean {
  if (!role) return false

  return (
    hasPermission(role, resource, 'view') ||
    hasPermission(role, resource, 'manage')
  )
}

/**
 * Verifica se pode gerenciar (apenas manage)
 */
export function canManage(role: Role | null, resource: Resource): boolean {
  if (!role) return false

  return hasPermission(role, resource, 'manage')
}

/**
 * Verifica se é super admin
 */
export function isSuperAdmin(role: Role | null): boolean {
  return role?.id === 'super_admin'
}

/**
 * Verifica se é org admin
 */
export function isOrgAdmin(role: Role | null): boolean {
  return role?.id === 'org_admin'
}

/**
 * Verifica se é org miner
 */
export function isOrgMiner(role: Role | null): boolean {
  return role?.id === 'org_miner'
}

/**
 * Mapeia role_id para rota de dashboard
 */
export function getDashboardRoute(roleId: RoleId): string {
  const routes: Record<RoleId, string> = {
    super_admin: '/super-admin',
    org_admin: '/dashboard',
    org_miner: '/dashboard',
  }

  return routes[roleId]
}
```

---

## Proteção de Rotas (React Router)

### Arquivo: `src/components/ProtectedRoute.tsx`

```typescript
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { Resource, Action } from '@/types/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredResource?: Resource
  requiredAction?: Action
  requireSuperAdmin?: boolean
}

export function ProtectedRoute({
  children,
  requiredResource,
  requiredAction = 'view',
  requireSuperAdmin = false,
}: ProtectedRouteProps) {
  const { user, role, hasPermission, isSuperAdmin } = useAuth()
  const location = useLocation()

  // Não autenticado
  if (!user || !role) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Requer super admin
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  // Requer permissão específica
  if (requiredResource && !hasPermission(requiredResource, requiredAction)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

// Uso:
// <ProtectedRoute requiredResource="users" requiredAction="manage">
//   <UsersPage />
// </ProtectedRoute>
```

---

## UI: Conditional Rendering

### Componente de Permissão

```typescript
import { useAuth } from '@/contexts/AuthContext'
import type { Resource, Action } from '@/types/auth'

interface CanProps {
  resource: Resource
  action?: Action
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function Can({ resource, action = 'view', children, fallback = null }: CanProps) {
  const { hasPermission, canView } = useAuth()

  const allowed = action === 'view'
    ? canView(resource)
    : hasPermission(resource, action)

  return allowed ? <>{children}</> : <>{fallback}</>
}

// Uso:
// <Can resource="users" action="manage">
//   <Button>Criar Usuário</Button>
// </Can>
```

---

## Sidebar Dinâmico (Baseado em Permissões)

### Arquivo: `src/config/sidebar.ts`

```typescript
import type { Resource } from '@/types/auth'
import { LucideIcon, Users, Wallet, HardDrive, Settings } from 'lucide-react'

export interface SidebarItem {
  label: string
  href: string
  icon: LucideIcon
  requiredResource?: Resource
  requiredAction?: 'view' | 'manage'
  children?: SidebarItem[]
}

export const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    requiredResource: 'dashboard',
  },
  {
    label: 'Workers',
    href: '/workers',
    icon: HardDrive,
    requiredResource: 'workers',
  },
  {
    label: 'Financeiro',
    href: '/financial',
    icon: Wallet,
    requiredResource: 'financial',
  },
  {
    label: 'Usuários',
    href: '/users',
    icon: Users,
    requiredResource: 'users',
    requiredAction: 'manage', // Apenas quem pode gerenciar
  },
  {
    label: 'Configurações',
    href: '/settings',
    icon: Settings,
    requiredResource: 'organization',
    requiredAction: 'manage',
  },
]

// Filtrar items baseado em permissões
export function filterSidebarByPermissions(
  items: SidebarItem[],
  hasPermission: (resource: Resource, action: 'view' | 'manage') => boolean
): SidebarItem[] {
  return items.filter((item) => {
    if (!item.requiredResource) return true

    const action = item.requiredAction || 'view'
    return hasPermission(item.requiredResource, action)
  })
}
```

---

## Migração de v1 para v2

### Script de Migração SQL

```sql
-- 1. Criar nova tabela users (simplificada)
CREATE TABLE users_v2 AS
SELECT
  u.id,
  u.auth_user_id,
  u.email,
  u.name,
  u.phone,
  u.avatar_url,
  u.organization_id,
  u.timezone,
  u.created_at,
  u.updated_at,
  u.deleted_at,
  CASE
    WHEN rt.id = 3 THEN 'super_admin'
    WHEN rt.id = 4 THEN 'org_admin'
    WHEN rt.id = 5 THEN 'org_miner'
  END as role_id
FROM saas_user u
  INNER JOIN saas_user_role ur ON u.id = ur.user_id
  INNER JOIN saas_role r ON ur.role_id = r.id
  INNER JOIN saas_role_type rt ON r.role_type_id = rt.id;

-- 2. Renomear tabelas
ALTER TABLE saas_user RENAME TO saas_user_old;
ALTER TABLE users_v2 RENAME TO users;

-- 3. Criar roles fixos
INSERT INTO roles (id, name, description, permissions) VALUES (...);

-- 4. Deletar tabelas antigas (após validação)
DROP TABLE saas_user_old;
DROP TABLE saas_user_role;
DROP TABLE saas_role;
DROP TABLE saas_role_permission;
DROP TABLE saas_permission;
DROP TABLE saas_user_permission;
DROP TABLE saas_role_type;
DROP TABLE permission_type;
```

---

## Comparação: Antes vs Depois

| Aspecto | v1 (Atual) | v2 (Novo) | Melhoria |
|---------|------------|-----------|----------|
| **Tabelas** | 8 | 3 | -62% |
| **JOINs por query** | 6 | 2 | -66% |
| **Roles dinâmicos** | Sim (complexo) | Não (3 fixos) | Simplificado |
| **Permissões** | Tabela separada | JSON na role | -1 tabela |
| **Cache necessário** | Sim (5min) | Não | Mais rápido |
| **Código TS** | ~500 linhas | ~150 linhas | -70% |
| **Manutenção** | Difícil | Fácil | ✅ |

---

## Benefícios da Simplificação

1. **Menos Queries**: 2 JOINs vs 6 JOINs (-66%)
2. **Menos Código**: ~70% menos código TypeScript
3. **Sem Denormalização**: Sem `saas_user_permission` cache
4. **Mais Rápido**: Sem necessidade de cache de 5 minutos
5. **Mais Fácil de Entender**: Estrutura linear vs grafo complexo
6. **Menos Bugs**: Menos código = menos bugs
7. **Facilita Onboarding**: Novos devs entendem rapidamente

---

## Trade-offs (O que perdemos)

1. **Roles Dinâmicos**: Não é possível criar roles customizados em runtime
   - **Solução**: 99% dos casos cobertos pelos 3 roles fixos

2. **Permissões Granulares**: Só temos `view` e `manage` (não CRUD separado)
   - **Solução**: Na prática, raramente precisa-se de `create` sem `update`

3. **Menos Flexibilidade**: Sistema mais rígido
   - **Solução**: Para pool de mineração, isso é suficiente e desejável (KISS principle)

---

## Resumo Executivo

### Antes (v1)
```
8 tabelas → 6 JOINs → Cache de 5min → 500 linhas de código → Difícil manutenção
```

### Depois (v2)
```
3 tabelas → 2 JOINs → Sem cache → 150 linhas de código → Fácil manutenção
```

**Ganho:** -62% tabelas, -66% queries, -70% código, +100% simplicidade

---

## Fases de Implementação

**Fase 1: Database**
- Criar migrations para novas tabelas (`users`, `roles`)
- Seed data dos 3 roles fixos
- Executar script de migração de dados v1 para v2

**Fase 2: Types e Funções Core**
- Implementar types TypeScript (`src/types/auth.ts`)
- Criar funções de permissão (`src/lib/permissions.ts`)
- Criar AuthContext com novas funções

**Fase 3: Componentes de Proteção**
- Implementar ProtectedRoute component
- Implementar Can component (conditional rendering)
- Atualizar sidebar para filtrar por permissões

**Fase 4: Testes e Validação**
- Testar todos os fluxos de permissão
- Validar migração de dados
- Atualizar documentação

---

**Complexidade**: Simples (vs Alta complexidade no sistema atual)
