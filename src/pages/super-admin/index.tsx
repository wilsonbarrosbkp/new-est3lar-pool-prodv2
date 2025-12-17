import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import { formatHashrate, formatNumber, formatRelativeTime } from '@/lib/formatters'

// Mock data - será substituído por dados reais do Supabase
const mockSystemStats: {
  totalOrganizations: number
  totalUsers: number
  activeEndpoints: number
  systemHealth: 'healthy' | 'degraded' | 'critical'
  uptime: number
} = {
  totalOrganizations: 12,
  totalUsers: 156,
  activeEndpoints: 8,
  systemHealth: 'healthy',
  uptime: 99.87,
}

const mockCkpoolStats = {
  hashrate1m: 1.23e15, // 1.23 PH/s
  hashrate1h: 1.21e15,
  hashrate1d: 1.18e15,
  workersTotal: 245,
  workersActive: 231,
  workersIdle: 8,
  workersOff: 6,
}

export default function SuperAdminDashboard() {
  const [period, setPeriod] = useState<'1h' | '6h' | '24h' | '7d'>('24h')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate] = useState(new Date())

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simular refresh
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  // Calcular variação do hashrate
  const hashrateChange =
    mockCkpoolStats.hashrate1h > 0
      ? ((mockCkpoolStats.hashrate1m - mockCkpoolStats.hashrate1h) /
          mockCkpoolStats.hashrate1h) *
        100
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
            <div className="text-2xl font-bold tabular-nums">
              {mockSystemStats.totalOrganizations}
            </div>
            <p className="text-xs text-text-secondary mt-0.5">Ativas</p>
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
            <div className="text-2xl font-bold tabular-nums">
              {mockSystemStats.totalUsers}
            </div>
            <p className="text-xs text-text-secondary mt-0.5">Cadastrados</p>
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
            <div className="text-lg font-bold tabular-nums truncate">
              {formatHashrate(mockCkpoolStats.hashrate1m)}
            </div>
            <p className="text-xs text-text-secondary mt-0.5 truncate">
              1h: {formatHashrate(mockCkpoolStats.hashrate1h)}
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
            <div className="text-lg font-bold tabular-nums truncate">
              {formatNumber(mockCkpoolStats.workersActive)}/
              {formatNumber(mockCkpoolStats.workersTotal)}
            </div>
            <p className="text-xs text-text-secondary mt-0.5 truncate">
              Idle: {formatNumber(mockCkpoolStats.workersIdle)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-xs">{mockCkpoolStats.workersActive}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-xs">{mockCkpoolStats.workersIdle}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-text-secondary" />
                <span className="text-xs">{mockCkpoolStats.workersOff}</span>
              </div>
            </div>
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
            <div className="text-2xl font-bold tabular-nums text-success">
              {mockSystemStats.activeEndpoints}
            </div>
            <p className="text-xs text-text-secondary mt-0.5">Configurados</p>
            <div className="flex items-center gap-1 mt-1.5">
              <CheckCircle className="h-3 w-3 text-success" />
              <span className="text-xs text-success">Ativos</span>
            </div>
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
            <div
              className={cn(
                'text-2xl font-bold tabular-nums',
                mockSystemStats.uptime >= 99
                  ? 'text-success'
                  : mockSystemStats.uptime >= 95
                    ? 'text-warning'
                    : 'text-error'
              )}
            >
              {mockSystemStats.uptime.toFixed(2)}%
            </div>
            <p className="text-xs text-text-secondary mt-0.5">Uptime</p>
            <div className="flex items-center gap-1 mt-2">
              {mockSystemStats.systemHealth === 'healthy' && (
                <>
                  <CheckCircle className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">Saudável</span>
                </>
              )}
              {mockSystemStats.systemHealth === 'degraded' && (
                <>
                  <AlertTriangle className="h-3 w-3 text-warning" />
                  <span className="text-xs text-warning">Degradado</span>
                </>
              )}
              {mockSystemStats.systemHealth === 'critical' && (
                <>
                  <XCircle className="h-3 w-3 text-error" />
                  <span className="text-xs text-error">Crítico</span>
                </>
              )}
            </div>
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
              onValueChange={(value) =>
                setPeriod(value as '1h' | '6h' | '24h' | '7d')
              }
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
          <div className="h-[300px] flex items-center justify-center text-text-secondary">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Gráfico será implementado com Recharts</p>
              <p className="text-xs mt-1">Período selecionado: {period}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
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

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-text-secondary">
              Ajustar parâmetros do sistema e integrações
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
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

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
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
      </div>
    </div>
  )
}
