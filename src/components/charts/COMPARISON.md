# Comparação: HashrateChart vs ChartAreaInteractive

Este documento explica as diferenças entre os dois componentes de gráfico de área disponíveis no projeto.

## HashrateChart (Existente)

### Características
- 📊 **Gráfico específico** para exibir dados de hashrate
- 🎨 **Cores fixas** definidas internamente
- 🔧 **Customização limitada** aos props específicos
- 📈 **Três linhas de dados**: hashrate atual, média 1h, média 24h
- 🎯 **Propósito único**: Monitoramento de hashrate em pools de mineração

### Quando Usar
✅ Para exibir dados de hashrate de pools
✅ Quando precisa das três métricas específicas (atual, 1h, 24h)
✅ Dashboard de mineração/pool stats

### Exemplo de Uso
```tsx
import { HashrateChart } from '@/components/charts'

<HashrateChart
  data={hashrateData}
  period="24h"
  showLegend={true}
  height={300}
/>
```

### Props
- `data`: Array de HashrateChartPoint
- `period`: '1h' | '6h' | '24h' | '7d'
- `loading`: boolean (opcional)
- `showLegend`: boolean (opcional)
- `height`: number (opcional)

### Prós
✅ Otimizado para caso de uso específico (hashrate)
✅ Formatação automática de hashrate (K, M, G, T, P, E)
✅ Tooltip customizado com labels específicos
✅ Estados de loading e empty tratados

### Contras
❌ Não é reutilizável para outros tipos de dados
❌ Cores fixas, não seguem tematização
❌ Estrutura de dados fixa (hashrate, hashrate1h, hashrate1d)

---

## ChartAreaInteractive (Novo - shadcn/ui)

### Características
- 🎨 **Totalmente customizável** via props
- 🌈 **Usa design system** (variáveis CSS)
- 🔄 **Reutilizável** para qualquer tipo de dado
- 🎯 **Genérico**: Desktop vs Mobile (mas pode ser adaptado)
- 📅 **Seletor de período** interativo built-in
- 🎨 **Temas**: Suporta light/dark mode
- ♿ **Acessível**: ARIA, navegação por teclado

### Quando Usar
✅ Gráficos genéricos (vendas, acessos, conversões, etc.)
✅ Quando precisa de filtro de período interativo
✅ Quando quer consistência visual com shadcn/ui
✅ Novos gráficos que seguem o design system

### Exemplo de Uso
```tsx
import { ChartAreaInteractive } from '@/components/charts'

<ChartAreaInteractive
  title="Visitantes"
  description="Últimos 90 dias"
  data={visitorsData}
  config={chartConfig}
  timeRangeOptions={[
    { value: '30d', label: 'Últimos 30 dias', days: 30 },
    { value: '90d', label: 'Últimos 90 dias', days: 90 },
  ]}
/>
```

### Props
- `title`: string (opcional)
- `description`: string (opcional)
- `data`: Array<{ date, desktop, mobile }> (opcional)
- `config`: ChartConfig (opcional)
- `timeRangeOptions`: Array (opcional)

### Prós
✅ Altamente customizável
✅ Integrado com design system
✅ Filtro de período built-in
✅ Tooltip formatado em pt-BR
✅ Gradientes suaves
✅ Temas light/dark
✅ Componente shadcn/ui oficial

### Contras
❌ Requer adaptação dos dados para o formato esperado
❌ Não tem formatação específica de hashrate
❌ Mais genérico, menos otimizado para caso específico

---

## Comparação Lado a Lado

| Característica | HashrateChart | ChartAreaInteractive |
|----------------|---------------|----------------------|
| **Propósito** | Específico (hashrate) | Genérico (qualquer dado) |
| **Customização** | Limitada | Total |
| **Design System** | Cores fixas | Variáveis CSS |
| **Filtro de Período** | ❌ (via props externos) | ✅ (built-in) |
| **Temas** | ❌ | ✅ (light/dark) |
| **Acessibilidade** | Básica | Completa (ARIA) |
| **Tooltip** | Customizado | shadcn/ui padrão |
| **Legenda** | Customizada | shadcn/ui padrão |
| **Wrapper** | ResponsiveContainer direto | ChartContainer (shadcn) |
| **Framework** | Recharts puro | Recharts + shadcn/ui |

---

## Quando Migrar?

### Mantenha HashrateChart se:
- Está funcionando perfeitamente
- É usado em contexto específico de pool stats
- Não precisa de customização de cores/tema
- Formatação de hashrate é essencial

### Use ChartAreaInteractive para:
- Novos gráficos genéricos
- Dashboards que não sejam de mineração
- Quando precisa de consistência visual
- Quando quer filtro de período interativo
- Quando planeja adicionar temas light/dark

---

## Migração (Se Necessário)

Para migrar `HashrateChart` para usar o novo wrapper shadcn/ui:

```tsx
// Antes (HashrateChart)
<HashrateChart
  data={hashrateData}
  period="24h"
  showLegend={true}
/>

// Depois (ChartAreaInteractive adaptado)
<ChartAreaInteractive
  title="Hashrate"
  description="Monitoramento em tempo real"
  data={hashrateData.map(d => ({
    date: d.time,
    desktop: d.hashrate,
    mobile: d.hashrate1h,
  }))}
  config={{
    visitors: { label: 'Hashrate' },
    desktop: { label: 'Atual', color: 'hsl(var(--chart-2))' },
    mobile: { label: 'Média 1h', color: 'hsl(var(--chart-1))' },
  }}
/>
```

**Nota:** Isso perde a formatação específica de hashrate. É melhor manter HashrateChart como está.

---

## Recomendação

**NÃO migre o HashrateChart!** Ele está otimizado para o caso de uso específico.

**USE ChartAreaInteractive para:**
- Novos dashboards
- Gráficos genéricos
- Analytics
- Estatísticas gerais
- Qualquer dado que não seja hashrate

**Ambos podem coexistir perfeitamente no projeto!**

---

## Estrutura Atual

```
src/components/charts/
├── HashrateChart.tsx          ← Específico para hashrate (MANTER)
├── ChartAreaInteractive.tsx   ← Genérico shadcn/ui (NOVO)
├── index.ts                   ← Exporta ambos
├── README.md                  ← Docs ChartAreaInteractive
├── EXAMPLE.tsx                ← Exemplos ChartAreaInteractive
└── COMPARISON.md              ← Este arquivo
```

---

## Próximos Passos Sugeridos

1. **Manter HashrateChart** para pool stats
2. **Usar ChartAreaInteractive** para novos dashboards
3. **Criar variantes** de ChartAreaInteractive se necessário:
   - ChartBarInteractive (gráfico de barras)
   - ChartLineInteractive (gráfico de linhas)
   - ChartPieInteractive (gráfico de pizza)
4. **Padronizar** novos gráficos usando o wrapper shadcn/ui

---

**Conclusão:** Ambos os componentes têm seus propósitos. Use cada um para o que foi otimizado!
