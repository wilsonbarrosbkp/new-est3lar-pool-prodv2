import {
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Activity,
  Wifi,
  WifiOff,
  Clock,
  ArrowUpDown,
  Gauge,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { typography } from '@/design-system/tokens'

export type ServerStatus = 'online' | 'offline' | 'warning' | 'maintenance'
export type ServerRole = 'load-balancer' | 'proxy' | 'pool-stats' | 'mining-pool' | 'database' | 'monitor'

export interface ServerMetrics {
  cpuUsage: number // 0-100
  memoryUsage: number // 0-100
  memoryTotal: string // "16 GB"
  diskUsage: number // 0-100
  diskTotal: string // "500 GB"
  networkIn: string // "125 Mbps"
  networkOut: string // "89 Mbps"
  uptime: string // "15d 4h 32m"
  connections?: number // Active connections (for proxy/lb)
  requestsPerSec?: number // RPS (for proxy/lb)
  latency?: number // ms
}

export interface ServerData {
  id: string
  name: string
  hostname: string
  ip: string
  role: ServerRole
  status: ServerStatus
  os: string
  location?: string
  metrics: ServerMetrics
  lastUpdate: Date
}

interface ServerCardProps {
  server: ServerData
  onClick?: () => void
}

const roleConfig: Record<ServerRole, { label: string; icon: typeof Server; color: string }> = {
  'load-balancer': { label: 'Load Balancer', icon: ArrowUpDown, color: 'text-blue-500' },
  'proxy': { label: 'Proxy Pool', icon: Network, color: 'text-violet-500' },
  'pool-stats': { label: 'Pool Stats', icon: Activity, color: 'text-cyan-500' },
  'mining-pool': { label: 'Mining Pool', icon: Cpu, color: 'text-orange-500' },
  'database': { label: 'Database', icon: HardDrive, color: 'text-green-500' },
  'monitor': { label: 'Monitor', icon: Gauge, color: 'text-pink-500' },
}

const statusConfig: Record<ServerStatus, { label: string; color: string; bgColor: string }> = {
  online: { label: 'Online', color: 'text-success', bgColor: 'bg-success' },
  offline: { label: 'Offline', color: 'text-error', bgColor: 'bg-error' },
  warning: { label: 'Warning', color: 'text-warning', bgColor: 'bg-warning' },
  maintenance: { label: 'Manutenção', color: 'text-blue-400', bgColor: 'bg-blue-400' },
}

function MetricBar({ value, color = 'bg-primary' }: { value: number; color?: string }) {
  const getBarColor = (val: number) => {
    if (val >= 90) return 'bg-error'
    if (val >= 75) return 'bg-warning'
    return color
  }

  return (
    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all', getBarColor(value))}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  )
}

export function ServerCard({ server, onClick }: ServerCardProps) {
  const role = roleConfig[server.role]
  const status = statusConfig[server.status]
  const RoleIcon = role.icon

  return (
    <Card
      className={cn(
        'cursor-pointer hover:shadow-lg transition-all hover:border-primary/50',
        server.status === 'offline' && 'opacity-60'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center bg-zinc-800', role.color)}>
              <RoleIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className={`${typography.body.small} ${typography.weight.medium}`}>{server.name}</CardTitle>
              <p className={`${typography.body.tiny} text-zinc-500`}>{server.hostname}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full animate-pulse', status.bgColor)} />
            <Badge
              variant="outline"
              className={cn(typography.body.tiny, status.color)}
            >
              {server.status === 'online' ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
              {status.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info básica */}
        <div className={`flex items-center justify-between ${typography.body.tiny} text-zinc-500`}>
          <span>{server.ip}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {server.metrics.uptime}
          </span>
        </div>

        {/* Métricas principais */}
        <div className="space-y-3">
          {/* CPU */}
          <div className="space-y-1">
            <div className={`flex items-center justify-between ${typography.body.tiny}`}>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Cpu className="h-3 w-3" />
                CPU
              </span>
              <span className="font-mono text-zinc-300">{server.metrics.cpuUsage}%</span>
            </div>
            <MetricBar value={server.metrics.cpuUsage} color="bg-blue-500" />
          </div>

          {/* Memória */}
          <div className="space-y-1">
            <div className={`flex items-center justify-between ${typography.body.tiny}`}>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <MemoryStick className="h-3 w-3" />
                RAM
              </span>
              <span className="font-mono text-zinc-300">
                {server.metrics.memoryUsage}% <span className="text-zinc-500">/ {server.metrics.memoryTotal}</span>
              </span>
            </div>
            <MetricBar value={server.metrics.memoryUsage} color="bg-violet-500" />
          </div>

          {/* Disco */}
          <div className="space-y-1">
            <div className={`flex items-center justify-between ${typography.body.tiny}`}>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <HardDrive className="h-3 w-3" />
                Disco
              </span>
              <span className="font-mono text-zinc-300">
                {server.metrics.diskUsage}% <span className="text-zinc-500">/ {server.metrics.diskTotal}</span>
              </span>
            </div>
            <MetricBar value={server.metrics.diskUsage} color="bg-cyan-500" />
          </div>
        </div>

        {/* Network & Extras */}
        <div className="pt-2 border-t border-zinc-800">
          <div className="grid grid-cols-2 gap-3">
            <div className={typography.body.tiny}>
              <span className="text-zinc-500 flex items-center gap-1">
                <Network className="h-3 w-3" />
                Network
              </span>
              <div className="font-mono text-zinc-300 mt-0.5">
                <span className="text-green-400">↓</span> {server.metrics.networkIn}
                <span className="mx-1 text-zinc-600">|</span>
                <span className="text-blue-400">↑</span> {server.metrics.networkOut}
              </div>
            </div>

            {server.metrics.connections !== undefined && (
              <div className={typography.body.tiny}>
                <span className="text-zinc-500">Conexões</span>
                <p className="font-mono text-zinc-300 mt-0.5">{server.metrics.connections.toLocaleString()}</p>
              </div>
            )}

            {server.metrics.requestsPerSec !== undefined && (
              <div className={typography.body.tiny}>
                <span className="text-zinc-500">Requests/s</span>
                <p className="font-mono text-zinc-300 mt-0.5">{server.metrics.requestsPerSec.toLocaleString()}</p>
              </div>
            )}

            {server.metrics.latency !== undefined && (
              <div className={typography.body.tiny}>
                <span className="text-zinc-500">Latência</span>
                <p className="font-mono text-zinc-300 mt-0.5">{server.metrics.latency}ms</p>
              </div>
            )}
          </div>
        </div>

        {/* Role badge */}
        <div className="pt-2">
          <Badge variant="secondary" className={typography.body.tiny}>
            {role.label}
          </Badge>
          {server.location && (
            <span className={`${typography.body.tiny} text-zinc-500 ml-2`}>{server.location}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ServerCard
