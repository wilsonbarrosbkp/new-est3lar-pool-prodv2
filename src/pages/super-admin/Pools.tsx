import { useState, useMemo } from 'react'
import {
  Database,
  Plus,
  MoreHorizontal,
  Search,
  Server,
  Zap,
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
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { typography } from '@/design-system/tokens'
import { useCRUDPage } from '@/hooks/useCRUDPage'
import type {
  Pool,
  OrganizationOption,
  CurrencyOption,
  PayoutModel,
} from '@/types/super-admin'

type FormData = {
  name: string
  organization_id: number | null
  currency_id: number | null
  payout_model_id: number | null
  pool_fee_percent: number
  min_payout: number
  stratum_url: string
  stratum_port: number | null
  stratum_difficulty: number | null
  is_active: boolean
}

const initialFormData: FormData = {
  name: '',
  organization_id: null,
  currency_id: null,
  payout_model_id: null,
  pool_fee_percent: 1.0,
  min_payout: 0.001,
  stratum_url: '',
  stratum_port: 3333,
  stratum_difficulty: null,
  is_active: true,
}

export default function PoolsPage() {
  // Estados adicionais para dados relacionados e filtros
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([])
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([])
  const [payoutModels, setPayoutModels] = useState<PayoutModel[]>([])
  const [filterOrg, setFilterOrg] = useState<string>('all')

  const {
    data: pools,
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
  } = useCRUDPage<Pool, FormData>({
    tableName: 'pools',
    initialFormData,
    entityName: 'pool',
    searchFields: ['name', 'organization_name', 'currency_symbol'],

    // Carregamento customizado para incluir joins e dados relacionados
    customLoadData: async () => {
      const [poolsResult, orgsResult, currenciesResult, payoutModelsResult] = await Promise.all([
        supabase
          .from('pools')
          .select(`
            *,
            organizations(name),
            currencies(symbol),
            payout_models(name)
          `)
          .order('name'),
        supabase.from('organizations').select('id, name').eq('status', 'ativo').order('name'),
        supabase.from('currencies').select('id, name, symbol').eq('is_active', true).eq('type', 'crypto').order('name'),
        supabase.from('payout_models').select('*').order('name'),
      ])

      if (poolsResult.error) throw poolsResult.error
      if (orgsResult.error) throw orgsResult.error
      if (currenciesResult.error) throw currenciesResult.error
      if (payoutModelsResult.error) throw payoutModelsResult.error

      // Tipo para o resultado da query com joins
      type PoolWithRelations = Pool & {
        organizations: { name: string } | null
        currencies: { symbol: string } | null
        payout_models: { name: string } | null
      }

      const poolsWithDetails = (poolsResult.data || []).map((pool: PoolWithRelations) => ({
        ...pool,
        organization_name: pool.organizations?.name,
        currency_symbol: pool.currencies?.symbol,
        payout_model_name: pool.payout_models?.name,
      }))

      setOrganizations(orgsResult.data || [])
      setCurrencies(currenciesResult.data || [])
      setPayoutModels(payoutModelsResult.data || [])

      return poolsWithDetails
    },

    mapDataToForm: (pool) => ({
      name: pool.name,
      organization_id: pool.organization_id,
      currency_id: pool.currency_id ?? null,
      payout_model_id: pool.payout_model_id,
      pool_fee_percent: pool.pool_fee_percent,
      min_payout: pool.min_payout ?? 0.001,
      stratum_url: pool.stratum_url || '',
      stratum_port: pool.stratum_port ?? null,
      stratum_difficulty: pool.stratum_difficulty ?? null,
      is_active: pool.is_active ?? true,
    }),

    mapFormToData: (data) => ({
      name: data.name,
      organization_id: data.organization_id,
      currency_id: data.currency_id,
      payout_model_id: data.payout_model_id,
      pool_fee_percent: data.pool_fee_percent,
      min_payout: data.min_payout,
      stratum_url: data.stratum_url || null,
      stratum_port: data.stratum_port,
      stratum_difficulty: data.stratum_difficulty,
      is_active: data.is_active,
    }),

    validateForm: (data) => {
      if (!data.name.trim()) return 'Nome é obrigatório'
      if (!data.organization_id || !data.currency_id || !data.payout_model_id) {
        return 'Organização, moeda e modelo de pagamento são obrigatórios'
      }
      return null
    },

    messages: {
      deleteConfirm: (pool) => `Tem certeza que deseja excluir "${pool.name}"?`,
    },
  })

  // Filtrar pools localmente
  const filteredPools = useMemo(() => {
    let result = [...pools]

    // Busca textual
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (pool) =>
          pool.name.toLowerCase().includes(searchLower) ||
          pool.organization_name?.toLowerCase().includes(searchLower) ||
          pool.currency_symbol?.toLowerCase().includes(searchLower)
      )
    }

    // Filtro por organização
    if (filterOrg !== 'all') {
      result = result.filter((pool) => pool.organization_id.toString() === filterOrg)
    }

    return result
  }, [pools, search, filterOrg])

  // Separar ativos e inativos
  const activePools = filteredPools.filter(p => p.is_active)
  const inactivePools = filteredPools.filter(p => !p.is_active)

  // Toggle ativo/inativo
  const toggleActive = async (pool: Pool) => {
    try {
      const { error } = await supabase
        .from('pools')
        .update({ is_active: !pool.is_active })
        .eq('id', pool.id)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error('Erro ao atualizar pool:', error)
      toast.error('Erro ao atualizar pool')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              placeholder="Buscar pools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterOrg} onValueChange={setFilterOrg}>
            <SelectTrigger className="w-[180px]">
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
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Pool
        </Button>
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
          ) : filteredPools.length === 0 ? (
            <div className="text-center py-12">
              <Database className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">
                {search || filterOrg !== 'all' ? 'Nenhum pool encontrado' : 'Nenhum pool cadastrado'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pool</TableHead>
                  <TableHead>Organização</TableHead>
                  <TableHead>Moeda</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Taxa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Pools Ativos */}
                {activePools.length > 0 && (
                  <>
                    <TableRow>
                      <TableCell colSpan={7} className="bg-surface/50">
                        <div className={`flex items-center gap-2 ${typography.body.small} ${typography.weight.medium} text-success`}>
                          <Zap className="h-4 w-4" />
                          Pools Ativos ({activePools.length})
                        </div>
                      </TableCell>
                    </TableRow>
                    {activePools.map((pool) => (
                      <TableRow key={pool.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                              <Server className="h-5 w-5" />
                            </div>
                            <div>
                              <p className={typography.weight.medium}>{pool.name}</p>
                              <p className={`${typography.table.small} text-text-secondary`}>
                                {pool.stratum_url ? `${pool.stratum_url}:${pool.stratum_port}` : 'Sem stratum'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{pool.organization_name}</TableCell>
                        <TableCell>
                          <Badge variant="warning">{pool.currency_symbol}</Badge>
                        </TableCell>
                        <TableCell>{pool.payout_model_name}</TableCell>
                        <TableCell>{pool.pool_fee_percent}%</TableCell>
                        <TableCell>
                          <Badge
                            variant="success"
                            className="cursor-pointer"
                            onClick={() => toggleActive(pool)}
                          >
                            Ativo
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
                              <DropdownMenuItem onClick={() => handleOpenEdit(pool)}>
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-error"
                                onClick={() => handleDelete(pool)}
                              >
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}

                {/* Pools Inativos */}
                {inactivePools.length > 0 && (
                  <>
                    <TableRow>
                      <TableCell colSpan={7} className="bg-surface/50">
                        <div className={`flex items-center gap-2 ${typography.body.small} ${typography.weight.medium} text-text-secondary`}>
                          <Server className="h-4 w-4" />
                          Pools Inativos ({inactivePools.length})
                        </div>
                      </TableCell>
                    </TableRow>
                    {inactivePools.map((pool) => (
                      <TableRow key={pool.id} className="opacity-60">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-surface text-text-secondary rounded-full flex items-center justify-center">
                              <Server className="h-5 w-5" />
                            </div>
                            <div>
                              <p className={typography.weight.medium}>{pool.name}</p>
                              <p className={`${typography.table.small} text-text-secondary`}>
                                {pool.stratum_url ? `${pool.stratum_url}:${pool.stratum_port}` : 'Sem stratum'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{pool.organization_name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{pool.currency_symbol}</Badge>
                        </TableCell>
                        <TableCell>{pool.payout_model_name}</TableCell>
                        <TableCell>{pool.pool_fee_percent}%</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => toggleActive(pool)}
                          >
                            Inativo
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
                              <DropdownMenuItem onClick={() => handleOpenEdit(pool)}>
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-error"
                                onClick={() => handleDelete(pool)}
                              >
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className={`${typography.body.small} text-text-secondary`}>
        {filteredPools.length} pool(s) | {activePools.length} ativo(s) | {inactivePools.length} inativo(s)
      </div>

      {/* Sheet de criação/edição */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editing ? 'Editar Pool' : 'Novo Pool'}
            </SheetTitle>
            <SheetDescription>
              {editing
                ? 'Altere as informações do pool abaixo.'
                : 'Preencha as informações para criar um novo pool.'}
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
                placeholder="Ex: Pool Bitcoin Principal"
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

            <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="payout_model_id">Modelo Pagamento *</Label>
                <Select
                  value={formData.payout_model_id?.toString() || ''}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, payout_model_id: Number(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {payoutModels.map((model) => (
                      <SelectItem key={model.id} value={model.id.toString()}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pool_fee_percent">Taxa (%)</Label>
                <Input
                  id="pool_fee_percent"
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  value={formData.pool_fee_percent}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, pool_fee_percent: Number(e.target.value) }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_payout">Pagamento Mínimo</Label>
                <Input
                  id="min_payout"
                  type="number"
                  step="0.00000001"
                  min={0}
                  value={formData.min_payout}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, min_payout: Number(e.target.value) }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stratum_url">URL Stratum</Label>
              <Input
                id="stratum_url"
                value={formData.stratum_url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, stratum_url: e.target.value }))
                }
                placeholder="Ex: stratum.exemplo.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stratum_port">Porta</Label>
                <Input
                  id="stratum_port"
                  type="number"
                  value={formData.stratum_port || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, stratum_port: e.target.value ? Number(e.target.value) : null }))
                  }
                  placeholder="3333"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stratum_difficulty">Dificuldade</Label>
                <Input
                  id="stratum_difficulty"
                  type="number"
                  step="0.00000001"
                  value={formData.stratum_difficulty || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, stratum_difficulty: e.target.value ? Number(e.target.value) : null }))
                  }
                  placeholder="Auto"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_active">Status</Label>
              <Select
                value={formData.is_active ? 'true' : 'false'}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, is_active: value === 'true' }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Ativo</SelectItem>
                  <SelectItem value="false">Inativo</SelectItem>
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
