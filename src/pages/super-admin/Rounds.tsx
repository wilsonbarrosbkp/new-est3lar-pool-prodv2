import { useState, useEffect, useCallback } from 'react'
import {
  RotateCcw,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Hourglass,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { typography } from '@/design-system/tokens'

interface Round {
  id: number
  pool_id: number
  pool_name?: string
  height: number
  hash: string
  reward: number
  transaction_fees: number
  total_shares: number
  status: 'pendente' | 'confirmado' | 'orfao' | 'maturo'
  found_by: string | null
  found_at: string
  confirmed_at: string | null
  mature_at: string | null
  created_at: string
}

interface Pool {
  id: number
  name: string
}

const statusOptions = [
  { value: 'pendente', label: 'Pendente', color: 'warning', icon: Clock },
  { value: 'confirmado', label: 'Confirmado', color: 'primary', icon: Hourglass },
  { value: 'maturo', label: 'Maturo', color: 'success', icon: CheckCircle },
  { value: 'orfao', label: 'Órfão', color: 'error', icon: XCircle },
] as const

export default function RoundsPage() {
  const [rounds, setRounds] = useState<Round[]>([])
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPool, setFilterPool] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [roundsResult, poolsResult] = await Promise.all([
        supabase
          .from('rounds')
          .select(`
            *,
            pools(name)
          `)
          .order('found_at', { ascending: false })
          .limit(100),
        supabase.from('pools').select('id, name').order('name'),
      ])

      if (roundsResult.error) throw roundsResult.error
      if (poolsResult.error) throw poolsResult.error

      const roundsWithDetails = (roundsResult.data || []).map((round: any) => ({
        ...round,
        pool_name: round.pools?.name,
      }))

      setRounds(roundsWithDetails)
      setPools(poolsResult.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar rounds')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredRounds = rounds.filter(round => {
    const matchesSearch =
      round.hash.toLowerCase().includes(search.toLowerCase()) ||
      round.found_by?.toLowerCase().includes(search.toLowerCase()) ||
      round.height.toString().includes(search) ||
      round.pool_name?.toLowerCase().includes(search.toLowerCase())
    const matchesPool = filterPool === 'all' || round.pool_id.toString() === filterPool
    const matchesStatus = filterStatus === 'all' || round.status === filterStatus
    return matchesSearch && matchesPool && matchesStatus
  })

  const handleCopyHash = async (round: Round) => {
    try {
      await navigator.clipboard.writeText(round.hash)
      setCopiedId(round.id)
      setTimeout(() => setCopiedId(null), 2000)
      toast.success('Hash copiado!')
    } catch {
      toast.error('Erro ao copiar hash')
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('pt-BR')
  }

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`
  }

  const formatReward = (reward: number) => {
    return `${reward.toFixed(8)} BTC`
  }

  const formatShares = (shares: number) => {
    if (shares >= 1e12) return `${(shares / 1e12).toFixed(2)}T`
    if (shares >= 1e9) return `${(shares / 1e9).toFixed(2)}B`
    if (shares >= 1e6) return `${(shares / 1e6).toFixed(2)}M`
    if (shares >= 1e3) return `${(shares / 1e3).toFixed(2)}K`
    return shares.toString()
  }

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(s => s.value === status)
    return option || { label: status, color: 'secondary', icon: Clock }
  }

  const updateStatus = async (round: Round, newStatus: Round['status']) => {
    try {
      const updateData: any = { status: newStatus }
      if (newStatus === 'confirmado' && !round.confirmed_at) {
        updateData.confirmed_at = new Date().toISOString()
      }
      if (newStatus === 'maturo' && !round.mature_at) {
        updateData.mature_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('rounds')
        .update(updateData)
        .eq('id', round.id)

      if (error) throw error
      toast.success('Status atualizado!')
      loadData()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast.error('Erro ao atualizar status')
    }
  }

  const totalReward = filteredRounds.filter(r => r.status !== 'orfao').reduce((acc, r) => acc + r.reward, 0)
  const pendingRounds = filteredRounds.filter(r => r.status === 'pendente').length
  const orphanRounds = filteredRounds.filter(r => r.status === 'orfao').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-1 gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              placeholder="Buscar rounds..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterPool} onValueChange={setFilterPool}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Pool" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Pools</SelectItem>
              {pools.map((pool) => (
                <SelectItem key={pool.id} value={pool.id.toString()}>
                  {pool.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" variant="outline" onClick={loadData}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <p className={`${typography.kpi.title} text-text-secondary`}>Total Rounds</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{filteredRounds.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-success/10 text-success rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className={`${typography.kpi.title} text-text-secondary`}>Recompensa Total</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{formatReward(totalReward)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-warning/10 text-warning rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className={`${typography.kpi.title} text-text-secondary`}>Pendentes</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{pendingRounds}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-error/10 text-error rounded-full flex items-center justify-center">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className={`${typography.kpi.title} text-text-secondary`}>Órfãos</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{orphanRounds}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredRounds.length === 0 ? (
            <div className="text-center py-12">
              <RotateCcw className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">
                {search || filterPool !== 'all' || filterStatus !== 'all'
                  ? 'Nenhum round encontrado'
                  : 'Nenhum round registrado'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Altura</TableHead>
                  <TableHead>Pool</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>Recompensa</TableHead>
                  <TableHead>Shares</TableHead>
                  <TableHead>Encontrado Por</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRounds.map((round) => {
                  const statusBadge = getStatusBadge(round.status)
                  const StatusIcon = statusBadge.icon
                  return (
                    <TableRow key={round.id} className={round.status === 'orfao' ? 'opacity-60' : ''}>
                      <TableCell>
                        <span className={`font-mono ${typography.weight.bold}`}>{round.height.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>{round.pool_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className={typography.table.small}>{formatHash(round.hash)}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => handleCopyHash(round)}
                          >
                            {copiedId === round.id ? (
                              <Check className="h-3 w-3 text-success" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                          <a
                            href={`https://mempool.space/block/${round.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-mono">{formatReward(round.reward)}</span>
                          {round.transaction_fees > 0 && (
                            <p className={`${typography.table.small} text-text-secondary`}>
                              +{round.transaction_fees.toFixed(8)} fees
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{formatShares(round.total_shares)}</span>
                      </TableCell>
                      <TableCell>
                        <code className={typography.table.small}>{round.found_by || '-'}</code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className={typography.table.cell}>{formatDate(round.found_at)}</p>
                          {round.status === 'maturo' && round.mature_at && (
                            <p className={`${typography.table.small} text-success`}>Maturo: {formatDate(round.mature_at)}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={statusBadge.color as any}
                            className="gap-1 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Ciclar entre status
                              const statuses: Round['status'][] = ['pendente', 'confirmado', 'maturo', 'orfao']
                              const currentIndex = statuses.indexOf(round.status)
                              const nextStatus = statuses[(currentIndex + 1) % statuses.length]
                              updateStatus(round, nextStatus)
                            }}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusBadge.label}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <div className={`${typography.body.small} text-text-secondary`}>
        Mostrando {filteredRounds.length} rounds (máximo 100 mais recentes)
      </div>
    </div>
  )
}
