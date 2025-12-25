import { useState, useCallback, useMemo } from 'react'
import {
  Globe,
  Plus,
  MoreHorizontal,
  Search,
  Server,
  Webhook,
  Copy,
  Check,
  Lock,
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
import { Switch } from '@/components/ui/Switch'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { handleError, showErrorToast } from '@/lib/error-handler'
import { typography } from '@/design-system/tokens'
import { useCRUDPage } from '@/hooks/useCRUDPage'
import type {
  Endpoint,
  OrganizationOption,
} from '@/types/super-admin'

type FormData = {
  name: string
  url: string
  type: 'stratum' | 'api' | 'webhook'
  organization_id: number | null
  port: number | null
  difficulty: number | null
  is_ssl: boolean
  status: 'ativo' | 'inativo'
}

const initialFormData: FormData = {
  name: '',
  url: '',
  type: 'stratum',
  organization_id: null,
  port: 3333,
  difficulty: null,
  is_ssl: false,
  status: 'ativo',
}

const typeOptions = [
  { value: 'stratum', label: 'Stratum', icon: Server, color: 'primary' },
  { value: 'api', label: 'API', icon: Globe, color: 'success' },
  { value: 'webhook', label: 'Webhook', icon: Webhook, color: 'warning' },
] as const

export default function EndpointsPage() {
  // Estados locais para dados relacionados e filtros
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([])
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const {
    data: endpoints,
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
  } = useCRUDPage<Endpoint, FormData>({
    tableName: 'endpoints',
    initialFormData,
    customLoadData: async () => {
      const [endpointsResult, orgsResult] = await Promise.all([
        supabase
          .from('endpoints')
          .select(`
            *,
            organizations(name)
          `)
          .order('type')
          .order('name'),
        supabase.from('organizations').select('id, name').eq('status', 'ativo').order('name'),
      ])

      if (endpointsResult.error) throw endpointsResult.error
      if (orgsResult.error) throw orgsResult.error

      setOrganizations(orgsResult.data || [])

      // Tipo para o resultado da query com join
      type EndpointWithOrg = Endpoint & {
        organizations: { name: string } | null
      }

      return (endpointsResult.data || []).map((endpoint: EndpointWithOrg) => ({
        ...endpoint,
        organization_name: endpoint.organizations?.name,
      })) as Endpoint[]
    },
    mapDataToForm: (endpoint) => ({
      name: endpoint.name,
      url: endpoint.url,
      type: endpoint.type,
      organization_id: endpoint.organization_id ?? null,
      port: endpoint.port ?? null,
      difficulty: endpoint.difficulty ?? null,
      is_ssl: endpoint.is_ssl ?? false,
      status: endpoint.status,
    }),
    mapFormToData: (data) => ({
      name: data.name,
      url: data.url,
      type: data.type,
      organization_id: data.organization_id,
      port: data.port,
      difficulty: data.difficulty,
      is_ssl: data.is_ssl,
      status: data.status,
    }),
    validateForm: (data) => {
      if (!data.name.trim() || !data.url.trim()) {
        return 'Nome e URL são obrigatórios'
      }
      return null
    },
    searchFields: ['name', 'url', 'organization_name'],
    entityName: 'endpoint',
    messages: {
      deleteConfirm: (endpoint) => `Tem certeza que deseja excluir "${endpoint.name}"?`,
    },
  })

  // Filtros adicionais sobre os dados já filtrados pelo hook
  const filteredEndpoints = useMemo(() => {
    return baseFilteredData.filter((endpoint) => {
      const matchesType = filterType === 'all' || endpoint.type === filterType
      const matchesStatus = filterStatus === 'all' || endpoint.status === filterStatus
      return matchesType && matchesStatus
    })
  }, [baseFilteredData, filterType, filterStatus])

  // Funções auxiliares
  const handleCopyUrl = useCallback(async (endpoint: Endpoint) => {
    const fullUrl = endpoint.port
      ? `${endpoint.is_ssl ? 'ssl://' : ''}${endpoint.url}:${endpoint.port}`
      : endpoint.url
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopiedId(endpoint.id)
      setTimeout(() => setCopiedId(null), 2000)
      toast.success('URL copiada!')
    } catch {
      toast.error('Erro ao copiar URL')
    }
  }, [])

  const toggleStatus = useCallback(async (endpoint: Endpoint) => {
    try {
      const { error } = await supabase
        .from('endpoints')
        .update({ status: endpoint.status === 'ativo' ? 'inativo' : 'ativo' })
        .eq('id', endpoint.id)

      if (error) throw error
      loadData()
    } catch (error) {
      const appError = handleError(error, 'atualizar status do endpoint')
      showErrorToast(appError)
    }
  }, [loadData])

  const getTypeOption = useCallback((type: string) => {
    return typeOptions.find(t => t.value === type) || typeOptions[0]
  }, [])

  const formatUrl = useCallback((endpoint: Endpoint) => {
    const protocol = endpoint.is_ssl ? 'ssl://' : ''
    const port = endpoint.port ? `:${endpoint.port}` : ''
    return `${protocol}${endpoint.url}${port}`
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-1 gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              placeholder="Buscar endpoints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Tipos</SelectItem>
              {typeOptions.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
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
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Endpoint
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {typeOptions.map((type) => {
          const count = endpoints.filter(e => e.type === type.value && e.status === 'ativo').length
          const TypeIcon = type.icon
          return (
            <Card key={type.value}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 bg-${type.color}/10 text-${type.color} rounded-full flex items-center justify-center`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={`${typography.kpi.title} text-text-secondary`}>{type.label} Ativos</p>
                    <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
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
          ) : filteredEndpoints.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">
                {search || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Nenhum endpoint encontrado'
                  : 'Nenhum endpoint cadastrado'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Organização</TableHead>
                  <TableHead>SSL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEndpoints.map((endpoint) => {
                  const typeOption = getTypeOption(endpoint.type)
                  const TypeIcon = typeOption.icon
                  return (
                    <TableRow key={endpoint.id} className={endpoint.status === 'inativo' ? 'opacity-60' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 bg-${typeOption.color}/10 text-${typeOption.color} rounded-full flex items-center justify-center`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className={typography.weight.medium}>{endpoint.name}</p>
                            {endpoint.difficulty && (
                              <p className={`${typography.table.small} text-text-secondary`}>
                                Diff: {endpoint.difficulty}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={typeOption.color as any}>{typeOption.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className={`${typography.table.small} bg-surface px-2 py-1 rounded`}>
                            {formatUrl(endpoint)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleCopyUrl(endpoint)}
                          >
                            {copiedId === endpoint.id ? (
                              <Check className="h-3 w-3 text-success" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{endpoint.organization_name || 'Global'}</TableCell>
                      <TableCell>
                        {endpoint.is_ssl ? (
                          <Badge variant="success" className="gap-1">
                            <Lock className="h-3 w-3" />
                            SSL
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Não</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={endpoint.status === 'ativo' ? 'success' : 'secondary'}
                          className="cursor-pointer"
                          onClick={() => toggleStatus(endpoint)}
                        >
                          {endpoint.status === 'ativo' ? 'Ativo' : 'Inativo'}
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
                            <DropdownMenuItem onClick={() => handleOpenEdit(endpoint)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-error"
                              onClick={() => handleDelete(endpoint)}
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
              {editing ? 'Editar Endpoint' : 'Novo Endpoint'}
            </SheetTitle>
            <SheetDescription>
              {editing
                ? 'Altere as informações do endpoint abaixo.'
                : 'Preencha as informações para criar um novo endpoint.'}
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
                placeholder="Ex: Stratum Principal"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL/Host *</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="Ex: stratum.exemplo.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'stratum' | 'api' | 'webhook') =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="port">Porta</Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.port || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, port: e.target.value ? Number(e.target.value) : null }))
                  }
                  placeholder="3333"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization_id">Organização (opcional)</Label>
              <Select
                value={formData.organization_id?.toString() || 'global'}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, organization_id: value === 'global' ? null : Number(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Global" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global (todos)</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id.toString()}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'stratum' && (
              <div className="space-y-2">
                <Label htmlFor="difficulty">Dificuldade Inicial</Label>
                <Input
                  id="difficulty"
                  type="number"
                  step="0.00000001"
                  value={formData.difficulty || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, difficulty: e.target.value ? Number(e.target.value) : null }))
                  }
                  placeholder="Variável"
                />
              </div>
            )}

            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="is_ssl">Usar SSL/TLS</Label>
                <p className={`${typography.form.helper} text-text-secondary`}>Conexão segura</p>
              </div>
              <Switch
                id="is_ssl"
                checked={formData.is_ssl}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({ ...prev, is_ssl: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'ativo' | 'inativo') =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
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
