import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatHashrate } from '@/lib/formatters'
import type { HashrateChartPoint, Period } from '@/hooks/use-pool-stats'

interface HashrateChartProps {
  data: HashrateChartPoint[]
  period: Period
  loading?: boolean
  showLegend?: boolean
  height?: number
}

// Cores do design system
const COLORS = {
  hashrate: '#3b82f6', // blue-500
  hashrate1h: '#8b5cf6', // violet-500
  hashrate1d: '#06b6d4', // cyan-500
  grid: '#27272a', // zinc-800
  text: '#a1a1aa', // zinc-400
  background: '#18181b', // zinc-900
}

// Formata valor do eixo Y para hashrate
function formatYAxis(value: number): string {
  if (value === 0) return '0'

  const units = ['', 'K', 'M', 'G', 'T', 'P', 'E']
  let unitIndex = 0
  let v = Math.abs(value)

  while (v >= 1000 && unitIndex < units.length - 1) {
    v /= 1000
    unitIndex++
  }

  return `${v.toFixed(0)}${units[unitIndex]}`
}

// Tooltip customizado
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
      <p className="text-sm text-zinc-400 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-zinc-300">
            {entry.dataKey === 'hashrate' && 'Atual: '}
            {entry.dataKey === 'hashrate1h' && '1h: '}
            {entry.dataKey === 'hashrate1d' && '24h: '}
            <span className="font-mono font-medium text-white">
              {formatHashrate(entry.value)}
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
    hashrate1d: 'Média 24h',
  }

  return (
    <div className="flex items-center justify-center gap-6 mt-2">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
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
  // Calcular domínio do eixo Y
  const yDomain = useMemo(() => {
    if (data.length === 0) return [0, 100]

    const allValues = data.flatMap((d) => [
      d.hashrate,
      d.hashrate1h,
      d.hashrate1d,
    ])

    const max = Math.max(...allValues)
    const min = Math.min(...allValues.filter((v) => v > 0))

    // Adicionar 10% de margem
    const padding = (max - min) * 0.1
    return [Math.max(0, min - padding), max + padding]
  }, [data])

  // Calcular intervalo de ticks baseado no período
  const tickInterval = useMemo(() => {
    switch (period) {
      case '1h':
        return 10 // A cada 10 pontos
      case '6h':
        return 12 // A cada 12 pontos (1 hora)
      case '24h':
        return 16 // A cada 16 pontos (4 horas)
      case '7d':
        return 24 // A cada 24 pontos (1 dia)
      default:
        return 12
    }
  }, [period])

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
        <div className="text-xs text-zinc-600">
          Os dados aparecerão quando houver coletas
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart
          data={data}
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
            <linearGradient id="colorHashrate1d" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.hashrate1d} stopOpacity={0.1} />
              <stop offset="95%" stopColor={COLORS.hashrate1d} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke={COLORS.grid}
            vertical={false}
          />

          <XAxis
            dataKey="time"
            tick={{ fill: COLORS.text, fontSize: 11 }}
            tickLine={{ stroke: COLORS.grid }}
            axisLine={{ stroke: COLORS.grid }}
            interval={tickInterval}
            minTickGap={40}
          />

          <YAxis
            tick={{ fill: COLORS.text, fontSize: 11 }}
            tickLine={{ stroke: COLORS.grid }}
            axisLine={{ stroke: COLORS.grid }}
            tickFormatter={formatYAxis}
            domain={yDomain}
            width={50}
          />

          <Tooltip content={<CustomTooltip />} />

          {showLegend && <Legend content={<CustomLegend />} />}

          {/* Média 24h - mais suave no fundo */}
          <Area
            type="monotone"
            dataKey="hashrate1d"
            stroke={COLORS.hashrate1d}
            strokeWidth={1}
            fill="url(#colorHashrate1d)"
            dot={false}
            activeDot={false}
          />

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
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default HashrateChart
