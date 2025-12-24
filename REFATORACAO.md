# Plano de Refatoração - Genesis Pool

> **Regra de Ouro**: Sempre execute `npm run build` e teste a aplicação antes de seguir para o próximo passo.

---

## Resumo Executivo

| Fase | Descrição | Esforço | Impacto |
|------|-----------|---------|---------|
| 1 | Consolidar Interfaces/Tipos | Baixo | Alto |
| 2 | Criar Hook useCRUDPage | Médio | Altíssimo |
| 3 | Refatorar Páginas CRUD (Piloto) | Médio | Alto |
| 4 | Aplicar Padrão nas Demais Páginas | Médio | Alto |
| 5 | Extrair Componentes UI Reutilizáveis | Baixo | Médio |
| 6 | Melhorar Type Safety | Baixo | Médio |
| 7 | Padronizar Error Handling | Baixo | Médio |
| 8 | Limpeza e Padronização Final | Baixo | Baixo |

---

## Fase 1: Consolidar Interfaces/Tipos

**Objetivo**: Eliminar interfaces duplicadas em múltiplos arquivos

### Problema Identificado
Interfaces como `Organization`, `Currency`, `Pool`, `Wallet`, `PayoutModel` estão redefinidas em ~10 arquivos diferentes em `/src/pages/super-admin/`.

### Arquivos Afetados
- `src/pages/super-admin/Payments.tsx` (linhas 79-102)
- `src/pages/super-admin/Pools.tsx` (linhas 50-96)
- `src/pages/super-admin/Wallets.tsx`
- `src/pages/super-admin/Hardware.tsx`
- `src/pages/super-admin/Revenue.tsx`
- `src/pages/super-admin/Users.tsx`
- `src/pages/super-admin/Organizations.tsx`
- `src/pages/super-admin/Workers.tsx`
- `src/pages/super-admin/Endpoints.tsx`
- `src/pages/super-admin/Webhooks.tsx`

### Checklist

- [ ] **1.1** Revisar `/src/types/super-admin.ts` e identificar tipos existentes
- [ ] **1.2** Criar tipos faltantes em `/src/types/super-admin.ts`
- [ ] **1.3** Atualizar `Payments.tsx` - remover interfaces locais e importar de types
- [ ] **1.4** `npm run build` - verificar se compila sem erros
- [ ] **1.5** Testar página de Payments no browser
- [ ] **1.6** Atualizar `Pools.tsx` - remover interfaces locais e importar de types
- [ ] **1.7** `npm run build` - verificar se compila sem erros
- [ ] **1.8** Testar página de Pools no browser
- [ ] **1.9** Atualizar `Wallets.tsx` - remover interfaces locais e importar de types
- [ ] **1.10** `npm run build` + teste
- [ ] **1.11** Atualizar `Hardware.tsx` - remover interfaces locais e importar de types
- [ ] **1.12** `npm run build` + teste
- [ ] **1.13** Atualizar `Revenue.tsx` - remover interfaces locais e importar de types
- [ ] **1.14** `npm run build` + teste
- [ ] **1.15** Atualizar `Users.tsx` - remover interfaces locais e importar de types
- [ ] **1.16** `npm run build` + teste
- [ ] **1.17** Atualizar `Organizations.tsx` - remover interfaces locais e importar de types
- [ ] **1.18** `npm run build` + teste
- [ ] **1.19** Atualizar `Workers.tsx` - remover interfaces locais e importar de types
- [ ] **1.20** `npm run build` + teste
- [ ] **1.21** Atualizar `Endpoints.tsx` - remover interfaces locais e importar de types
- [ ] **1.22** `npm run build` + teste
- [ ] **1.23** Atualizar `Webhooks.tsx` - remover interfaces locais e importar de types
- [ ] **1.24** `npm run build` + teste
- [ ] **1.25** Commit: "refactor: consolidate interfaces in types/super-admin.ts"

---

## Fase 2: Criar Hook useCRUDPage

**Objetivo**: Criar hook genérico que encapsula lógica comum de páginas CRUD

### Problema Identificado
12 páginas CRUD repetem o mesmo padrão de ~15 useState hooks e ~8 funções idênticas, totalizando ~7000+ linhas de código duplicado.

### Padrão Repetido Atual
```typescript
// Estados repetidos em cada página
const [loading, setLoading] = useState(true)
const [search, setSearch] = useState('')
const [filterStatus, setFilterStatus] = useState<string>('all')
const [sheetOpen, setSheetOpen] = useState(false)
const [editing, setEditing] = useState<T | null>(null)
const [formData, setFormData] = useState(initialFormData)
const [saving, setSaving] = useState(false)

// Funções repetidas
const loadData = useCallback(async () => { ... }, [])
const handleOpenCreate = () => { ... }
const handleOpenEdit = (item: T) => { ... }
const handleCloseSheet = () => { ... }
const handleSubmit = async (e: React.FormEvent) => { ... }
const handleDelete = async (item: T) => { ... }
```

### Checklist

- [ ] **2.1** Criar arquivo `/src/hooks/useCRUDPage.ts`
- [ ] **2.2** Definir interface genérica `UseCRUDPageOptions<T>`
- [ ] **2.3** Implementar gerenciamento de estado genérico
- [ ] **2.4** Implementar função `loadData` genérica
- [ ] **2.5** Implementar `handleOpenCreate`, `handleOpenEdit`, `handleCloseSheet`
- [ ] **2.6** Implementar `handleSubmit` genérico com callbacks
- [ ] **2.7** Implementar `handleDelete` genérico
- [ ] **2.8** Implementar lógica de filtro e busca
- [ ] **2.9** Adicionar tipagem completa (sem `any`)
- [ ] **2.10** `npm run build` - verificar se compila sem erros
- [ ] **2.11** Escrever testes unitários básicos para o hook
- [ ] **2.12** Commit: "feat: create useCRUDPage generic hook"

### Assinatura Esperada do Hook
```typescript
interface UseCRUDPageOptions<T, F> {
  tableName: string
  viewName?: string
  initialFormData: F
  mapDataToForm: (item: T) => F
  validateForm?: (data: F) => string | null
  onBeforeCreate?: (data: F) => Promise<Partial<F>>
  onBeforeUpdate?: (data: F, id: string) => Promise<Partial<F>>
}

interface UseCRUDPageReturn<T, F> {
  // Estados
  data: T[]
  loading: boolean
  search: string
  setSearch: (value: string) => void
  filters: Record<string, string>
  setFilter: (key: string, value: string) => void
  sheetOpen: boolean
  editing: T | null
  formData: F
  setFormData: React.Dispatch<React.SetStateAction<F>>
  saving: boolean

  // Ações
  loadData: () => Promise<void>
  handleOpenCreate: () => void
  handleOpenEdit: (item: T) => void
  handleCloseSheet: () => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  handleDelete: (item: T) => Promise<void>

  // Utilitários
  filteredData: T[]
}
```

---

## Fase 3: Refatorar Páginas CRUD (Piloto)

**Objetivo**: Aplicar o hook `useCRUDPage` em 3 páginas como piloto

### Páginas Selecionadas para Piloto
1. `Organizations.tsx` (690 linhas) - Mais simples
2. `Users.tsx` (809 linhas) - Complexidade média
3. `Pools.tsx` (712 linhas) - Mais complexa

### Checklist

#### 3.1 Organizations.tsx
- [ ] **3.1.1** Backup: copiar código atual para referência
- [ ] **3.1.2** Importar e configurar `useCRUDPage`
- [ ] **3.1.3** Remover estados duplicados
- [ ] **3.1.4** Remover funções duplicadas
- [ ] **3.1.5** Adaptar JSX para usar retorno do hook
- [ ] **3.1.6** `npm run build` - verificar se compila sem erros
- [ ] **3.1.7** Testar CRUD completo: Listar, Criar, Editar, Deletar
- [ ] **3.1.8** Testar filtros e busca
- [ ] **3.1.9** Verificar se reduziu de ~690 para ~300 linhas
- [ ] **3.1.10** Commit: "refactor: apply useCRUDPage to Organizations"

#### 3.2 Users.tsx
- [ ] **3.2.1** Backup: copiar código atual para referência
- [ ] **3.2.2** Importar e configurar `useCRUDPage`
- [ ] **3.2.3** Remover estados duplicados
- [ ] **3.2.4** Remover funções duplicadas
- [ ] **3.2.5** Adaptar JSX para usar retorno do hook
- [ ] **3.2.6** `npm run build` - verificar se compila sem erros
- [ ] **3.2.7** Testar CRUD completo: Listar, Criar, Editar, Deletar
- [ ] **3.2.8** Testar filtros e busca
- [ ] **3.2.9** Testar funcionalidades específicas (roles, permissions)
- [ ] **3.2.10** Commit: "refactor: apply useCRUDPage to Users"

#### 3.3 Pools.tsx
- [ ] **3.3.1** Backup: copiar código atual para referência
- [ ] **3.3.2** Importar e configurar `useCRUDPage`
- [ ] **3.3.3** Remover estados duplicados
- [ ] **3.3.4** Remover funções duplicadas
- [ ] **3.3.5** Adaptar JSX para usar retorno do hook
- [ ] **3.3.6** `npm run build` - verificar se compila sem erros
- [ ] **3.3.7** Testar CRUD completo: Listar, Criar, Editar, Deletar
- [ ] **3.3.8** Testar funcionalidades específicas (stratum config)
- [ ] **3.3.9** Commit: "refactor: apply useCRUDPage to Pools"

#### 3.4 Revisão do Piloto
- [ ] **3.4.1** Revisar se o hook atende todos os casos de uso
- [ ] **3.4.2** Ajustar hook se necessário baseado no feedback
- [ ] **3.4.3** Documentar padrões e decisões tomadas
- [ ] **3.4.4** `npm run build` + teste geral
- [ ] **3.4.5** Commit: "docs: document useCRUDPage usage patterns"

---

## Fase 4: Aplicar Padrão nas Demais Páginas

**Objetivo**: Refatorar as páginas CRUD restantes usando o hook validado

### Páginas Restantes
1. `Payments.tsx` (914 linhas) - Maior arquivo
2. `Hardware.tsx` (880 linhas)
3. `Revenue.tsx` (737 linhas)
4. `Webhooks.tsx` (733 linhas)
5. `Workers.tsx` (715 linhas)
6. `Wallets.tsx`
7. `Endpoints.tsx` (653 linhas)
8. `Currencies.tsx`
9. `PayoutModels.tsx`

### Checklist

- [ ] **4.1** Refatorar `Payments.tsx` + build + teste
- [ ] **4.2** Commit: "refactor: apply useCRUDPage to Payments"
- [ ] **4.3** Refatorar `Hardware.tsx` + build + teste
- [ ] **4.4** Commit: "refactor: apply useCRUDPage to Hardware"
- [ ] **4.5** Refatorar `Revenue.tsx` + build + teste
- [ ] **4.6** Commit: "refactor: apply useCRUDPage to Revenue"
- [ ] **4.7** Refatorar `Webhooks.tsx` + build + teste
- [ ] **4.8** Commit: "refactor: apply useCRUDPage to Webhooks"
- [ ] **4.9** Refatorar `Workers.tsx` + build + teste
- [ ] **4.10** Commit: "refactor: apply useCRUDPage to Workers"
- [ ] **4.11** Refatorar `Wallets.tsx` + build + teste
- [ ] **4.12** Commit: "refactor: apply useCRUDPage to Wallets"
- [ ] **4.13** Refatorar `Endpoints.tsx` + build + teste
- [ ] **4.14** Commit: "refactor: apply useCRUDPage to Endpoints"
- [ ] **4.15** Refatorar `Currencies.tsx` + build + teste
- [ ] **4.16** Commit: "refactor: apply useCRUDPage to Currencies"
- [ ] **4.17** Refatorar `PayoutModels.tsx` + build + teste
- [ ] **4.18** Commit: "refactor: apply useCRUDPage to PayoutModels"
- [ ] **4.19** Teste geral de regressão em todas as páginas
- [ ] **4.20** Commit: "refactor: complete CRUD pages migration to useCRUDPage"

---

## Fase 5: Extrair Componentes UI Reutilizáveis

**Objetivo**: Criar componentes reutilizáveis para padrões UI repetidos

### Componentes a Criar

#### 5.1 PasswordInput
- **Problema**: Lógica de mostrar/esconder senha duplicada em `LoginForm` e `ResetPasswordForm`
- **Localização**: `src/components/ui/password-input.tsx`

#### 5.2 DataTable Genérico (Opcional)
- **Problema**: Tabelas com sorting, filtering repetidas em páginas CRUD
- **Localização**: `src/components/ui/data-table.tsx`

#### 5.3 ConfirmDialog
- **Problema**: Dialogs de confirmação de delete repetidos
- **Localização**: `src/components/ui/confirm-dialog.tsx`

### Checklist

- [ ] **5.1** Criar `PasswordInput` component
- [ ] **5.2** `npm run build` + teste
- [ ] **5.3** Atualizar `LoginForm` para usar `PasswordInput`
- [ ] **5.4** `npm run build` + teste login
- [ ] **5.5** Atualizar `ResetPasswordForm` para usar `PasswordInput`
- [ ] **5.6** `npm run build` + teste reset password
- [ ] **5.7** Commit: "feat: create PasswordInput reusable component"
- [ ] **5.8** (Opcional) Criar `ConfirmDialog` component
- [ ] **5.9** (Opcional) Aplicar em páginas CRUD
- [ ] **5.10** Commit: "feat: create ConfirmDialog reusable component"

---

## Fase 6: Melhorar Type Safety

**Objetivo**: Eliminar uso de `any` e melhorar tipagem

### Problema Identificado
23 ocorrências de `any` type no código

### Checklist

- [ ] **6.1** Buscar todas as ocorrências de `: any` no código
- [ ] **6.2** Listar cada ocorrência com contexto
- [ ] **6.3** Substituir `any` em `Pools.tsx` (linha 147)
- [ ] **6.4** `npm run build` + teste
- [ ] **6.5** Substituir demais `any` types um por um
- [ ] **6.6** `npm run build` após cada substituição
- [ ] **6.7** Habilitar `"noImplicitAny": true` no tsconfig (se não estiver)
- [ ] **6.8** `npm run build` - corrigir erros restantes
- [ ] **6.9** Commit: "refactor: remove all any types, improve type safety"

---

## Fase 7: Padronizar Error Handling

**Objetivo**: Criar tratamento de erros consistente em toda a aplicação

### Problema Identificado
- Padrões variados: `toast.error()`, `console.error()`, silent fails
- Mensagens de erro inconsistentes

### Checklist

- [ ] **7.1** Criar `/src/lib/error-handler.ts`
- [ ] **7.2** Definir tipos de erro e estratégias de handling
- [ ] **7.3** Implementar função `handleError(error, context)`
- [ ] **7.4** `npm run build`
- [ ] **7.5** Aplicar em `AuthContext.tsx`
- [ ] **7.6** `npm run build` + teste auth
- [ ] **7.7** Aplicar em páginas CRUD (pode ser parte do hook)
- [ ] **7.8** `npm run build` + teste geral
- [ ] **7.9** Commit: "refactor: standardize error handling across app"

### Estrutura Sugerida
```typescript
// src/lib/error-handler.ts
type ErrorContext = 'auth' | 'crud' | 'api' | 'form'

interface ErrorHandlerOptions {
  context: ErrorContext
  showToast?: boolean
  logToConsole?: boolean
  rethrow?: boolean
}

export function handleError(
  error: unknown,
  message: string,
  options: ErrorHandlerOptions
): void {
  // Implementação consistente
}
```

---

## Fase 8: Limpeza e Padronização Final

**Objetivo**: Ajustes finais de código e padronização

### Checklist

#### 8.1 Criar Arquivo de Constantes
- [ ] **8.1.1** Criar `/src/lib/constants.ts`
- [ ] **8.1.2** Mover valores hardcoded para constantes
- [ ] **8.1.3** `npm run build` + teste
- [ ] **8.1.4** Commit: "refactor: centralize constants"

#### 8.2 Padronizar Nomenclatura
- [ ] **8.2.1** Padronizar `is*` para booleanos (`isLoading` vs `loading`)
- [ ] **8.2.2** Padronizar nomes de estado em hooks
- [ ] **8.2.3** `npm run build` + teste
- [ ] **8.2.4** Commit: "refactor: standardize naming conventions"

#### 8.3 Remover Código Morto
- [ ] **8.3.1** Identificar funções não utilizadas (`handleExport` stubs)
- [ ] **8.3.2** Remover ou implementar código stub
- [ ] **8.3.3** `npm run build` + teste
- [ ] **8.3.4** Commit: "chore: remove dead code"

#### 8.4 Refatorar AuthContext (Opcional)
- [ ] **8.4.1** Extrair `useAuthStorage.ts`
- [ ] **8.4.2** Extrair `useUserData.ts`
- [ ] **8.4.3** Simplificar `AuthContext.tsx`
- [ ] **8.4.4** `npm run build` + teste auth completo
- [ ] **8.4.5** Commit: "refactor: split AuthContext into smaller hooks"

#### 8.5 Revisão Final
- [ ] **8.5.1** Executar `npm run build` final
- [ ] **8.5.2** Teste de regressão completo
- [ ] **8.5.3** Revisar bundle size (deve ter reduzido)
- [ ] **8.5.4** Documentar mudanças no README se necessário
- [ ] **8.5.5** Commit: "docs: update documentation after refactoring"

---

## Métricas de Sucesso

### Antes da Refatoração
- [ ] Documentar número total de linhas de código
- [ ] Documentar número de arquivos com >500 linhas
- [ ] Documentar número de ocorrências de `any`
- [ ] Documentar número de interfaces duplicadas

### Depois da Refatoração
- [ ] Redução de ~40% nas linhas de código das páginas CRUD
- [ ] Nenhum arquivo com >500 linhas (exceto casos justificados)
- [ ] Zero ocorrências de `any` type
- [ ] Zero interfaces duplicadas
- [ ] Build passando sem warnings

---

## Comandos Úteis

```bash
# Build do projeto
npm run build

# Rodar em desenvolvimento
npm run dev

# Verificar tipos
npx tsc --noEmit

# Buscar ocorrências de "any"
grep -r ": any" src/ --include="*.ts" --include="*.tsx"

# Contar linhas por arquivo
find src -name "*.tsx" -exec wc -l {} + | sort -n

# Verificar imports não utilizados
npx eslint src --ext .ts,.tsx --rule 'no-unused-vars: error'
```

---

## Notas Importantes

1. **Sempre faça backup** antes de refatorações grandes
2. **Um commit por mudança lógica** - facilita rollback se necessário
3. **Teste manualmente** além do build - alguns bugs só aparecem em runtime
4. **Não refatore tudo de uma vez** - faça incrementalmente
5. **Se algo quebrar**, reverta e analise antes de continuar

---

*Última atualização: 24/12/2024*
