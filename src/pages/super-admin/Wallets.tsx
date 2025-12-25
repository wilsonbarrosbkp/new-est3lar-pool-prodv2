import { useState, useCallback, useMemo } from 'react'
import {
  Wallet as WalletIcon,
  Plus,
  MoreHorizontal,
  Search,
  Star,
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
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { typography } from '@/design-system/tokens'
import { formatAddress } from '@/lib/formatters'
import { useCRUDPage } from '@/hooks/useCRUDPage'
import type {
  Wallet,
  OrganizationOption,
  Currency,
} from '@/types/super-admin'

type FormData = {
  address: string
  label: string
  organization_id: number | null
  currency_id: number | null
  is_primary: boolean
  is_active: boolean
}

const initialFormData: FormData = {
  address: '',
  label: '',
  organization_id: null,
  currency_id: null,
  is_primary: false,
  is_active: true,
}

export default function WalletsPage() {
  // Estados locais para dados relacionados e filtros
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [filterOrg, setFilterOrg] = useState<string>('all')
  const [filterCurrency, setFilterCurrency] = useState<string>('all')
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
  } = useCRUDPage<Wallet, FormData>({
    tableName: 'wallets',
    initialFormData,
    customLoadData: async () => {
      const [walletsResult, orgsResult, currenciesResult] = await Promise.all([
        supabase
          .from('wallets')
          .select(`
            *,
            organizations(name),
            currencies(symbol, name)
          `)
          .order('is_primary', { ascending: false })
          .order('label'),
        supabase.from('organizations').select('id, name').eq('status', 'ativo').order('name'),
        supabase.from('currencies').select('id, name, symbol, type').eq('is_active', true).order('type, name'),
      ])

      if (walletsResult.error) throw walletsResult.error
      if (orgsResult.error) throw orgsResult.error
      if (currenciesResult.error) throw currenciesResult.error

      setOrganizations(orgsResult.data || [])
      setCurrencies(currenciesResult.data || [])

      return (walletsResult.data || []).map((wallet: Record<string, unknown>) => ({
        ...wallet,
        organization_name: (wallet.organizations as { name?: string } | null)?.name,
        currency_symbol: (wallet.currencies as { symbol?: string } | null)?.symbol,
        currency_name: (wallet.currencies as { name?: string } | null)?.name,
      })) as Wallet[]
    },
    mapDataToForm: (wallet) => ({
      address: wallet.address,
      label: wallet.label,
      organization_id: wallet.organization_id,
      currency_id: wallet.currency_id,
      is_primary: wallet.is_primary ?? false,
      is_active: wallet.is_active ?? true,
    }),
    customSubmit: async (data, editingItem) => {
      // Se está marcando como principal, remover flag das outras carteiras
      if (data.is_primary && data.organization_id && data.currency_id) {
        await supabase
          .from('wallets')
          .update({ is_primary: false })
          .eq('organization_id', data.organization_id)
          .eq('currency_id', data.currency_id)
      }

      const walletData = {
        address: data.address,
        label: data.label,
        organization_id: data.organization_id,
        currency_id: data.currency_id,
        is_primary: data.is_primary,
        is_active: data.is_active,
      }

      if (editingItem) {
        const { error } = await supabase
          .from('wallets')
          .update(walletData)
          .eq('id', editingItem.id)

        if (error) throw error
        toast.success('Carteira atualizada com sucesso!')
      } else {
        const { error } = await supabase
          .from('wallets')
          .insert(walletData)

        if (error) throw error
        toast.success('Carteira criada com sucesso!')
      }
    },
    validateForm: (data) => {
      if (!data.address.trim() || !data.label.trim()) {
        return 'Endereço e label são obrigatórios'
      }
      if (!data.organization_id || !data.currency_id) {
        return 'Organização e moeda são obrigatórios'
      }
      return null
    },
    searchFields: ['label', 'address', 'organization_name'],
    entityName: 'carteira',
    messages: {
      deleteConfirm: (wallet) => `Tem certeza que deseja excluir "${wallet.label}"?`,
    },
  })

  // Filtros adicionais sobre os dados já filtrados pelo hook
  const filteredWallets = useMemo(() => {
    return baseFilteredData.filter((wallet) => {
      const matchesOrg = filterOrg === 'all' || wallet.organization_id.toString() === filterOrg
      const matchesCurrency = filterCurrency === 'all' || wallet.currency_id.toString() === filterCurrency
      return matchesOrg && matchesCurrency
    })
  }, [baseFilteredData, filterOrg, filterCurrency])

  // Funções auxiliares
  const handleCopyAddress = useCallback(async (wallet: Wallet) => {
    try {
      await navigator.clipboard.writeText(wallet.address)
      setCopiedId(wallet.id)
      setTimeout(() => setCopiedId(null), 2000)
      toast.success('Endereço copiado!')
    } catch {
      toast.error('Erro ao copiar endereço')
    }
  }, [])

  const toggleActive = useCallback(async (wallet: Wallet) => {
    try {
      const { error } = await supabase
        .from('wallets')
        .update({ is_active: !wallet.is_active })
        .eq('id', wallet.id)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error('Erro ao atualizar carteira:', error)
      toast.error('Erro ao atualizar carteira')
    }
  }, [loadData])

  const setPrimary = useCallback(async (wallet: Wallet) => {
    try {
      // Remover flag das outras
      await supabase
        .from('wallets')
        .update({ is_primary: false })
        .eq('organization_id', wallet.organization_id)
        .eq('currency_id', wallet.currency_id)

      // Marcar esta como principal
      const { error } = await supabase
        .from('wallets')
        .update({ is_primary: true })
        .eq('id', wallet.id)

      if (error) throw error
      toast.success('Carteira definida como principal!')
      loadData()
    } catch (error) {
      console.error('Erro ao definir carteira principal:', error)
      toast.error('Erro ao definir carteira principal')
    }
  }, [loadData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-1 gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              placeholder="Buscar carteiras..."
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
          <Select value={filterCurrency} onValueChange={setFilterCurrency}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Moeda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {currencies.map((currency) => (
                <SelectItem key={currency.id} value={currency.id.toString()}>
                  {currency.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Carteira
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
          ) : filteredWallets.length === 0 ? (
            <div className="text-center py-12">
              <WalletIcon className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">
                {search || filterOrg !== 'all' || filterCurrency !== 'all'
                  ? 'Nenhuma carteira encontrada'
                  : 'Nenhuma carteira cadastrada'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Carteira</TableHead>
                  <TableHead>Organização</TableHead>
                  <TableHead>Moeda</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWallets.map((wallet) => (
                  <TableRow key={wallet.id} className={!wallet.is_active ? 'opacity-60' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 ${wallet.is_primary ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'} rounded-full flex items-center justify-center`}>
                          {wallet.is_primary ? (
                            <Star className="h-5 w-5 fill-current" />
                          ) : (
                            <WalletIcon className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={typography.weight.medium}>{wallet.label}</p>
                            {wallet.is_primary && (
                              <Badge variant="warning" className={typography.badge.small}>Principal</Badge>
                            )}
                          </div>
                          <p className={`${typography.table.small} text-text-secondary`}>{wallet.currency_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{wallet.organization_name}</TableCell>
                    <TableCell>
                      <Badge variant={wallet.currency_symbol === 'BTC' ? 'warning' : 'secondary'}>
                        {wallet.currency_symbol}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className={`${typography.table.small} bg-surface px-2 py-1 rounded`}>
                          {formatAddress(wallet.address)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopyAddress(wallet)}
                        >
                          {copiedId === wallet.id ? (
                            <Check className="h-3 w-3 text-success" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={wallet.is_active ? 'success' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => toggleActive(wallet)}
                      >
                        {wallet.is_active ? 'Ativa' : 'Inativa'}
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
                          <DropdownMenuItem onClick={() => handleOpenEdit(wallet)}>
                            Editar
                          </DropdownMenuItem>
                          {!wallet.is_primary && (
                            <DropdownMenuItem onClick={() => setPrimary(wallet)}>
                              Definir como principal
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-error"
                            onClick={() => handleDelete(wallet)}
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

      {/* Resumo */}
      <div className={`${typography.body.small} text-text-secondary`}>
        {filteredWallets.length} carteira(s) | {filteredWallets.filter(w => w.is_primary).length} principal(is) | {filteredWallets.filter(w => w.is_active).length} ativa(s)
      </div>

      {/* Sheet de criação/edição */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {editing ? 'Editar Carteira' : 'Nova Carteira'}
            </SheetTitle>
            <SheetDescription>
              {editing
                ? 'Altere as informações da carteira abaixo.'
                : 'Preencha as informações para criar uma nova carteira.'}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, label: e.target.value }))
                }
                placeholder="Ex: Carteira Principal BTC"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                placeholder="Ex: bc1q..."
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
              <Label htmlFor="currency_id">Moeda *</Label>
              <Select
                value={formData.currency_id?.toString() || ''}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, currency_id: Number(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma moeda" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.id} value={currency.id.toString()}>
                      {currency.symbol} - {currency.name} ({currency.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="is_primary">Principal?</Label>
                <Select
                  value={formData.is_primary ? 'true' : 'false'}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, is_primary: value === 'true' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="true">Ativa</SelectItem>
                    <SelectItem value="false">Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
