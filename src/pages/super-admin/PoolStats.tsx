import { useEffect,useState } from 'react'
import {
  Activity,
  Award,
  ChevronDown,
  ChevronUp,
  Clock,
  Network,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { chartStyles,typography } from '@/design-system/tokens'
import { useLatestPoolStats, usePoolStats } from '@/hooks/use-pool-stats'
import { POOL, REFRESH_INTERVALS } from '@/lib/constants'
import { formatHashrate, formatRelativeTime, formatShares, formatUptime } from '@/lib/formatters'

export default function PoolStatsPage() {
  const { stats: latestStats, loading: loadingLatest } = useLatestPoolStats(POOL.DEFAULT_ID)
  const { chartData, loading: loadingChart } = usePoolStats({
    poolId: POOL.DEFAULT_ID,
    period: '24h',
    autoRefresh: true,
    refreshInterval: REFRESH_INTERVALS.DEFAULT,
  })
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])


  // Calcular variações baseado na média de 1h como referência
  const calcVariation = (current: number, reference: number): number => {
    if (!reference || reference === 0) return 0
    return ((current - reference) / reference) * 100
  }

  const ref1h = latestStats?.hashrate_1h || 0
  const hashrateVariations = {
    '1m': calcVariation(latestStats?.hashrate_1m || 0, ref1h),
    '5m': calcVariation(latestStats?.hashrate_5m || 0, ref1h),
    '15m': calcVariation(latestStats?.hashrate_15m || 0, ref1h),
    '1h': 0,
    '6h': calcVariation(latestStats?.hashrate_6h || 0, ref1h),
    '1d': calcVariation(latestStats?.hashrate_1d || 0, ref1h),
    '7d': calcVariation(latestStats?.hashrate_7d || 0, ref1h),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`${typography.heading.h2} ${typography.weight.bold} text-white`}>Pool Stats</h1>
          <p className={`${typography.body.small} text-text-secondary mt-1`}>
            Monitoramento em tempo real da pool de mineração
          </p>
        </div>
        <div className={`flex items-center gap-2 ${typography.body.small} text-text-secondary`}>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Auto-refresh ativo</span>
          <Badge variant="secondary" className="ml-2">
            {formatRelativeTime(lastRefresh)}
          </Badge>
        </div>
      </div>

      {/* General Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            {loadingLatest ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className={`${typography.kpi.title} text-text-secondary`}>Uptime</p>
                  <p className={`${typography.kpi.value} ${typography.weight.bold}`}>
                    {latestStats ? formatUptime(latestStats.runtime_seconds) : 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            {loadingLatest ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-success/10 text-success rounded-full flex items-center justify-center">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <p className={`${typography.kpi.title} text-text-secondary`}>Última Atualização</p>
                  <p className={`${typography.kpi.value} ${typography.weight.bold}`}>
                    {latestStats ? formatRelativeTime(new Date(latestStats.collected_at)) : 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            {loadingLatest ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-warning/10 text-warning rounded-full flex items-center justify-center">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className={`${typography.kpi.title} text-text-secondary`}>Tempo Médio p/ Bloco</p>
                  <p className={`${typography.kpi.value} ${typography.weight.bold}`}>N/A</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            {loadingLatest ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-error/10 text-error rounded-full flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className={`${typography.kpi.title} text-text-secondary`}>Blocos Encontrados</p>
                  <p className={`${typography.kpi.value} ${typography.weight.bold}`}>0</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hashrates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Hashrates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingLatest ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: '1 Minuto', value: latestStats?.hashrate_1m || 0, variation: hashrateVariations['1m'] },
                { label: '5 Minutos', value: latestStats?.hashrate_5m || 0, variation: hashrateVariations['5m'] },
                { label: '15 Minutos', value: latestStats?.hashrate_15m || 0, variation: hashrateVariations['15m'] },
                { label: '1 Hora', value: latestStats?.hashrate_1h || 0, variation: hashrateVariations['1h'] },
                { label: '6 Horas', value: latestStats?.hashrate_6h || 0, variation: hashrateVariations['6h'] },
                { label: '1 Dia', value: latestStats?.hashrate_1d || 0, variation: hashrateVariations['1d'] },
                { label: '7 Dias', value: latestStats?.hashrate_7d || 0, variation: hashrateVariations['7d'] },
              ].map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <p className={`${typography.kpi.title} text-text-secondary mb-2`}>{item.label}</p>
                    <p className={`${typography.kpi.value} ${typography.weight.bold} mb-1`}>{formatHashrate(item.value)}</p>
                    <div className="flex items-center gap-1">
                      {item.variation > 0 ? (
                        <ChevronUp className="h-4 w-4 text-success" />
                      ) : item.variation < 0 ? (
                        <ChevronDown className="h-4 w-4 text-error" />
                      ) : null}
                      <span
                        className={`${typography.body.small} ${
                          item.variation > 0
                            ? 'text-success'
                            : item.variation < 0
                            ? 'text-error'
                            : 'text-text-secondary'
                        }`}
                      >
                        {Math.abs(item.variation).toFixed(2)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hashrate Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Hashrate ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingChart ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid.stroke} />
                <XAxis
                  dataKey="time"
                  stroke={chartStyles.axis.stroke}
                  style={{ fontSize: chartStyles.axis.fontSize }}
                />
                <YAxis
                  stroke={chartStyles.axis.stroke}
                  style={{ fontSize: chartStyles.axis.fontSize }}
                  tickFormatter={(value) => formatHashrate(value)}
                />
                <RechartsTooltip
                  contentStyle={chartStyles.tooltip}
                  formatter={(value: number | string | undefined) => formatHashrate(Number(value || 0))}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="hashrate"
                  stroke={chartStyles.lines.primary}
                  strokeWidth={2}
                  name="1 Min"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="hashrate1h"
                  stroke={chartStyles.lines.secondary}
                  strokeWidth={2}
                  name="1 Hora"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="hashrate1d"
                  stroke={chartStyles.lines.tertiary}
                  strokeWidth={2}
                  name="1 Dia"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Users & Shares Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Usuários e Workers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingLatest ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Usuários</span>
                  <span className={`${typography.kpi.value} ${typography.weight.bold}`}>
                    {latestStats?.users || 0}
                    <span className={`${typography.body.small} text-text-secondary ml-2`}>
                      (Ociosos: {latestStats?.workers_idle || 0})
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Desconectados</span>
                  <span className={`${typography.kpi.value} ${typography.weight.bold} text-error`}>
                    {latestStats?.workers_disconnected || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Workers Ativos</span>
                  <span className={`${typography.kpi.value} ${typography.weight.bold} text-success`}>
                    {latestStats?.workers_active || 0}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shares Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              Shares
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingLatest ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Aceitas</span>
                  <span className={`${typography.kpi.value} ${typography.weight.bold} text-success`}>
                    {latestStats ? formatShares(latestStats.shares_accepted) : '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Rejeitadas</span>
                  <span className={`${typography.kpi.value} ${typography.weight.bold} text-error`}>
                    {latestStats ? formatShares(latestStats.shares_rejected) : '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Melhor Diff</span>
                  <span className={`${typography.kpi.value} ${typography.weight.bold}`}>
                    {latestStats ? formatShares(latestStats.best_share) : '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">% da Diff da Rede</span>
                  <span className={`${typography.kpi.value} ${typography.weight.bold}`}>0%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Shares Per Second */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            Shares por Segundo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingLatest ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className={`${typography.kpi.title} text-text-secondary mb-1`}>1 Minuto</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>
                  {latestStats ? (latestStats.shares_per_second_1m / 1000).toFixed(3) : '0.000'}
                </p>
              </div>
              <div className="text-center">
                <p className={`${typography.kpi.title} text-text-secondary mb-1`}>5 Minutos</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>
                  {latestStats ? (latestStats.shares_per_second_5m / 1000).toFixed(3) : '0.000'}
                </p>
              </div>
              <div className="text-center">
                <p className={`${typography.kpi.title} text-text-secondary mb-1`}>15 Minutos</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>
                  {latestStats ? (latestStats.shares_per_second_15m / 1000).toFixed(3) : '0.000'}
                </p>
              </div>
              <div className="text-center">
                <p className={`${typography.kpi.title} text-text-secondary mb-1`}>1 Hora</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>
                  {latestStats ? (latestStats.shares_per_second_1h / 1000).toFixed(3) : '0.000'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users and Workers Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários e Workers ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingChart ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid.stroke} />
                <XAxis
                  dataKey="time"
                  stroke={chartStyles.axis.stroke}
                  style={{ fontSize: chartStyles.axis.fontSize }}
                />
                <YAxis stroke={chartStyles.axis.stroke} style={{ fontSize: chartStyles.axis.fontSize }} />
                <RechartsTooltip
                  contentStyle={chartStyles.tooltip}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="workers"
                  stroke={chartStyles.lines.primary}
                  strokeWidth={2}
                  name="Workers"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top 10 User Difficulties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Top 10 Dificuldades de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Posição</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead className="text-right">Melhor Diff</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={3} className="text-center text-text-secondary py-12">
                  Nenhum dado disponível
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
