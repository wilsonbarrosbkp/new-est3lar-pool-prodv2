import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Edit,
  Eye,
  FileText,
  LogIn,
  LogOut,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
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
import { useReadOnlyPage } from '@/hooks/useReadOnlyPage'
import { handleError } from '@/lib/error-handler'
import { formatDateTime } from '@/lib/formatters'
import { supabase } from '@/lib/supabase/client'

interface AuditLog {
  id: number
  organization_id: number | null
  organization_name?: string
  user_id: string | null
  user_name?: string
  user_email?: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'ACCESS'
  entity_type: string | null
  entity_id: string | null
  before_data: Record<string, any> | null
  after_data: Record<string, any> | null
  changes: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  correlation_id: string
  created_at: string
}

interface Organization {
  id: number
  name: string
}

const actionOptions = [
  { value: 'CREATE', label: 'Criação', color: 'success', icon: Plus },
  { value: 'UPDATE', label: 'Atualização', color: 'warning', icon: Edit },
  { value: 'DELETE', label: 'Exclusão', color: 'error', icon: Trash2 },
  { value: 'LOGIN', label: 'Login', color: 'primary', icon: LogIn },
  { value: 'LOGOUT', label: 'Logout', color: 'secondary', icon: LogOut },
  { value: 'ACCESS', label: 'Acesso', color: 'secondary', icon: Eye },
] as const

export default function AuditPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [entityTypes, setEntityTypes] = useState<string[]>([])

  // Hook useReadOnlyPage
  const {
    loading,
    search,
    setSearch,
    filters,
    setFilter,
    loadData,
    expandedIds,
    toggleExpand,
    filteredData: baseFilteredData,
  } = useReadOnlyPage<AuditLog>({
    tableName: 'audit_logs',
    selectFields: `
      *,
      organizations(name),
      users(name, email)
    `,
    searchFields: ['user_name', 'user_email', 'entity_type', 'entity_id', 'ip_address'],
    defaultOrderBy: { column: 'created_at', ascending: false },
    limit: 200,
    entityName: 'log de auditoria',
    onDataLoaded: async (data) => {
      // Carregar organizations quando os dados forem carregados
      try {
        const { data: orgsData, error } = await supabase
          .from('organizations')
          .select('id, name')
          .order('name')
        if (error) throw error
        setOrganizations(orgsData || [])
      } catch (error) {
        handleError(error, 'carregar organizations')
      }

      // Extrair tipos de entidades únicos
      const types = [...new Set(data
        .map((log: AuditLog) => log.entity_type)
        .filter((type: string | null): type is string => type !== null)
      )]
      setEntityTypes(types)
    },
    customLoadData: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          organizations(name),
          users(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(200)

      if (error) throw error

      // Tipo para o resultado da query com joins
      type AuditLogWithRelations = AuditLog & {
        organizations: { name: string } | null
        users: { name: string; email: string } | null
      }

      return (data || []).map((log: AuditLogWithRelations) => ({
        ...log,
        organization_name: log.organizations?.name,
        user_name: log.users?.name,
        user_email: log.users?.email,
      }))
    },
  })

  // Inicializar filtros com 'all'
  if (!filters.org) setFilter('org', 'all')
  if (!filters.action) setFilter('action', 'all')
  if (!filters.entity) setFilter('entity', 'all')

  // Aplicar filtros customizados
  const filteredLogs = baseFilteredData.filter(log => {
    const matchesOrg = filters.org === 'all' || !filters.org || log.organization_id?.toString() === filters.org
    const matchesAction = filters.action === 'all' || !filters.action || log.action === filters.action
    const matchesEntity = filters.entity === 'all' || !filters.entity || log.entity_type === filters.entity
    return matchesOrg && matchesAction && matchesEntity
  })

  const getActionBadge = (action: string) => {
    const option = actionOptions.find(a => a.value === action)
    return option || { label: action, color: 'secondary', icon: Eye }
  }

  const renderChanges = (log: AuditLog) => {
    if (!log.changes && !log.before_data && !log.after_data) {
      return <p className={`text-text-secondary ${typography.body.small}`}>Sem dados detalhados</p>
    }

    if (log.changes && Object.keys(log.changes).length > 0) {
      return (
        <div className="space-y-2">
          <p className={`${typography.body.small} ${typography.weight.medium}`}>Alterações:</p>
          <div className={`bg-background rounded-md p-3 ${typography.body.tiny} font-mono overflow-x-auto`}>
            {Object.entries(log.changes).map(([key, value]: [string, any]) => (
              <div key={key} className="flex gap-2 py-1 border-b border-border last:border-0">
                <span className="text-text-secondary">{key}:</span>
                <span className="text-error">{JSON.stringify(value?.old)}</span>
                <span className="text-text-secondary">→</span>
                <span className="text-success">{JSON.stringify(value?.new)}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        {log.before_data && (
          <div className="space-y-2">
            <p className={`${typography.body.small} ${typography.weight.medium}`}>Antes:</p>
            <pre className={`bg-background rounded-md p-3 ${typography.body.tiny} font-mono overflow-x-auto max-h-48`}>
              {JSON.stringify(log.before_data, null, 2)}
            </pre>
          </div>
        )}
        {log.after_data && (
          <div className="space-y-2">
            <p className={`${typography.body.small} ${typography.weight.medium}`}>Depois:</p>
            <pre className={`bg-background rounded-md p-3 ${typography.body.tiny} font-mono overflow-x-auto max-h-48`}>
              {JSON.stringify(log.after_data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    )
  }

  const actionCounts = {
    CREATE: filteredLogs.filter(l => l.action === 'CREATE').length,
    UPDATE: filteredLogs.filter(l => l.action === 'UPDATE').length,
    DELETE: filteredLogs.filter(l => l.action === 'DELETE').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-1 gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              placeholder="Buscar logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filters.org || 'all'} onValueChange={(value) => setFilter('org', value)}>
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
          <Select value={filters.action || 'all'} onValueChange={(value) => setFilter('action', value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Ações</SelectItem>
              {actionOptions.map((action) => (
                <SelectItem key={action.value} value={action.value}>
                  {action.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.entity || 'all'} onValueChange={(value) => setFilter('entity', value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Entidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Entidades</SelectItem>
              {entityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" variant="outline" onClick={loadData}>
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className={`${typography.kpi.title} text-text-secondary`}>Total Logs</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{filteredLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-success/10 text-success rounded-full flex items-center justify-center">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <p className={`${typography.kpi.title} text-text-secondary`}>Criações</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{actionCounts.CREATE}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-warning/10 text-warning rounded-full flex items-center justify-center">
                <Edit className="h-5 w-5" />
              </div>
              <div>
                <p className={`${typography.kpi.title} text-text-secondary`}>Atualizações</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{actionCounts.UPDATE}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-error/10 text-error rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <p className={`${typography.kpi.title} text-text-secondary`}>Exclusões</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{actionCounts.DELETE}</p>
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
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">
                {search || filters.org !== 'all' || filters.action !== 'all' || filters.entity !== 'all'
                  ? 'Nenhum log encontrado'
                  : 'Nenhum log de auditoria registrado'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Organização</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => {
                  const actionBadge = getActionBadge(log.action)
                  const ActionIcon = actionBadge.icon
                  const isExpanded = expandedIds.has(log.id)
                  const hasDetails = log.changes || log.before_data || log.after_data

                  return (
                    <>
                      <TableRow
                        key={log.id}
                        className={hasDetails ? 'cursor-pointer hover:bg-surface/50' : ''}
                        onClick={() => hasDetails && toggleExpand(log.id)}
                      >
                        <TableCell>
                          {hasDetails && (
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-text-secondary" />
                            <span className={typography.body.small}>{formatDateTime(log.created_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className={typography.weight.medium}>{log.user_name || 'Sistema'}</p>
                            <p className={`${typography.body.tiny} text-text-secondary`}>{log.user_email || '-'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={actionBadge.color as any} className="gap-1">
                            <ActionIcon className="h-3 w-3" />
                            {actionBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.entity_type ? (
                            <div>
                              <p className={typography.weight.medium}>{log.entity_type}</p>
                              {log.entity_id && (
                                <code className={`${typography.body.tiny} text-text-secondary`}>#{log.entity_id}</code>
                              )}
                            </div>
                          ) : (
                            <span className="text-text-secondary">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <code className={typography.body.tiny}>{log.ip_address || '-'}</code>
                        </TableCell>
                        <TableCell>{log.organization_name || '-'}</TableCell>
                      </TableRow>
                      {isExpanded && hasDetails && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-surface/30 p-4">
                            {renderChanges(log)}
                            {log.user_agent && (
                              <div className="mt-4">
                                <p className={`${typography.body.small} ${typography.weight.medium}`}>User Agent:</p>
                                <code className={`${typography.body.tiny} text-text-secondary break-all`}>
                                  {log.user_agent}
                                </code>
                              </div>
                            )}
                            <div className="mt-2">
                              <p className={`${typography.body.tiny} text-text-secondary`}>
                                Correlation ID: <code>{log.correlation_id}</code>
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <div className={`${typography.body.small} text-text-secondary`}>
        Mostrando {filteredLogs.length} logs (máximo 200 mais recentes)
      </div>
    </div>
  )
}
