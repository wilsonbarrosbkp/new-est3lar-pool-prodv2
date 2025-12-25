import { useCallback,useEffect, useState } from 'react'
import {
  Calendar,
  DollarSign,
  Minus,
  Plus,
  Search,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'

import { CRUDFormSheet } from '@/components/crud/CRUDFormSheet'
import { TableActionMenu } from '@/components/crud/TableActionMenu'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
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
import { handleError, showErrorToast } from '@/lib/error-handler'
import { formatBTC,formatDate, formatHashrate } from '@/lib/formatters'
import { supabase } from '@/lib/supabase/client'

import type {
  CurrencyOption,
  OrganizationOption,
  PoolOption,
  RevenueReport,
} from '@/types/super-admin'

type FormData = {
  organization_id: number | null
  pool_id: number | null
  period_start: string
  period_end: string
  total_hashrate: number
  total_shares: number
  blocks_found: number
  gross_revenue: number
  pool_fees: number
  net_revenue: number
  energy_cost: number
  profit: number
  currency_id: number | null
}

const initialFormData: FormData = {
  organization_id: null,
  pool_id: null,
  period_start: '',
  period_end: '',
  total_hashrate: 0,
  total_shares: 0,
  blocks_found: 0,
  gross_revenue: 0,
  pool_fees: 0,
  net_revenue: 0,
  energy_cost: 0,
  profit: 0,
  currency_id: null,
}

export default function RevenuePage() {
  const [reports, setReports] = useState<RevenueReport[]>([])
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([])
  const [pools, setPools] = useState<PoolOption[]>([])
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterOrg, setFilterOrg] = useState<string>('all')
  const [filterPool, setFilterPool] = useState<string>('all')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<RevenueReport | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [reportsResult, orgsResult, poolsResult, currenciesResult] = await Promise.all([
        supabase
          .from('revenue_reports')
          .select(`
            *,
            organizations(name),
            pools(name),
            currencies(symbol)
          `)
          .order('period_start', { ascending: false }),
        supabase.from('organizations').select('id, name').eq('status', 'ativo').order('name'),
        supabase.from('pools').select('id, name, organization_id').eq('is_active', true).order('name'),
        supabase.from('currencies').select('id, name, symbol').eq('is_active', true).order('type, name'),
      ])

      if (reportsResult.error) throw reportsResult.error
      if (orgsResult.error) throw orgsResult.error
      if (poolsResult.error) throw poolsResult.error
      if (currenciesResult.error) throw currenciesResult.error

      // Tipo para o resultado da query com joins
      type RevenueReportWithRelations = RevenueReport & {
        organizations: { name: string } | null
        pools: { name: string } | null
        currencies: { symbol: string } | null
      }

      const reportsWithDetails = (reportsResult.data || []).map((report: RevenueReportWithRelations) => ({
        ...report,
        organization_name: report.organizations?.name,
        pool_name: report.pools?.name,
        currency_symbol: report.currencies?.symbol,
      }))

      setReports(reportsWithDetails)
      setOrganizations(orgsResult.data || [])
      setPools(poolsResult.data || [])
      setCurrencies(currenciesResult.data || [])
    } catch (error) {
      const appError = handleError(error, 'carregar dados de receita')
      showErrorToast(appError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredReports = reports.filter(report => {
    const matchesSearch =
      report.organization_name?.toLowerCase().includes(search.toLowerCase()) ||
      report.pool_name?.toLowerCase().includes(search.toLowerCase())
    const matchesOrg = filterOrg === 'all' || report.organization_id.toString() === filterOrg
    const matchesPool = filterPool === 'all' || report.pool_id?.toString() === filterPool
    return matchesSearch && matchesOrg && matchesPool
  })

  const filteredPools = formData.organization_id
    ? pools.filter(p => p.organization_id === formData.organization_id)
    : pools

  const handleOpenCreate = () => {
    setEditingReport(null)
    setFormData(initialFormData)
    setSheetOpen(true)
  }

  const handleOpenEdit = (report: RevenueReport) => {
    setEditingReport(report)
    setFormData({
      organization_id: report.organization_id,
      pool_id: report.pool_id ?? null,
      period_start: report.period_start,
      period_end: report.period_end,
      total_hashrate: report.total_hashrate,
      total_shares: report.total_shares,
      blocks_found: report.blocks_found,
      gross_revenue: report.gross_revenue,
      pool_fees: report.pool_fees,
      net_revenue: report.net_revenue,
      energy_cost: report.energy_cost,
      profit: report.profit,
      currency_id: report.currency_id ?? null,
    })
    setSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setSheetOpen(false)
    setEditingReport(null)
    setFormData(initialFormData)
  }

  // Auto-calculate net_revenue and profit
  const calculateValues = (data: FormData) => {
    const net_revenue = data.gross_revenue - data.pool_fees
    const profit = net_revenue - data.energy_cost
    return { ...data, net_revenue, profit }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.organization_id) {
      toast.error('Organização é obrigatória')
      return
    }

    if (!formData.period_start || !formData.period_end) {
      toast.error('Período é obrigatório')
      return
    }

    setSaving(true)

    try {
      const calculatedData = calculateValues(formData)
      const reportData = {
        organization_id: calculatedData.organization_id,
        pool_id: calculatedData.pool_id,
        period_start: calculatedData.period_start,
        period_end: calculatedData.period_end,
        total_hashrate: calculatedData.total_hashrate,
        total_shares: calculatedData.total_shares,
        blocks_found: calculatedData.blocks_found,
        gross_revenue: calculatedData.gross_revenue,
        pool_fees: calculatedData.pool_fees,
        net_revenue: calculatedData.net_revenue,
        energy_cost: calculatedData.energy_cost,
        profit: calculatedData.profit,
        currency_id: calculatedData.currency_id,
      }

      if (editingReport) {
        const { error } = await supabase
          .from('revenue_reports')
          .update(reportData)
          .eq('id', editingReport.id)

        if (error) throw error
        toast.success('Relatório atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('revenue_reports')
          .insert(reportData)

        if (error) throw error
        toast.success('Relatório criado com sucesso!')
      }

      handleCloseSheet()
      loadData()
    } catch (error) {
      const appError = handleError(error, 'salvar relatório')
      showErrorToast(appError)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (report: RevenueReport) => {
    if (!confirm('Tem certeza que deseja excluir este relatório?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('revenue_reports')
        .delete()
        .eq('id', report.id)

      if (error) throw error

      toast.success('Relatório excluído com sucesso!')
      loadData()
    } catch (error) {
      const appError = handleError(error, 'excluir relatório')
      showErrorToast(appError)
    }
  }

  const totalGrossRevenue = filteredReports.reduce((acc, r) => acc + r.gross_revenue, 0)
  const totalProfit = filteredReports.reduce((acc, r) => acc + r.profit, 0)
  const totalBlocks = filteredReports.reduce((acc, r) => acc + r.blocks_found, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-1 gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              placeholder="Buscar relatórios..."
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
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Relatório
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-success/10 text-success rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className={`${typography.kpi.title} text-text-secondary`}>Receita Bruta Total</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{formatBTC(totalGrossRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                totalProfit >= 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
              }`}>
                {totalProfit >= 0 ? <TrendingUp className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
              </div>
              <div>
                <p className={`${typography.kpi.title} text-text-secondary`}>Lucro Total</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold} ${totalProfit >= 0 ? 'text-success' : 'text-error'}`}>
                  {formatBTC(totalProfit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-warning/10 text-warning rounded-full flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className={`${typography.kpi.title} text-text-secondary`}>Blocos Encontrados</p>
                <p className={`${typography.kpi.value} ${typography.weight.bold}`}>{totalBlocks}</p>
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
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">
                {search || filterOrg !== 'all' || filterPool !== 'all'
                  ? 'Nenhum relatório encontrado'
                  : 'Nenhum relatório cadastrado'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Organização</TableHead>
                  <TableHead>Pool</TableHead>
                  <TableHead>Hashrate</TableHead>
                  <TableHead>Blocos</TableHead>
                  <TableHead>Receita Bruta</TableHead>
                  <TableHead>Lucro</TableHead>
                  <TableHead className="w-12">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-text-secondary" />
                        <span className={typography.table.cell}>
                          {formatDate(report.period_start)} - {formatDate(report.period_end)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{report.organization_name}</TableCell>
                    <TableCell>{report.pool_name || '-'}</TableCell>
                    <TableCell className="font-mono">{formatHashrate(report.total_hashrate)}</TableCell>
                    <TableCell>
                      <Badge variant="warning">{report.blocks_found}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">{formatBTC(report.gross_revenue)}</TableCell>
                    <TableCell>
                      <span className={`font-mono ${typography.weight.medium} ${
                        report.profit >= 0 ? 'text-success' : 'text-error'
                      }`}>
                        {formatBTC(report.profit)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <TableActionMenu
                        actions={[
                          { label: 'Editar', onClick: () => handleOpenEdit(report) },
                          { label: 'Excluir', onClick: () => handleDelete(report), variant: 'destructive' },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Sheet de criação/edição */}
      <CRUDFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editingReport ? 'Editar Relatório' : 'Novo Relatório de Revenue'}
        description={
          editingReport
            ? 'Altere as informações do relatório abaixo.'
            : 'Preencha as informações para criar um novo relatório.'
        }
        onSubmit={handleSubmit}
        onCancel={handleCloseSheet}
        saving={saving}
        isEditing={!!editingReport}
      >
        <div className="space-y-2">
          <Label htmlFor="organization_id">Organização *</Label>
          <Select
            value={formData.organization_id?.toString() || ''}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                organization_id: Number(value),
                pool_id: null,
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
              <SelectItem value="none">Todos os pools</SelectItem>
              {filteredPools.map((pool) => (
                <SelectItem key={pool.id} value={pool.id.toString()}>
                  {pool.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="period_start">Início do Período *</Label>
            <Input
              id="period_start"
              type="date"
              value={formData.period_start}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, period_start: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="period_end">Fim do Período *</Label>
            <Input
              id="period_end"
              type="date"
              value={formData.period_end}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, period_end: e.target.value }))
              }
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total_hashrate">Hashrate Médio (H/s)</Label>
            <Input
              id="total_hashrate"
              type="number"
              min={0}
              value={formData.total_hashrate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, total_hashrate: Number(e.target.value) }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="blocks_found">Blocos Encontrados</Label>
            <Input
              id="blocks_found"
              type="number"
              min={0}
              value={formData.blocks_found}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, blocks_found: Number(e.target.value) }))
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gross_revenue">Receita Bruta (BTC)</Label>
          <Input
            id="gross_revenue"
            type="number"
            step="0.00000001"
            min={0}
            value={formData.gross_revenue}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, gross_revenue: Number(e.target.value) }))
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pool_fees">Taxas do Pool (BTC)</Label>
            <Input
              id="pool_fees"
              type="number"
              step="0.00000001"
              min={0}
              value={formData.pool_fees}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, pool_fees: Number(e.target.value) }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="energy_cost">Custo de Energia (BTC)</Label>
            <Input
              id="energy_cost"
              type="number"
              step="0.00000001"
              min={0}
              value={formData.energy_cost}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, energy_cost: Number(e.target.value) }))
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency_id">Moeda</Label>
          <Select
            value={formData.currency_id?.toString() || 'none'}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, currency_id: value === 'none' ? null : Number(value) }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              {currencies.map((currency) => (
                <SelectItem key={currency.id} value={currency.id.toString()}>
                  {currency.symbol} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="p-4 bg-surface rounded-lg space-y-2">
          <p className={`${typography.body.small} ${typography.weight.medium}`}>Valores Calculados:</p>
          <div className={`grid grid-cols-2 gap-4 ${typography.body.small}`}>
            <div>
              <span className="text-text-secondary">Receita Líquida: </span>
              <span className="font-mono">{(formData.gross_revenue - formData.pool_fees).toFixed(8)} BTC</span>
            </div>
            <div>
              <span className="text-text-secondary">Lucro: </span>
              <span className={`font-mono ${
                (formData.gross_revenue - formData.pool_fees - formData.energy_cost) >= 0
                  ? 'text-success'
                  : 'text-error'
              }`}>
                {(formData.gross_revenue - formData.pool_fees - formData.energy_cost).toFixed(8)} BTC
              </span>
            </div>
          </div>
        </div>
      </CRUDFormSheet>
    </div>
  )
}
