# Componentes de Gráficos

## ChartAreaInteractive

Gráfico de área interativo com seleção de período e legenda.

### Uso Básico

```tsx
import { ChartAreaInteractive } from '@/components/charts/ChartAreaInteractive'

export default function Dashboard() {
  return (
    <div className="p-6">
      <ChartAreaInteractive />
    </div>
  )
}
```

### Uso com Dados Customizados

```tsx
import { ChartAreaInteractive } from '@/components/charts/ChartAreaInteractive'

const meusDados = [
  { date: '2024-01-01', desktop: 100, mobile: 50 },
  { date: '2024-01-02', desktop: 120, mobile: 60 },
  // ... mais dados
]

export default function Dashboard() {
  return (
    <ChartAreaInteractive
      title="Acessos ao Sistema"
      description="Visualização de acessos por dispositivo"
      data={meusDados}
    />
  )
}
```

### Uso com Config Customizada

```tsx
import { ChartAreaInteractive } from '@/components/charts/ChartAreaInteractive'
import type { ChartConfig } from '@/components/ui/Chart'

const configCustomizada = {
  visitors: {
    label: 'Total de Visitantes',
  },
  desktop: {
    label: 'Computador',
    color: 'hsl(var(--chart-3))', // Verde Genesis
  },
  mobile: {
    label: 'Celular',
    color: 'hsl(var(--chart-1))', // Roxo
  },
} satisfies ChartConfig

export default function Dashboard() {
  return (
    <ChartAreaInteractive
      config={configCustomizada}
    />
  )
}
```

### Uso com Períodos Customizados

```tsx
import { ChartAreaInteractive } from '@/components/charts/ChartAreaInteractive'

const periodosCustomizados = [
  { value: '7d', label: 'Últimos 7 dias', days: 7 },
  { value: '15d', label: 'Últimos 15 dias', days: 15 },
  { value: '30d', label: 'Último mês', days: 30 },
]

export default function Dashboard() {
  return (
    <ChartAreaInteractive
      timeRangeOptions={periodosCustomizados}
    />
  )
}
```

### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `title` | `string` | `"Gráfico de Área - Interativo"` | Título do card |
| `description` | `string` | `"Mostrando visitantes totais nos últimos 3 meses"` | Descrição do card |
| `data` | `Array<{date: string, desktop: number, mobile: number}>` | `chartData` interno | Dados do gráfico |
| `config` | `ChartConfig` | Config padrão | Configuração de labels e cores |
| `timeRangeOptions` | `Array<{value: string, label: string, days: number}>` | 30d, 60d, 90d | Opções de período |

### Cores Disponíveis

As cores dos gráficos estão definidas no design system (`/src/index.css`):

- `--chart-1`: Purple (#8e47db)
- `--chart-2`: Blue (#3b82f6)
- `--chart-3`: Green (#22c55e) - Cor primária Genesis
- `--chart-4`: Yellow (#fbbf24)
- `--chart-5`: Red (#ef4444)

Use como: `color: 'hsl(var(--chart-1))'`

### Acessibilidade

- ✅ Labels ARIA apropriados no Select
- ✅ Navegação por teclado
- ✅ Tooltip acessível
- ✅ Contraste adequado de cores
- ✅ Textos descritivos

### Responsividade

- Mobile: Gráfico com altura de 250px, padding reduzido
- Desktop: Gráfico mantém proporção, padding completo
- Layout flexível que se adapta ao container pai
