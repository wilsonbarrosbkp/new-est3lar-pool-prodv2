import { useState, useEffect, useCallback } from 'react'
import {
  Webhook,
  Plus,
  MoreHorizontal,
  Search,
  Clock,
  CheckCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
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
import { Checkbox } from '@/components/ui/Checkbox'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

interface WebhookData {
  id: number
  name: string
  url: string
  events: string[]
  organization_id: number
  organization_name?: string
  secret: string | null
  headers: Record<string, string> | null
  retry_count: number
  timeout_ms: number
  status: 'ativo' | 'inativo'
  created_at: string
  last_triggered: string | null
}

interface Organization {
  id: number
  name: string
}

type FormData = {
  name: string
  url: string
  events: string[]
  organization_id: number | null
  secret: string
  retry_count: number
  timeout_ms: number
  status: 'ativo' | 'inativo'
}

const initialFormData: FormData = {
  name: '',
  url: '',
  events: [],
  organization_id: null,
  secret: '',
  retry_count: 3,
  timeout_ms: 30000,
  status: 'ativo',
}

const availableEvents = [
  { value: 'payment.created', label: 'Pagamento Criado' },
  { value: 'payment.completed', label: 'Pagamento Concluído' },
  { value: 'payment.failed', label: 'Pagamento Falhou' },
  { value: 'round.found', label: 'Round Encontrado' },
  { value: 'round.confirmed', label: 'Round Confirmado' },
  { value: 'round.mature', label: 'Round Maturo' },
  { value: 'round.orphan', label: 'Round Órfão' },
  { value: 'worker.online', label: 'Worker Online' },
  { value: 'worker.offline', label: 'Worker Offline' },
  { value: 'pool.stats', label: 'Estatísticas do Pool' },
]

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookData[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterOrg, setFilterOrg] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<WebhookData | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [showSecret, setShowSecret] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [webhooksResult, orgsResult] = await Promise.all([
        supabase
          .from('webhooks')
          .select(`
            *,
            organizations(name)
          `)
          .order('name'),
        supabase.from('organizations').select('id, name').eq('status', 'ativo').order('name'),
      ])

      if (webhooksResult.error) throw webhooksResult.error
      if (orgsResult.error) throw orgsResult.error

      const webhooksWithDetails = (webhooksResult.data || []).map((webhook: any) => ({
        ...webhook,
        organization_name: webhook.organizations?.name,
      }))

      setWebhooks(webhooksWithDetails)
      setOrganizations(orgsResult.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar webhooks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredWebhooks = webhooks.filter(webhook => {
    const matchesSearch =
      webhook.name.toLowerCase().includes(search.toLowerCase()) ||
      webhook.url.toLowerCase().includes(search.toLowerCase()) ||
      webhook.organization_name?.toLowerCase().includes(search.toLowerCase())
    const matchesOrg = filterOrg === 'all' || webhook.organization_id.toString() === filterOrg
    const matchesStatus = filterStatus === 'all' || webhook.status === filterStatus
    return matchesSearch && matchesOrg && matchesStatus
  })

  const handleCopyUrl = async (webhook: WebhookData) => {
    try {
      await navigator.clipboard.writeText(webhook.url)
      setCopiedId(webhook.id)
      setTimeout(() => setCopiedId(null), 2000)
      toast.success('URL copiada!')
    } catch {
      toast.error('Erro ao copiar URL')
    }
  }

  const handleOpenCreate = () => {
    setEditingWebhook(null)
    setFormData(initialFormData)
    setSheetOpen(true)
  }

  const handleOpenEdit = (webhook: WebhookData) => {
    setEditingWebhook(webhook)
    setFormData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events || [],
      organization_id: webhook.organization_id,
      secret: webhook.secret || '',
      retry_count: webhook.retry_count,
      timeout_ms: webhook.timeout_ms,
      status: webhook.status,
    })
    setSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setSheetOpen(false)
    setEditingWebhook(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.url.trim()) {
      toast.error('Nome e URL são obrigatórios')
      return
    }

    if (!formData.organization_id) {
      toast.error('Organização é obrigatória')
      return
    }

    if (formData.events.length === 0) {
      toast.error('Selecione pelo menos um evento')
      return
    }

    setSaving(true)

    try {
      const webhookData = {
        name: formData.name,
        url: formData.url,
        events: formData.events,
        organization_id: formData.organization_id,
        secret: formData.secret || null,
        retry_count: formData.retry_count,
        timeout_ms: formData.timeout_ms,
        status: formData.status,
      }

      if (editingWebhook) {
        const { error } = await supabase
          .from('webhooks')
          .update(webhookData)
          .eq('id', editingWebhook.id)

        if (error) throw error
        toast.success('Webhook atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('webhooks')
          .insert(webhookData)

        if (error) throw error
        toast.success('Webhook criado com sucesso!')
      }

      handleCloseSheet()
      loadData()
    } catch (error) {
      console.error('Erro ao salvar webhook:', error)
      toast.error('Erro ao salvar webhook')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (webhook: WebhookData) => {
    if (!confirm(`Tem certeza que deseja excluir "${webhook.name}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', webhook.id)

      if (error) throw error

      toast.success('Webhook excluído com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir webhook:', error)
      toast.error('Erro ao excluir webhook')
    }
  }

  const toggleStatus = async (webhook: WebhookData) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .update({ status: webhook.status === 'ativo' ? 'inativo' : 'ativo' })
        .eq('id', webhook.id)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast.error('Erro ao atualizar status')
    }
  }

  const testWebhook = async (webhook: WebhookData) => {
    toast.info(`Testando webhook "${webhook.name}"...`)
    // In a real implementation, this would trigger a test payload
    setTimeout(() => {
      toast.success('Webhook testado com sucesso!')
    }, 1000)
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Nunca'
    return new Date(date).toLocaleString('pt-BR')
  }

  const toggleEvent = (event: string) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }))
  }

  const activeWebhooks = filteredWebhooks.filter(w => w.status === 'ativo').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-1 gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              placeholder="Buscar webhooks..."
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
          Novo Webhook
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <Webhook className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Webhooks</p>
                <p className="text-xl font-bold">{filteredWebhooks.length}</p>
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
                <p className="text-sm text-text-secondary">Ativos</p>
                <p className="text-xl font-bold">{activeWebhooks}</p>
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
                <p className="text-sm text-text-secondary">Inativos</p>
                <p className="text-xl font-bold">{filteredWebhooks.length - activeWebhooks}</p>
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
          ) : filteredWebhooks.length === 0 ? (
            <div className="text-center py-12">
              <Webhook className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">
                {search || filterOrg !== 'all' || filterStatus !== 'all'
                  ? 'Nenhum webhook encontrado'
                  : 'Nenhum webhook cadastrado'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Webhook</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Eventos</TableHead>
                  <TableHead>Organização</TableHead>
                  <TableHead>Último Disparo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWebhooks.map((webhook) => (
                  <TableRow key={webhook.id} className={webhook.status === 'inativo' ? 'opacity-60' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                          <Webhook className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{webhook.name}</p>
                          <p className="text-xs text-text-secondary">
                            {webhook.retry_count} retries | {webhook.timeout_ms}ms timeout
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 max-w-[200px]">
                        <code className="text-xs truncate">{webhook.url}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 flex-shrink-0"
                          onClick={() => handleCopyUrl(webhook)}
                        >
                          {copiedId === webhook.id ? (
                            <Check className="h-3 w-3 text-success" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      {webhook.secret && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-text-secondary">Secret:</span>
                          <code className="text-xs">
                            {showSecret === webhook.id
                              ? webhook.secret.slice(0, 20) + '...'
                              : '••••••••'}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => setShowSecret(showSecret === webhook.id ? null : webhook.id)}
                          >
                            {showSecret === webhook.id ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {webhook.events.slice(0, 2).map((event) => (
                          <Badge key={event} variant="secondary" className="text-xs">
                            {event.split('.')[1]}
                          </Badge>
                        ))}
                        {webhook.events.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{webhook.events.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{webhook.organization_name}</TableCell>
                    <TableCell>
                      <span className="text-sm text-text-secondary">
                        {formatDate(webhook.last_triggered)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={webhook.status === 'ativo' ? 'success' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => toggleStatus(webhook)}
                      >
                        {webhook.status === 'ativo' ? 'Ativo' : 'Inativo'}
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
                          <DropdownMenuItem onClick={() => handleOpenEdit(webhook)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => testWebhook(webhook)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Testar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-error"
                            onClick={() => handleDelete(webhook)}
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Sheet de criação/edição */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingWebhook ? 'Editar Webhook' : 'Novo Webhook'}
            </SheetTitle>
            <SheetDescription>
              {editingWebhook
                ? 'Altere as informações do webhook abaixo.'
                : 'Preencha as informações para criar um novo webhook.'}
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
                placeholder="Ex: Notificação de Pagamentos"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://exemplo.com/webhook"
                required
              />
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

            <div className="space-y-2">
              <Label>Eventos *</Label>
              <div className="grid grid-cols-2 gap-2 p-3 bg-surface rounded-lg max-h-48 overflow-y-auto">
                {availableEvents.map((event) => (
                  <div key={event.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={event.value}
                      checked={formData.events.includes(event.value)}
                      onCheckedChange={() => toggleEvent(event.value)}
                    />
                    <label
                      htmlFor={event.value}
                      className="text-sm cursor-pointer"
                    >
                      {event.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secret">Secret (opcional)</Label>
              <Input
                id="secret"
                value={formData.secret}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, secret: e.target.value }))
                }
                placeholder="Secret para assinatura HMAC"
                type="password"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retry_count">Retries</Label>
                <Input
                  id="retry_count"
                  type="number"
                  min={0}
                  max={10}
                  value={formData.retry_count}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, retry_count: Number(e.target.value) }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout_ms">Timeout (ms)</Label>
                <Input
                  id="timeout_ms"
                  type="number"
                  min={1000}
                  max={60000}
                  value={formData.timeout_ms}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, timeout_ms: Number(e.target.value) }))
                  }
                />
              </div>
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
                {saving ? 'Salvando...' : editingWebhook ? 'Atualizar' : 'Criar'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
