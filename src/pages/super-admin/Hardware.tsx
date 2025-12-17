import { useState, useEffect, useCallback } from 'react'
import {
  Cpu,
  Plus,
  MoreHorizontal,
  Search,
  Zap,
  Thermometer,
  Calendar,
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

interface Hardware {
  id: number
  name: string
  model: string
  manufacturer: string
  hashrate: number
  hashrate_unit: string
  power_consumption: number
  efficiency: number | null
  organization_id: number
  organization_name?: string
  serial_number: string | null
  purchase_date: string | null
  warranty_until: string | null
  status: 'ativo' | 'inativo' | 'manutencao'
  created_at: string
}

interface Organization {
  id: number
  name: string
}

type FormData = {
  name: string
  model: string
  manufacturer: string
  hashrate: number
  hashrate_unit: string
  power_consumption: number
  efficiency: number | null
  organization_id: number | null
  serial_number: string
  purchase_date: string
  warranty_until: string
  status: 'ativo' | 'inativo' | 'manutencao'
}

const initialFormData: FormData = {
  name: '',
  model: '',
  manufacturer: '',
  hashrate: 0,
  hashrate_unit: 'TH/s',
  power_consumption: 0,
  efficiency: null,
  organization_id: null,
  serial_number: '',
  purchase_date: '',
  warranty_until: '',
  status: 'ativo',
}

const statusOptions = [
  { value: 'ativo', label: 'Ativo', color: 'success' },
  { value: 'inativo', label: 'Inativo', color: 'secondary' },
  { value: 'manutencao', label: 'Manutenção', color: 'warning' },
] as const

export default function HardwarePage() {
  const [hardware, setHardware] = useState<Hardware[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterOrg, setFilterOrg] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingHardware, setEditingHardware] = useState<Hardware | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [hardwareResult, orgsResult] = await Promise.all([
        supabase
          .from('hardware')
          .select(`
            *,
            organizations(name)
          `)
          .order('name'),
        supabase.from('organizations').select('id, name').eq('status', 'ativo').order('name'),
      ])

      if (hardwareResult.error) throw hardwareResult.error
      if (orgsResult.error) throw orgsResult.error

      const hardwareWithDetails = (hardwareResult.data || []).map((item: any) => ({
        ...item,
        organization_name: item.organizations?.name,
      }))

      setHardware(hardwareWithDetails)
      setOrganizations(orgsResult.data || [])
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

  const filteredHardware = hardware.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.model.toLowerCase().includes(search.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
      item.organization_name?.toLowerCase().includes(search.toLowerCase())
    const matchesOrg = filterOrg === 'all' || item.organization_id.toString() === filterOrg
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    return matchesSearch && matchesOrg && matchesStatus
  })

  const handleOpenCreate = () => {
    setEditingHardware(null)
    setFormData(initialFormData)
    setSheetOpen(true)
  }

  const handleOpenEdit = (item: Hardware) => {
    setEditingHardware(item)
    setFormData({
      name: item.name,
      model: item.model,
      manufacturer: item.manufacturer,
      hashrate: item.hashrate,
      hashrate_unit: item.hashrate_unit,
      power_consumption: item.power_consumption,
      efficiency: item.efficiency,
      organization_id: item.organization_id,
      serial_number: item.serial_number || '',
      purchase_date: item.purchase_date || '',
      warranty_until: item.warranty_until || '',
      status: item.status,
    })
    setSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setSheetOpen(false)
    setEditingHardware(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.model.trim() || !formData.manufacturer.trim()) {
      toast.error('Nome, modelo e fabricante são obrigatórios')
      return
    }

    if (!formData.organization_id) {
      toast.error('Organização é obrigatória')
      return
    }

    setSaving(true)

    try {
      const hardwareData = {
        name: formData.name,
        model: formData.model,
        manufacturer: formData.manufacturer,
        hashrate: formData.hashrate,
        hashrate_unit: formData.hashrate_unit,
        power_consumption: formData.power_consumption,
        efficiency: formData.efficiency,
        organization_id: formData.organization_id,
        serial_number: formData.serial_number || null,
        purchase_date: formData.purchase_date || null,
        warranty_until: formData.warranty_until || null,
        status: formData.status,
      }

      if (editingHardware) {
        const { error } = await supabase
          .from('hardware')
          .update(hardwareData)
          .eq('id', editingHardware.id)

        if (error) throw error
        toast.success('Hardware atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('hardware')
          .insert(hardwareData)

        if (error) throw error
        toast.success('Hardware criado com sucesso!')
      }

      handleCloseSheet()
      loadData()
    } catch (error) {
      console.error('Erro ao salvar hardware:', error)
      toast.error('Erro ao salvar hardware')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: Hardware) => {
    if (!confirm(`Tem certeza que deseja excluir "${item.name}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('hardware')
        .delete()
        .eq('id', item.id)

      if (error) throw error

      toast.success('Hardware excluído com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir hardware:', error)
      toast.error('Erro ao excluir hardware')
    }
  }

  const updateStatus = async (item: Hardware, newStatus: 'ativo' | 'inativo' | 'manutencao') => {
    try {
      const { error } = await supabase
        .from('hardware')
        .update({ status: newStatus })
        .eq('id', item.id)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast.error('Erro ao atualizar status')
    }
  }

  const formatHashrate = (hashrate: number, unit: string) => {
    return `${hashrate.toLocaleString()} ${unit}`
  }

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(s => s.value === status)
    return option || { label: status, color: 'secondary' }
  }

  const totalHashrate = filteredHardware
    .filter(h => h.status === 'ativo')
    .reduce((acc, h) => acc + h.hashrate, 0)

  const totalPower = filteredHardware
    .filter(h => h.status === 'ativo')
    .reduce((acc, h) => acc + h.power_consumption, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-1 gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              placeholder="Buscar hardware..."
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
            <SelectTrigger className="w-[140px]">
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
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Hardware
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Equipamentos</p>
                <p className="text-xl font-bold">{filteredHardware.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-success/10 text-success rounded-full flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Hashrate Total (Ativos)</p>
                <p className="text-xl font-bold">{totalHashrate.toLocaleString()} TH/s</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-warning/10 text-warning rounded-full flex items-center justify-center">
                <Thermometer className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Consumo Total (Ativos)</p>
                <p className="text-xl font-bold">{(totalPower / 1000).toFixed(1)} kW</p>
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
          ) : filteredHardware.length === 0 ? (
            <div className="text-center py-12">
              <Cpu className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">
                {search || filterOrg !== 'all' || filterStatus !== 'all'
                  ? 'Nenhum hardware encontrado'
                  : 'Nenhum hardware cadastrado'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Organização</TableHead>
                  <TableHead>Hashrate</TableHead>
                  <TableHead>Consumo</TableHead>
                  <TableHead>Eficiência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHardware.map((item) => {
                  const statusBadge = getStatusBadge(item.status)
                  return (
                    <TableRow key={item.id} className={item.status !== 'ativo' ? 'opacity-60' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                            <Cpu className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-text-secondary">
                              {item.manufacturer} {item.model}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.organization_name}</TableCell>
                      <TableCell>
                        <span className="font-mono">{formatHashrate(item.hashrate, item.hashrate_unit)}</span>
                      </TableCell>
                      <TableCell>{item.power_consumption}W</TableCell>
                      <TableCell>
                        {item.efficiency ? `${item.efficiency} J/TH` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.color as any}>
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
                            <DropdownMenuItem onClick={() => handleOpenEdit(item)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {item.status !== 'ativo' && (
                              <DropdownMenuItem onClick={() => updateStatus(item, 'ativo')}>
                                Marcar como Ativo
                              </DropdownMenuItem>
                            )}
                            {item.status !== 'manutencao' && (
                              <DropdownMenuItem onClick={() => updateStatus(item, 'manutencao')}>
                                Enviar para Manutenção
                              </DropdownMenuItem>
                            )}
                            {item.status !== 'inativo' && (
                              <DropdownMenuItem onClick={() => updateStatus(item, 'inativo')}>
                                Desativar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-error"
                              onClick={() => handleDelete(item)}
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
              {editingHardware ? 'Editar Hardware' : 'Novo Hardware'}
            </SheetTitle>
            <SheetDescription>
              {editingHardware
                ? 'Altere as informações do hardware abaixo.'
                : 'Preencha as informações para cadastrar um novo hardware.'}
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
                placeholder="Ex: ASIC Miner 01"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Fabricante *</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))
                  }
                  placeholder="Ex: Bitmain"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modelo *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, model: e.target.value }))
                  }
                  placeholder="Ex: S19 Pro"
                  required
                />
              </div>
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
                <Label htmlFor="hashrate">Hashrate *</Label>
                <Input
                  id="hashrate"
                  type="number"
                  min={0}
                  value={formData.hashrate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, hashrate: Number(e.target.value) }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hashrate_unit">Unidade</Label>
                <Select
                  value={formData.hashrate_unit}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, hashrate_unit: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="H/s">H/s</SelectItem>
                    <SelectItem value="KH/s">KH/s</SelectItem>
                    <SelectItem value="MH/s">MH/s</SelectItem>
                    <SelectItem value="GH/s">GH/s</SelectItem>
                    <SelectItem value="TH/s">TH/s</SelectItem>
                    <SelectItem value="PH/s">PH/s</SelectItem>
                    <SelectItem value="EH/s">EH/s</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="power_consumption">Consumo (Watts) *</Label>
                <Input
                  id="power_consumption"
                  type="number"
                  min={0}
                  value={formData.power_consumption}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, power_consumption: Number(e.target.value) }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="efficiency">Eficiência (J/TH)</Label>
                <Input
                  id="efficiency"
                  type="number"
                  step="0.01"
                  min={0}
                  value={formData.efficiency || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, efficiency: e.target.value ? Number(e.target.value) : null }))
                  }
                  placeholder="Auto-calculado"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serial_number">Número de Série</Label>
              <Input
                id="serial_number"
                value={formData.serial_number}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, serial_number: e.target.value }))
                }
                placeholder="Ex: SN123456789"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchase_date">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Data de Compra
                </Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, purchase_date: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warranty_until">Garantia Até</Label>
                <Input
                  id="warranty_until"
                  type="date"
                  value={formData.warranty_until}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, warranty_until: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'ativo' | 'inativo' | 'manutencao') =>
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
                {saving ? 'Salvando...' : editingHardware ? 'Atualizar' : 'Criar'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
