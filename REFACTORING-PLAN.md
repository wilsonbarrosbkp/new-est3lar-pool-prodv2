# Plano de Refatoracao - Genesis Pool v2.0

> **Data da Analise**: 25/12/2024
> **Autor**: Wilson Dev
> **Versao do Projeto**: 2.0.0

---

## Resumo Executivo

Este documento consolida a analise completa do projeto genesis-pool e apresenta um plano de refatoracao estruturado com checklist de atividades.

### Metricas Atuais

| Metrica | Valor |
|---------|-------|
| Total de Arquivos TS/TSX | 78 |
| Paginas Super-Admin | 16 |
| Componentes UI Base | 24+ |
| Custom Hooks | 4 |
| Linhas console.log/error/warn | 30 |
| Tipos `any` | 0 |

---

## FASE 1: Centralizacao de Formatadores

**Prioridade**: ALTA
**Impacto**: Manutencao, Consistencia, Reducao de Bugs

### Problema Identificado
19 instancias de funcoes de formatacao duplicadas em multiplas paginas.

### Funcoes Duplicadas

| Funcao | Arquivos Afetados | Existe em formatters.ts? |
|--------|-------------------|-------------------------|
| `formatHashrate()` | PoolStats.tsx, Hardware.tsx, Workers.tsx, Revenue.tsx | Sim |
| `formatDate()` | Rounds.tsx, Revenue.tsx, Payments.tsx, Webhooks.tsx, Audit.tsx | Sim |
| `formatShares()` | PoolStats.tsx, Rounds.tsx | Nao |
| `formatUptime()` | PoolStats.tsx, Hardware.tsx | Nao |
| `formatBTC()` | Revenue.tsx | Nao |
| `formatAmount()` | Payments.tsx | Nao |
| `formatTxHash()` | Payments.tsx | Nao |
| `capitalize()` | useCRUDPage.ts | Nao |

### Checklist

- [x] **1.1** Adicionar `formatShares()` em `/src/lib/formatters.ts`
- [x] **1.2** Adicionar `formatUptime()` em `/src/lib/formatters.ts`
- [x] **1.3** Adicionar `formatBTC()` em `/src/lib/formatters.ts`
- [x] **1.4** Adicionar `formatAmount()` em `/src/lib/formatters.ts`
- [x] **1.5** Adicionar `formatTxHash()` em `/src/lib/formatters.ts`
- [x] **1.6** Mover `capitalize()` de useCRUDPage.ts para `/src/lib/formatters.ts`
- [x] **1.7** Atualizar PoolStats.tsx - remover formatadores locais e importar de formatters
- [x] **1.8** `pnpm run build` + teste
- [x] **1.9** Atualizar Hardware.tsx - usar formatadores centralizados
- [x] **1.10** `pnpm run build` + teste
- [x] **1.11** Atualizar Workers.tsx - usar formatadores centralizados
- [x] **1.12** `pnpm run build` + teste
- [x] **1.13** Atualizar Revenue.tsx - usar formatadores centralizados
- [x] **1.14** `pnpm run build` + teste
- [x] **1.15** Atualizar Rounds.tsx - usar formatadores centralizados
- [x] **1.16** `pnpm run build` + teste
- [x] **1.17** Atualizar Payments.tsx - usar formatadores centralizados
- [x] **1.18** `pnpm run build` + teste
- [x] **1.19** Atualizar Webhooks.tsx - usar formatadores centralizados
- [x] **1.20** `pnpm run build` + teste
- [x] **1.21** Atualizar Audit.tsx - usar formatadores centralizados
- [x] **1.22** `pnpm run build` + teste
- [x] **1.23** Atualizar Wallets.tsx - usar formatadores centralizados
- [x] **1.24** Atualizar useCRUDPage.ts - importar capitalize de formatters
- [x] **1.25** `pnpm run build` final - SUCESSO
- [x] **1.26** Commit: "refactor: centralize formatters in lib/formatters.ts" - CONCLUIDO

---

## FASE 2: Padronizacao de Nomenclatura de Arquivos

**Prioridade**: MEDIA
**Impacto**: Consistencia, Onboarding

### Problema Identificado
Inconsistencia entre PascalCase e kebab-case nos componentes UI.

### Arquivos com Nomenclatura Inconsistente

```
src/components/ui/
  password-input.tsx  <- kebab-case
  confirm-dialog.tsx  <- kebab-case
  Button.tsx          <- PascalCase
  Card.tsx            <- PascalCase
  ...
```

### Checklist

- [x] **2.1** Renomear `password-input.tsx` para `PasswordInput.tsx`
- [x] **2.2** Atualizar imports afetados
- [x] **2.3** `pnpm run build` + teste
- [x] **2.4** Renomear `confirm-dialog.tsx` para `ConfirmDialog.tsx`
- [x] **2.5** Atualizar imports afetados
- [x] **2.6** `pnpm run build` + teste
- [x] **2.7** Commit: "refactor: standardize component file naming to PascalCase" - CONCLUIDO

---

## FASE 3: Consolidacao de Hooks (useCRUDPage + useReadOnlyPage)

**Prioridade**: MEDIA
**Impacto**: Manutencao, Reducao de Duplicacao

### Problema Identificado
Os dois hooks principais compartilham ~60% do codigo:
- Logica de carregamento de dados
- Sistema de filtros e busca
- Ordenacao de dados
- Refs para evitar loops infinitos

### Checklist

- [x] **3.1** Criar hook base `useDataPage.ts` com logica compartilhada
- [x] **3.2** Extrair `SortConfig` e logica de ordenacao para modulo separado
- [x] **3.3** Extrair logica de filtros para modulo separado
- [x] **3.4** Refatorar `useCRUDPage` para usar hook base
- [x] **3.5** `pnpm run build` + teste
- [x] **3.6** Refatorar `useReadOnlyPage` para usar hook base
- [x] **3.7** `pnpm run build` + teste
- [x] **3.8** Testar todas as paginas CRUD
- [x] **3.9** Testar todas as paginas read-only (Audit, Rounds)
- [x] **3.10** Commit: "refactor: consolidate data hooks with shared base" - CONCLUIDO

---

## FASE 4: Componentizacao de Paginas CRUD

**Prioridade**: ALTA
**Impacto**: Testabilidade, Manutencao, Reuso

### Problema Identificado
Paginas CRUD muito grandes (600-750 linhas) com multiplas responsabilidades.

### Tamanho Atual das Paginas

| Arquivo | Linhas | Status |
|---------|--------|--------|
| Users.tsx | ~745 | Muito grande |
| Pools.tsx | ~648 | Muito grande |
| Hardware.tsx | ~600+ | Grande |
| Payments.tsx | ~600+ | Grande |
| Revenue.tsx | ~500+ | Grande |

### Componentes a Criar

```
src/components/crud/
  CRUDPageHeader.tsx       <- Header com titulo, busca, filtros, acoes
  CRUDPageFilters.tsx      <- Barra de filtros generica
  CRUDFormSheet.tsx        <- Sheet com formulario
  DataTableSortHeader.tsx  <- Header de tabela com ordenacao
```

### Checklist

- [x] **4.1** Criar `/src/components/crud/DataTableSortHeader.tsx`
- [x] **4.2** Criar `/src/components/crud/TableActionMenu.tsx`
- [x] **4.3** Criar `/src/components/crud/CRUDFormSheet.tsx`
- [x] **4.4** `pnpm run build` + teste
- [x] **4.5** Criar `/src/components/crud/index.ts` com exports
- [x] **4.6** Refatorar Organizations.tsx usando novos componentes
- [x] **4.7** `pnpm run build` + teste completo da pagina
- [ ] **4.8** Aplicar em demais paginas CRUD (Users, Pools, etc.) - PENDENTE
- [x] **4.9** Commit: "refactor: create reusable CRUD page components" - CONCLUIDO

---

## FASE 5: Tratamento de Erros Consistente

**Prioridade**: MEDIA
**Impacto**: Reliability, Debug, UX

### Problema Identificado
- 30 ocorrencias de `console.log/error/warn` espalhadas
- Tratamento inconsistente: alguns usam `showErrorToast()`, outros `toast.error()` direto
- `/src/lib/error-handler.ts` existe mas nao e usado consistentemente

### Checklist

- [x] **5.1** Auditar todas as ocorrencias de `console.error` em pages - 29 ocorrencias encontradas
- [x] **5.2** Substituir `console.error + toast.error` por `handleError()` do error-handler
- [x] **5.3** Atualizar useDataPage.ts para usar error-handler centralizado
- [x] **5.4** Atualizar useCRUDPage.ts para usar error-handler centralizado
- [x] **5.5** `pnpm run build` + teste
- [x] **5.6** Atualizar useReadOnlyPage.ts para usar error-handler centralizado
- [x] **5.7** `pnpm run build` + teste
- [x] **5.8** Atualizar todas as paginas super-admin (12 arquivos)
- [x] **5.9** Atualizar componentes (SuperAdminLayout, HashrateAreaChart, ConfirmDialog)
- [x] **5.10** `pnpm run build` final - SUCESSO
- [x] **5.11** Commit: "refactor: standardize error handling with central handler" - CONCLUIDO

---

## FASE 6: Limpeza de Codigo

**Prioridade**: BAIXA
**Impacto**: Bundle size, Clareza

### Problemas Identificados

1. **Arquivo de exemplo**: `ChartAreaInteractive.tsx` com dados hardcoded de 2024
2. **Magic strings**: Keys de storage construidas dinamicamente
3. **Hardcoded values**: `poolId: 1` em PoolStats.tsx

### Checklist

- [ ] **6.1** Avaliar se `ChartAreaInteractive.tsx` deve ser removido ou movido para `/examples`
- [ ] **6.2** Extrair logica de localStorage para `/src/lib/storage.ts`
- [ ] **6.3** Remover/parametrizar `poolId: 1` hardcoded em PoolStats.tsx
- [ ] **6.4** Criar constantes para magic strings em `/src/lib/constants.ts`
- [ ] **6.5** `pnpm run build` + teste
- [ ] **6.6** Commit: "chore: cleanup hardcoded values and example files"

---

## FASE 7: Padronizacao de Idioma

**Prioridade**: BAIXA
**Impacto**: Consistencia UX

### Problema Identificado
Mix de portugues e ingles em labels e status:
- Status: `'ativo' | 'inativo'` (portugues) vs `'active' | 'inactive'` (ingles em alguns lugares)
- Labels: `'Recently'` em PoolStats.tsx

### Checklist

- [ ] **7.1** Definir idioma padrao para status (recomendado: portugues)
- [ ] **7.2** Auditar e corrigir status inconsistentes
- [ ] **7.3** `pnpm run build` + teste
- [ ] **7.4** Commit: "refactor: standardize status labels to Portuguese"

---

## FASE 8: Tipos Duplicados

**Prioridade**: MEDIA
**Impacto**: Type Safety, Manutencao

### Problema Identificado
Tipos User definidos em dois lugares:
- `/src/types/auth.ts` - User com RoleId
- `/src/types/super-admin.ts` - User com interface completa

### Checklist

- [ ] **8.1** Analisar diferenca entre tipos User
- [ ] **8.2** Criar tipo base User e extender para casos especificos
- [ ] **8.3** Atualizar imports em todos os arquivos afetados
- [ ] **8.4** `pnpm run build` + teste
- [ ] **8.5** Commit: "refactor: consolidate User types"

---

## FASE 9: Organizacao de Imports

**Prioridade**: BAIXA
**Impacto**: Legibilidade, Consistencia

### Problema Identificado
Imports desorganizados e longos (15+ linhas de imports de lucide-react).

### Padrao Recomendado

```tsx
// 1. React e bibliotecas externas
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

// 2. UI Components
import { Button, Input, Card } from '@/components/ui'

// 3. Hooks
import { useCRUDPage } from '@/hooks'

// 4. Utils e libs
import { formatDate, formatHashrate } from '@/lib/formatters'

// 5. Types
import type { User, Role } from '@/types/super-admin'

// 6. Icons (agrupados)
import { UserCog, Plus, Search, ArrowUpDown } from 'lucide-react'
```

### Checklist

- [ ] **9.1** Configurar ESLint import/order
- [ ] **9.2** Aplicar ordenacao automatica de imports
- [ ] **9.3** `pnpm run build` + teste
- [ ] **9.4** Commit: "style: organize imports with consistent ordering"

---

## Dependencias do Projeto

### Status Atual

As dependencias estao **atualizadas**. Verificado em 25/12/2024:

| Dependencia | Versao Atual | Status |
|-------------|--------------|--------|
| React | 19.2.3 | Atual |
| TypeScript | 5.9.3 | Atual |
| Vite | 7.3.0 | Atual |
| Tailwind CSS | 4.1.18 | Atual |
| Supabase JS | 2.89.0 | Atual |
| TanStack Query | 5.90.12 | Atual |
| Zod | 4.2.1 | Atual |

### Checklist de Dependencias

- [x] Verificar dependencias desatualizadas (`pnpm outdated`)
- [x] Nenhuma dependencia obsoleta encontrada

---

## Cronograma Sugerido

| Fase | Descricao | Esforco Estimado |
|------|-----------|------------------|
| 1 | Centralizacao de Formatadores | 1-2 dias |
| 2 | Padronizacao de Nomenclatura | 0.5 dia |
| 3 | Consolidacao de Hooks | 2-3 dias |
| 4 | Componentizacao de Paginas CRUD | 3-4 dias |
| 5 | Tratamento de Erros | 1 dia |
| 6 | Limpeza de Codigo | 0.5 dia |
| 7 | Padronizacao de Idioma | 0.5 dia |
| 8 | Tipos Duplicados | 1 dia |
| 9 | Organizacao de Imports | 0.5 dia |

**Total Estimado**: 10-13 dias de trabalho

---

## Metricas de Sucesso

### Antes da Refatoracao
- [x] Linhas de codigo duplicado em formatadores: ~100 linhas
- [x] Paginas com >500 linhas: 5 arquivos
- [x] Hooks com codigo duplicado: ~200 linhas

### Depois da Refatoracao
- [ ] Zero formatadores duplicados
- [ ] Nenhuma pagina com >400 linhas
- [ ] Hooks compartilham base comum
- [ ] Build passando sem warnings
- [ ] Todos os testes funcionando

---

## Comandos Uteis

```bash
# Build do projeto
pnpm run build

# Rodar em desenvolvimento
pnpm run dev

# Verificar tipos
pnpm exec tsc --noEmit

# Buscar console.log/error
grep -r "console\." src/ --include="*.ts" --include="*.tsx"

# Contar linhas por arquivo
find src -name "*.tsx" -exec wc -l {} + | sort -n
```

---

## Notas Importantes

1. **Sempre execute build** antes de seguir para proxima tarefa
2. **Um commit por fase** - facilita rollback se necessario
3. **Teste manualmente** alem do build
4. **Nao refatore tudo de uma vez** - faca incrementalmente

---

*Documento gerado em: 25/12/2024*
*Autor: Wilson Dev*
