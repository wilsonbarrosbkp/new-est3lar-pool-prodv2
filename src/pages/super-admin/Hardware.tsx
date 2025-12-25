import { useCallback, useEffect, useMemo,useState } from 'react'
import {
  Calendar,
  Cpu,
  Plus,
  RefreshCw,
  Search,
  Server,
  Thermometer,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'

import { CRUDFormSheet } from '@/components/crud/CRUDFormSheet'
import { TableActionMenu } from '@/components/crud/TableActionMenu'
import { ServerCard, type ServerData } from '@/components/infrastructure/ServerCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { typography } from '@/design-system/tokens'
import { useCRUDPage } from '@/hooks/useCRUDPage'
import { handleError, showErrorToast } from '@/lib/error-handler'
import { formatHashrateWithUnit, formatUptime } from '@/lib/formatters'
import { supabase } from '@/lib/supabase/client'

import type {
  Hardware,
  OrganizationOption,
} from '@/types/super-admin'

type FormData = {
  name: string
  model: string
  manufacturer: string
  hashrate: number
  hashrate_unit: string
  power_consumption: number
  efficiency: number | null
  organization_id: number | null
  serial_number: string
  purchase_date: string
  warranty_until: string
  status: 'ativo' | 'inativo' | 'manutencao'
}

const initialFormData: FormData = {
  name: '',
  model: '',
  manufacturer: '',
  hashrate: 0,
  hashrate_unit: 'TH/s',
  power_consumption: 0,
  efficiency: null,
  organization_id: null,
  serial_number: '',
  purchase_date: '',
  warranty_until: '',
  status: 'ativo',
}

const statusOptions = [
  { value: 'ativo', label: 'Ativo', color: 'success' },
  { value: 'inativo', label: 'Inativo', color: 'secondary' },
  { value: 'manutencao', label: 'Manutenção', color: 'warning' },
] as const

// Interface para dados do banco
interface ServerFromDB {
  id: number
  name: string
  hostname: string
  ip_address: string
  role: string
  status: string
  os: string
  location: string | null
  cpu_usage: number
  memory_usage: number
  memory_total: string
  disk_usage: number
  disk_total: string
  network_in: string
  network_out: string
  uptime_seconds: number
  connections: number | null
  requests_per_sec: number | null
  latency_ms: number | null
  last_metrics_at: string | null
  created_at: string
}

// Função para converter dados do banco para o formato do componente
function mapServerFromDB(server: ServerFromDB): ServerData {
  return {
    id: server.id.toString(),
    name: server.name,
    hostname: server.hostname || '',
    ip: server.ip_address || '',
    role: server.role as ServerData['role'],
    status: server.status as ServerData['status'],
    os: server.os || 'Linux',
    location: server.location || undefined,
    metrics: {
      cpuUsage: Number(server.cpu_usage) || 0,
      memoryUsage: Number(server.memory_usage) || 0,
      memoryTotal: server.memory_total || '0 GB',
      diskUsage: Number(server.disk_usage) || 0,
      diskTotal: server.disk_total || '0 GB',
      networkIn: server.network_in || '0 Mbps',
      networkOut: server.network_out || '0 Mbps',
      uptime: formatUptime(server.uptime_seconds || 0),
      connections: server.connections || undefined,
      requestsPerSec: server.requests_per_sec || undefined,
      latency: server.latency_ms ? Number(server.latency_ms) : undefined,
    },
    lastUpdate: server.last_metrics_at ? new Date(server.last_metrics_at) : new Date(),
  }
}

export default function HardwarePage() {
  // Estados locais para dados relacionados e filtros
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([])
  const [servers, setServers] = useState<ServerData[]>([])
  const [loadingServers, setLoadingServers] = useState(true)
  const [filterOrg, setFilterOrg] = useState<string>('all')
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
    loadData,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseSheet,
    handleSubmit,
    handleDelete,
    filteredData: baseFilteredData,
  } = useCRUDPage<Hardware, FormData>({
    tableName: 'hardware',
    initialFormData,
    customLoadData: async () => {
      const [hardwareResult, orgsResult] = await Promise.all([
        supabase
          .from('hardware')
          .select(`
            *,
            organizations(name)
          `)
          .order('name'),
        supabase.from('organizations').select('id, name').eq('status', 'ativo').order('name'),
      ])

      if (hardwareResult.error) throw hardwareResult.error
      if (orgsResult.error) throw orgsResult.error

      setOrganizations(orgsResult.data || [])

      return (hardwareResult.data || []).map((item: Record<string, unknown>) => ({
        ...item,
        organization_name: (item.organizations as { name?: string } | null)?.name,
      })) as Hardware[]
    },
    mapDataToForm: (item) => ({
      name: item.name,
      model: item.model,
      manufacturer: item.manufacturer,
      hashrate: item.hashrate,
      hashrate_unit: item.hashrate_unit ?? 'TH/s',
      power_consumption: item.power_consumption,
      efficiency: item.efficiency ?? null,
      organization_id: item.organization_id,
      serial_number: item.serial_number || '',
      purchase_date: item.purchase_date || '',
      warranty_until: item.warranty_until || '',
      status: item.status,
    }),
    mapFormToData: (data) => ({
      name: data.name,
      model: data.model,
      manufacturer: data.manufacturer,
      hashrate: data.hashrate,
      hashrate_unit: data.hashrate_unit,
      power_consumption: data.power_consumption,
      efficiency: data.efficiency,
      organization_id: data.organization_id,
      serial_number: data.serial_number || null,
      purchase_date: data.purchase_date || null,
      warranty_until: data.warranty_until || null,
      status: data.status,
    }),
    validateForm: (data) => {
      if (!data.name.trim() || !data.model.trim() || !data.manufacturer.trim()) {
        return 'Nome, modelo e fabricante são obrigatórios'
      }
      if (!data.organization_id) {
        return 'Organização é obrigatória'
      }
      return null
    },
    searchFields: ['name', 'model', 'manufacturer', 'organization_name'],
    entityName: 'hardware',
    messages: {
      deleteConfirm: (item) => `Tem certeza que deseja excluir "${item.name}"?`,
    },
  })

  // Carregar servidores separadamente
  const loadServers = useCallback(async () => {
    setLoadingServers(true)
    try {
      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .order('id')

      if (error) throw error

      const mappedServers = (data || []).map((s: ServerFromDB) => mapServerFromDB(s))
      setServers(mappedServers)
    } catch (error) {
      const appError = handleError(error, 'carregar servidores')
      showErrorToast(appError)
    } finally {
      setLoadingServers(false)
    }
  }, [])

  useEffect(() => {
    loadServers()
  }, [loadServers])

  // Filtros adicionais sobre os dados já filtrados pelo hook
  const filteredHardware = useMemo(() => {
    return baseFilteredData.filter((item) => {
      const matchesOrg = filterOrg === 'all' || item.organization_id.toString() === filterOrg
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus
      return matchesOrg && matchesStatus
    })
  }, [baseFilteredData, filterOrg, filterStatus])

  // Funções auxiliares
  const updateStatus = useCallback(async (item: Hardware, newStatus: 'ativo' | 'inativo' | 'manutencao') => {
    try {
      const { error } = await supabase
        .from('hardware')
        .update({ status: newStatus })
        .eq('id', item.id)

      if (error) throw error
      loadData()
    } catch (error) {
      const appError = handleError(error, 'atualizar status do hardware')
      showErrorToast(appError)
    }
  }, [loadData])


  const getStatusBadge = useCallback((status: string) => {
    const option = statusOptions.find(s => s.value === status)
    return option || { label: status, color: 'secondary' }
  }, [])

  const totalHashrate = useMemo(
    () => filteredHardware.filter(h => h.status === 'ativo').reduce((acc, h) => acc + h.hashrate, 0),
    [filteredHardware]
  )

  const totalPower = useMemo(
    () => filteredHardware.filter(h => h.status === 'ativo').reduce((acc, h) => acc + h.power_consumption, 0),
    [filteredHardware]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-1 gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              placeholder="Buscar hardware..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterOrg} onValueChange={setFilterOrg}>
            <SelectTrigger className="w-[160px]">
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
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Hardware
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <p className={`${typography.kpi.title} text-text-secondary`}>Total Equipamentos</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{filteredHardware.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-success/10 text-success rounded-full flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className={`${typography.kpi.title} text-text-secondary`}>Hashrate Total (Ativos)</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{totalHashrate.toLocaleString()} TH/s</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-warning/10 text-warning rounded-full flex items-center justify-center">
                <Thermometer className="h-5 w-5" />
              </div>
              <div>
                <p className={`${typography.kpi.title} text-text-secondary`}>Consumo Total (Ativos)</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{(totalPower / 1000).toFixed(1)} kW</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Infraestrutura Genesis Pool */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={`${typography.card.title} flex items-center gap-2`}>
              <Server className="h-5 w-5" />
              Infraestrutura Genesis Pool
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-success">
                {servers.filter(s => s.status === 'online').length}/{servers.length} Online
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={loadServers}
                disabled={loadingServers}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingServers ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingServers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : servers.length === 0 ? (
            <div className="text-center py-12">
              <Server className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">Nenhum servidor cadastrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {servers.map((server) => (
                <ServerCard
                  key={server.id}
                  server={server}
                  onClick={() => toast.info(`Detalhes de ${server.name} em breve...`)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredHardware.length === 0 ? (
            <div className="text-center py-12">
              <Cpu className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">
                {search || filterOrg !== 'all' || filterStatus !== 'all'
                  ? 'Nenhum hardware encontrado'
                  : 'Nenhum hardware cadastrado'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Organização</TableHead>
                  <TableHead>Hashrate</TableHead>
                  <TableHead>Consumo</TableHead>
                  <TableHead>Eficiência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHardware.map((item) => {
                  const statusBadge = getStatusBadge(item.status)
                  return (
                    <TableRow key={item.id} className={item.status !== 'ativo' ? 'opacity-60' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                            <Cpu className="h-5 w-5" />
                          </div>
                          <div>
                            <p className={typography.weight.medium}>{item.name}</p>
                            <p className={`${typography.table.small} text-text-secondary`}>
                              {item.manufacturer} {item.model}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.organization_name}</TableCell>
                      <TableCell>
                        <span className="font-mono">{formatHashrateWithUnit(item.hashrate, item.hashrate_unit ?? 'TH/s')}</span>
                      </TableCell>
                      <TableCell>{item.power_consumption}W</TableCell>
                      <TableCell>
                        {item.efficiency ? `${item.efficiency} J/TH` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.color as 'success' | 'secondary' | 'warning'}>
                          {statusBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <TableActionMenu
                          actions={[
                            { label: 'Editar', onClick: () => handleOpenEdit(item) },
                            ...(item.status !== 'ativo'
                              ? [{ label: 'Marcar como Ativo', onClick: () => updateStatus(item, 'ativo') }]
                              : []),
                            ...(item.status !== 'manutencao'
                              ? [{ label: 'Enviar para Manutenção', onClick: () => updateStatus(item, 'manutencao') }]
                              : []),
                            ...(item.status !== 'inativo'
                              ? [{ label: 'Desativar', onClick: () => updateStatus(item, 'inativo') }]
                              : []),
                            { label: 'Excluir', onClick: () => handleDelete(item), variant: 'destructive' as const },
                          ]}
                        />
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
      <CRUDFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editing ? 'Editar Hardware' : 'Novo Hardware'}
        description={
          editing
            ? 'Altere as informações do hardware abaixo.'
            : 'Preencha as informações para cadastrar um novo hardware.'
        }
        onSubmit={handleSubmit}
        onCancel={handleCloseSheet}
        saving={saving}
        isEditing={!!editing}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Ex: ASIC Miner 01"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="manufacturer">Fabricante *</Label>
            <Input
              id="manufacturer"
              value={formData.manufacturer}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))
              }
              placeholder="Ex: Bitmain"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Modelo *</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, model: e.target.value }))
              }
              placeholder="Ex: S19 Pro"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization_id">Organização *</Label>
          <Select
            value={formData.organization_id?.toString() || ''}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, organization_id: Number(value) }))
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hashrate">Hashrate *</Label>
            <Input
              id="hashrate"
              type="number"
              min={0}
              value={formData.hashrate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, hashrate: Number(e.target.value) }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hashrate_unit">Unidade</Label>
            <Select
              value={formData.hashrate_unit}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, hashrate_unit: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="H/s">H/s</SelectItem>
                <SelectItem value="KH/s">KH/s</SelectItem>
                <SelectItem value="MH/s">MH/s</SelectItem>
                <SelectItem value="GH/s">GH/s</SelectItem>
                <SelectItem value="TH/s">TH/s</SelectItem>
                <SelectItem value="PH/s">PH/s</SelectItem>
                <SelectItem value="EH/s">EH/s</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="power_consumption">Consumo (Watts) *</Label>
            <Input
              id="power_consumption"
              type="number"
              min={0}
              value={formData.power_consumption}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, power_consumption: Number(e.target.value) }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="efficiency">Eficiência (J/TH)</Label>
            <Input
              id="efficiency"
              type="number"
              step="0.01"
              min={0}
              value={formData.efficiency || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, efficiency: e.target.value ? Number(e.target.value) : null }))
              }
              placeholder="Auto-calculado"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="serial_number">Número de Série</Label>
          <Input
            id="serial_number"
            value={formData.serial_number}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, serial_number: e.target.value }))
            }
            placeholder="Ex: SN123456789"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purchase_date">
              <Calendar className="h-4 w-4 inline mr-1" />
              Data de Compra
            </Label>
            <Input
              id="purchase_date"
              type="date"
              value={formData.purchase_date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, purchase_date: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="warranty_until">Garantia Até</Label>
            <Input
              id="warranty_until"
              type="date"
              value={formData.warranty_until}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, warranty_until: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: 'ativo' | 'inativo' | 'manutencao') =>
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
      </CRUDFormSheet>
    </div>
  )
}
