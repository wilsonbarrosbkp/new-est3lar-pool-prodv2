/**
 * EXEMPLO DE USO - ChartAreaInteractive
 *
 * Este arquivo demonstra diferentes formas de usar o componente ChartAreaInteractive.
 * Copie e cole os exemplos conforme necessário.
 */

import { ChartAreaInteractive } from '@/components/charts/ChartAreaInteractive'
import type { ChartConfig } from '@/components/ui/Chart'

// =============================================================================
// EXEMPLO 1: Uso Básico (sem customizações)
// =============================================================================

export function ExemploBasico() {
  return (
    <div className="p-6">
      <ChartAreaInteractive />
    </div>
  )
}

// =============================================================================
// EXEMPLO 2: Com Dados Customizados
// =============================================================================

export function ExemploComDadosCustomizados() {
  const dadosDeVendas = [
    { date: '2024-01-01', desktop: 450, mobile: 320 },
    { date: '2024-01-02', desktop: 380, mobile: 280 },
    { date: '2024-01-03', desktop: 520, mobile: 420 },
    { date: '2024-01-04', desktop: 460, mobile: 380 },
    { date: '2024-01-05', desktop: 590, mobile: 510 },
    // ... adicione mais dados
  ]

  return (
    <div className="p-6">
      <ChartAreaInteractive
        title="Vendas por Plataforma"
        description="Acompanhe as vendas realizadas em cada plataforma"
        data={dadosDeVendas}
      />
    </div>
  )
}

// =============================================================================
// EXEMPLO 3: Com Config Customizada (Cores Genesis Pool)
// =============================================================================

export function ExemploComCoresCustomizadas() {
  const configGenesisPool = {
    visitors: {
      label: 'Total de Visitantes',
    },
    desktop: {
      label: 'Desktop',
      color: 'hsl(var(--chart-3))', // Verde Genesis (Primary)
    },
    mobile: {
      label: 'Mobile',
      color: 'hsl(var(--chart-2))', // Azul
    },
  } satisfies ChartConfig

  return (
    <div className="p-6">
      <ChartAreaInteractive
        title="Visitantes Únicos"
        description="Distribuição de acessos por tipo de dispositivo"
        config={configGenesisPool}
      />
    </div>
  )
}

// =============================================================================
// EXEMPLO 4: Com Períodos Customizados
// =============================================================================

export function ExemploComPeriodosCustomizados() {
  const periodosPersonalizados = [
    { value: '7d', label: 'Última semana', days: 7 },
    { value: '14d', label: 'Últimas 2 semanas', days: 14 },
    { value: '30d', label: 'Último mês', days: 30 },
    { value: '90d', label: 'Últimos 3 meses', days: 90 },
    { value: '180d', label: 'Últimos 6 meses', days: 180 },
  ]

  return (
    <div className="p-6">
      <ChartAreaInteractive
        title="Histórico de Acessos"
        description="Selecione o período desejado para análise"
        timeRangeOptions={periodosPersonalizados}
      />
    </div>
  )
}

// =============================================================================
// EXEMPLO 5: Grid com Múltiplos Gráficos
// =============================================================================

export function ExemploGridGraficos() {
  return (
    <div className="grid gap-6 p-6 md:grid-cols-2">
      <ChartAreaInteractive
        title="Acessos - Desktop vs Mobile"
        description="Comparativo de acessos por plataforma"
      />

      <ChartAreaInteractive
        title="Conversões - Desktop vs Mobile"
        description="Taxa de conversão por dispositivo"
      />

      <ChartAreaInteractive
        title="Tempo de Permanência"
        description="Média de tempo no site por plataforma"
      />

      <ChartAreaInteractive
        title="Taxa de Rejeição"
        description="Bounce rate por tipo de dispositivo"
      />
    </div>
  )
}

// =============================================================================
// EXEMPLO 6: Integração com API (dados dinâmicos)
// =============================================================================

export function ExemploComAPI() {
  // Exemplo de como você integraria com sua API
  // const { data, isLoading } = useQuery({
  //   queryKey: ['analytics'],
  //   queryFn: fetchAnalyticsData,
  // })

  // if (isLoading) return <div>Carregando...</div>

  const dadosDaAPI = [
    // Simulando dados vindos de uma API
    { date: '2024-12-01', desktop: 1200, mobile: 850 },
    { date: '2024-12-02', desktop: 1350, mobile: 920 },
    // ... mais dados
  ]

  return (
    <div className="p-6">
      <ChartAreaInteractive
        title="Analytics em Tempo Real"
        description="Dados atualizados automaticamente"
        data={dadosDaAPI}
      />
    </div>
  )
}

// =============================================================================
// EXEMPLO 7: Gráfico Full Width (Dashboard Principal)
// =============================================================================

export function ExemploDashboardPrincipal() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* KPI Cards (exemplo) */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Seus KPI cards aqui */}
      </div>

      {/* Gráfico Principal Full Width */}
      <ChartAreaInteractive
        title="Visão Geral de Acessos"
        description="Análise completa de visitantes por dispositivo nos últimos 90 dias"
      />

      {/* Outros componentes */}
    </div>
  )
}

// =============================================================================
// CORES DISPONÍVEIS NO DESIGN SYSTEM
// =============================================================================

/**
 * Paleta de cores para gráficos (definida em /src/index.css):
 *
 * --chart-1: 142 71 219   (Purple #8e47db)
 * --chart-2: 59 130 246   (Blue #3b82f6)
 * --chart-3: 34 197 94    (Green #22c55e - Primary Genesis)
 * --chart-4: 251 191 36   (Yellow #fbbf24)
 * --chart-5: 239 68 68    (Red #ef4444)
 *
 * Uso: color: 'hsl(var(--chart-1))'
 */
