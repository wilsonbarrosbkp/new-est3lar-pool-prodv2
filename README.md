# Est3lar Pool v2

Sistema de gerenciamento de pool de mineracao Bitcoin - Versao 2.0

Migracao do Next.js 15 para Vite + React com stack moderna e otimizada.

---

## Stack Tecnologica

### Frontend
- **React 19.2.3** - Library UI
- **TypeScript 5.9.3** - Type safety
- **Vite 7.3.0** - Build tool ultra-rapido
- **React Router DOM 7.10.1** - Roteamento client-side
- **Tailwind CSS 4.1.18** - Styling com utility-first
- **Radix UI** - Primitivos acessiveis para UI components
- **Lucide React 0.561.0** - Icones modernos

### Backend e Autenticacao
- **Supabase** - PostgreSQL + Auth + Real-time
- **@supabase/supabase-js 2.88.0** - Cliente JavaScript

### State e Forms
- **TanStack Query v5.90.12** - Server state management
- **React Hook Form 7.68.0** - Gerenciamento de formularios
- **Zod 4.2.1** - Validacao de schemas
- **Sonner 2.0.7** - Toast notifications

### Charts e Tabelas
- **Recharts 3.6.0** - Graficos
- **TanStack Table 8.21.3** - Tabelas avancadas

### Development
- **pnpm 10.18.2** - Package manager rapido
- **ESLint 9.39.2** - Linting
- **PostCSS 8.5.6** - CSS processing

---

## Sistema de Autenticacao

### Paginas de Autenticacao

**Pagina de Login** (`/login`)
- Formulario email + senha
- Validacao client-side e server-side
- Toggle de visibilidade de senha
- Loading states
- Redirecionamento automatico por role
- Toast notifications para feedback
- Link "Esqueci a senha"

**Recuperacao de Senha** (`/forgot-password`)
- Formulario com campo de email
- Envio de email com link magico via Supabase
- Tela de confirmacao apos envio

**Redefinicao de Senha** (`/reset-password`)
- Formulario nova senha + confirmacao
- Toggle de visibilidade em ambos os campos
- Validacao: senhas devem coincidir + minimo 6 caracteres

### Sistema de Roles e Redirecionamento

| Role ID | Nome | Nivel | Redireciona para |
|---------|------|-------|------------------|
| 1 | Super Admin | 100 | `/super-admin` |
| 2 | Org Admin | 50 | `/org-admin` |
| 3 | Org Miner | 10 | `/dashboard` |

### Protecao de Rotas

O sistema implementa protecao de rotas baseada em roles:

- **PublicRoute** - Rotas publicas (login, forgot-password). Redireciona usuarios autenticados para seu dashboard
- **ProtectedRoute** - Rotas protegidas. Requer autenticacao
- **SuperAdminRoute** - Apenas Super Admin (role_id: 1)
- **OrgAdminRoute** - Super Admin + Org Admin (role_id: 1, 2)
- **MinerRoute** - Todos os roles autenticados

### Credenciais de Teste

```
Email: admin@est3lar.com
Senha: Est3lar@2025
Role: Super Admin
```

---

## Painel Super Admin

O painel Super Admin esta totalmente implementado com 16 paginas:

### Paginas Implementadas

| Pagina | Rota | Descricao |
|--------|------|-----------|
| Dashboard | `/super-admin` | Visao geral com metricas e graficos |
| Organizacoes | `/super-admin/organizations` | Gerenciamento de organizacoes |
| Usuarios | `/super-admin/users` | Gerenciamento de usuarios |
| Permissoes | `/super-admin/permissions` | Gerenciamento de roles e permissoes |
| Moedas | `/super-admin/currencies` | Gerenciamento de criptomoedas |
| Pools | `/super-admin/pools` | Gerenciamento de pools de mineracao |
| Wallets | `/super-admin/wallets` | Gerenciamento de carteiras |
| Hardware | `/super-admin/hardware` | Gerenciamento de equipamentos |
| Workers | `/super-admin/workers` | Gerenciamento de workers |
| Pagamentos | `/super-admin/payments` | Historico de pagamentos |
| Receita | `/super-admin/revenue` | Relatorios de receita |
| Auditoria | `/super-admin/audit` | Logs de auditoria |
| Endpoints | `/super-admin/endpoints` | Gerenciamento de endpoints |
| Rounds | `/super-admin/rounds` | Rounds de mineracao |
| Webhooks | `/super-admin/webhooks` | Configuracao de webhooks |
| Pool Stats | `/super-admin/pool-stats` | Estatisticas da pool em tempo real |

### Layout Super Admin

- Sidebar colapsavel com navegacao
- Header com informacoes do usuario
- Suporte a dark mode
- Design responsivo
- Icones Lucide React

---

## Componentes UI

### Componentes Base (shadcn/ui style)

| Componente | Arquivo | Descricao |
|------------|---------|-----------|
| Button | `ui/Button.tsx` | Variantes: default, gradient, outline, ghost, destructive |
| Input | `ui/Input.tsx` | Campo de entrada com dark mode |
| Label | `ui/Label.tsx` | Labels acessiveis |
| Card | `ui/Card.tsx` | Container com header, content, footer |
| Badge | `ui/Badge.tsx` | Tags e status |
| Avatar | `ui/Avatar.tsx` | Imagens de perfil |
| Tabs | `ui/Tabs.tsx` | Navegacao em abas |
| Select | `ui/Select.tsx` | Dropdown de selecao |
| Dialog | `ui/Dialog.tsx` | Modais |
| DropdownMenu | `ui/DropdownMenu.tsx` | Menus contextuais |
| Separator | `ui/Separator.tsx` | Linhas divisorias |
| Tooltip | `ui/Tooltip.tsx` | Dicas de contexto |
| Toast | `ui/Toast.tsx` | Notificacoes |
| Switch | `ui/Switch.tsx` | Toggle on/off |
| Textarea | `ui/Textarea.tsx` | Campo de texto multilinhas |
| Checkbox | `ui/Checkbox.tsx` | Caixas de selecao |
| LoadingFallback | `ui/LoadingFallback.tsx` | Loading para lazy components |

### Componentes de Layout

| Componente | Arquivo | Descricao |
|------------|---------|-----------|
| SuperAdminLayout | `layout/SuperAdminLayout.tsx` | Layout principal do Super Admin |
| Sidebar | `layout/Sidebar.tsx` | Navegacao lateral |
| SidebarProvider | `layout/SidebarContext.tsx` | Contexto da sidebar |

### Componentes de Autenticacao

| Componente | Arquivo | Descricao |
|------------|---------|-----------|
| AuthHeader | `auth/AuthHeader.tsx` | Logo + subtitle |
| AuthForm | `auth/AuthForm.tsx` | Layout centralizado com backdrop |
| LoginForm | `auth/LoginForm.tsx` | Formulario de login |
| ForgotPasswordForm | `auth/ForgotPasswordForm.tsx` | Formulario de recuperacao |
| ResetPasswordForm | `auth/ResetPasswordForm.tsx` | Formulario de redefinicao |
| ProtectedRoute | `auth/ProtectedRoute.tsx` | Protecao de rotas |
| PublicRoute | `auth/PublicRoute.tsx` | Rotas publicas |

---

## Estrutura de Arquivos

```
new-est3lar-pool-prodv2/
├── public/
│   ├── Est3lar-Colors.png
│   ├── placeholder.webp
│   └── favicon/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── DropdownMenu.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Label.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Separator.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Switch.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Tooltip.tsx
│   │   ├── auth/
│   │   │   ├── AuthForm.tsx
│   │   │   ├── AuthHeader.tsx
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── PublicRoute.tsx
│   │   │   └── ResetPasswordForm.tsx
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       ├── SidebarContext.tsx
│   │       └── SuperAdminLayout.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── ResetPassword.tsx
│   │   └── super-admin/
│   │       ├── index.tsx
│   │       ├── Organizations.tsx
│   │       ├── Users.tsx
│   │       ├── Permissions.tsx
│   │       ├── Currencies.tsx
│   │       ├── Pools.tsx
│   │       ├── Wallets.tsx
│   │       ├── Hardware.tsx
│   │       ├── Workers.tsx
│   │       ├── Payments.tsx
│   │       ├── Revenue.tsx
│   │       ├── Audit.tsx
│   │       ├── Endpoints.tsx
│   │       ├── Rounds.tsx
│   │       ├── Webhooks.tsx
│   │       └── PoolStats.tsx
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── login.ts
│   │   │   └── reset-password.ts
│   │   ├── supabase/
│   │   │   └── client.ts
│   │   └── utils.ts
│   ├── types/
│   │   └── auth.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Configuracao e Instalacao

### Pre-requisitos
- Node.js 18+ ou 20+
- pnpm 10.18.2+

### Passo 1: Instalar Dependencias

```bash
cd /Users/youapp/GitHubProd/new-est3lar-pool-prodv2
pnpm install
```

### Passo 2: Configurar Variaveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
VITE_SUPABASE_URL=https://tcgrxhrmzmsasnpekhaq.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### Passo 3: Iniciar Servidor de Desenvolvimento

```bash
pnpm dev
```

Servidor inicia em: **http://localhost:3000**

### Passo 4: Build para Producao

```bash
pnpm build
```

---

## Rotas Configuradas

| Rota | Descricao | Protecao |
|------|-----------|----------|
| `/` | Redirect para `/login` | Publica |
| `/login` | Pagina de login | PublicRoute |
| `/forgot-password` | Recuperar senha | PublicRoute |
| `/reset-password` | Redefinir senha | Publica |
| `/dashboard` | Dashboard Minerador | - |
| `/org-admin` | Painel Org Admin | - |
| `/super-admin/*` | Area Super Admin | SuperAdminRoute |
| `/*` | 404 | - |

---

## Contextos

### AuthContext

Gerencia o estado de autenticacao da aplicacao:

```typescript
interface AuthContextType {
  user: User | null
  userData: UserData | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}
```

**Uso:**
```typescript
import { useAuth, ROLES } from '@/contexts/AuthContext'

function Component() {
  const { user, userData, isLoading, signOut } = useAuth()

  if (userData?.role_id === ROLES.SUPER_ADMIN) {
    // Super Admin logic
  }
}
```

---

## Scripts Disponiveis

| Comando | Descricao |
|---------|-----------|
| `pnpm dev` | Inicia servidor de desenvolvimento |
| `pnpm build` | Build de producao |
| `pnpm preview` | Preview do build |
| `pnpm lint` | Executa ESLint |

---

## Performance

### Lazy Loading

Todas as paginas utilizam lazy loading para otimizar o carregamento inicial:

- **Paginas de Auth**: Login, ForgotPassword, ResetPassword
- **Layout Super Admin**: Carrega apenas quando autenticado
- **16 Paginas Admin**: Cada pagina e um chunk separado

### Build Stats (Producao)

```
Chunks principais:
dist/assets/index-*.js           229.69 kB │ gzip:  71.31 kB
dist/assets/charts-*.js          354.22 kB │ gzip: 104.90 kB
dist/assets/supabase-*.js        169.12 kB │ gzip:  44.08 kB
dist/assets/ui-vendor-*.js       117.02 kB │ gzip:  37.38 kB
dist/assets/react-vendor-*.js     45.10 kB │ gzip:  16.18 kB

Paginas (carregam sob demanda):
dist/assets/Login-*.js             3.52 kB │ gzip:   1.55 kB
dist/assets/SuperAdminLayout-*.js 19.41 kB │ gzip:   6.29 kB
dist/assets/[paginas]-*.js        8-23 kB │ gzip:   3-6 kB

Build time: ~2.4s
```

### Otimizacao

| Metrica | Antes | Depois | Reducao |
|---------|-------|--------|---------|
| Bundle inicial | 517 KB | 230 KB | **56%** |
| Carregamento login | ~1.2 MB | ~450 KB | **63%** |

---

## Banco de Dados (Supabase)

### Tabelas Principais

**roles**
```sql
id SERIAL PRIMARY KEY
name TEXT NOT NULL
description TEXT
level INTEGER NOT NULL
badge_color TEXT
is_system BOOLEAN DEFAULT false
```

**users**
```sql
id UUID PRIMARY KEY
auth_user_id UUID REFERENCES auth.users(id)
email TEXT NOT NULL
full_name TEXT
role_id INTEGER REFERENCES roles(id)
organization_id UUID
```

### Roles do Sistema

| ID | Nome | Level | Cor |
|----|------|-------|-----|
| 1 | Super Admin | 100 | #dc2626 |
| 2 | Org Admin | 50 | #2563eb |
| 3 | Org Miner | 10 | #16a34a |

---

## Design System

### Cores

```css
--background: #0B0F14
--card: #0F1720
--primary: #E2E8F0
--text-primary: #FFFFFF
--text-secondary: #94A3B8
--border: rgba(255,255,255,0.06)
```

### Gradiente do Botao

```css
background: linear-gradient(to right, #88FBDD, #4067D6, #F288FD)
```

---

## Troubleshooting

### Erro: Missing Supabase environment variables

1. Verifique se `.env` existe na raiz
2. Confirme que as variaveis estao configuradas
3. Reinicie o servidor: `pnpm dev`

### Erro 500 no Login

Se receber erro 500 ao fazer login, pode ser que o usuario tenha campos NULL na tabela `auth.users`. Execute:

```sql
UPDATE auth.users
SET
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  confirmation_token = COALESCE(confirmation_token, '')
WHERE email = 'seu@email.com';
```

### Build lento

Se demorar mais de 5s, limpe o cache:
```bash
rm -rf node_modules/.vite
```

---

## Licenca

Proprietario - Est3lar

---

**Versao:** 2.1.0
**Ultima atualizacao:** 2025-12-22
**Status:** Sistema completo com lazy loading e otimizacao de performance
