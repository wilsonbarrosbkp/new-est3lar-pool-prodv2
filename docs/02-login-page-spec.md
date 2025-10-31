# Especificação: Página de Login

## Visão Geral

Página de autenticação para acesso ao sistema Est3lar Pool v2, implementando integração com Supabase Auth.

---

## Objetivos

1. Permitir login de usuários existentes (email + senha)
2. Redirecionar para recuperação de senha
3. Validar credenciais via Supabase
4. Redirecionar para dashboard apropriado baseado em role
5. Design responsivo (mobile-first)
6. Suporte a dark/light mode

---

## Layout e Estrutura

### Desktop (>1024px)
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌─────────────────┐    ┌──────────────────────┐  │
│  │                 │    │                      │  │
│  │   BRANDING      │    │    LOGIN FORM        │  │
│  │   (Left Panel)  │    │    (Right Panel)     │  │
│  │                 │    │                      │  │
│  │   - Logo        │    │  - Email input       │  │
│  │   - Tagline     │    │  - Password input    │  │
│  │   - Illustration│    │  - Forgot password   │  │
│  │                 │    │  - Submit button     │  │
│  │                 │    │                      │  │
│  └─────────────────┘    └──────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌────────────────────────┐
│                        │
│       LOGO             │
│                        │
│    ──────────────      │
│                        │
│    Email input         │
│    Password input      │
│    Forgot password     │
│    [Login Button]      │
│                        │
└────────────────────────┘
```

---

## Design Especificação (REAL - extraído do v1)

### Container Principal
- **Max Width**: `960px`
- **Grid Layout**: 2 colunas no desktop (`md:grid-cols-2`)
- **Border**: `1px solid var(--border)` (rgba(255,255,255,0.06))
- **Border Radius**: `0.625rem` (10px)
- **Shadow**: `shadow-lg`
- **Overflow**: `hidden` (para bordas arredondadas)

### Painel Esquerdo (Formulário)
- **Background**: `#0F1720` (dark mode - var(--card))
- **Padding**: `32px` (mobile) / `48px` (desktop) - `p-8 md:p-12`
- **Min Height**: `480px`
- **Flex**: Centralizado verticalmente (`flex flex-col justify-center`)
- **Conteúdo**:
  - Logo: `/Est3lar-Colors.png` (altura: 4rem / 64px)
  - Título: "Est3lar"
  - Subtítulo: "Faça login para acessar o painel"
  - Campos: Email e Senha
  - Botão: Gradiente

### Painel Direito (Imagem de Fundo)
- **Imagem**: `/placeholder.webp` (1024x1024)
- **Display**: `hidden md:block` (apenas desktop)
- **Position**: `absolute inset-0`
- **Object Fit**: `cover`
- **Opacity**: `100%`
- **Proteções**:
  - `select-none pointer-events-none`
  - `draggable="false"`
  - Previne: drag, click, context menu
  - `user-select: none`

### Tema Padrão
- **Dark Mode**: SEMPRE ativo (sem toggle)
- **Classe HTML**: `<html class="dark">`
- **Background Page**: `#0B0F14` (var(--background))
- **Background Card**: `#0F1720` (var(--card))

---

## Campos do Formulário

### 1. Email
**Tipo**: `input[type="email"]`
**Atributos**:
```tsx
{
  id: "email",
  name: "email",
  type: "email",
  placeholder: "seu@email.com",
  autoComplete: "email",
  required: true,
  autoFocus: true
}
```

**Validação**:
- Campo obrigatório
- Formato de email válido (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Mensagem de erro: "Email inválido"

**Estilo**:
```css
className="w-full bg-surface text-text-primary border border-border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
```

---

### 2. Senha
**Tipo**: `input[type="password"]` com toggle de visibilidade

**Atributos**:
```tsx
{
  id: "password",
  name: "password",
  type: isPasswordVisible ? "text" : "password",
  placeholder: "••••••••",
  autoComplete: "current-password",
  required: true,
  minLength: 6
}
```

**Validação**:
- Campo obrigatório
- Mínimo 6 caracteres
- Mensagem de erro: "Senha deve ter no mínimo 6 caracteres"

**Toggle de Visibilidade**:
- Ícone: `Eye` / `EyeOff` (lucide-react)
- Posição: Absolute à direita do input
- Cor: `var(--text-secondary)`
- Hover: `var(--text-primary)`

**Estilo**:
```css
className="w-full bg-surface text-text-primary border border-border rounded-md px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
```

---

### 3. Esqueci Minha Senha (Link)
**Texto**: "Esqueci a senha"
**Href**: `/forgot-password`
**Posicionamento**: Ao lado do label "Senha", alinhado à direita (`justify-between`)

**Estilo REAL (v1)**:
```tsx
className="text-xs text-muted-foreground hover:text-foreground transition-colors"
```

**Cores**:
- Normal: `text-muted-foreground` (#94A3B8 - cinza azulado)
- Hover: `text-foreground` (#FFFFFF - branco)

---

### 4. Botão de Submit (REAL - v1)
**Texto**: "Entrar"
**Tipo**: `button[type="submit"]`

**Estilo Exato do v1**:
```tsx
className="w-full bg-gradient-to-r from-[#88FBDD] via-[#4067D6] to-[#F288FD] text-white border border-[var(--black-25)] shadow-[0_1px_0_0_var(--black-25)] hover:opacity-90 transition-opacity"
```

**Gradiente (cyan → azul → rosa)**:
- `from-[#88FBDD]` - Cyan claro
- `via-[#4067D6]` - Azul
- `to-[#F288FD]` - Rosa/Magenta

**Efeitos**:
- Border: `border-[var(--black-25)]` (rgba(0,0,0,0.25))
- Shadow: `0 1px 0 0 var(--black-25)`
- Hover: `opacity-90`
- Transition: `transition-opacity`

**Estados**:
- **Normal**: Gradiente completo
- **Hover**: Opacity 90%
- **Disabled**: `disabled={true}` (nota: no v1 está sempre disabled - bug?)

---

## Fluxo de Autenticação

### 1. Submit do Formulário
```typescript
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setIsLoading(true)
  setError(null)

  // Validar campos
  const validation = validateLoginForm({ email, password })
  if (!validation.success) {
    setError(validation.error)
    setIsLoading(false)
    return
  }

  // Chamar Supabase
  const result = await signIn({ email, password })

  if (result.error) {
    handleAuthError(result.error)
    setIsLoading(false)
    return
  }

  // Redirecionar baseado em role
  redirectToDashboard(result.user.role_type_id)
}
```

---

### 2. Integração Supabase

#### Função de Login (`src/lib/auth/sign-in.ts`)
```typescript
import { supabase } from '@/lib/supabase/client'

export async function signIn(credentials: { email: string; password: string }) {
  try {
    // 1. Autenticar com Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email.trim(),
      password: credentials.password,
    })

    if (error) {
      return { error: error.message, user: null }
    }

    // 2. Buscar dados do usuário na tabela saas_user
    const { data: userData, error: userError } = await supabase
      .from('saas_user')
      .select(`
        id,
        name,
        email,
        organization_id,
        saas_user_role!inner (
          role_id,
          saas_role!inner (
            id,
            name,
            role_type_id
          )
        )
      `)
      .eq('auth_user_id', data.user.id)
      .single()

    if (userError || !userData) {
      return { error: 'Usuário não encontrado no sistema', user: null }
    }

    // 3. Retornar dados completos
    return {
      error: null,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        organization_id: userData.organization_id,
        role_type_id: userData.saas_user_role.saas_role.role_type_id,
      },
    }
  } catch (err) {
    return { error: 'Erro ao fazer login', user: null }
  }
}
```

---

### 3. Tratamento de Erros

**Mapeamento de Erros Supabase → Mensagens do Usuário**:
```typescript
function handleAuthError(errorMessage: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Email ou senha incorretos',
    'Email not confirmed': 'Por favor, confirme seu email antes de fazer login',
    'User not found': 'Usuário não encontrado no sistema',
    'Too many requests': 'Muitas tentativas. Tente novamente em alguns minutos',
  }

  return errorMap[errorMessage] || 'Erro ao fazer login. Tente novamente'
}
```

**Exibição de Erros**:
- Mensagem abaixo do botão de submit
- Cor: `var(--error)`
- Ícone: `AlertCircle` (lucide-react)

```tsx
{error && (
  <div className="flex items-center gap-2 text-error text-sm mt-4 p-3 bg-error/10 rounded-md border border-error/20">
    <AlertCircle size={16} />
    <span>{error}</span>
  </div>
)}
```

---

### 4. Redirecionamento Baseado em Role

```typescript
function redirectToDashboard(roleTypeId: number) {
  const routes = {
    3: '/super-admin',      // Super Admin
    4: '/dashboard-admin',  // Organization Admin
    5: '/dashboard-user',   // Organization Miner
  }

  const route = routes[roleTypeId as keyof typeof routes] || '/dashboard-admin'
  window.location.href = route
}
```

---

## Validação de Formulário

### Schema Zod
```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export type LoginInput = z.infer<typeof loginSchema>
```

### Implementação com React Hook Form
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
})
```

---

## Responsividade

### Mobile (<768px)
- Remover painel esquerdo
- Logo centralizado no topo (80px de altura)
- Formulário ocupa largura total com padding lateral de 16px
- Inputs: altura `48px` (touch-friendly)
- Botão: altura `48px`

### Tablet (768px - 1024px)
- Layout similar ao mobile
- Formulário max-width `400px` centralizado

### Desktop (>1024px)
- Layout split 50/50
- Formulário max-width `400px` com margin auto

---

## Componentes Reutilizáveis

### Input Component
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-text-primary">
        {label}
      </label>
      <input
        className={cn(
          "w-full bg-surface text-text-primary border rounded-md px-4 py-3",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          "transition-all",
          error ? "border-error" : "border-border"
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  )
}
```

### Button Component
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  children: React.ReactNode
}

export function Button({ isLoading, children, ...props }: ButtonProps) {
  return (
    <button
      className="w-full bg-primary text-primary-foreground hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-md font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" size={20} />}
      {children}
    </button>
  )
}
```

---

## Casos de Teste

### Validação de Formulário
- [ ] Email vazio → erro "Email é obrigatório"
- [ ] Email inválido (`teste@`) → erro "Email inválido"
- [ ] Senha vazia → erro "Senha é obrigatória"
- [ ] Senha com 5 caracteres → erro "Senha deve ter no mínimo 6 caracteres"
- [ ] Campos válidos → submit habilitado

### Fluxo de Autenticação
- [ ] Credenciais corretas → redireciona para dashboard correto
- [ ] Credenciais incorretas → exibe erro "Email ou senha incorretos"
- [ ] Email não confirmado → exibe erro "Confirme seu email"
- [ ] Usuário sem registro no saas_user → erro "Usuário não encontrado"

### Redirecionamento
- [ ] Super Admin (role_type_id: 3) → `/super-admin`
- [ ] Org Admin (role_type_id: 4) → `/dashboard-admin`
- [ ] Org Miner (role_type_id: 5) → `/dashboard-user`

### UI/UX
- [ ] Toggle de senha funciona
- [ ] Loading state exibe spinner
- [ ] Mensagens de erro aparecem abaixo do botão
- [ ] Link "Esqueci senha" redireciona para `/forgot-password`
- [ ] Dark mode alterna corretamente

---

## Estrutura de Arquivos (v2)

```
src/
├── pages/
│   └── Login.tsx                    # Página principal
├── components/
│   ├── ui/
│   │   ├── Input.tsx               # Input base (Radix-styled)
│   │   ├── Button.tsx              # Botão base
│   │   └── Label.tsx               # Label base
│   └── auth/
│       ├── LoginForm.tsx           # Formulário completo
│       ├── AuthForm.tsx            # Container 2-col layout
│       └── AuthHeader.tsx          # Logo + subtitle
├── lib/
│   ├── auth/
│   │   └── login.ts                # loginAction (client-side)
│   ├── supabase/
│   │   └── client.ts               # Cliente Supabase
│   ├── utils.ts                    # cn() helper
│   └── validations/
│       └── auth.ts                 # Schemas Zod (não usado no v1)
└── types/
    └── auth.ts                     # Types TypeScript
```

**Nota**: No v1 não há validação Zod no cliente, apenas no server action.

---

## Variáveis de Ambiente Necessárias

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Assets Necessários

### Imagens (copiar de /Users/youapp/GitHubProd/est3lar-pool-prodv1/public/)

1. **Logo Principal**: `Est3lar-Colors.png`
   - Dimensões: 2530x847px
   - Uso: Topo do formulário de login (altura: 4rem)
   - Path: `/public/Est3lar-Colors.png`

2. **Background**: `placeholder.webp`
   - Dimensões: 1024x1024px
   - Uso: Painel esquerdo com opacity 100%
   - Path: `/public/placeholder.webp`

3. **Favicon**: Copiar pasta completa `/public/favicon/`
   - `favicon.ico`
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `apple-touch-icon.png`
   - `android-chrome-192x192.png`
   - `android-chrome-512x512.png`
   - `site.webmanifest`

### Configuração do Favicon (no index.html)

```html
<link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
<link rel="manifest" href="/favicon/site.webmanifest" />
<link rel="shortcut icon" href="/favicon/favicon.ico" />
<meta name="theme-color" content="#4067D6" />
```

---

## Fases de Implementação (Ordem Recomendada)

**Fase 1: Assets e Utilitários** ✅ CORES JÁ ATUALIZADAS
- [x] Copiar assets do v1 (logos, placeholder, favicons)
- [ ] Criar `lib/utils.ts` com função `cn()`
- [ ] Criar `lib/supabase/client.ts`
- [ ] Criar types básicos em `types/auth.ts`

**Fase 2: Componentes UI Base**
- [ ] `components/ui/Label.tsx` (simples, baseado em Radix)
- [ ] `components/ui/Input.tsx` (com foco em dark mode)
- [ ] `components/ui/Button.tsx` (com gradiente)

**Fase 3: Componentes de Auth**
- [ ] `components/auth/AuthHeader.tsx` (logo + subtitle)
- [ ] `components/auth/AuthForm.tsx` (layout 2-col)
- [ ] `components/auth/LoginForm.tsx` (form completo)

**Fase 4: Lógica de Autenticação**
- [ ] `lib/auth/login.ts` - loginAction
- [ ] Integração Supabase Auth
- [ ] Tratamento de erros (toast)
- [ ] Redirecionamento por role

**Fase 5: Página e Rotas**
- [ ] `pages/Login.tsx`
- [ ] Adicionar rota `/login` no App.tsx
- [ ] Testar fluxo completo

**Fase 6: Testes Finais**
- [ ] Teste mobile (<768px)
- [ ] Teste desktop (>1024px)
- [ ] Validar cores vs v1
- [ ] Validar comportamentos

---

## Próximas Fases do Projeto

Após completar a página de login:
1. **Página de Recuperação de Senha** (`/forgot-password`)
2. **Página de Reset de Senha** (`/reset-password`)
3. **Proteção de Rotas** (ProtectedRoute component)
4. **Dashboard Super Admin**

---

## Footer de Termos (v1)

Abaixo do formulário, texto centralizado:

```tsx
<div className="text-center text-xs text-balance text-black/70 dark:text-white/70">
  Ao continuar, você concorda com nossos{" "}
  <a href="https://est3lar.io/TermosUso" target="_blank">Termos de Uso</a>,{" "}
  <a href="https://est3lar.io/PoliticaPrivacidade" target="_blank">Política de Privacidade</a>
  {" "}e{" "}
  <a href="https://est3lar.io/LGPD" target="_blank">LGPD</a>.
</div>
```

**Estilo dos Links**:
- Underline: `underline underline-offset-4`
- Hover: `hover:text-[var(--primary)]`

---

## Diferenças Importantes vs Especificação Original

1. **Botão**: Gradiente colorido (cyan→azul→rosa), não primary sólido
2. **Primary color**: `#E2E8F0` (branco azulado), não roxo
3. **Background**: `#0B0F14` (mais escuro que antes)
4. **Layout**: 2 colunas 50/50, imagem à direita (não esquerda)
5. **Validação**: SEM Zod no cliente, apenas validação HTML5 + server
6. **Logo**: No painel do formulário, não no painel da imagem
7. **Footer**: Termos de uso abaixo do card
8. **Sem loading state**: Botão disabled no v1 (possível bug)
