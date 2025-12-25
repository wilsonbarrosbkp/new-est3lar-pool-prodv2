import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { chartStyles,typography } from '@/design-system/tokens'
import { formatHashrate } from '@/lib/formatters'

import type { HashrateChartPoint, Period } from '@/hooks/use-pool-stats'

interface HashrateChartProps {
  data: HashrateChartPoint[]
  period: Period
  loading?: boolean
  showLegend?: boolean
  height?: number
}

// Cores do design system - Variações de verde Genesis Pool
const COLORS = {
  hashrate: '#22c55e', // green-500 - Atual (destaque)
  hashrate1h: '#4ade80', // green-400 - Média 1h
  grid: '#27272a', // zinc-800
  text: '#a1a1aa', // zinc-400
  background: '#18181b', // zinc-900
}

// Unidades de hashrate com limites claros
const HASHRATE_UNITS = [
  { unit: 'H/s', divisor: 1, minValue: 0 },
  { unit: 'KH/s', divisor: 1e3, minValue: 1e3 },
  { unit: 'MH/s', divisor: 1e6, minValue: 1e6 },
  { unit: 'GH/s', divisor: 1e9, minValue: 1e9 },
  { unit: 'TH/s', divisor: 1e12, minValue: 1e12 },
  { unit: 'PH/s', divisor: 1e15, minValue: 1e15 },
  { unit: 'EH/s', divisor: 1e18, minValue: 1e18 },
]

// Determina a unidade apropriada baseada no valor máximo
// Se max = 700 TH/s (7e14), retorna TH/s pois 7e14 < 1e15 (1 PH/s)
function getAppropriateUnit(maxValue: number) {
  if (maxValue === 0 || !isFinite(maxValue)) return HASHRATE_UNITS[0]

  // Encontrar a maior unidade onde o valor máximo ainda é >= 1 quando dividido
  for (let i = HASHRATE_UNITS.length - 1; i >= 0; i--) {
    const normalizedValue = maxValue / HASHRATE_UNITS[i].divisor
    // Se o valor normalizado é >= 1, esta é a unidade correta
    if (normalizedValue >= 1) {
      return HASHRATE_UNITS[i]
    }
  }
  return HASHRATE_UNITS[0]
}

// Tooltip customizado
function CustomTooltip({ active, payload, label, divisor = 1 }: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
  divisor?: number
}) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
      <p className={`${typography.chart.label} text-zinc-400 mb-2`}>{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className={`flex items-center gap-2 ${typography.chart.label}`}>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-zinc-300">
            {entry.dataKey === 'hashrate' && 'Atual: '}
            {entry.dataKey === 'hashrate1h' && '1h: '}
            <span className={`font-mono ${typography.weight.medium} text-white`}>
              {formatHashrate(entry.value * divisor)}
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}

// Legenda customizada
function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload) return null

  const labels: Record<string, string> = {
    hashrate: 'Hashrate Atual',
    hashrate1h: 'Média 1h',
  }

  return (
    <div className="flex items-center justify-center gap-6 mt-2">
      {payload.map((entry, index) => (
        <div key={index} className={`flex items-center gap-2 ${typography.chart.label}`}>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-zinc-400">{labels[entry.value] || entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function HashrateChart({
  data,
  period,
  loading = false,
  showLegend = true,
  height = 300,
}: HashrateChartProps) {
  // Calcular a unidade apropriada baseada no valor máximo
  const { unit, divisor, normalizedData, yDomain } = useMemo(() => {
    if (data.length === 0) {
      return {
        unit: 'H/s',
        divisor: 1,
        normalizedData: [],
        yDomain: [0, 100] as [number, number]
      }
    }

    // Usar apenas hashrate atual e 1h para determinar a unidade
    // hashrate_1d é excluído pois pode distorcer a escala (ex: 10 PH/s vs 500 TH/s)
    const primaryValues = data.flatMap((d) => [
      d.hashrate,
      d.hashrate1h,
    ])

    const maxValue = Math.max(...primaryValues)

    // Determinar unidade baseada no máximo
    const appropriateUnit = getAppropriateUnit(maxValue)

    // Normalizar dados para a unidade escolhida
    const normalized = data.map((d) => ({
      ...d,
      hashrate: d.hashrate / appropriateUnit.divisor,
      hashrate1h: d.hashrate1h / appropriateUnit.divisor,
      hashrate1d: d.hashrate1d / appropriateUnit.divisor,
    }))

    // Calcular domínio normalizado (apenas hashrate e 1h)
    const allNormalizedValues = normalized.flatMap((d) => [
      d.hashrate,
      d.hashrate1h,
    ])
    const normalizedMax = Math.max(...allNormalizedValues)
    const normalizedMin = Math.min(...allNormalizedValues.filter((v) => v > 0))

    // Escala linear com padding de 10%
    const padding = (normalizedMax - normalizedMin) * 0.1

    return {
      unit: appropriateUnit.unit,
      divisor: appropriateUnit.divisor,
      normalizedData: normalized,
      yDomain: [
        Math.max(0, normalizedMin - padding),
        normalizedMax + padding
      ] as [number, number]
    }
  }, [data])

  // Calcular valor de referência de 5 minutos atrás (para período 1m)
  const referenceValue5m = useMemo(() => {
    if (period !== '1m' || data.length === 0) return null

    const now = new Date()
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000)

    // Encontrar o ponto mais próximo de 5 minutos atrás
    const point5m = data.find((d) => {
      const pointTime = new Date(d.timestamp)
      return pointTime <= fiveMinAgo
    }) || data[0]

    if (!point5m) return null

    return point5m.hashrate / divisor
  }, [period, data, divisor])

  // Calcular intervalo de ticks baseado no período
  const tickInterval = useMemo(() => {
    switch (period) {
      case '1m':
        return 0 // mostrar todos os pontos
      case '5m':
        return 0 // mostrar todos os pontos
      case '15m':
        return 2 // mostrar a cada 2 pontos
      case '30m':
        return 5 // mostrar a cada 5 pontos
      case '1h':
        return 10 // 60 pontos / 10 = 6 labels
      case '6h':
        return 15 // 180 pontos / 15 = 12 labels
      case '24h':
        return 12 // 144 pontos / 12 = 12 labels
      case '7d':
        return 12 // 168 pontos / 12 = 14 labels
      default:
        return 10
    }
  }, [period])

  // Formata o tick do eixo Y
  const formatYAxisTick = (value: number): string => {
    if (value === 0) return '0'
    if (value < 1) return value.toFixed(2)
    if (value < 10) return value.toFixed(1)
    return value.toFixed(0)
  }

  if (loading) {
    return (
      <div
        className="flex items-center justify-center bg-zinc-900/50 rounded-lg animate-pulse"
        style={{ height }}
      >
        <div className="text-zinc-500">Carregando dados...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-zinc-900/50 rounded-lg"
        style={{ height }}
      >
        <div className="text-zinc-500 mb-2">Sem dados disponíveis</div>
        <div className={`${typography.body.tiny} text-zinc-600`}>
          Os dados aparecerão quando houver coletas
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={normalizedData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorHashrate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.hashrate} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.hashrate} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorHashrate1h" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.hashrate1h} stopOpacity={0.2} />
              <stop offset="95%" stopColor={COLORS.hashrate1h} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke={COLORS.grid}
            vertical={false}
          />

          <XAxis
            dataKey="time"
            tick={{ fill: COLORS.text, fontSize: chartStyles.axis.fontSizeSmall }}
            tickLine={{ stroke: COLORS.grid }}
            axisLine={{ stroke: COLORS.grid }}
            interval={tickInterval}
            minTickGap={40}
          />

          <YAxis
            tick={{ fill: COLORS.text, fontSize: chartStyles.axis.fontSizeSmall }}
            tickLine={{ stroke: COLORS.grid }}
            axisLine={{ stroke: COLORS.grid }}
            tickFormatter={formatYAxisTick}
            domain={yDomain}
            width={60}
            label={{
              value: unit,
              angle: -90,
              position: 'insideLeft',
              fill: COLORS.text,
              fontSize: chartStyles.axis.fontSizeSmall,
              dx: 10,
            }}
          />

          <Tooltip
            content={<CustomTooltip divisor={divisor} />}
          />

          {showLegend && <Legend content={<CustomLegend />} />}

          {/* Média 1h */}
          <Area
            type="monotone"
            dataKey="hashrate1h"
            stroke={COLORS.hashrate1h}
            strokeWidth={1.5}
            fill="url(#colorHashrate1h)"
            dot={false}
            activeDot={{ r: 4, fill: COLORS.hashrate1h }}
          />

          {/* Hashrate atual - destaque */}
          <Area
            type="monotone"
            dataKey="hashrate"
            stroke={COLORS.hashrate}
            strokeWidth={2}
            fill="url(#colorHashrate)"
            dot={false}
            activeDot={{ r: 5, fill: COLORS.hashrate }}
          />

          {/* Linha tracejada de referência - valor de 5 min atrás (apenas no período 1m) */}
          {period === '1m' && referenceValue5m !== null && (
            <ReferenceLine
              y={referenceValue5m}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `5min: ${referenceValue5m.toFixed(0)}`,
                fill: '#f59e0b',
                fontSize: 10,
                position: 'right',
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default HashrateChart
