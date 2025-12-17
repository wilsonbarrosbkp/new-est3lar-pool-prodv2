import { useState, useEffect, useCallback } from 'react'
import {
  FileText,
  Search,
  Clock,
  Plus,
  Edit,
  Trash2,
  LogIn,
  LogOut,
  Eye,
  ChevronDown,
  ChevronUp,
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
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterOrg, setFilterOrg] = useState<string>('all')
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterEntity, setFilterEntity] = useState<string>('all')
  const [expandedLog, setExpandedLog] = useState<number | null>(null)
  const [entityTypes, setEntityTypes] = useState<string[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [logsResult, orgsResult] = await Promise.all([
        supabase
          .from('audit_logs')
          .select(`
            *,
            organizations(name),
            users(name, email)
          `)
          .order('created_at', { ascending: false })
          .limit(200),
        supabase.from('organizations').select('id, name').order('name'),
      ])

      if (logsResult.error) throw logsResult.error
      if (orgsResult.error) throw orgsResult.error

      const logsWithDetails = (logsResult.data || []).map((log: any) => ({
        ...log,
        organization_name: log.organizations?.name,
        user_name: log.users?.name,
        user_email: log.users?.email,
      }))

      setLogs(logsWithDetails)
      setOrganizations(orgsResult.data || [])

      // Extract unique entity types
      const types = [...new Set(logsWithDetails
        .map((log: AuditLog) => log.entity_type)
        .filter((type: string | null): type is string => type !== null)
      )]
      setEntityTypes(types)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar logs de auditoria')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_id?.toLowerCase().includes(search.toLowerCase()) ||
      log.ip_address?.includes(search)
    const matchesOrg = filterOrg === 'all' || log.organization_id?.toString() === filterOrg
    const matchesAction = filterAction === 'all' || log.action === filterAction
    const matchesEntity = filterEntity === 'all' || log.entity_type === filterEntity
    return matchesSearch && matchesOrg && matchesAction && matchesEntity
  })

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR')
  }

  const getActionBadge = (action: string) => {
    const option = actionOptions.find(a => a.value === action)
    return option || { label: action, color: 'secondary', icon: Eye }
  }

  const toggleExpand = (id: number) => {
    setExpandedLog(expandedLog === id ? null : id)
  }

  const renderChanges = (log: AuditLog) => {
    if (!log.changes && !log.before_data && !log.after_data) {
      return <p className="text-text-secondary text-sm">Sem dados detalhados</p>
    }

    if (log.changes && Object.keys(log.changes).length > 0) {
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium">Alterações:</p>
          <div className="bg-background rounded-md p-3 text-xs font-mono overflow-x-auto">
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
            <p className="text-sm font-medium">Antes:</p>
            <pre className="bg-background rounded-md p-3 text-xs font-mono overflow-x-auto max-h-48">
              {JSON.stringify(log.before_data, null, 2)}
            </pre>
          </div>
        )}
        {log.after_data && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Depois:</p>
            <pre className="bg-background rounded-md p-3 text-xs font-mono overflow-x-auto max-h-48">
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
          <Select value={filterAction} onValueChange={setFilterAction}>
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
          <Select value={filterEntity} onValueChange={setFilterEntity}>
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
                <p className="text-sm text-text-secondary">Total Logs</p>
                <p className="text-xl font-bold">{filteredLogs.length}</p>
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
                <p className="text-sm text-text-secondary">Criações</p>
                <p className="text-xl font-bold">{actionCounts.CREATE}</p>
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
                <p className="text-sm text-text-secondary">Atualizações</p>
                <p className="text-xl font-bold">{actionCounts.UPDATE}</p>
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
                <p className="text-sm text-text-secondary">Exclusões</p>
                <p className="text-xl font-bold">{actionCounts.DELETE}</p>
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
                {search || filterOrg !== 'all' || filterAction !== 'all' || filterEntity !== 'all'
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
                  const isExpanded = expandedLog === log.id
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
                            <span className="text-sm">{formatDate(log.created_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{log.user_name || 'Sistema'}</p>
                            <p className="text-xs text-text-secondary">{log.user_email || '-'}</p>
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
                              <p className="font-medium">{log.entity_type}</p>
                              {log.entity_id && (
                                <code className="text-xs text-text-secondary">#{log.entity_id}</code>
                              )}
                            </div>
                          ) : (
                            <span className="text-text-secondary">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">{log.ip_address || '-'}</code>
                        </TableCell>
                        <TableCell>{log.organization_name || '-'}</TableCell>
                      </TableRow>
                      {isExpanded && hasDetails && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-surface/30 p-4">
                            {renderChanges(log)}
                            {log.user_agent && (
                              <div className="mt-4">
                                <p className="text-sm font-medium">User Agent:</p>
                                <code className="text-xs text-text-secondary break-all">
                                  {log.user_agent}
                                </code>
                              </div>
                            )}
                            <div className="mt-2">
                              <p className="text-xs text-text-secondary">
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
      <div className="text-sm text-text-secondary">
        Mostrando {filteredLogs.length} logs (máximo 200 mais recentes)
      </div>
    </div>
  )
}
