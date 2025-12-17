import { useState, useEffect, useCallback } from 'react'
import {
  Coins,
  Plus,
  MoreHorizontal,
  Search,
  Bitcoin,
  DollarSign,
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

interface Currency {
  id: number
  name: string
  symbol: string
  type: 'crypto' | 'fiat'
  decimals: number
  is_active: boolean
  created_at: string
}

type FormData = {
  name: string
  symbol: string
  type: 'crypto' | 'fiat'
  decimals: number
  is_active: boolean
}

const initialFormData: FormData = {
  name: '',
  symbol: '',
  type: 'crypto',
  decimals: 8,
  is_active: true,
}

export default function CurrenciesPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .order('type, name')

      if (error) throw error
      setCurrencies(data || [])
    } catch (error) {
      console.error('Erro ao carregar moedas:', error)
      toast.error('Erro ao carregar moedas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredCurrencies = currencies.filter(currency =>
    currency.name.toLowerCase().includes(search.toLowerCase()) ||
    currency.symbol.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenCreate = () => {
    setEditingCurrency(null)
    setFormData(initialFormData)
    setSheetOpen(true)
  }

  const handleOpenEdit = (currency: Currency) => {
    setEditingCurrency(currency)
    setFormData({
      name: currency.name,
      symbol: currency.symbol,
      type: currency.type,
      decimals: currency.decimals,
      is_active: currency.is_active,
    })
    setSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setSheetOpen(false)
    setEditingCurrency(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.symbol.trim()) {
      toast.error('Nome e símbolo são obrigatórios')
      return
    }

    setSaving(true)

    try {
      if (editingCurrency) {
        const { error } = await supabase
          .from('currencies')
          .update({
            name: formData.name,
            symbol: formData.symbol.toUpperCase(),
            type: formData.type,
            decimals: formData.decimals,
            is_active: formData.is_active,
          })
          .eq('id', editingCurrency.id)

        if (error) throw error
        toast.success('Moeda atualizada com sucesso!')
      } else {
        const { error } = await supabase
          .from('currencies')
          .insert({
            name: formData.name,
            symbol: formData.symbol.toUpperCase(),
            type: formData.type,
            decimals: formData.decimals,
            is_active: formData.is_active,
          })

        if (error) throw error
        toast.success('Moeda criada com sucesso!')
      }

      handleCloseSheet()
      loadData()
    } catch (error) {
      console.error('Erro ao salvar moeda:', error)
      toast.error('Erro ao salvar moeda')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (currency: Currency) => {
    if (!confirm(`Tem certeza que deseja excluir "${currency.name}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('currencies')
        .delete()
        .eq('id', currency.id)

      if (error) throw error

      toast.success('Moeda excluída com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir moeda:', error)
      toast.error('Erro ao excluir moeda')
    }
  }

  const toggleActive = async (currency: Currency) => {
    try {
      const { error } = await supabase
        .from('currencies')
        .update({ is_active: !currency.is_active })
        .eq('id', currency.id)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error('Erro ao atualizar moeda:', error)
      toast.error('Erro ao atualizar moeda')
    }
  }

  const cryptoCurrencies = filteredCurrencies.filter(c => c.type === 'crypto')
  const fiatCurrencies = filteredCurrencies.filter(c => c.type === 'fiat')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Buscar moedas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Moeda
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
          ) : filteredCurrencies.length === 0 ? (
            <div className="text-center py-12">
              <Coins className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">
                {search ? 'Nenhuma moeda encontrada' : 'Nenhuma moeda cadastrada'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Moeda</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Decimais</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Criptomoedas */}
                {cryptoCurrencies.length > 0 && (
                  <>
                    <TableRow>
                      <TableCell colSpan={5} className="bg-surface/50">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Bitcoin className="h-4 w-4" />
                          Criptomoedas ({cryptoCurrencies.length})
                        </div>
                      </TableCell>
                    </TableRow>
                    {cryptoCurrencies.map((currency) => (
                      <TableRow key={currency.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-warning/10 text-warning rounded-full flex items-center justify-center text-sm font-bold">
                              {currency.symbol.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium">{currency.name}</p>
                              <p className="text-xs text-text-secondary">{currency.symbol}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="warning">Crypto</Badge>
                        </TableCell>
                        <TableCell>{currency.decimals}</TableCell>
                        <TableCell>
                          <Badge
                            variant={currency.is_active ? 'success' : 'secondary'}
                            className="cursor-pointer"
                            onClick={() => toggleActive(currency)}
                          >
                            {currency.is_active ? 'Ativa' : 'Inativa'}
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
                              <DropdownMenuItem onClick={() => handleOpenEdit(currency)}>
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-error"
                                onClick={() => handleDelete(currency)}
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

                {/* Moedas Fiat */}
                {fiatCurrencies.length > 0 && (
                  <>
                    <TableRow>
                      <TableCell colSpan={5} className="bg-surface/50">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <DollarSign className="h-4 w-4" />
                          Moedas Fiat ({fiatCurrencies.length})
                        </div>
                      </TableCell>
                    </TableRow>
                    {fiatCurrencies.map((currency) => (
                      <TableRow key={currency.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-success/10 text-success rounded-full flex items-center justify-center text-sm font-bold">
                              {currency.symbol.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium">{currency.name}</p>
                              <p className="text-xs text-text-secondary">{currency.symbol}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">Fiat</Badge>
                        </TableCell>
                        <TableCell>{currency.decimals}</TableCell>
                        <TableCell>
                          <Badge
                            variant={currency.is_active ? 'success' : 'secondary'}
                            className="cursor-pointer"
                            onClick={() => toggleActive(currency)}
                          >
                            {currency.is_active ? 'Ativa' : 'Inativa'}
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
                              <DropdownMenuItem onClick={() => handleOpenEdit(currency)}>
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-error"
                                onClick={() => handleDelete(currency)}
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
        {filteredCurrencies.length} moeda(s) | {cryptoCurrencies.length} crypto | {fiatCurrencies.length} fiat
      </div>

      {/* Sheet de criação/edição */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {editingCurrency ? 'Editar Moeda' : 'Nova Moeda'}
            </SheetTitle>
            <SheetDescription>
              {editingCurrency
                ? 'Altere as informações da moeda abaixo.'
                : 'Preencha as informações para criar uma nova moeda.'}
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
                placeholder="Ex: Bitcoin"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Símbolo *</Label>
                <Input
                  id="symbol"
                  value={formData.symbol}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, symbol: e.target.value.toUpperCase() }))
                  }
                  placeholder="Ex: BTC"
                  maxLength={10}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'crypto' | 'fiat') =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="fiat">Fiat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="decimals">Casas Decimais</Label>
              <Input
                id="decimals"
                type="number"
                min={0}
                max={18}
                value={formData.decimals}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, decimals: Number(e.target.value) }))
                }
              />
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
                {saving ? 'Salvando...' : editingCurrency ? 'Atualizar' : 'Criar'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
