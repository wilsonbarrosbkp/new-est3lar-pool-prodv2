import { useCallback,useEffect, useState } from 'react'

import { POOL, REFRESH_INTERVALS } from '@/lib/constants'
import { supabase } from '@/lib/supabase/client'

export interface PoolStatsData {
  id: number
  pool_id: number
  collected_at: string
  hashrate_1m: number
  hashrate_5m: number
  hashrate_15m: number
  hashrate_1h: number
  hashrate_6h: number
  hashrate_1d: number
  hashrate_7d: number
  workers_total: number
  workers_active: number
  workers_idle: number
  workers_disconnected: number
  shares_accepted: number
  shares_rejected: number
  best_share: number
  difficulty: number
  shares_per_second_1m: number
  shares_per_second_5m: number
  shares_per_second_15m: number
  shares_per_second_1h: number
  source: string
  runtime_seconds: number
  users: number
}

export interface HashrateChartPoint {
  time: string
  timestamp: Date
  hashrate: number
  hashrate1h: number
  hashrate1d: number
  workers: number
}

export type Period = '1m' | '5m' | '15m' | '30m' | '1h' | '6h' | '24h' | '7d'

interface UsePoolStatsOptions {
  poolId?: number
  period?: Period
  autoRefresh?: boolean
  refreshInterval?: number
}

// Calcula a data de início baseado no período
function getStartDate(period: Period): Date {
  const now = new Date()
  switch (period) {
    case '1m':
      return new Date(now.getTime() - 1 * 60 * 1000) // 1 minuto
    case '5m':
      return new Date(now.getTime() - 5 * 60 * 1000) // 5 minutos
    case '15m':
      return new Date(now.getTime() - 15 * 60 * 1000) // 15 minutos
    case '30m':
      return new Date(now.getTime() - 30 * 60 * 1000) // 30 minutos
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000) // 1 hora
    case '6h':
      return new Date(now.getTime() - 6 * 60 * 60 * 1000) // 6 horas
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 horas
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 dias
    default:
      return new Date(now.getTime() - 60 * 60 * 1000)
  }
}

// Calcula quantos pontos mostrar baseado no período
function getDataPoints(period: Period): number {
  switch (period) {
    case '1m':
      return 60 // todos os pontos disponíveis no último minuto
    case '5m':
      return 60 // todos os pontos disponíveis
    case '15m':
      return 60 // todos os pontos disponíveis
    case '30m':
      return 60 // todos os pontos disponíveis
    case '1h':
      return 60 // 1 ponto por minuto
    case '6h':
      return 180 // 1 ponto a cada 2 minutos
    case '24h':
      return 144 // 1 ponto a cada 10 minutos
    case '7d':
      return 168 // 1 ponto por hora
    default:
      return 60
  }
}

export function usePoolStats(options: UsePoolStatsOptions = {}) {
  const {
    poolId = POOL.DEFAULT_ID,
    period = '24h',
    autoRefresh = false,
    refreshInterval = REFRESH_INTERVALS.DEFAULT,
  } = options

  const [data, setData] = useState<PoolStatsData[]>([])
  const [chartData, setChartData] = useState<HashrateChartPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)

      const startDate = getStartDate(period)
      const limit = getDataPoints(period)

      // Buscar dados do período selecionado
      const { data: stats, error: fetchError } = await supabase
        .from('pool_stats')
        .select('*')
        .eq('pool_id', poolId)
        .gte('collected_at', startDate.toISOString())
        .order('collected_at', { ascending: true })
        .limit(limit * 2) // Pegar mais dados para fazer sampling

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      if (!stats || stats.length === 0) {
        setData([])
        setChartData([])
        setLastUpdate(new Date())
        return
      }

      setData(stats)

      // Fazer sampling dos dados para o gráfico
      const sampledData = sampleData(stats, limit)

      // Transformar para formato do gráfico
      const chartPoints: HashrateChartPoint[] = sampledData.map((stat) => ({
        time: formatTimeLabel(stat.collected_at, period),
        timestamp: new Date(stat.collected_at),
        hashrate: stat.hashrate_1m || 0,
        hashrate1h: stat.hashrate_1h || 0,
        hashrate1d: stat.hashrate_1d || 0,
        workers: stat.workers_active || 0,
      }))

      setChartData(chartPoints)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [poolId, period])

  // Carregar dados na montagem e quando mudar período
  useEffect(() => {
    setLoading(true)
    fetchData()
  }, [fetchData])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const timer = setInterval(fetchData, refreshInterval)
    return () => clearInterval(timer)
  }, [autoRefresh, refreshInterval, fetchData])

  // Subscrição realtime
  useEffect(() => {
    const channel = supabase
      .channel('pool_stats_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pool_stats',
          filter: `pool_id=eq.${poolId}`,
        },
        () => {
          // Recarregar dados quando houver novo insert
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [poolId, fetchData])

  return {
    data,
    chartData,
    loading,
    error,
    lastUpdate,
    refetch: fetchData,
  }
}

// Função para amostrar dados uniformemente
function sampleData<T>(data: T[], targetPoints: number): T[] {
  if (data.length <= targetPoints) return data

  const step = data.length / targetPoints
  const sampled: T[] = []

  for (let i = 0; i < targetPoints; i++) {
    const index = Math.min(Math.floor(i * step), data.length - 1)
    sampled.push(data[index])
  }

  // Sempre incluir o último ponto
  if (sampled[sampled.length - 1] !== data[data.length - 1]) {
    sampled[sampled.length - 1] = data[data.length - 1]
  }

  return sampled
}

// Formata label de tempo baseado no período
function formatTimeLabel(dateStr: string, period: Period): string {
  const date = new Date(dateStr)

  switch (period) {
    case '1h':
    case '6h':
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    case '24h':
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    case '7d':
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    default:
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
  }
}

// Hook para obter apenas o último stat (para KPIs)
export function useLatestPoolStats(poolId: number = 1) {
  const [stats, setStats] = useState<PoolStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLatest = useCallback(async () => {
    try {
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('pool_stats')
        .select('*')
        .eq('pool_id', poolId)
        .order('collected_at', { ascending: false })
        .limit(1)
        .single()

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [poolId])

  useEffect(() => {
    fetchLatest()
  }, [fetchLatest])

  // Subscrição realtime
  useEffect(() => {
    const channel = supabase
      .channel('latest_pool_stats')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pool_stats',
          filter: `pool_id=eq.${poolId}`,
        },
        (payload) => {
          setStats(payload.new as PoolStatsData)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [poolId])

  return { stats, loading, error, refetch: fetchLatest }
}
