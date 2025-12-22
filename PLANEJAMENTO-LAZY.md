# Planejamento: Implementacao Lazy Loading

**Data:** 22/12/2025
**Objetivo:** Reduzir bundle inicial de ~517KB para ~150-200KB
**Resultado atual:** 229 KB (meta atingida!)
**Metodo:** Implementacao ponto a ponto com testes entre cada etapa

---

## Beneficios Esperados

| Metrica | Antes | Depois (estimado) |
|---------|-------|-------------------|
| Bundle inicial | 517 KB | ~150-200 KB |
| Tempo carregamento | ~2-3s | ~0.5-1s |
| First Contentful Paint | Lento | Rapido |

---

## Pre-requisitos

- [x] Build funcionando sem erros
- [ ] Entender estrutura atual de rotas (App.tsx)

---

## Checklist de Implementacao

### Fase 1: Infraestrutura Base

- [x] **1.1** Criar componente LoadingFallback para Suspense
  - Arquivo: `src/components/ui/LoadingFallback.tsx`
  - Teste: Build passa, componente renderiza

### Fase 2: Paginas de Autenticacao (baixo risco)

- [x] **2.1** Lazy load da pagina Login
  - Arquivo: `src/App.tsx`
  - Teste: Acessar `/login`, pagina carrega normalmente

- [x] **2.2** Lazy load da pagina ForgotPassword
  - Arquivo: `src/App.tsx`
  - Teste: Acessar `/forgot-password`, pagina carrega normalmente

- [x] **2.3** Lazy load da pagina ResetPassword
  - Arquivo: `src/App.tsx`
  - Teste: Acessar `/reset-password`, pagina carrega normalmente

### Fase 3: Paginas Super Admin (maior impacto)

- [x] **3.1** Lazy load do SuperAdminLayout
  - Arquivo: `src/App.tsx`
  - Teste: Login como admin, dashboard carrega

- [x] **3.2** Lazy load das paginas individuais do Super Admin
  - Arquivos: Todas as paginas em `src/pages/super-admin/`
  - Teste: Navegar entre paginas, todas carregam

### Fase 4: Paginas Org Admin e Miner

- [ ] **4.1** Lazy load do OrgAdminLayout (quando existir)
- [ ] **4.2** Lazy load do MinerDashboard (quando existir)

### Fase 5: Otimizacoes Adicionais

- [ ] **5.1** Separar chunk do Recharts (graficos)
  - Arquivo: `vite.config.ts`
  - Teste: Build mostra chunk separado para charts

- [ ] **5.2** Verificar tamanho final dos bundles
  - Meta: index.js < 200KB

---

## Ordem de Execucao

```
1.1 -> commit -> 2.1 -> commit -> 2.2 -> commit -> 2.3 -> commit
                                                          |
                                                          v
5.2 <- commit <- 5.1 <- commit <- 3.2 <- commit <- 3.1 <--+
```

---

## Comandos de Teste

```bash
# Build de producao
pnpm build

# Servidor de preview (testar build)
pnpm preview

# Desenvolvimento (testar hot reload)
pnpm dev
```

---

## Rollback

Se algo quebrar, reverter o ultimo commit:
```bash
git checkout -- src/App.tsx
```

---

## Progresso

| Etapa | Status | Data | Observacoes |
|-------|--------|------|-------------|
| 1.1   | Concluido | 22/12/2025 | Componente criado, build OK |
| 2.1   | Concluido | 22/12/2025 | Chunk separado: Login-*.js (3.35 KB) |
| 2.2   | Concluido | 22/12/2025 | Chunk: ForgotPassword-*.js (2.77 KB) |
| 2.3   | Concluido | 22/12/2025 | Chunk: ResetPassword-*.js (2.92 KB) + shared |
| 3.1   | Concluido | 22/12/2025 | Chunk: SuperAdminLayout-*.js (26.53 KB) |
| 3.2   | Concluido | 22/12/2025 | 16 paginas lazy! index.js: 229 KB |
| 5.1   | Pendente | - | - |
| 5.2   | Pendente | - | - |

---

**Responsavel:** Wilson
**Assistente:** Claude Code
