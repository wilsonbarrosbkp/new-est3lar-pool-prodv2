/**
 * =============================================================================
 * DESIGN SYSTEM TOKENS - Genesis Pool v1
 *
 * Tokens para uso em codigo TypeScript/JavaScript.
 * Para cores CSS, use as classes Tailwind geradas pelo @theme no index.css
 *
 * Uso:
 *   import { gradients, sizes } from '@/design-system/tokens'
 *   className={`bg-gradient-to-r ${gradients.brand}`}
 * =============================================================================
 */

// =============================================================================
// GRADIENTS
// Gradientes para uso em className com template literals
// =============================================================================

export const gradients = {
  /**
   * Gradiente principal da marca Genesis Pool
   * Verde escuro -> Verde médio -> Verde claro
   * Uso: botoes ativos, badges, destaques
   */
  brand: 'from-[#123326] via-[#166534] to-[#22c55e]',

  /**
   * Gradiente para botoes de acao principal
   * Verde claro -> Verde médio -> Verde escuro
   */
  action: 'from-[#4ade80] via-[#22c55e] to-[#166534]',
} as const

// =============================================================================
// SIZES - Tamanhos padrao para componentes
// =============================================================================

export const sizes = {
  /** Tamanhos de botao */
  button: {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
    icon: {
      sm: 'size-8',
      md: 'size-10',
      lg: 'size-12',
    },
  },

  /** Tamanhos de input */
  input: {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  },

  /** Tamanhos de avatar */
  avatar: {
    sm: 'size-6',
    md: 'size-8',
    lg: 'size-10',
    xl: 'size-12',
  },

  /** Tamanhos de icone */
  icon: {
    xs: 'size-3',
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
  },
} as const

// =============================================================================
// SPACING - Espacamentos padrao
// =============================================================================

export const spacing = {
  /** Padding de containers */
  container: {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  },

  /** Gap entre elementos */
  gap: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  },

  /** Espacamento de secoes */
  section: {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
  },
} as const

// =============================================================================
// SHADOWS - Sombras padrao (para uso inline quando necessario)
// =============================================================================

export const shadows = {
  /** Sombra sutil */
  sm: '0 1px 1px rgba(0,0,0,0.35)',

  /** Sombra media */
  md: '0 2px 10px rgba(0,0,0,0.40)',

  /** Sombra para botoes com gradiente */
  button: '0 1px 0 0 rgba(0,0,0,0.25)',
} as const

// =============================================================================
// BORDERS - Bordas padrao
// =============================================================================

export const borders = {
  /** Borda padrao sutil */
  default: 'border border-border',

  /** Borda com enfase */
  emphasis: 'border border-border-emphasis',

  /** Borda para inputs */
  input: 'border border-input',

  /** Borda escura (para elementos com gradiente) */
  dark: 'border border-black/25',
} as const

// =============================================================================
// TRANSITIONS - Transicoes padrao
// =============================================================================

export const transitions = {
  /** Transicao rapida (hover, focus) */
  fast: 'transition-all duration-150 ease-out',

  /** Transicao normal */
  normal: 'transition-all duration-200 ease-out',

  /** Transicao lenta (modais, paineis) */
  slow: 'transition-all duration-300 ease-out',
} as const

// =============================================================================
// TYPOGRAPHY - Tokens de tipografia (espelham valores do index.css)
// =============================================================================

export const typography = {
  /** Classes para headings */
  heading: {
    h1: 'text-[length:var(--font-size-h1)] sm:text-[length:var(--font-size-h1-sm)]',
    h2: 'text-[length:var(--font-size-h2)] sm:text-[length:var(--font-size-h2-sm)]',
    h3: 'text-[length:var(--font-size-h3)] sm:text-[length:var(--font-size-h3-sm)]',
    h4: 'text-[length:var(--font-size-h4)] sm:text-[length:var(--font-size-h4-sm)]',
  },

  /** Classes para body text */
  body: {
    default: 'text-[length:var(--font-size-body)] sm:text-[length:var(--font-size-body-sm)]',
    small: 'text-[length:var(--font-size-small)] sm:text-[length:var(--font-size-small-sm)]',
    tiny: 'text-[length:var(--font-size-tiny)] sm:text-[length:var(--font-size-tiny-sm)]',
  },

  /** Classes para KPI cards */
  kpi: {
    title: 'text-[length:var(--font-size-kpi-title)] sm:text-[length:var(--font-size-kpi-title-sm)]',
    value: 'text-[length:var(--font-size-kpi-value)] sm:text-[length:var(--font-size-kpi-value-sm)]',
    subtitle: 'text-[length:var(--font-size-kpi-subtitle)] sm:text-[length:var(--font-size-kpi-subtitle-sm)]',
  },

  /** Classes para tables */
  table: {
    header: 'text-[length:var(--font-size-table-header)] sm:text-[length:var(--font-size-table-header-sm)]',
    cell: 'text-[length:var(--font-size-table-cell)] sm:text-[length:var(--font-size-table-cell-sm)]',
    small: 'text-[length:var(--font-size-table-small)] sm:text-[length:var(--font-size-table-small-sm)]',
  },

  /** Classes para buttons */
  button: {
    default: 'text-[length:var(--font-size-button)] sm:text-[length:var(--font-size-button-sm)]',
    small: 'text-[length:var(--font-size-button-small)] sm:text-[length:var(--font-size-button-small-sm)]',
  },

  /** Classes para badges */
  badge: {
    default: 'text-[length:var(--font-size-badge)] sm:text-[length:var(--font-size-badge-sm)]',
    small: 'text-[length:var(--font-size-badge-small)] sm:text-[length:var(--font-size-badge-small-sm)]',
  },

  /** Classes para forms */
  form: {
    label: 'text-[length:var(--font-size-label)] sm:text-[length:var(--font-size-label-sm)]',
    input: 'text-[length:var(--font-size-input)] sm:text-[length:var(--font-size-input-sm)]',
    placeholder: 'text-[length:var(--font-size-placeholder)] sm:text-[length:var(--font-size-placeholder-sm)]',
    helper: 'text-[length:var(--font-size-helper)] sm:text-[length:var(--font-size-helper-sm)]',
    error: 'text-[length:var(--font-size-error)] sm:text-[length:var(--font-size-error-sm)]',
  },

  /** Classes para navigation */
  nav: {
    default: 'text-[length:var(--font-size-nav)] sm:text-[length:var(--font-size-nav-sm)]',
    breadcrumb: 'text-[length:var(--font-size-breadcrumb)] sm:text-[length:var(--font-size-breadcrumb-sm)]',
    sidebar: 'text-[length:var(--font-size-sidebar)] sm:text-[length:var(--font-size-sidebar-sm)]',
  },

  /** Classes para modals */
  modal: {
    title: 'text-[length:var(--font-size-modal-title)] sm:text-[length:var(--font-size-modal-title-sm)]',
    description: 'text-[length:var(--font-size-modal-description)] sm:text-[length:var(--font-size-modal-description-sm)]',
  },

  /** Classes para tooltips/toasts */
  feedback: {
    tooltip: 'text-[length:var(--font-size-tooltip)] sm:text-[length:var(--font-size-tooltip-sm)]',
    toast: 'text-[length:var(--font-size-toast)] sm:text-[length:var(--font-size-toast-sm)]',
  },

  /** Classes para charts */
  chart: {
    label: 'text-[length:var(--font-size-chart-label)] sm:text-[length:var(--font-size-chart-label-sm)]',
    value: 'text-[length:var(--font-size-chart-value)] sm:text-[length:var(--font-size-chart-value-sm)]',
  },

  /** Classes para select/dropdown */
  select: {
    default: 'text-[length:var(--font-size-select)] sm:text-[length:var(--font-size-select-sm)]',
    item: 'text-[length:var(--font-size-dropdown-item)] sm:text-[length:var(--font-size-dropdown-item-sm)]',
  },

  /** Classes para avatar */
  avatar: {
    default: 'text-[length:var(--font-size-avatar)] sm:text-[length:var(--font-size-avatar-sm)]',
    small: 'text-[length:var(--font-size-avatar-small)] sm:text-[length:var(--font-size-avatar-small-sm)]',
  },

  /** Classes para card components */
  card: {
    title: 'text-[length:var(--font-size-card-title)] sm:text-[length:var(--font-size-card-title-sm)]',
    description: 'text-[length:var(--font-size-card-description)] sm:text-[length:var(--font-size-card-description-sm)]',
  },

  /** Font weights */
  weight: {
    normal: 'font-normal',    // 400
    medium: 'font-medium',    // 500
    semibold: 'font-semibold', // 600
    bold: 'font-bold',        // 700
  },
} as const

// =============================================================================
// COMPONENT STYLES - Estilos compostos para componentes comuns
// =============================================================================

export const componentStyles = {
  /** Estilo para item ativo no sidebar/menu */
  activeItem: `bg-gradient-to-r ${gradients.brand} text-white ${borders.dark} shadow-[${shadows.button}]`,

  /** Estilo para botao primario com gradiente */
  gradientButton: `bg-gradient-to-r ${gradients.action} text-white ${borders.dark} shadow-[${shadows.button}] hover:opacity-90`,

  /** Estilo para card padrao */
  card: 'bg-card text-card-foreground rounded-md border border-border',

  /** Estilo para input padrao */
  input: 'bg-background border border-input rounded-md text-text-primary placeholder:text-text-secondary',

  /** Estilo para hover em menus */
  menuHover: 'hover:bg-surface hover:text-text-primary',
} as const

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type GradientKey = keyof typeof gradients
export type ButtonSize = keyof typeof sizes.button
export type InputSize = keyof typeof sizes.input
export type AvatarSize = keyof typeof sizes.avatar
export type IconSize = keyof typeof sizes.icon

// Typography types
export type TypographyHeading = keyof typeof typography.heading
export type TypographyBody = keyof typeof typography.body
export type TypographyKpi = keyof typeof typography.kpi
export type TypographyTable = keyof typeof typography.table
export type TypographyButton = keyof typeof typography.button
export type TypographyBadge = keyof typeof typography.badge
export type TypographyForm = keyof typeof typography.form
export type TypographyNav = keyof typeof typography.nav
export type TypographyModal = keyof typeof typography.modal
export type TypographyFeedback = keyof typeof typography.feedback
export type TypographyChart = keyof typeof typography.chart
export type TypographySelect = keyof typeof typography.select

/**
 * Estilos para componentes que precisam de objetos JavaScript (ex: Recharts)
 * Usam as mesmas variáveis CSS do design system
 */
export const chartStyles = {
  /** Cores para eixos e grid */
  axis: {
    stroke: '#71717a', // text-secondary equivalente
    fontSize: '12px',
    fontSizeSmall: 11,  // Para gráficos com mais dados (Recharts usa number)
  },
  grid: {
    stroke: '#27272a', // border equivalente
  },
  tooltip: {
    backgroundColor: '#18181b', // surface equivalente
    border: '1px solid #27272a',
    borderRadius: '6px',
    color: '#ffffff',
  },
  /** Paleta de cores para linhas de gráficos */
  lines: {
    primary: '#3b82f6',   // blue-500
    secondary: '#8b5cf6', // violet-500
    tertiary: '#06b6d4',  // cyan-500
    success: '#10b981',   // green-500
    warning: '#f59e0b',   // amber-500
    error: '#ef4444',     // red-500
  },
} as const
export type TypographyAvatar = keyof typeof typography.avatar
export type TypographyCard = keyof typeof typography.card
export type FontWeight = keyof typeof typography.weight
