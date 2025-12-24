# Plano de Refatoração - Genesis Pool

> **Regra de Ouro**: Sempre execute `pnpm run build` e teste a aplicação antes de seguir para o próximo passo.

---

## Resumo Executivo

| Fase | Descrição | Esforço | Impacto | Status |
|------|-----------|---------|---------|--------|
| 1 | Consolidar Interfaces/Tipos | Baixo | Alto | ✅ Concluída |
| 2 | Criar Hook useCRUDPage | Médio | Altíssimo | ✅ Concluída |
| 3 | Refatorar Páginas CRUD (Piloto) | Médio | Alto | ✅ Concluída |
| 4 | Aplicar Padrão nas Demais Páginas | Médio | Alto | 🔄 Em Progresso |
| 5 | Extrair Componentes UI Reutilizáveis | Baixo | Médio | ⏳ Pendente |
| 6 | Melhorar Type Safety | Baixo | Médio | ⏳ Pendente |
| 7 | Padronizar Error Handling | Baixo | Médio | ⏳ Pendente |
| 8 | Limpeza e Padronização Final | Baixo | Baixo | ⏳ Pendente |

---

## Fase 1: Consolidar Interfaces/Tipos ✅

**Status**: Concluída

**Objetivo**: Eliminar interfaces duplicadas em múltiplos arquivos

### O que foi feito
- Revisado `/src/types/super-admin.ts` com todos os tipos necessários
- Todas as páginas CRUD atualizadas para importar tipos de `@/types/super-admin`
- Interfaces locais removidas e substituídas por tipos centralizados

### Arquivos Afetados
- ✅ `src/pages/super-admin/Payments.tsx`
- ✅ `src/pages/super-admin/Pools.tsx`
- ✅ `src/pages/super-admin/Wallets.tsx`
- ✅ `src/pages/super-admin/Hardware.tsx`
- ✅ `src/pages/super-admin/Revenue.tsx`
- ✅ `src/pages/super-admin/Users.tsx`
- ✅ `src/pages/super-admin/Organizations.tsx`
- ✅ `src/pages/super-admin/Workers.tsx`
- ✅ `src/pages/super-admin/Endpoints.tsx`
- ✅ `src/pages/super-admin/Webhooks.tsx`

---

## Fase 2: Criar Hook useCRUDPage ✅

**Status**: Concluída

**Objetivo**: Criar hook genérico que encapsula lógica comum de páginas CRUD

### O que foi feito
- ✅ Criado arquivo `/src/hooks/useCRUDPage.ts`
- ✅ Interface genérica `UseCRUDPageOptions<T, F>` implementada
- ✅ Gerenciamento de estado genérico (loading, search, filters, sheetOpen, editing, formData, saving)
- ✅ Funções CRUD: `loadData`, `handleOpenCreate`, `handleOpenEdit`, `handleCloseSheet`, `handleSubmit`, `handleDelete`
- ✅ Lógica de filtro e busca com `searchFields`
- ✅ Ordenação configurável com `sortConfig` e `handleSort`
- ✅ Suporte a queries customizadas via `customLoadData`
- ✅ Callbacks: `onBeforeCreate`, `onBeforeUpdate`, `onAfterCreate`, `onAfterUpdate`, `onAfterDelete`
- ✅ Mensagens customizáveis
- ✅ Tipagem completa com TypeScript

### Bug Corrigido (24/12/2025)
- **Problema**: Tabelas não exibiam dados devido a loop infinito de re-render
- **Causa**: Objetos `defaultOrderBy` e `messages` eram recriados a cada render, causando loops nas dependências do useCallback
- **Solução**: Adicionados `useRef` para armazenar objetos e funções callback, criada função `getMessages()` memoizada

### Assinatura Final do Hook
```typescript
interface UseCRUDPageOptions<T extends { id: number | string }, F> {
  tableName: string
  selectFields?: string
  initialFormData: F
  mapDataToForm: (item: T) => F
  validateForm?: (data: F) => string | null
  mapFormToData?: (data: F) => Record<string, unknown>
  searchFields?: (keyof T)[]
  defaultOrderBy?: { column: string; ascending?: boolean }
  limit?: number
  customLoadData?: () => Promise<T[]>
  onDataLoaded?: (data: T[]) => void
  onBeforeCreate?: (data: Record<string, unknown>) => Promise<Record<string, unknown>>
  onBeforeUpdate?: (data: Record<string, unknown>, id: number | string) => Promise<Record<string, unknown>>
  onAfterCreate?: (item: T) => void
  onAfterUpdate?: (item: T) => void
  onAfterDelete?: (id: number | string) => void
  customSubmit?: (formData: F, editing: T | null) => Promise<void>
  messages?: {
    loadError?: string
    createSuccess?: string
    updateSuccess?: string
    deleteSuccess?: string
    deleteConfirm?: (item: T) => string
    saveError?: string
    deleteError?: string
  }
  entityName?: string
}

interface UseCRUDPageReturn<T extends { id: number | string }, F> {
  data: T[]
  loading: boolean
  search: string
  setSearch: (value: string) => void
  filters: Record<string, string>
  setFilter: (key: string, value: string) => void
  sortConfig: SortConfig<T>
  setSortConfig: React.Dispatch<React.SetStateAction<SortConfig<T>>>
  sheetOpen: boolean
  setSheetOpen: (open: boolean) => void
  editing: T | null
  formData: F
  setFormData: React.Dispatch<React.SetStateAction<F>>
  saving: boolean
  loadData: () => Promise<void>
  handleOpenCreate: () => void
  handleOpenEdit: (item: T) => void
  handleCloseSheet: () => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  handleDelete: (item: T) => Promise<void>
  handleSort: (key: keyof T) => void
  filteredData: T[]
  totalCount: number
  filteredCount: number
}
```

---

## Fase 3: Refatorar Páginas CRUD (Piloto) ✅

**Status**: Concluída

**Objetivo**: Aplicar o hook `useCRUDPage` em 3 páginas como piloto

### Páginas Piloto Concluídas

#### 3.1 Organizations.tsx ✅
- ✅ Migrado para usar `useCRUDPage`
- ✅ Build passando
- ✅ CRUD testado e funcionando
- ✅ Redução significativa de código duplicado

#### 3.2 Users.tsx ✅
- ✅ Migrado para usar `useCRUDPage`
- ✅ Usa `customLoadData` para carregar view `v_users_details`
- ✅ Usa `customSubmit` para criar usuários via Edge Function
- ✅ Filtros adicionais por status, role e organização mantidos
- ✅ Build passando

#### 3.3 Pools.tsx ✅
- ✅ Migrado para usar `useCRUDPage`
- ✅ Usa `customLoadData` com Promise.all para múltiplas queries
- ✅ Joins com organizations, currencies e payout_models
- ✅ Filtro adicional por organização mantido
- ✅ Build passando

---

## Fase 4: Aplicar Padrão nas Demais Páginas 🔄

**Status**: Em Progresso (4/7 concluídas)

**Objetivo**: Refatorar as páginas CRUD restantes usando o hook validado

### Progresso de Migração

| Página | Complexidade | Status | Observações |
|--------|--------------|--------|-------------|
| Currencies.tsx | Simples | ✅ Concluída | Separação crypto/fiat mantida, toggleActive como função auxiliar |
| Webhooks.tsx | Média | ✅ Concluída | Filtros adicionais (org, status), funções auxiliares (testWebhook, copyUrl, copySecret) |
| Workers.tsx | Média | ✅ Concluída | Múltiplos joins, filtros cascata (pools/hardware por org), formatHashrate, formatTimeAgo |
| Endpoints.tsx | Média | ✅ Concluída | Filtros por tipo e status, formatUrl, toggleStatus, handleCopyUrl |
| Payments.tsx | Média | ⏳ Pendente | Múltiplas relações, cálculos agregados, timestamps automáticos |
| Wallets.tsx | Complexa | ⏳ Pendente | Lógica de primária única, múltiplos toggles |
| Hardware.tsx | Complexa | ⏳ Pendente | Muitos campos, componentes visuais customizados |

### Páginas com Padrão Diferente (Não CRUD Completo)

| Página | Tipo | Decisão |
|--------|------|---------|
| Permissions.tsx | Híbrido (CRUD + Matrix Many-to-Many) | Avaliar se adaptar ou manter |
| Rounds.tsx | Read-only + Status Update | Criar hook específico ou manter |
| Audit.tsx | Read-only | Criar hook específico ou manter |

### Checklist Fase 4

- [x] **4.1** Refatorar `Currencies.tsx` + build + teste
- [x] **4.2** Refatorar `Webhooks.tsx` + build + teste
- [x] **4.3** Refatorar `Workers.tsx` + build + teste
- [x] **4.4** Refatorar `Endpoints.tsx` + build + teste
- [ ] **4.5** Refatorar `Payments.tsx` + build + teste
- [ ] **4.6** Refatorar `Wallets.tsx` + build + teste
- [ ] **4.7** Refatorar `Hardware.tsx` + build + teste
- [ ] **4.8** Avaliar `Permissions.tsx` (híbrido)
- [ ] **4.9** Avaliar `Rounds.tsx` e `Audit.tsx` (read-only)
- [ ] **4.10** Teste geral de regressão em todas as páginas

---

## Fase 5: Extrair Componentes UI Reutilizáveis ⏳

**Status**: Pendente

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
- [ ] **5.2** `pnpm run build` + teste
- [ ] **5.3** Atualizar `LoginForm` para usar `PasswordInput`
- [ ] **5.4** `pnpm run build` + teste login
- [ ] **5.5** Atualizar `ResetPasswordForm` para usar `PasswordInput`
- [ ] **5.6** `pnpm run build` + teste reset password
- [ ] **5.7** (Opcional) Criar `ConfirmDialog` component
- [ ] **5.8** (Opcional) Aplicar em páginas CRUD

---

## Fase 6: Melhorar Type Safety ⏳

**Status**: Pendente

**Objetivo**: Eliminar uso de `any` e melhorar tipagem

### Checklist

- [ ] **6.1** Buscar todas as ocorrências de `: any` no código
- [ ] **6.2** Listar cada ocorrência com contexto
- [ ] **6.3** Substituir `any` types um por um
- [ ] **6.4** `pnpm run build` após cada substituição
- [ ] **6.5** Habilitar `"noImplicitAny": true` no tsconfig (se não estiver)
- [ ] **6.6** `pnpm run build` - corrigir erros restantes

---

## Fase 7: Padronizar Error Handling ⏳

**Status**: Pendente

**Objetivo**: Criar tratamento de erros consistente em toda a aplicação

### Checklist

- [ ] **7.1** Criar `/src/lib/error-handler.ts`
- [ ] **7.2** Definir tipos de erro e estratégias de handling
- [ ] **7.3** Implementar função `handleError(error, context)`
- [ ] **7.4** Aplicar em `AuthContext.tsx`
- [ ] **7.5** Aplicar em páginas CRUD (integrar com hook)
- [ ] **7.6** `pnpm run build` + teste geral

---

## Fase 8: Limpeza e Padronização Final ⏳

**Status**: Pendente

**Objetivo**: Ajustes finais de código e padronização

### Checklist

- [ ] **8.1** Criar `/src/lib/constants.ts` para valores hardcoded
- [ ] **8.2** Padronizar nomenclatura de estados (`isLoading` vs `loading`)
- [ ] **8.3** Remover código morto (funções não utilizadas)
- [ ] **8.4** Refatorar `AuthContext` (opcional - extrair hooks menores)
- [ ] **8.5** Revisão final de bundle size
- [ ] **8.6** Documentar mudanças no README

---

## Métricas de Sucesso

### Antes da Refatoração
- ~7000+ linhas de código duplicado em páginas CRUD
- Interfaces duplicadas em ~10 arquivos
- 23 ocorrências de `any` type

### Progresso Atual
- ✅ Hook `useCRUDPage` criado e funcionando
- ✅ 7 páginas migradas (Organizations, Users, Pools, Currencies, Webhooks, Workers, Endpoints)
- ✅ Zero interfaces duplicadas (tipos centralizados)
- ✅ Build passando sem erros
- 🔄 4 páginas pendentes de migração

### Meta Final
- [ ] Redução de ~40% nas linhas de código das páginas CRUD
- [ ] Nenhum arquivo com >500 linhas (exceto casos justificados)
- [ ] Zero ocorrências de `any` type
- [ ] Build passando sem warnings

---

## Comandos Úteis

```bash
# Build do projeto
pnpm run build

# Rodar em desenvolvimento
pnpm run dev

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
6. **Use `pnpm`** ao invés de `npm` para gerenciamento de pacotes

---

## Histórico de Atualizações

| Data | Fase | Descrição |
|------|------|-----------|
| 24/12/2025 | 1 | Consolidação de interfaces concluída |
| 24/12/2025 | 2 | Hook useCRUDPage criado e corrigido (bug re-render loop) |
| 24/12/2025 | 3 | Páginas piloto migradas (Organizations, Users, Pools) |
| 24/12/2025 | 4 | Currencies, Webhooks, Workers, Endpoints migrados |

---

*Última atualização: 24/12/2025*
