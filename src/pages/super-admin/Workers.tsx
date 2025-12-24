import { useState, useCallback, useMemo } from 'react'
import {
  Users,
  Plus,
  MoreHorizontal,
  Search,
  Wifi,
  WifiOff,
  Clock,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/Sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { supabase } from '@/lib/supabase/client'
import { typography } from '@/design-system/tokens'
import { useCRUDPage } from '@/hooks/useCRUDPage'
import type {
  Worker,
  OrganizationOption,
  PoolOption,
  HardwareOption,
} from '@/types/super-admin'

type FormData = {
  name: string
  organization_id: number | null
  pool_id: number | null
  hardware_id: number | null
  status: 'online' | 'offline' | 'idle'
}

const initialFormData: FormData = {
  name: '',
  organization_id: null,
  pool_id: null,
  hardware_id: null,
  status: 'offline',
}

const statusOptions = [
  { value: 'online', label: 'Online', color: 'success', icon: Wifi },
  { value: 'offline', label: 'Offline', color: 'error', icon: WifiOff },
  { value: 'idle', label: 'Idle', color: 'warning', icon: Clock },
] as const

export default function WorkersPage() {
  // Estados locais para dados relacionados e filtros
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([])
  const [pools, setPools] = useState<PoolOption[]>([])
  const [hardware, setHardware] = useState<HardwareOption[]>([])
  const [filterOrg, setFilterOrg] = useState<string>('all')
  const [filterPool, setFilterPool] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const {
    loading,
    search,
    setSearch,
    sheetOpen,
    setSheetOpen,
    editing,
    formData,
    setFormData,
    saving,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseSheet,
    handleSubmit,
    handleDelete,
    filteredData: baseFilteredData,
  } = useCRUDPage<Worker, FormData>({
    tableName: 'workers',
    initialFormData,
    customLoadData: async () => {
      const [workersResult, orgsResult, poolsResult, hardwareResult] = await Promise.all([
        supabase
          .from('workers')
          .select(`
            *,
            organizations(name),
            pools(name),
            hardware(name)
          `)
          .order('status', { ascending: true })
          .order('name'),
        supabase.from('organizations').select('id, name').eq('status', 'ativo').order('name'),
        supabase.from('pools').select('id, name, organization_id').eq('is_active', true).order('name'),
        supabase.from('hardware').select('id, name, organization_id').eq('status', 'ativo').order('name'),
      ])

      if (workersResult.error) throw workersResult.error
      if (orgsResult.error) throw orgsResult.error
      if (poolsResult.error) throw poolsResult.error
      if (hardwareResult.error) throw hardwareResult.error

      setOrganizations(orgsResult.data || [])
      setPools(poolsResult.data || [])
      setHardware(hardwareResult.data || [])

      // Tipo para o resultado da query com joins
      type WorkerWithRelations = Worker & {
        organizations: { name: string } | null
        pools: { name: string } | null
        hardware: { name: string } | null
      }

      return (workersResult.data || []).map((worker: WorkerWithRelations) => ({
        ...worker,
        organization_name: worker.organizations?.name,
        pool_name: worker.pools?.name,
        hardware_name: worker.hardware?.name,
      })) as Worker[]
    },
    mapDataToForm: (worker) => ({
      name: worker.name,
      organization_id: worker.organization_id,
      pool_id: worker.pool_id,
      hardware_id: worker.hardware_id ?? null,
      status: worker.status,
    }),
    mapFormToData: (data) => ({
      name: data.name,
      organization_id: data.organization_id,
      pool_id: data.pool_id,
      hardware_id: data.hardware_id,
      status: data.status,
    }),
    validateForm: (data) => {
      if (!data.name.trim()) {
        return 'Nome é obrigatório'
      }
      if (!data.organization_id || !data.pool_id) {
        return 'Organização e pool são obrigatórios'
      }
      return null
    },
    searchFields: ['name', 'organization_name', 'pool_name'],
    entityName: 'worker',
    messages: {
      deleteConfirm: (worker) => `Tem certeza que deseja excluir "${worker.name}"?`,
    },
  })

  // Filtros adicionais sobre os dados já filtrados pelo hook
  const filteredWorkers = useMemo(() => {
    return baseFilteredData.filter((worker) => {
      const matchesOrg = filterOrg === 'all' || worker.organization_id.toString() === filterOrg
      const matchesPool = filterPool === 'all' || worker.pool_id.toString() === filterPool
      const matchesStatus = filterStatus === 'all' || worker.status === filterStatus
      return matchesOrg && matchesPool && matchesStatus
    })
  }, [baseFilteredData, filterOrg, filterPool, filterStatus])

  // Filter pools by selected organization
  const filteredPools = useMemo(
    () => formData.organization_id
      ? pools.filter(p => p.organization_id === formData.organization_id)
      : pools,
    [pools, formData.organization_id]
  )

  // Filter hardware by selected organization
  const filteredHardware = useMemo(
    () => formData.organization_id
      ? hardware.filter(h => h.organization_id === formData.organization_id)
      : hardware,
    [hardware, formData.organization_id]
  )

  // Funções auxiliares
  const formatHashrate = useCallback((hashrate: number) => {
    if (hashrate >= 1e15) return `${(hashrate / 1e15).toFixed(2)} PH/s`
    if (hashrate >= 1e12) return `${(hashrate / 1e12).toFixed(2)} TH/s`
    if (hashrate >= 1e9) return `${(hashrate / 1e9).toFixed(2)} GH/s`
    if (hashrate >= 1e6) return `${(hashrate / 1e6).toFixed(2)} MH/s`
    if (hashrate >= 1e3) return `${(hashrate / 1e3).toFixed(2)} KH/s`
    return `${hashrate} H/s`
  }, [])

  const formatTimeAgo = useCallback((date: string | null) => {
    if (!date) return 'Nunca'
    const now = new Date()
    const then = new Date(date)
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000)

    if (diff < 60) return `${diff}s atrás`
    if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`
    return `${Math.floor(diff / 86400)}d atrás`
  }, [])

  const getStatusBadge = useCallback((status: string) => {
    const option = statusOptions.find(s => s.value === status)
    return option || { label: status, color: 'secondary', icon: WifiOff }
  }, [])

  const getSharesEfficiency = useCallback((worker: Worker) => {
    const total = worker.shares_accepted + worker.shares_rejected + (worker.shares_stale ?? 0)
    if (total === 0) return 0
    return ((worker.shares_accepted / total) * 100).toFixed(1)
  }, [])

  const onlineWorkers = useMemo(
    () => filteredWorkers.filter(w => w.status === 'online'),
    [filteredWorkers]
  )
  const offlineWorkers = useMemo(
    () => filteredWorkers.filter(w => w.status === 'offline'),
    [filteredWorkers]
  )
  const totalHashrate = useMemo(
    () => onlineWorkers.reduce((acc, w) => acc + w.hashrate, 0),
    [onlineWorkers]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-1 gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              placeholder="Buscar workers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterOrg} onValueChange={setFilterOrg}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Organização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Orgs</SelectItem>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id.toString()}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterPool} onValueChange={setFilterPool}>
            <SelectTrigger className="w-[140px]">
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
            <SelectTrigger className="w-[120px]">
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
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Worker
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className={`${typography.kpi.title} text-text-secondary`}>Total Workers</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{filteredWorkers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-success/10 text-success rounded-full flex items-center justify-center">
                <Wifi className="h-5 w-5" />
              </div>
              <div>
                <p className={`${typography.kpi.title} text-text-secondary`}>Online</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{onlineWorkers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-error/10 text-error rounded-full flex items-center justify-center">
                <WifiOff className="h-5 w-5" />
              </div>
              <div>
                <p className={`${typography.kpi.title} text-text-secondary`}>Offline</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{offlineWorkers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-warning/10 text-warning rounded-full flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className={`${typography.kpi.title} text-text-secondary`}>Hashrate Total</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{formatHashrate(totalHashrate)}</p>
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
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">
                {search || filterOrg !== 'all' || filterPool !== 'all' || filterStatus !== 'all'
                  ? 'Nenhum worker encontrado'
                  : 'Nenhum worker cadastrado'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead>Pool</TableHead>
                  <TableHead>Hashrate</TableHead>
                  <TableHead>Shares</TableHead>
                  <TableHead>Eficiência</TableHead>
                  <TableHead>Última Atividade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers.map((worker) => {
                  const statusBadge = getStatusBadge(worker.status)
                  const StatusIcon = statusBadge.icon
                  return (
                    <TableRow key={worker.id} className={worker.status === 'offline' ? 'opacity-60' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            worker.status === 'online'
                              ? 'bg-success/10 text-success'
                              : worker.status === 'idle'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-surface text-text-secondary'
                          }`}>
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className={typography.weight.medium}>{worker.name}</p>
                            <p className={`${typography.table.small} text-text-secondary`}>
                              {worker.organization_name}
                              {worker.hardware_name && ` • ${worker.hardware_name}`}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{worker.pool_name}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-mono">{formatHashrate(worker.hashrate)}</p>
                          <p className={`${typography.table.small} text-text-secondary`}>
                            1h: {formatHashrate(worker.hashrate_1h ?? 0)} | 24h: {formatHashrate(worker.hashrate_24h ?? 0)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={typography.table.cell}>
                          <span className="text-success">{worker.shares_accepted.toLocaleString()}</span>
                          {' / '}
                          <span className="text-error">{worker.shares_rejected.toLocaleString()}</span>
                          {(worker.shares_stale ?? 0) > 0 && (
                            <>
                              {' / '}
                              <span className="text-warning">{(worker.shares_stale ?? 0).toLocaleString()}</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-mono ${
                          Number(getSharesEfficiency(worker)) > 95
                            ? 'text-success'
                            : Number(getSharesEfficiency(worker)) > 90
                            ? 'text-warning'
                            : 'text-error'
                        }`}>
                          {getSharesEfficiency(worker)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`${typography.table.cell} text-text-secondary`}>
                          {formatTimeAgo(worker.last_seen ?? null)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.color as any}>
                          {statusBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEdit(worker)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-error"
                              onClick={() => handleDelete(worker)}
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Sheet de criação/edição */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {editing ? 'Editar Worker' : 'Novo Worker'}
            </SheetTitle>
            <SheetDescription>
              {editing
                ? 'Altere as informações do worker abaixo.'
                : 'Preencha as informações para criar um novo worker.'}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ex: worker-01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization_id">Organização *</Label>
              <Select
                value={formData.organization_id?.toString() || ''}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    organization_id: Number(value),
                    pool_id: null,
                    hardware_id: null,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma organização" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id.toString()}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pool_id">Pool *</Label>
              <Select
                value={formData.pool_id?.toString() || ''}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, pool_id: Number(value) }))
                }
                disabled={!formData.organization_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.organization_id ? "Selecione um pool" : "Selecione a organização primeiro"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredPools.map((pool) => (
                    <SelectItem key={pool.id} value={pool.id.toString()}>
                      {pool.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hardware_id">Hardware (opcional)</Label>
              <Select
                value={formData.hardware_id?.toString() || 'none'}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, hardware_id: value === 'none' ? null : Number(value) }))
                }
                disabled={!formData.organization_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um hardware" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {filteredHardware.map((hw) => (
                    <SelectItem key={hw.id} value={hw.id.toString()}>
                      {hw.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'online' | 'offline' | 'idle') =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <SheetFooter className="gap-2 sm:gap-0 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseSheet}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Criar'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
