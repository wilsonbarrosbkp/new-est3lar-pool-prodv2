import { useState, useCallback, useMemo } from 'react'
import {
  CreditCard,
  Plus,
  MoreHorizontal,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  Check,
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
import { Textarea } from '@/components/ui/Textarea'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { handleError, showErrorToast } from '@/lib/error-handler'
import { typography } from '@/design-system/tokens'
import { formatAmount, formatDateTime, formatTxHash } from '@/lib/formatters'
import { useCRUDPage } from '@/hooks/useCRUDPage'
import type {
  Payment,
  OrganizationOption,
  PoolOption,
  PaymentType,
} from '@/types/super-admin'

/** Wallet parcial para uso em selects */
type WalletOption = {
  id: number
  label: string
  address: string
  organization_id: number
  currency_id: number
}

/** Currency parcial para uso em selects */
type CurrencyOption = {
  id: number
  name: string
  symbol: string
  decimals: number
}

type FormData = {
  organization_id: number | null
  pool_id: number | null
  wallet_id: number | null
  amount: number
  currency_id: number | null
  type: PaymentType
  fee: number
  tx_hash: string
  block_height: number | null
  status: Payment['status']
  notes: string
}

const initialFormData: FormData = {
  organization_id: null,
  pool_id: null,
  wallet_id: null,
  amount: 0,
  currency_id: null,
  type: 'manual',
  fee: 0,
  tx_hash: '',
  block_height: null,
  status: 'pendente',
  notes: '',
}

const statusOptions = [
  { value: 'pendente', label: 'Pendente', color: 'warning', icon: Clock },
  { value: 'processando', label: 'Processando', color: 'default', icon: Clock },
  { value: 'concluido', label: 'Concluído', color: 'success', icon: CheckCircle },
  { value: 'falhou', label: 'Falhou', color: 'destructive', icon: XCircle },
  { value: 'cancelado', label: 'Cancelado', color: 'secondary', icon: XCircle },
] as const

const typeOptions = [
  { value: 'block_reward', label: 'Block Reward' },
  { value: 'transaction_fee', label: 'Transaction Fee' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'manual', label: 'Manual' },
  { value: 'adjustment', label: 'Adjustment' },
] as const

export default function PaymentsPage() {
  // Estados locais para dados relacionados e filtros
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([])
  const [pools, setPools] = useState<PoolOption[]>([])
  const [wallets, setWallets] = useState<WalletOption[]>([])
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([])
  const [filterOrg, setFilterOrg] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<number | null>(null)

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
  } = useCRUDPage<Payment, FormData>({
    tableName: 'payments',
    initialFormData,
    customLoadData: async () => {
      const [paymentsResult, orgsResult, poolsResult, walletsResult, currenciesResult] = await Promise.all([
        supabase
          .from('payments')
          .select(`
            *,
            organizations(name),
            pools(name),
            wallets(address, label),
            currencies(symbol)
          `)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase.from('organizations').select('id, name').eq('status', 'ativo').order('name'),
        supabase.from('pools').select('id, name, organization_id').eq('is_active', true).order('name'),
        supabase.from('wallets').select('id, label, address, organization_id, currency_id').eq('is_active', true).order('label'),
        supabase.from('currencies').select('id, name, symbol, decimals').eq('is_active', true).order('type, name'),
      ])

      if (paymentsResult.error) throw paymentsResult.error
      if (orgsResult.error) throw orgsResult.error
      if (poolsResult.error) throw poolsResult.error
      if (walletsResult.error) throw walletsResult.error
      if (currenciesResult.error) throw currenciesResult.error

      setOrganizations(orgsResult.data || [])
      setPools(poolsResult.data || [])
      setWallets(walletsResult.data || [])
      setCurrencies(currenciesResult.data || [])

      return (paymentsResult.data || []).map((payment: Record<string, unknown>) => ({
        ...payment,
        organization_name: (payment.organizations as { name?: string } | null)?.name,
        pool_name: (payment.pools as { name?: string } | null)?.name,
        wallet_address: (payment.wallets as { address?: string } | null)?.address,
        wallet_label: (payment.wallets as { label?: string } | null)?.label,
        currency_symbol: (payment.currencies as { symbol?: string } | null)?.symbol,
      })) as Payment[]
    },
    mapDataToForm: (payment) => ({
      organization_id: payment.organization_id,
      pool_id: payment.pool_id ?? null,
      wallet_id: payment.wallet_id,
      amount: payment.amount,
      currency_id: payment.currency_id,
      type: payment.type ?? 'manual',
      fee: payment.fee ?? 0,
      tx_hash: payment.tx_hash || '',
      block_height: payment.block_height ?? null,
      status: payment.status,
      notes: payment.notes || '',
    }),
    mapFormToData: (data) => ({
      organization_id: data.organization_id,
      pool_id: data.pool_id,
      wallet_id: data.wallet_id,
      amount: data.amount,
      currency_id: data.currency_id,
      type: data.type,
      fee: data.fee,
      tx_hash: data.tx_hash || null,
      block_height: data.block_height,
      status: data.status,
      notes: data.notes || null,
    }),
    onBeforeCreate: async (data) => {
      // Adicionar timestamps automáticos
      if (data.status === 'concluido') {
        return { ...data, confirmed_at: new Date().toISOString() }
      }
      if (data.status === 'processando') {
        return { ...data, processed_at: new Date().toISOString() }
      }
      return data
    },
    onBeforeUpdate: async (data) => {
      // Adicionar timestamps automáticos se status mudou
      if (data.status === 'concluido') {
        return { ...data, confirmed_at: new Date().toISOString() }
      }
      if (data.status === 'processando') {
        return { ...data, processed_at: new Date().toISOString() }
      }
      return data
    },
    validateForm: (data) => {
      if (!data.organization_id || !data.wallet_id || !data.currency_id) {
        return 'Organização, carteira e moeda são obrigatórios'
      }
      if (data.amount <= 0) {
        return 'Valor deve ser maior que zero'
      }
      return null
    },
    searchFields: ['organization_name', 'wallet_address', 'tx_hash'],
    entityName: 'pagamento',
    messages: {
      deleteConfirm: (payment) => `Tem certeza que deseja excluir o pagamento #${payment.id}?`,
    },
  })

  // Filtros adicionais sobre os dados já filtrados pelo hook
  const filteredPayments = useMemo(() => {
    return baseFilteredData.filter((payment) => {
      const matchesOrg = filterOrg === 'all' || payment.organization_id.toString() === filterOrg
      const matchesStatus = filterStatus === 'all' || payment.status === filterStatus
      const matchesType = filterType === 'all' || payment.type === filterType
      return matchesOrg && matchesStatus && matchesType
    })
  }, [baseFilteredData, filterOrg, filterStatus, filterType])

  // Filter wallets and pools by selected organization
  const filteredWallets = useMemo(
    () => formData.organization_id
      ? wallets.filter(w => w.organization_id === formData.organization_id)
      : wallets,
    [wallets, formData.organization_id]
  )

  const filteredPools = useMemo(
    () => formData.organization_id
      ? pools.filter(p => p.organization_id === formData.organization_id)
      : pools,
    [pools, formData.organization_id]
  )

  // Funções auxiliares
  const handleCopyTxHash = useCallback(async (payment: Payment) => {
    if (!payment.tx_hash) return
    try {
      await navigator.clipboard.writeText(payment.tx_hash)
      setCopiedId(payment.id)
      setTimeout(() => setCopiedId(null), 2000)
      toast.success('TX Hash copiado!')
    } catch {
      toast.error('Erro ao copiar TX Hash')
    }
  }, [])

  const updateStatus = useCallback(async (payment: Payment, newStatus: Payment['status']) => {
    try {
      const updateData: Record<string, unknown> = { status: newStatus }
      if (newStatus === 'processando' && !payment.processed_at) {
        updateData.processed_at = new Date().toISOString()
      }
      if (newStatus === 'concluido' && !payment.confirmed_at) {
        updateData.confirmed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', payment.id)

      if (error) throw error
      loadData()
    } catch (error) {
      const appError = handleError(error, 'atualizar status do pagamento')
      showErrorToast(appError)
    }
  }, [loadData])

  const getStatusBadge = useCallback((status: string) => {
    const option = statusOptions.find(s => s.value === status)
    return option || { label: status, color: 'secondary' }
  }, [])

  const getTypeLabel = useCallback((type: string) => {
    const option = typeOptions.find(t => t.value === type)
    return option?.label || type
  }, [])

  const totalPending = useMemo(
    () => filteredPayments.filter(p => p.status === 'pendente').reduce((acc, p) => acc + p.amount, 0),
    [filteredPayments]
  )
  const totalCompleted = useMemo(
    () => filteredPayments.filter(p => p.status === 'concluido').reduce((acc, p) => acc + p.amount, 0),
    [filteredPayments]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-1 gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              placeholder="Buscar pagamentos..."
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
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]">
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
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Pagamento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className={`${typography.kpi.title} text-text-secondary`}>Total Pagamentos</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{filteredPayments.length}</p>
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
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{totalPending.toFixed(8)} BTC</p>
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
                <p className={`${typography.kpi.title} text-text-secondary`}>Concluídos</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{totalCompleted.toFixed(8)} BTC</p>
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
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">
                {search || filterOrg !== 'all' || filterStatus !== 'all' || filterType !== 'all'
                  ? 'Nenhum pagamento encontrado'
                  : 'Nenhum pagamento cadastrado'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Organização</TableHead>
                  <TableHead>Carteira</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>TX Hash</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const statusBadge = getStatusBadge(payment.status)
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className={`font-mono ${typography.body.small}`}>#{payment.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className={typography.weight.medium}>{payment.organization_name}</p>
                          {payment.pool_name && (
                            <p className={`${typography.body.tiny} text-text-secondary`}>{payment.pool_name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className={typography.body.small}>{payment.wallet_label}</p>
                          <code className={`${typography.body.tiny} text-text-secondary`}>
                            {payment.wallet_address?.slice(0, 10)}...
                          </code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-mono ${typography.weight.medium}`}>
                          {formatAmount(payment.amount, payment.currency_symbol || '')}
                        </span>
                        {(payment.fee ?? 0) > 0 && (
                          <p className={`${typography.body.tiny} text-text-secondary`}>
                            Fee: {(payment.fee ?? 0).toFixed(8)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={typography.body.tiny}>
                          {getTypeLabel(payment.type ?? 'manual')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.tx_hash ? (
                          <div className="flex items-center gap-1">
                            <code className={typography.body.tiny}>{formatTxHash(payment.tx_hash)}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                              onClick={() => handleCopyTxHash(payment)}
                            >
                              {copiedId === payment.id ? (
                                <Check className="h-3 w-3 text-success" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                            <a
                              href={`https://mempool.space/tx/${payment.tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-text-secondary">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={typography.body.small}>{formatDateTime(payment.created_at)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.color as 'warning' | 'default' | 'success' | 'destructive' | 'secondary'}>
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
                            <DropdownMenuItem onClick={() => handleOpenEdit(payment)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {payment.status === 'pendente' && (
                              <DropdownMenuItem onClick={() => updateStatus(payment, 'processando')}>
                                Marcar Processando
                              </DropdownMenuItem>
                            )}
                            {(payment.status === 'pendente' || payment.status === 'processando') && (
                              <DropdownMenuItem onClick={() => updateStatus(payment, 'concluido')}>
                                Marcar Concluído
                              </DropdownMenuItem>
                            )}
                            {payment.status !== 'cancelado' && payment.status !== 'concluido' && (
                              <DropdownMenuItem onClick={() => updateStatus(payment, 'cancelado')}>
                                Cancelar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-error"
                              onClick={() => handleDelete(payment)}
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
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editing ? 'Editar Pagamento' : 'Novo Pagamento'}
            </SheetTitle>
            <SheetDescription>
              {editing
                ? 'Altere as informações do pagamento abaixo.'
                : 'Preencha as informações para criar um novo pagamento.'}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="organization_id">Organização *</Label>
              <Select
                value={formData.organization_id?.toString() || ''}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    organization_id: Number(value),
                    pool_id: null,
                    wallet_id: null,
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pool_id">Pool (opcional)</Label>
                <Select
                  value={formData.pool_id?.toString() || 'none'}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, pool_id: value === 'none' ? null : Number(value) }))
                  }
                  disabled={!formData.organization_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {filteredPools.map((pool) => (
                      <SelectItem key={pool.id} value={pool.id.toString()}>
                        {pool.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet_id">Carteira *</Label>
                <Select
                  value={formData.wallet_id?.toString() || ''}
                  onValueChange={(value) => {
                    const wallet = wallets.find(w => w.id === Number(value))
                    setFormData((prev) => ({
                      ...prev,
                      wallet_id: Number(value),
                      currency_id: wallet?.currency_id || prev.currency_id,
                    }))
                  }}
                  disabled={!formData.organization_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredWallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id.toString()}>
                        {wallet.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.00000001"
                  min={0}
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: Number(e.target.value) }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency_id">Moeda *</Label>
                <Select
                  value={formData.currency_id?.toString() || ''}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, currency_id: Number(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.id} value={currency.id.toString()}>
                        {currency.symbol} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: string) =>
                    setFormData((prev) => ({ ...prev, type: value as PaymentType }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fee">Taxa</Label>
                <Input
                  id="fee"
                  type="number"
                  step="0.00000001"
                  min={0}
                  value={formData.fee}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, fee: Number(e.target.value) }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tx_hash">TX Hash</Label>
              <Input
                id="tx_hash"
                value={formData.tx_hash}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tx_hash: e.target.value }))
                }
                placeholder="Ex: abc123..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="block_height">Block Height</Label>
                <Input
                  id="block_height"
                  type="number"
                  min={0}
                  value={formData.block_height || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, block_height: e.target.value ? Number(e.target.value) : null }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Payment['status']) =>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Notas adicionais..."
                rows={3}
              />
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
