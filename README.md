# Est3lar Pool v2

Sistema de gerenciamento de pool de mineração Bitcoin - Versão 2.0 (Simplificada)

Migração do Next.js 15 para Vite + React com stack moderna e otimizada.

---

## Stack Tecnológica

### Frontend
- **React 19.1.1** - Library UI
- **TypeScript 5.9.3** - Type safety
- **Vite 7.1.12** - Build tool ultra-rápido
- **React Router DOM 7.9.5** - Roteamento client-side
- **Tailwind CSS 4.1.16** - Styling com utility-first
- **Radix UI** - Primitivos acessíveis para UI components
- **Lucide React** - Ícones modernos

### Backend & Autenticação
- **Supabase** - PostgreSQL + Auth + Real-time
- **@supabase/supabase-js 2.75.0** - Cliente JavaScript

### State & Forms
- **TanStack Query v5.90.5** - Server state management
- **Sonner** - Toast notifications

### Development
- **pnpm 10.18.2** - Package manager rápido
- **ESLint** - Linting
- **PostCSS** - CSS processing

---

## Funcionalidades Implementadas

### Sistema de Autenticação Completo

**Página de Login** (`/login`)
- Formulário email + senha
- Validação client-side (HTML5)
- Validação server-side (Supabase)
- Toggle de visibilidade de senha
- Loading states
- Redirecionamento por role (super_admin, org_admin, org_miner)
- Toast notifications para feedback
- Link "Esqueci a senha"

**Recuperação de Senha** (`/forgot-password`)
- Formulário com campo de email
- Envio de email com link mágico via Supabase
- Tela de confirmação após envio
- Link para voltar ao login

**Redefinição de Senha** (`/reset-password`)
- Formulário nova senha + confirmação
- Toggle de visibilidade em ambos os campos
- Validação: senhas devem coincidir + mínimo 6 caracteres
- Integração com token do link mágico
- Redirecionamento automático para login após sucesso
- Toast notifications

### Design System

**Cores (extraídas do v1)**
- Background: `#0B0F14`
- Card: `#0F1720`
- Primary: `#E2E8F0`
- Text Primary: `#FFFFFF`
- Text Secondary: `#94A3B8`
- Border: `rgba(255,255,255,0.06)`

**Botão com Gradiente**
```css
background: linear-gradient(to right, #88FBDD, #4067D6, #F288FD)
```
Gradiente cyan → azul → rosa/magenta

**Background das Páginas Auth**
- Imagem Est3lar container em fullscreen
- Opacidade: 30%
- Formulário centralizado com backdrop blur

**Tipografia**
- Font family: Inter (via fontsource)
- Font sizes: sistema escalável com Tailwind

### Componentes

**UI Base**
- `Button` - Variantes: default, gradient, outline, ghost
- `Input` - Com suporte a dark mode
- `Label` - Baseado em Radix UI

**Auth Components**
- `AuthHeader` - Logo + subtitle com proteção anti-drag
- `AuthForm` - Layout centralizado com backdrop blur
- `LoginForm` - Formulário completo de login
- `ForgotPasswordForm` - Formulário de recuperação
- `ResetPasswordForm` - Formulário de redefinição

**Pages**
- `Login` - Página de login com background
- `ForgotPassword` - Página de recuperação com background
- `ResetPassword` - Página de redefinição com background

### Utilitários

**Supabase Client** (`src/lib/supabase/client.ts`)
- Cliente configurado com persistSession
- Auto refresh token
- Detecção de sessão na URL
- Fallback para placeholder em desenvolvimento

**Auth Functions**
- `loginAction` - Autenticação + fetch de dados do usuário
- `forgotPasswordAction` - Envio de email de recuperação
- `resetPasswordAction` - Atualização de senha

**Utils**
- `cn()` - Helper para merge de classes (clsx + tailwind-merge)

### Types

**Auth Types** (`src/types/auth.ts`)
```typescript
type RoleId = 'super_admin' | 'org_admin' | 'org_miner'

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResult {
  success: boolean
  error?: string
  redirectTo?: string
  user?: User
}
```

---

## Estrutura de Arquivos

```
new-est3lar-pool-prodv2/
├── public/
│   ├── Est3lar-Colors.png      # Logo principal
│   ├── placeholder.webp        # Background auth pages
│   └── favicon/                # Favicons (7 arquivos)
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Label.tsx
│   │   └── auth/
│   │       ├── AuthHeader.tsx
│   │       ├── AuthForm.tsx
│   │       ├── LoginForm.tsx
│   │       ├── ForgotPasswordForm.tsx
│   │       └── ResetPasswordForm.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── ForgotPassword.tsx
│   │   └── ResetPassword.tsx
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
├── docs/
│   ├── 01-design-system.md
│   ├── 02-login-page-spec.md
│   ├── 04-permissions-simplified.md
│   └── IMPLEMENTACAO-COMPLETA.md
├── .env.example
├── .env                        # Não versionado
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## Configuração e Instalação

### Pré-requisitos
- Node.js 18+ ou 20+
- pnpm 10.18.2+ (ou use `corepack enable`)

### Passo 1: Clonar e Instalar

```bash
cd /Users/youapp/GitHubProd/new-est3lar-pool-prodv2
pnpm install
```

Instala 321 dependências em ~30s.

### Passo 2: Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tcgrxhrmzmsasnpekhaq.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

**IMPORTANTE**:
- Use apenas a `anon` key no frontend
- NUNCA use a `service_role` key no código do cliente
- A `service_role` key só deve ser usada em APIs backend/privadas

### Passo 3: Iniciar Servidor de Desenvolvimento

```bash
pnpm dev
```

Servidor inicia em: **http://localhost:3000**

O Vite deve iniciar em ~144ms com hot module replacement (HMR) ativo.

### Passo 4: Build para Produção

```bash
pnpm build
```

**Build stats:**
- Tempo: ~1.74s
- index.js: 257 KB (79 KB gzipped)
- CSS: 19 KB (4.6 KB gzipped)
- Total gzipped: ~128 KB

Preview do build:
```bash
pnpm preview
```

---

## Rotas Configuradas

| Rota | Descrição | Status |
|------|-----------|--------|
| `/` | Redirect para `/login` | Implementado |
| `/login` | Página de login | Implementado |
| `/forgot-password` | Recuperar senha | Implementado |
| `/reset-password` | Redefinir senha | Implementado |
| `/dashboard` | Dashboard (org_admin, org_miner) | Placeholder |
| `/super-admin` | Super Admin area | Placeholder |
| `/*` | 404 → Redirect para `/login` | Implementado |

---

## Fluxos Implementados

### Fluxo de Login

1. User acessa `/login`
2. Preenche email + senha
3. Submit → `loginAction()`
4. Supabase Auth: `signInWithPassword()`
5. Fetch dados do usuário: `SELECT from users WHERE auth_user_id`
6. Determina redirect baseado em `role_id`:
   - `super_admin` → `/super-admin`
   - `org_admin` → `/dashboard`
   - `org_miner` → `/dashboard`
7. Toast de sucesso
8. Redirect via `window.location.href`

### Fluxo de Recuperação de Senha

**Etapa 1: Solicitar Reset**
1. User clica "Esqueci a senha" no login
2. Redirect para `/forgot-password`
3. User preenche email
4. Submit → `forgotPasswordAction()`
5. Supabase envia email com link mágico
6. Tela de confirmação

**Etapa 2: Redefinir Senha**
1. User clica no link do email
2. Redirect para `/reset-password` (com token)
3. User preenche nova senha + confirmação
4. Validação: senhas coincidem + mínimo 6 caracteres
5. Submit → `resetPasswordAction()`
6. Supabase: `updateUser({ password })`
7. Toast de sucesso
8. Redirect automático para `/login` (1.5s)

---

## Validações

### Client-side (HTML5)

**Login:**
- Email: `type="email"` + `required`
- Password: `type="password"` + `required`

**Reset Password:**
- Password: `minLength={6}` + `required`
- Confirm Password: Match validation

### Server-side (Supabase)

**Login:**
- Email format validation
- Password strength
- Email confirmation check
- Credentials validation

**Password Reset:**
- Email exists validation
- Password confirmation match
- Minimum 6 characters
- Token validation (magic link)

### Tratamento de Erros

**Login:**
```typescript
"Invalid login credentials"  → "Email ou senha incorretos"
"Email not confirmed"         → "Confirme seu email antes de fazer login"
Outros erros                  → Mensagem genérica
```

**Password Reset:**
```typescript
Senhas não coincidem          → "As senhas não coincidem"
Senha muito curta             → "A senha deve ter no mínimo 6 caracteres"
Token inválido/expirado       → Mensagem do Supabase
```

---

## Configuração do Supabase

### Schema do Banco de Dados

**Tabela `users`:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Roles disponíveis:**
- `super_admin` - Acesso total ao sistema
- `org_admin` - Administrador de organização
- `org_miner` - Minerador da organização

### Email Templates (Supabase Dashboard)

Configure os templates de email em:
**Authentication → Email Templates**

**Reset Password Template:**
- Subject: `Redefinir senha - Est3lar Pool`
- Redirect URL: `{{ .SiteURL }}/reset-password`

---

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia servidor de desenvolvimento (http://localhost:3000) |
| `pnpm build` | Build de produção (~1.7s) |
| `pnpm preview` | Preview do build de produção |
| `pnpm lint` | Executa ESLint |

---

## Comparação com v1

### Melhorias

**Performance:**
- Build 60% mais rápido (1.7s vs 5s)
- HMR instantâneo (Vite vs Next.js)
- Bundle otimizado com code splitting

**Developer Experience:**
- TypeScript strict mode sem erros
- Auto-complete melhorado
- Estrutura mais simples

**Design:**
- 100% fiel ao v1
- Background com imagem Est3lar (30% opacidade)
- Formulário centralizado com backdrop blur
- Gradiente do botão idêntico

### Mantidos do v1

- Sistema de cores exato
- Layout e espaçamentos
- Footer de termos
- Proteção de assets (anti-drag, anti-context-menu)
- Redirecionamento por role

---

## Próximas Fases

### Imediatas
- Implementar ProtectedRoute component
- Criar AuthContext para gerenciar sessão
- Adicionar verificação de sessão em rotas protegidas

### Médio Prazo
- Dashboard base layout
- Sidebar navigation
- Sistema RBAC simplificado (3 tabelas vs 8 do v1)
- Área Super Admin

### Longo Prazo
- Migração de funcionalidades do v1:
  - Gestão de organizações
  - Gestão de mineradores
  - Estatísticas de mineração
  - Configurações de pool

---

## Documentação Adicional

Documentação técnica completa em `/docs`:

- **01-design-system.md** - Sistema de design (cores, fontes, tokens CSS)
- **02-login-page-spec.md** - Especificação da página de login
- **04-permissions-simplified.md** - Sistema RBAC simplificado (8 → 3 tabelas)
- **IMPLEMENTACAO-COMPLETA.md** - Detalhes completos da implementação

---

## Troubleshooting

### Erro: Missing Supabase environment variables

**Solução:**
1. Verifique se `.env` existe na raiz
2. Confirme que as variáveis estão configuradas:
   ```env
   VITE_SUPABASE_URL=https://...
   VITE_SUPABASE_ANON_KEY=...
   ```
3. Reinicie o servidor: `pnpm dev`

### Erro: TypeScript - Property 'env' does not exist

**Solução:** Já resolvido em `src/vite-env.d.ts`

### Build lento

**Verificar:**
- Vite deve fazer build em ~1.7s
- Se demorar >5s, limpar cache: `rm -rf node_modules/.vite`

---

## Contribuindo

### Code Style

- Use TypeScript strict mode
- Siga convenções do ESLint
- Componentes em PascalCase
- Funções em camelCase
- Sem emojis no código ou documentação
- Comentários em português brasileiro

### Git Workflow

```bash
# Criar branch feature
git checkout -b feature/nome-da-feature

# Fazer commits descritivos
git commit -m "feat: adiciona autenticação com Supabase"

# Push e criar PR
git push origin feature/nome-da-feature
```

---

## Performance

### Build Stats (Produção)

```
dist/index.html                1.73 kB │ gzip:  0.71 kB
dist/assets/index-*.css       19.30 kB │ gzip:  4.60 kB
dist/assets/react-vendor-*.js 44.92 kB │ gzip: 16.04 kB
dist/assets/supabase-*.js    168.91 kB │ gzip: 44.68 kB
dist/assets/index-*.js       257.19 kB │ gzip: 79.10 kB

Total (gzipped): ~128 KB
Build time: 1.74s
```

### Otimizações Aplicadas

- Code splitting automático (Vite)
- Tree shaking
- Minificação
- Chunks separados para vendors
- CSS extraction e minificação
- Asset optimization

---

## Licença

Proprietário - Est3lar

---

## Suporte

Para questões técnicas ou bugs:
1. Verifique a documentação em `/docs`
2. Consulte este README
3. Contate a equipe de desenvolvimento

---

**Versão:** 2.0.0
**Última atualização:** 2025-10-31
**Status:** Sistema de autenticação completo e funcional
