# Design System - Est3lar Pool v2

## Uso de Tokens

### Importação
```typescript
import { typography, gradients, sizes } from '@/design-system/tokens'
```

### Exemplos de Uso

#### Typography
```tsx
// Headings
<h1 className={typography.heading.h1}>Título Principal</h1>
<h2 className={typography.heading.h2}>Subtítulo</h2>

// Body text
<p className={typography.body.default}>Texto do corpo</p>
<small className={typography.body.small}>Texto pequeno</small>

// KPI Cards
<div className={typography.kpi.title}>Hashrate</div>
<div className={typography.kpi.value}>1.5 TH/s</div>

// Tables
<th className={typography.table.header}>Coluna</th>
<td className={typography.table.cell}>Valor</td>

// Buttons
<button className={typography.button.default}>Clique</button>

// Font weights
<span className={typography.weight.semibold}>Texto em negrito médio</span>
```

#### Gradients
```tsx
<div className={`bg-gradient-to-r ${gradients.brand}`}>
  Fundo com gradiente
</div>
```

#### Sizes
```tsx
<button className={sizes.button.md}>Botão Médio</button>
<input className={sizes.input.lg} />
```

## Tokens Disponíveis

### Typography

#### Headings
- `typography.heading.h1` - Título principal
- `typography.heading.h2` - Subtítulo
- `typography.heading.h3` - Título de seção
- `typography.heading.h4` - Título menor

#### Body Text
- `typography.body.default` - Texto padrão
- `typography.body.small` - Texto pequeno
- `typography.body.tiny` - Texto muito pequeno

#### KPI Cards
- `typography.kpi.title` - Título do KPI
- `typography.kpi.value` - Valor do KPI
- `typography.kpi.subtitle` - Subtítulo do KPI

#### Tables
- `typography.table.header` - Cabeçalho de tabela
- `typography.table.cell` - Célula de tabela
- `typography.table.small` - Texto pequeno em tabela

#### Buttons
- `typography.button.default` - Texto padrão de botão
- `typography.button.small` - Texto pequeno de botão

#### Badges
- `typography.badge.default` - Badge padrão
- `typography.badge.small` - Badge pequeno

#### Forms
- `typography.form.label` - Label de formulário
- `typography.form.input` - Input de formulário
- `typography.form.helper` - Texto de ajuda
- `typography.form.error` - Mensagem de erro

#### Navigation
- `typography.nav.default` - Navegação padrão
- `typography.nav.breadcrumb` - Breadcrumb
- `typography.nav.sidebar` - Sidebar

#### Modals
- `typography.modal.title` - Título de modal
- `typography.modal.description` - Descrição de modal

#### Feedback
- `typography.feedback.tooltip` - Tooltip
- `typography.feedback.toast` - Toast notification

#### Charts
- `typography.chart.label` - Label de gráfico
- `typography.chart.value` - Valor de gráfico

#### Select/Dropdown
- `typography.select.default` - Select padrão
- `typography.select.item` - Item de dropdown

#### Avatar
- `typography.avatar.default` - Avatar padrão
- `typography.avatar.small` - Avatar pequeno

#### Font Weights
- `typography.weight.normal` - Peso normal (400)
- `typography.weight.medium` - Peso médio (500)
- `typography.weight.semibold` - Semi-bold (600)
- `typography.weight.bold` - Bold (700)

### Gradients
- `gradients.brand` - Gradiente da marca (Rosa → Azul → Verde)
- `gradients.action` - Gradiente de ação (Cyan → Azul → Rosa)

### Sizes

#### Button Sizes
- `sizes.button.sm` - Botão pequeno
- `sizes.button.md` - Botão médio
- `sizes.button.lg` - Botão grande

#### Input Sizes
- `sizes.input.sm` - Input pequeno
- `sizes.input.md` - Input médio
- `sizes.input.lg` - Input grande

#### Icon Sizes
- `sizes.icon.xs` - Ícone extra pequeno
- `sizes.icon.sm` - Ícone pequeno
- `sizes.icon.md` - Ícone médio
- `sizes.icon.lg` - Ícone grande

### Spacing
- `spacing.container.sm/md/lg` - Padding de containers
- `spacing.gap.xs/sm/md/lg` - Gap entre elementos
- `spacing.section.sm/md/lg` - Espaçamento de seções

### Borders
- `borders.default` - Borda padrão
- `borders.emphasis` - Borda com ênfase
- `borders.input` - Borda de input
- `borders.dark` - Borda escura

### Transitions
- `transitions.fast` - Transição rápida (150ms)
- `transitions.normal` - Transição normal (200ms)
- `transitions.slow` - Transição lenta (300ms)

## Princípios

1. **Sempre use tokens** - Não use classes hardcoded como `text-sm`, use `typography.body.default`
2. **Type-safety** - Todos os tokens têm types TypeScript
3. **Responsivo** - Tokens de tipografia são responsivos por padrão (mobile/desktop)
4. **Consistência** - Use o mesmo token para casos de uso similares
