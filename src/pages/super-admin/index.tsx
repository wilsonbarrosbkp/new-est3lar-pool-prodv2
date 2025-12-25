import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  Clock,
  RefreshCw,
  Globe,
  Users,
  Network,
  Database,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  UserCheck,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { HashrateChart } from '@/components/charts/HashrateChart'
import { usePoolStats, type Period } from '@/hooks/use-pool-stats'
import { cn } from '@/lib/utils'
import { formatHashrate, formatNumber, formatRelativeTime } from '@/lib/formatters'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { typography } from '@/design-system/tokens'

interface SystemStats {
  totalOrganizations: number
  totalUsers: number
  activeEndpoints: number
  systemHealth: 'healthy' | 'degraded' | 'critical'
  uptime: number
}

interface PoolStats {
  hashrate1m: number
  hashrate1h: number
  hashrate1d: number
  workersTotal: number
  workersActive: number
  workersIdle: number
  workersDisconnected: number
}

const emptySystemStats: SystemStats = {
  totalOrganizations: 0,
  totalUsers: 0,
  activeEndpoints: 0,
  systemHealth: 'healthy',
  uptime: 100,
}

const emptyPoolStats: PoolStats = {
  hashrate1m: 0,
  hashrate1h: 0,
  hashrate1d: 0,
  workersTotal: 0,
  workersActive: 0,
  workersIdle: 0,
  workersDisconnected: 0,
}

export default function SuperAdminDashboard() {
  const [period, setPeriod] = useState<Period>('24h')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [systemStats, setSystemStats] = useState<SystemStats>(emptySystemStats)
  const [poolStats, setPoolStats] = useState<PoolStats>(emptyPoolStats)

  // Hook para dados do gráfico de hashrate
  const {
    chartData,
    loading: chartLoading,
    refetch: refetchChart,
  } = usePoolStats({ poolId: 1, period, autoRefresh: true })

  const loadData = useCallback(async () => {
    try {
      // Carregar contagens do banco
      const [orgsResult, usersResult, endpointsResult, poolStatsResult] = await Promise.all([
        supabase.from('organizations').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('endpoints').select('id', { count: 'exact', head: true }).eq('status', 'ativo'),
        supabase.from('pool_stats').select('*').order('collected_at', { ascending: false }).limit(1),
      ])

      // Atualizar stats do sistema
      setSystemStats({
        totalOrganizations: orgsResult.count || 0,
        totalUsers: usersResult.count || 0,
        activeEndpoints: endpointsResult.count || 0,
        systemHealth: 'healthy',
        uptime: 100,
      })

      // Atualizar stats da pool (se houver dados)
      if (poolStatsResult.data && poolStatsResult.data.length > 0) {
        const stats = poolStatsResult.data[0]
        setPoolStats({
          hashrate1m: stats.hashrate_1m || 0,
          hashrate1h: stats.hashrate_1h || 0,
          hashrate1d: stats.hashrate_1d || 0,
          workersTotal: stats.workers_total || 0,
          workersActive: stats.workers_active || 0,
          workersIdle: stats.workers_idle || 0,
          workersDisconnected: stats.workers_disconnected || 0,
        })
      }

      setLastUpdate(new Date())
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([loadData(), refetchChart()])
    setIsRefreshing(false)
    toast.success('Dados atualizados')
  }

  // Calcular variação do hashrate
  const hashrateChange =
    poolStats.hashrate1h > 0
      ? ((poolStats.hashrate1m - poolStats.hashrate1h) / poolStats.hashrate1h) * 100
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
          <div className="min-w-0">
            <h1 className={`${typography.heading.h1} ${typography.weight.bold} truncate`}>Super Admin Dashboard</h1>
            <p className={`${typography.body.small} text-text-secondary truncate`}>
              Visão completa do sistema Genesis Pool
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary" className={`gap-1 ${typography.body.tiny}`}>
            <Clock className="h-3 w-3" />
            <span className="hidden xs:inline">Atualizado</span> {formatRelativeTime(lastUpdate)}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn('h-4 w-4 sm:mr-2', isRefreshing && 'animate-spin')}
            />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Organizações */}
        <Card>
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className={`${typography.kpi.title} ${typography.weight.medium} text-text-secondary flex items-center gap-1`}>
              <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span className="truncate">Organizações</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            {loading ? (
              <Skeleton className="h-6 sm:h-8 w-10 sm:w-12" />
            ) : (
              <>
                <div className={`${typography.kpi.value} ${typography.weight.bold} tabular-nums`}>
                  {systemStats.totalOrganizations}
                </div>
                <p className={`${typography.kpi.subtitle} text-text-secondary mt-0.5`}>
                  {systemStats.totalOrganizations === 0 ? 'Nenhuma' : 'Ativas'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Usuários */}
        <Card>
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className={`${typography.kpi.title} ${typography.weight.medium} text-text-secondary flex items-center gap-1`}>
              <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span className="truncate">Usuários</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            {loading ? (
              <Skeleton className="h-6 sm:h-8 w-10 sm:w-12" />
            ) : (
              <>
                <div className={`${typography.kpi.value} ${typography.weight.bold} tabular-nums`}>
                  {systemStats.totalUsers}
                </div>
                <p className={`${typography.kpi.subtitle} text-text-secondary mt-0.5`}>
                  {systemStats.totalUsers === 0 ? 'Nenhum' : 'Cadastrados'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Hashrate */}
        <Card>
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className={`${typography.kpi.title} ${typography.weight.medium} text-text-secondary flex items-center gap-1`}>
              <BarChart3 className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span className="truncate">Hashrate</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            {loading ? (
              <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
            ) : poolStats.hashrate1m === 0 ? (
              <>
                <div className={`${typography.kpi.value} ${typography.weight.bold} tabular-nums text-text-secondary`}>
                  --
                </div>
                <p className={`${typography.kpi.subtitle} text-text-secondary mt-0.5`}>
                  Sem dados
                </p>
              </>
            ) : (
              <>
                <div className={`${typography.kpi.value} ${typography.weight.bold} tabular-nums truncate`}>
                  {formatHashrate(poolStats.hashrate1m)}
                </div>
                <p className={`${typography.kpi.subtitle} text-text-secondary mt-0.5 truncate`}>
                  1h: {formatHashrate(poolStats.hashrate1h)}
                </p>
                <div className="flex items-center gap-1 mt-1 sm:mt-2">
                  {Math.abs(hashrateChange) < 0.5 ? (
                    <>
                      <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-text-secondary" />
                      <span className={`${typography.kpi.subtitle} text-text-secondary`}>Estável</span>
                    </>
                  ) : hashrateChange > 0 ? (
                    <>
                      <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-success" />
                      <span className={`${typography.kpi.subtitle} text-success`}>
                        +{hashrateChange.toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-error" />
                      <span className={`${typography.kpi.subtitle} text-error`}>
                        {hashrateChange.toFixed(1)}%
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Workers */}
        <Card>
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className={`${typography.kpi.title} ${typography.weight.medium} text-text-secondary flex items-center gap-1`}>
              <UserCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span className="truncate">Workers</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            {loading ? (
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
            ) : poolStats.workersTotal === 0 ? (
              <>
                <div className={`${typography.kpi.value} ${typography.weight.bold} tabular-nums text-text-secondary`}>
                  --
                </div>
                <p className={`${typography.kpi.subtitle} text-text-secondary mt-0.5`}>
                  Sem workers
                </p>
              </>
            ) : (
              <>
                <div className={`${typography.kpi.value} ${typography.weight.bold} tabular-nums truncate`}>
                  {formatNumber(poolStats.workersActive)}/
                  {formatNumber(poolStats.workersTotal)}
                </div>
                <p className={`${typography.kpi.subtitle} text-text-secondary mt-0.5 truncate`}>
                  Idle: {formatNumber(poolStats.workersIdle)}
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2 flex-wrap">
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-success" />
                    <span className={typography.kpi.subtitle}>{poolStats.workersActive}</span>
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-warning" />
                    <span className={typography.kpi.subtitle}>{poolStats.workersIdle}</span>
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-text-secondary" />
                    <span className={typography.kpi.subtitle}>{poolStats.workersDisconnected}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Endpoints */}
        <Card>
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className={`${typography.kpi.title} ${typography.weight.medium} text-text-secondary flex items-center gap-1`}>
              <Network className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span className="truncate">Endpoints</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            {loading ? (
              <Skeleton className="h-6 sm:h-8 w-6 sm:w-8" />
            ) : (
              <>
                <div className={cn(
                  typography.kpi.value,
                  typography.weight.bold,
                  "tabular-nums",
                  systemStats.activeEndpoints > 0 ? "text-success" : "text-text-secondary"
                )}>
                  {systemStats.activeEndpoints}
                </div>
                <p className={`${typography.kpi.subtitle} text-text-secondary mt-0.5`}>
                  {systemStats.activeEndpoints === 0 ? 'Nenhum' : 'Configurados'}
                </p>
                {systemStats.activeEndpoints > 0 && (
                  <div className="flex items-center gap-1 mt-1 sm:mt-1.5">
                    <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-success" />
                    <span className={`${typography.kpi.subtitle} text-success`}>Ativos</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Sistema */}
        <Card>
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className={`${typography.kpi.title} ${typography.weight.medium} text-text-secondary flex items-center gap-1`}>
              <Database className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span className="truncate">Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            {loading ? (
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
            ) : (
              <>
                <div
                  className={cn(
                    typography.kpi.value,
                    typography.weight.bold,
                    'tabular-nums',
                    systemStats.uptime >= 99
                      ? 'text-success'
                      : systemStats.uptime >= 95
                        ? 'text-warning'
                        : 'text-error'
                  )}
                >
                  {systemStats.uptime.toFixed(2)}%
                </div>
                <p className={`${typography.kpi.subtitle} text-text-secondary mt-0.5`}>Uptime</p>
                <div className="flex items-center gap-1 mt-1 sm:mt-2">
                  {systemStats.systemHealth === 'healthy' && (
                    <>
                      <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-success" />
                      <span className={`${typography.kpi.subtitle} text-success`}>Saudável</span>
                    </>
                  )}
                  {systemStats.systemHealth === 'degraded' && (
                    <>
                      <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-warning" />
                      <span className={`${typography.kpi.subtitle} text-warning`}>Degradado</span>
                    </>
                  )}
                  {systemStats.systemHealth === 'critical' && (
                    <>
                      <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-error" />
                      <span className={`${typography.kpi.subtitle} text-error`}>Crítico</span>
                    </>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Hashrate */}
      <Card>
        <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className={`${typography.card.title} flex items-center gap-2`}>
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              <span className="truncate">Hashrates</span>
            </CardTitle>
            <Select
              value={period}
              onValueChange={(value) => setPeriod(value as Period)}
            >
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Último minuto</SelectItem>
                <SelectItem value="5m">Últimos 5 min</SelectItem>
                <SelectItem value="15m">Últimos 15 min</SelectItem>
                <SelectItem value="30m">Últimos 30 min</SelectItem>
                <SelectItem value="1h">Última hora</SelectItem>
                <SelectItem value="6h">Últimas 6 horas</SelectItem>
                <SelectItem value="24h">Últimas 24 horas</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6 pb-4 sm:pb-6">
          <HashrateChart
            data={chartData}
            period={period}
            loading={chartLoading}
            height={250}
          />
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link to="/super-admin/users">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className={`${typography.body.small} flex items-center gap-1.5 sm:gap-2`}>
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                <span className="truncate">Usuários</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <p className={`${typography.body.tiny} text-text-secondary line-clamp-2`}>
                Criar admins, editar permissões
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/super-admin/organizations">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className={`${typography.body.small} flex items-center gap-1.5 sm:gap-2`}>
                <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                <span className="truncate">Organizações</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <p className={`${typography.body.tiny} text-text-secondary line-clamp-2`}>
                Gerenciar orgs e configurações
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/super-admin/audit">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className={`${typography.body.small} flex items-center gap-1.5 sm:gap-2`}>
                <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success shrink-0" />
                <span className="truncate">Auditoria</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <p className={`${typography.body.tiny} text-text-secondary line-clamp-2`}>
                Logs de ações e segurança
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/super-admin/endpoints">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className={`${typography.body.small} flex items-center gap-1.5 sm:gap-2`}>
                <Database className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-warning shrink-0" />
                <span className="truncate">Sistema</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <p className={`${typography.body.tiny} text-text-secondary line-clamp-2`}>
                Endpoints, hardware e webhooks
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
