import { useState, useEffect, useCallback } from 'react'
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

interface Pool {
  id: number
  name: string
  organization_id: number
  organization_name?: string
  currency_id: number
  currency_symbol?: string
  payout_model_id: number
  payout_model_name?: string
  pool_fee_percent: number
  min_payout: number
  stratum_url: string | null
  stratum_port: number | null
  stratum_difficulty: number | null
  is_active: boolean
  created_at: string
}

interface Organization {
  id: number
  name: string
}

interface Currency {
  id: number
  name: string
  symbol: string
}

interface PayoutModel {
  id: number
  name: string
  description: string
}

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
  const [pools, setPools] = useState<Pool[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [payoutModels, setPayoutModels] = useState<PayoutModel[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterOrg, setFilterOrg] = useState<string>('all')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingPool, setEditingPool] = useState<Pool | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
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

      const poolsWithDetails = (poolsResult.data || []).map((pool: any) => ({
        ...pool,
        organization_name: pool.organizations?.name,
        currency_symbol: pool.currencies?.symbol,
        payout_model_name: pool.payout_models?.name,
      }))

      setPools(poolsWithDetails)
      setOrganizations(orgsResult.data || [])
      setCurrencies(currenciesResult.data || [])
      setPayoutModels(payoutModelsResult.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredPools = pools.filter(pool => {
    const matchesSearch =
      pool.name.toLowerCase().includes(search.toLowerCase()) ||
      pool.organization_name?.toLowerCase().includes(search.toLowerCase()) ||
      pool.currency_symbol?.toLowerCase().includes(search.toLowerCase())
    const matchesOrg = filterOrg === 'all' || pool.organization_id.toString() === filterOrg
    return matchesSearch && matchesOrg
  })

  const handleOpenCreate = () => {
    setEditingPool(null)
    setFormData(initialFormData)
    setSheetOpen(true)
  }

  const handleOpenEdit = (pool: Pool) => {
    setEditingPool(pool)
    setFormData({
      name: pool.name,
      organization_id: pool.organization_id,
      currency_id: pool.currency_id,
      payout_model_id: pool.payout_model_id,
      pool_fee_percent: pool.pool_fee_percent,
      min_payout: pool.min_payout,
      stratum_url: pool.stratum_url || '',
      stratum_port: pool.stratum_port,
      stratum_difficulty: pool.stratum_difficulty,
      is_active: pool.is_active,
    })
    setSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setSheetOpen(false)
    setEditingPool(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    if (!formData.organization_id || !formData.currency_id || !formData.payout_model_id) {
      toast.error('Organização, moeda e modelo de pagamento são obrigatórios')
      return
    }

    setSaving(true)

    try {
      const poolData = {
        name: formData.name,
        organization_id: formData.organization_id,
        currency_id: formData.currency_id,
        payout_model_id: formData.payout_model_id,
        pool_fee_percent: formData.pool_fee_percent,
        min_payout: formData.min_payout,
        stratum_url: formData.stratum_url || null,
        stratum_port: formData.stratum_port,
        stratum_difficulty: formData.stratum_difficulty,
        is_active: formData.is_active,
      }

      if (editingPool) {
        const { error } = await supabase
          .from('pools')
          .update(poolData)
          .eq('id', editingPool.id)

        if (error) throw error
        toast.success('Pool atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('pools')
          .insert(poolData)

        if (error) throw error
        toast.success('Pool criado com sucesso!')
      }

      handleCloseSheet()
      loadData()
    } catch (error) {
      console.error('Erro ao salvar pool:', error)
      toast.error('Erro ao salvar pool')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (pool: Pool) => {
    if (!confirm(`Tem certeza que deseja excluir "${pool.name}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('pools')
        .delete()
        .eq('id', pool.id)

      if (error) throw error

      toast.success('Pool excluído com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir pool:', error)
      toast.error('Erro ao excluir pool')
    }
  }

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

  const activePools = filteredPools.filter(p => p.is_active)
  const inactivePools = filteredPools.filter(p => !p.is_active)

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
                        <div className="flex items-center gap-2 text-sm font-medium text-success">
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
                              <p className="font-medium">{pool.name}</p>
                              <p className="text-xs text-text-secondary">
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
                        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
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
                              <p className="font-medium">{pool.name}</p>
                              <p className="text-xs text-text-secondary">
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
      <div className="text-sm text-text-secondary">
        {filteredPools.length} pool(s) | {activePools.length} ativo(s) | {inactivePools.length} inativo(s)
      </div>

      {/* Sheet de criação/edição */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingPool ? 'Editar Pool' : 'Novo Pool'}
            </SheetTitle>
            <SheetDescription>
              {editingPool
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
                {saving ? 'Salvando...' : editingPool ? 'Atualizar' : 'Criar'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
