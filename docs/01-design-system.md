# Design System - Est3lar Pool v2

## Paleta de Cores

### Tema Claro (Light Mode)

#### Cores Primárias
- **Primary**: `#9C4BEB` (Roxo vibrante)
- **Primary Light**: `#B268F5` (Roxo claro)
- **Primary Dark**: `#4E7ADB` (Azul profundo)
- **Primary Foreground**: `#FFFFFF` (Branco para texto sobre primary)

#### Cores Secundárias
- **Secondary**: `#4C77E6` (Azul médio)
- **Secondary Light**: `#57D9B0` (Verde-água/Turquesa)
- **Secondary Dark**: `#2B3541` (Cinza escuro azulado)
- **Secondary Foreground**: `#FFFFFF` (Branco para texto sobre secondary)

#### Cores de Superfície
- **Background**: `#E3E3E3` (Cinza muito claro - fundo geral)
- **Card**: `#C7CAD0` (Cinza médio-claro - cartões/containers)
- **Surface**: `#A6ABB2` (Cinza médio - superfícies elevadas)
- **Border**: `#525660` (Cinza escuro - bordas e divisores)

#### Cores de Texto
- **Text Primary**: `#232832` (Cinza muito escuro - texto principal)
- **Text Secondary**: `#2C303A` (Cinza escuro - texto secundário)
- **Text Inverse**: `#FFFFFF` (Branco - texto em fundos escuros)

---

### Tema Escuro (Dark Mode) - Classe `.dark`

#### Cores Primárias
- **Primary**: `#B268F5` (Roxo mais claro que no light)
- **Primary Light**: `#9C4BEB` (Roxo invertido)
- **Primary Dark**: `#4E7ADB` (Azul mantido)
- **Primary Foreground**: `#1C232E` (Texto escuro sobre primary)

#### Cores Secundárias
- **Secondary**: `#57D9B0` (Verde-água - destaque)
- **Secondary Light**: `#4C77E6` (Azul)
- **Secondary Dark**: `#2B3541` (Cinza escuro mantido)
- **Secondary Foreground**: `#1C232E` (Texto escuro sobre secondary)

#### Cores de Superfície
- **Background**: `#1C232E` (Azul muito escuro - fundo geral)
- **Card**: `#2B3541` (Cinza-azul escuro - cartões)
- **Surface**: `#2C303A` (Cinza escuro - superfícies)
- **Border**: `#525660` (Cinza médio - bordas)

#### Cores de Texto
- **Text Primary**: `#E3E3E3` (Cinza claro - texto principal)
- **Text Secondary**: `#A6ABB2` (Cinza médio - texto secundário)
- **Text Inverse**: `#1C232E` (Escuro - texto em fundos claros)

---

## Tipografia

### Fontes
- **Principal**: `Inter` (sans-serif)
  - Fonte moderna, alta legibilidade
  - Ótima para dashboards e interfaces
  - Suporta pesos: 300, 400, 500, 600, 700

- **Monospace**: `JetBrains Mono`
  - Para valores numéricos (hashrate, BTC values)
  - Endereços de wallet
  - Códigos e logs

### Escala Tipográfica

| Nome | Size | Line Height | Uso |
|------|------|-------------|-----|
| `text-xs` | 0.75rem (12px) | 1rem (16px) | Labels, badges |
| `text-sm` | 0.875rem (14px) | 1.25rem (20px) | Body text secundário |
| `text-base` | 1rem (16px) | 1.5rem (24px) | Body text principal |
| `text-lg` | 1.125rem (18px) | 1.75rem (28px) | Subtítulos |
| `text-xl` | 1.25rem (20px) | 1.75rem (28px) | Títulos de seção |
| `text-2xl` | 1.5rem (24px) | 2rem (32px) | Títulos de página |
| `text-3xl` | 1.875rem (30px) | 2.25rem (36px) | Hero titles |

### Pesos de Fonte
- **Light (300)**: Textos grandes e decorativos
- **Regular (400)**: Body text padrão
- **Medium (500)**: Ênfase sutil
- **Semibold (600)**: Títulos e labels importantes
- **Bold (700)**: Destaque forte, CTAs

---

## Espaçamento

### Escala de Espaçamento (Tailwind)
```
1  = 0.25rem (4px)
2  = 0.5rem  (8px)
3  = 0.75rem (12px)
4  = 1rem    (16px)
5  = 1.25rem (20px)
6  = 1.5rem  (24px)
8  = 2rem    (32px)
10 = 2.5rem  (40px)
12 = 3rem    (48px)
16 = 4rem    (64px)
```

### Uso Comum
- **Gap entre elementos**: `gap-4` (16px)
- **Padding de card**: `p-6` (24px)
- **Margem entre seções**: `mb-8` (32px)
- **Padding de botão**: `px-4 py-2` (16px horizontal, 8px vertical)

---

## Border Radius

```css
--radius-sm: 0.375rem  (6px)   /* Inputs, badges */
--radius-md: 0.5rem    (8px)   /* Botões, cards pequenos */
--radius-lg: 0.75rem   (12px)  /* Cards, modais */
--radius-xl: 1rem      (16px)  /* Containers grandes */
--radius-2xl: 1.5rem   (24px)  /* Elementos decorativos */
--radius-full: 9999px          /* Avatares, pills */
```

**Padrão do projeto**: `--radius-md` (8px)

---

## Sombras (Shadows)

### Light Mode
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
             0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
             0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
             0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

### Dark Mode
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4),
             0 2px 4px -1px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5),
             0 4px 6px -2px rgba(0, 0, 0, 0.4);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.6),
             0 10px 10px -5px rgba(0, 0, 0, 0.5);
```

---

## Cores Semânticas (Status)

### Success (Verde)
```css
--success: #10B981;
--success-light: #34D399;
--success-dark: #059669;
```

### Warning (Amarelo/Laranja)
```css
--warning: #F59E0B;
--warning-light: #FBBF24;
--warning-dark: #D97706;
```

### Error (Vermelho)
```css
--error: #EF4444;
--error-light: #F87171;
--error-dark: #DC2626;
```

### Info (Azul)
```css
--info: #3B82F6;
--info-light: #60A5FA;
--info-dark: #2563EB;
```

---

## Breakpoints Responsivos

```css
/* Mobile first approach */
sm: '640px'   /* Tablet portrait */
md: '768px'   /* Tablet landscape */
lg: '1024px'  /* Desktop */
xl: '1280px'  /* Large desktop */
2xl: '1536px' /* Extra large desktop */
```

---

## Implementação CSS

### Arquivo: `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Tema claro (padrão) */
:root {
  /* Cores primárias */
  --primary: #9C4BEB;
  --primary-light: #B268F5;
  --primary-dark: #4E7ADB;
  --primary-foreground: #FFFFFF;

  /* Cores secundárias */
  --secondary: #4C77E6;
  --secondary-light: #57D9B0;
  --secondary-dark: #2B3541;
  --secondary-foreground: #FFFFFF;

  /* Superfícies */
  --background: #E3E3E3;
  --card: #C7CAD0;
  --surface: #A6ABB2;
  --border: #525660;

  /* Texto */
  --text-primary: #232832;
  --text-secondary: #2C303A;
  --text-inverse: #FFFFFF;

  /* Semânticas */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;

  /* Raio de borda padrão */
  --radius: 0.5rem;
}

/* Tema escuro */
.dark {
  --primary: #B268F5;
  --primary-light: #9C4BEB;
  --primary-dark: #4E7ADB;
  --primary-foreground: #1C232E;

  --secondary: #57D9B0;
  --secondary-light: #4C77E6;
  --secondary-dark: #2B3541;
  --secondary-foreground: #1C232E;

  --background: #1C232E;
  --card: #2B3541;
  --surface: #2C303A;
  --border: #525660;

  --text-primary: #E3E3E3;
  --text-secondary: #A6ABB2;
  --text-inverse: #1C232E;
}

/* Base styles */
@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-text-primary;
    font-family: 'Inter', sans-serif;
  }
}
```

### Tailwind Config: `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          light: 'var(--primary-light)',
          dark: 'var(--primary-dark)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          light: 'var(--secondary-light)',
          dark: 'var(--secondary-dark)',
          foreground: 'var(--secondary-foreground)',
        },
        background: 'var(--background)',
        card: 'var(--card)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          inverse: 'var(--text-inverse)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        info: 'var(--info)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

---

## Exemplos de Uso

### Botão Primário
```tsx
<button className="bg-primary text-primary-foreground hover:bg-primary-light px-4 py-2 rounded-md font-medium transition-colors">
  Entrar
</button>
```

### Card
```tsx
<div className="bg-card border border-border rounded-lg p-6 shadow-md">
  <h2 className="text-xl font-semibold text-text-primary mb-2">Título</h2>
  <p className="text-text-secondary">Conteúdo do card</p>
</div>
```

### Input
```tsx
<input
  type="text"
  className="bg-surface text-text-primary border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
  placeholder="Digite aqui..."
/>
```

### Badge de Status
```tsx
<span className="bg-success text-white text-xs font-medium px-2 py-1 rounded-full">
  Online
</span>
```

---

## Toggle de Tema (Dark/Light)

Implementação usando `next-themes` ou contexto próprio:

```tsx
// Exemplo de toggle simples
const toggleTheme = () => {
  document.documentElement.classList.toggle('dark')
}

// Componente Toggle
<button onClick={toggleTheme} className="p-2 rounded-md bg-surface">
  {isDark ? <Sun size={20} /> : <Moon size={20} />}
</button>
```

---

## Fases de Implementação

**Fase 1: Setup Inicial**
- Instalar fontes (Inter + JetBrains Mono) via Google Fonts ou local
- Criar `src/index.css` com variáveis CSS
- Configurar `tailwind.config.js` com cores personalizadas

**Fase 2: Temas**
- Implementar toggle de tema dark/light
- Validar contraste de cores (acessibilidade WCAG AA)

**Fase 3: Componentes Base**
- Criar componentes base (Button, Input, Card) usando design tokens

---

## Preview de Paleta

### Light Mode
```
┌─────────────────────────────────────┐
│ Background: #E3E3E3                 │
│  ┌───────────────────────────────┐  │
│  │ Card: #C7CAD0                 │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │ Surface: #A6ABB2        │  │  │
│  │  │ Text: #232832           │  │  │
│  │  │ [Primary Button #9C4BEB]│  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Dark Mode
```
┌─────────────────────────────────────┐
│ Background: #1C232E                 │
│  ┌───────────────────────────────┐  │
│  │ Card: #2B3541                 │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │ Surface: #2C303A        │  │  │
│  │  │ Text: #E3E3E3           │  │  │
│  │  │ [Primary Button #B268F5]│  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

**Próxima fase**: Aplicar este design system na página de Login
