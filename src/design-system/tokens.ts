/**
 * =============================================================================
 * DESIGN SYSTEM TOKENS - Est3lar Pool v2
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
   * Gradiente principal da marca Est3lar
   * Rosa -> Azul -> Verde
   * Uso: botoes ativos, badges, destaques
   */
  brand: 'from-[#C26ECB] via-[#3352AB] to-[#6CC997]',

  /**
   * Gradiente para botoes de acao principal
   * Cyan -> Azul -> Rosa
   */
  action: 'from-[#88FBDD] via-[#4067D6] to-[#F288FD]',
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
