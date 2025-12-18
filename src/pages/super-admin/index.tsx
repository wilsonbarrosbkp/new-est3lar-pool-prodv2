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
  Settings,
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
            <p className="text-sm text-text-secondary">
              Visão completa do sistema Est3lar Pool
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Atualizado {formatRelativeTime(lastUpdate)}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')}
            />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Organizações */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Organizações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums">
                  {systemStats.totalOrganizations}
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  {systemStats.totalOrganizations === 0 ? 'Nenhuma' : 'Ativas'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Usuários */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums">
                  {systemStats.totalUsers}
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  {systemStats.totalUsers === 0 ? 'Nenhum' : 'Cadastrados'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Hashrate Global */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-text-secondary">
              Hashrate Global
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : poolStats.hashrate1m === 0 ? (
              <>
                <div className="text-lg font-bold tabular-nums text-text-secondary">
                  --
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  Sem dados
                </p>
              </>
            ) : (
              <>
                <div className="text-lg font-bold tabular-nums truncate">
                  {formatHashrate(poolStats.hashrate1m)}
                </div>
                <p className="text-xs text-text-secondary mt-0.5 truncate">
                  1h: {formatHashrate(poolStats.hashrate1h)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {Math.abs(hashrateChange) < 0.5 ? (
                    <>
                      <Minus className="h-3 w-3 text-text-secondary" />
                      <span className="text-xs text-text-secondary">Estável</span>
                    </>
                  ) : hashrateChange > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-success" />
                      <span className="text-xs text-success">
                        +{hashrateChange.toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 text-error" />
                      <span className="text-xs text-error">
                        {hashrateChange.toFixed(1)}%
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Workers Globais */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-text-secondary">
              Workers Globais
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : poolStats.workersTotal === 0 ? (
              <>
                <div className="text-lg font-bold tabular-nums text-text-secondary">
                  --
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  Sem workers
                </p>
              </>
            ) : (
              <>
                <div className="text-lg font-bold tabular-nums truncate">
                  {formatNumber(poolStats.workersActive)}/
                  {formatNumber(poolStats.workersTotal)}
                </div>
                <p className="text-xs text-text-secondary mt-0.5 truncate">
                  Idle: {formatNumber(poolStats.workersIdle)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-xs">{poolStats.workersActive}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    <span className="text-xs">{poolStats.workersIdle}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-text-secondary" />
                    <span className="text-xs">{poolStats.workersDisconnected}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Endpoints */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
              <Network className="h-3.5 w-3.5" />
              Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <>
                <div className={cn(
                  "text-2xl font-bold tabular-nums",
                  systemStats.activeEndpoints > 0 ? "text-success" : "text-text-secondary"
                )}>
                  {systemStats.activeEndpoints}
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  {systemStats.activeEndpoints === 0 ? 'Nenhum' : 'Configurados'}
                </p>
                {systemStats.activeEndpoints > 0 && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <CheckCircle className="h-3 w-3 text-success" />
                    <span className="text-xs text-success">Ativos</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Sistema */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5" />
              Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div
                  className={cn(
                    'text-2xl font-bold tabular-nums',
                    systemStats.uptime >= 99
                      ? 'text-success'
                      : systemStats.uptime >= 95
                        ? 'text-warning'
                        : 'text-error'
                  )}
                >
                  {systemStats.uptime.toFixed(2)}%
                </div>
                <p className="text-xs text-text-secondary mt-0.5">Uptime</p>
                <div className="flex items-center gap-1 mt-2">
                  {systemStats.systemHealth === 'healthy' && (
                    <>
                      <CheckCircle className="h-3 w-3 text-success" />
                      <span className="text-xs text-success">Saudável</span>
                    </>
                  )}
                  {systemStats.systemHealth === 'degraded' && (
                    <>
                      <AlertTriangle className="h-3 w-3 text-warning" />
                      <span className="text-xs text-warning">Degradado</span>
                    </>
                  )}
                  {systemStats.systemHealth === 'critical' && (
                    <>
                      <XCircle className="h-3 w-3 text-error" />
                      <span className="text-xs text-error">Crítico</span>
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Hashrate Global do Sistema
            </CardTitle>
            <Select
              value={period}
              onValueChange={(value) => setPeriod(value as Period)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Última hora</SelectItem>
                <SelectItem value="6h">Últimas 6 horas</SelectItem>
                <SelectItem value="24h">Últimas 24 horas</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <HashrateChart
            data={chartData}
            period={period}
            loading={chartLoading}
            height={300}
          />
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/super-admin/users">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                Gerenciar Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-text-secondary">
                Criar admins, editar permissões e gerenciar acessos
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/super-admin/organizations">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                Organizações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-text-secondary">
                Gerenciar organizações e suas configurações
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/super-admin/audit">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-success" />
                Auditoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-text-secondary">
                Ver logs de ações e monitorar segurança
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/super-admin/endpoints">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="h-4 w-4 text-warning" />
                Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-text-secondary">
                Monitorar endpoints, hardware e webhooks
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
