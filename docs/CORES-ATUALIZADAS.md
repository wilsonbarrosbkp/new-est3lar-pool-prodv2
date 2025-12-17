# Cores Atualizadas - Est3lar Pool v2

## Fonte: Projeto v1 (/Users/youapp/GitHubProd/est3lar-pool-prodv1/styles/tokens.css)

---

## Design System - Dark Mode (PADRÃO ÚNICO)

### Cores Base

| Token | Valor | Uso | Visual |
|-------|-------|-----|--------|
| `--background` | `#0B0F14` | Fundo da página | Azul muito escuro |
| `--card` | `#0F1720` | Painéis/Cards | Azul escuro (mais claro que bg) |
| `--surface` | `#0F1720` | Superfícies | Igual a card |

### Texto

| Token | Valor | Uso |
|-------|-------|-----|
| `--text-primary` | `#FFFFFF` | Texto principal (branco) |
| `--text-secondary` | `#94A3B8` | Texto secundário (cinza azulado) |
| `--text-inverse` | `#0B0F14` | Texto em fundos claros |

### Primary (Neutral Blue-Tinted White)

| Token | Valor | Uso |
|-------|-------|-----|
| `--primary` | `#E2E8F0` | Cor primária (branco azulado) |
| `--primary-light` | `rgba(226,232,240,0.8)` | Hover/active |
| `--primary-foreground` | `#0B0F14` | Texto sobre primary |

**Nota**: No v1, o primary NÃO é uma cor vibrante, é um tom neutro claro!

### Borders & Effects

| Token | Valor | Uso |
|-------|-------|-----|
| `--border` | `rgba(255,255,255,0.06)` | Bordas suaves (6% opacity) |
| `--border-emphasis` | `rgba(255,255,255,0.12)` | Bordas com ênfase (12% opacity) |
| `--ring` | `rgba(226,232,240,0.3)` | Focus ring (30% opacity) |

### Shadows

```css
--shadow-1: 0 1px 1px rgba(0,0,0,0.35);
--shadow-2: 0 2px 10px rgba(0,0,0,0.40);
```

### Opacidades de Preto (Helper Variables)

```css
--black-10: rgba(0,0,0,0.10)
--black-15: rgba(0,0,0,0.15)
--black-20: rgba(0,0,0,0.20)
--black-25: rgba(0,0,0,0.25)
--black-30: rgba(0,0,0,0.30)
--black-35: rgba(0,0,0,0.35)
--black-40: rgba(0,0,0,0.40)
--black-50: rgba(0,0,0,0.50)
```

---

## Cores Semânticas

### Status
```css
--success: #10B981       (Verde)
--warning: #F59E0B       (Laranja/Amarelo)
--error: #EF4444         (Vermelho)
--info: #3B82F6          (Azul)
```

### Status Específicos (Workers)
```css
--status-online: #10b981      (Verde)
--status-degraded: #f59e0b    (Laranja)
--status-offline: #ef4444     (Vermelho)
```

### Roles (Permissões)
```css
--role-owner: #9333ea         (Roxo)
--role-admin: #3b82f6         (Azul)
--role-operator: #10b981      (Verde)
--role-viewer: #6b7280        (Cinza)
```

---

## Gradiente Badge (v1)

```css
--gradient-badge: linear-gradient(to right, #C26ECB, #3352AB, #6CC997);
```

**Cores do Gradiente:**
- `#C26ECB` - Rosa/Roxo
- `#3352AB` - Azul
- `#6CC997` - Verde

---

## Border Radius

```css
--radius: 0.625rem;  /* 10px - base */

/* Calculados: */
--radius-sm: 6px    (radius - 4px)
--radius-md: 8px    (radius - 2px)
--radius-lg: 10px   (radius)
--radius-xl: 14px   (radius + 4px)
```

---

## Comparação: Cores Antigas vs Reais do v1

| Aspecto | Antigas (Especuladas) | Reais (v1) | Mudança |
|---------|----------------------|------------|---------|
| **Background** | `#1C232E` | `#0B0F14` | Mais escuro |
| **Card/Panel** | `#2B3541` | `#0F1720` | Mais escuro |
| **Primary** | `#B268F5` (Roxo) | `#E2E8F0` (Branco azulado) | ❗ TOTALMENTE DIFERENTE |
| **Text Primary** | `#E3E3E3` | `#FFFFFF` | Branco puro |
| **Text Secondary** | `#A6ABB2` | `#94A3B8` | Azulado |
| **Border** | `#525660` | `rgba(255,255,255,0.06)` | Transparente |

---

## Principais Descobertas

### 1. Primary NÃO é roxo vibrante!
No v1, `--primary` é `#E2E8F0` (um branco azulado neutro), não uma cor vibrante.

**Cores vibrantes estão em:**
- Roles (`--role-owner: #9333ea` - roxo)
- Gradiente badge (rosa/roxo → azul → verde)
- Status (verde/amarelo/vermelho)

### 2. Background mais escuro
`#0B0F14` é MUITO mais escuro que o `#1C232E` que estava usando.

### 3. Borders transparentes
Bordas usam `rgba(255,255,255,0.06)` (6% de branco), não cores sólidas.

### 4. Sem tema claro
Apenas dark mode no v1, confirmando a decisão de usar apenas dark no v2.

---

## Fontes (do v1)

```css
--font-sans: var(--font-geist-sans);  /* Geist Sans */
--font-mono: var(--font-geist-mono);  /* Geist Mono */
```

**No v2 estamos usando:**
- Inter (similar ao Geist Sans)
- JetBrains Mono (similar ao Geist Mono)

**Opção:** Trocar para Geist para manter 100% fiel ao v1

---

## Aplicação no Tailwind

Com as CSS variables atualizadas, o Tailwind já mapeia automaticamente:

```tsx
// Exemplos de uso:
<div className="bg-background">           {/* #0B0F14 */}
<div className="bg-card">                 {/* #0F1720 */}
<div className="text-text-primary">       {/* #FFFFFF */}
<div className="text-text-secondary">     {/* #94A3B8 */}
<div className="bg-primary">              {/* #E2E8F0 */}
<div className="border-border">           {/* rgba(255,255,255,0.06) */}

// Status
<span className="text-success">          {/* #10B981 */}
<span className="text-error">            {/* #EF4444 */}

// Roles
<span className="text-[var(--role-admin)]">  {/* #3b82f6 */}
```

---

## Próximos Passos

**CORES AGORA IDÊNTICAS AO V1!** ✅

Próximo: Implementar página de Login usando estas cores exatas.
