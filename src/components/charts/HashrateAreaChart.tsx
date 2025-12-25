import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/Chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { supabase } from '@/lib/supabase/client'
import { handleError } from '@/lib/error-handler'
import { POOL } from '@/lib/constants'

const chartConfig = {
  hashrate: {
    label: 'Hashrate',
  },
  hashrate1m: {
    label: 'Atual (1m)',
    color: 'var(--chart-1)',
  },
  hashrate1h: {
    label: 'Média 1h',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

interface HashrateAreaChartProps {
  poolId?: number
}

export function HashrateAreaChart({ poolId = POOL.DEFAULT_ID }: HashrateAreaChartProps) {
  const [timeRange, setTimeRange] = React.useState('1m')
  const [chartData, setChartData] = React.useState<
    Array<{ date: string; hashrate1m: number; hashrate1h: number }>
  >([])
  const [loading, setLoading] = React.useState(true)

  // Buscar dados do banco
  const fetchData = React.useCallback(async () => {
    try {
      let minutes = 1
      if (timeRange === '5m') minutes = 5
      else if (timeRange === '10m') minutes = 10
      else if (timeRange === '30m') minutes = 30
      else if (timeRange === '60m') minutes = 60
      else if (timeRange === '24h') minutes = 1440

      const startDate = new Date(Date.now() - minutes * 60 * 1000)

      const { data: stats, error } = await supabase
        .from('pool_stats')
        .select('collected_at, hashrate_1m, hashrate_1h')
        .eq('pool_id', poolId)
        .gte('collected_at', startDate.toISOString())
        .order('collected_at', { ascending: true })

      if (error) {
        handleError(error, 'buscar hashrate')
        return
      }

      if (!stats || stats.length === 0) {
        setChartData([])
        return
      }

      const points = stats.map((stat) => ({
        date: stat.collected_at,
        hashrate1m: stat.hashrate_1m || 0,
        hashrate1h: stat.hashrate_1h || 0,
      }))

      setChartData(points)
    } catch (err) {
      handleError(err, 'buscar dados do gráfico')
    } finally {
      setLoading(false)
    }
  }, [poolId, timeRange])

  React.useEffect(() => {
    setLoading(true)
    fetchData()
  }, [fetchData])

  // Auto refresh a cada 60s
  React.useEffect(() => {
    const timer = setInterval(fetchData, 60000)
    return () => clearInterval(timer)
  }, [fetchData])

  // Realtime
  React.useEffect(() => {
    const channel = supabase
      .channel('hashrate_chart')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pool_stats',
          filter: `pool_id=eq.${poolId}`,
        },
        () => fetchData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [poolId, fetchData])

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Hashrate</CardTitle>
          <CardDescription>
            Desempenho de hashrate da pool de mineração
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-auto min-w-[140px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Selecione o período"
          >
            <SelectValue placeholder="1 minuto" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="1m" className="rounded-lg">
              1 minuto
            </SelectItem>
            <SelectItem value="5m" className="rounded-lg">
              5 minutos
            </SelectItem>
            <SelectItem value="10m" className="rounded-lg">
              10 minutos
            </SelectItem>
            <SelectItem value="30m" className="rounded-lg">
              30 minutos
            </SelectItem>
            <SelectItem value="60m" className="rounded-lg">
              60 minutos
            </SelectItem>
            <SelectItem value="24h" className="rounded-lg">
              24 horas
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="flex items-center justify-center h-[250px] text-text-secondary">
            Carregando...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-text-secondary">
            Sem dados disponíveis
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillHashrate1m" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-hashrate1m)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-hashrate1m)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillHashrate1h" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-hashrate1h)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-hashrate1h)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value as string).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="hashrate1h"
                type="natural"
                fill="url(#fillHashrate1h)"
                stroke="var(--color-hashrate1h)"
                stackId="a"
              />
              <Area
                dataKey="hashrate1m"
                type="natural"
                fill="url(#fillHashrate1m)"
                stroke="var(--color-hashrate1m)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
