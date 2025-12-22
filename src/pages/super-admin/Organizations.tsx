import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Building2,
  Plus,
  MoreHorizontal,
  Users,
  Calendar,
  Download,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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
import { formatDate, formatCNPJ } from '@/lib/formatters'
import type { Organization } from '@/types/super-admin'
import { supabase } from '@/lib/supabase/client'

type SortConfig = {
  key: keyof Organization
  direction: 'asc' | 'desc'
} | null

type FormData = {
  name: string
  cnpj: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip_code: string
  status: 'ativo' | 'inativo'
}

const initialFormData: FormData = {
  name: '',
  cnpj: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  status: 'ativo',
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [saving, setSaving] = useState(false)

  // Carregar dados do Supabase
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Buscar organizações com contagem de usuários
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false })

      if (orgsError) throw orgsError

      // Buscar contagem de usuários por organização
      const { data: userCounts, error: countError } = await supabase
        .from('users')
        .select('organization_id')

      if (countError) throw countError

      // Mapear contagem de usuários
      const countMap = userCounts?.reduce((acc, user) => {
        if (user.organization_id) {
          acc[user.organization_id] = (acc[user.organization_id] || 0) + 1
        }
        return acc
      }, {} as Record<number, number>) || {}

      // Combinar dados
      const orgsWithCount = orgsData?.map(org => ({
        ...org,
        users_count: countMap[org.id] || 0
      })) || []

      setOrganizations(orgsWithCount)
    } catch (error) {
      console.error('Erro ao carregar organizações:', error)
      toast.error('Erro ao carregar organizações')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filtrar e ordenar organizações
  const filteredAndSortedOrgs = useMemo(() => {
    let result = [...organizations]

    // Filtrar por busca
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (org) =>
          org.name.toLowerCase().includes(searchLower) ||
          org.email?.toLowerCase().includes(searchLower) ||
          org.cnpj?.includes(search) ||
          org.city?.toLowerCase().includes(searchLower)
      )
    }

    // Ordenar
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: string | number = a[sortConfig.key] ?? ''
        let bValue: string | number = b[sortConfig.key] ?? ''

        // Tratamento especial para datas
        if (sortConfig.key === 'created_at') {
          aValue = new Date(aValue as string).getTime()
          bValue = new Date(bValue as string).getTime()
        }

        // Tratamento para números
        if (sortConfig.key === 'users_count') {
          aValue = Number(aValue) || 0
          bValue = Number(bValue) || 0
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return result
  }, [organizations, search, sortConfig])

  const handleSort = (key: keyof Organization) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const SortIcon = ({ columnKey }: { columnKey: keyof Organization }) => {
    if (sortConfig?.key !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    )
  }

  const handleOpenCreate = () => {
    setEditingOrg(null)
    setFormData(initialFormData)
    setSheetOpen(true)
  }

  const handleOpenEdit = (org: Organization) => {
    setEditingOrg(org)
    setFormData({
      name: org.name || '',
      cnpj: org.cnpj || '',
      email: org.email || '',
      phone: org.phone || '',
      address: org.address || '',
      city: org.city || '',
      state: org.state || '',
      zip_code: org.zip_code || '',
      status: org.status,
    })
    setSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setSheetOpen(false)
    setEditingOrg(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Nome da organização é obrigatório')
      return
    }

    setSaving(true)

    try {
      if (editingOrg) {
        // Atualizar organização existente
        const { error } = await supabase
          .from('organizations')
          .update({
            name: formData.name,
            cnpj: formData.cnpj || null,
            email: formData.email || null,
            phone: formData.phone || null,
            address: formData.address || null,
            city: formData.city || null,
            state: formData.state || null,
            zip_code: formData.zip_code || null,
            status: formData.status,
          })
          .eq('id', editingOrg.id)

        if (error) throw error
        toast.success('Organização atualizada com sucesso!')
      } else {
        // Criar nova organização
        const { error } = await supabase
          .from('organizations')
          .insert({
            name: formData.name,
            cnpj: formData.cnpj || null,
            email: formData.email || null,
            phone: formData.phone || null,
            address: formData.address || null,
            city: formData.city || null,
            state: formData.state || null,
            zip_code: formData.zip_code || null,
            status: formData.status,
          })

        if (error) throw error
        toast.success('Organização criada com sucesso!')
      }

      handleCloseSheet()
      loadData() // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar organização:', error)
      toast.error('Erro ao salvar organização')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (org: Organization) => {
    if (!confirm(`Tem certeza que deseja excluir "${org.name}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', org.id)

      if (error) throw error

      toast.success('Organização excluída com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir organização:', error)
      toast.error('Erro ao excluir organização')
    }
  }

  const handleExport = () => {
    toast.info('Exportação em desenvolvimento')
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        {/* Busca */}
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Buscar nome, CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nova Organização</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedOrgs.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">
                {search
                  ? 'Nenhuma organização encontrada para esta busca'
                  : 'Nenhuma organização cadastrada'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold hover:bg-transparent text-xs sm:text-sm"
                      onClick={() => handleSort('name')}
                    >
                      Nome
                      <SortIcon columnKey="name" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold hover:bg-transparent text-xs sm:text-sm"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      <SortIcon columnKey="status" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold hover:bg-transparent text-xs sm:text-sm"
                      onClick={() => handleSort('users_count')}
                    >
                      Usuários
                      <SortIcon columnKey="users_count" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Cidade/UF</TableHead>
                  <TableHead className="hidden md:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold hover:bg-transparent text-xs sm:text-sm"
                      onClick={() => handleSort('created_at')}
                    >
                      Criada em
                      <SortIcon columnKey="created_at" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-10 sm:w-12">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedOrgs.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="py-2 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs sm:text-sm font-medium shrink-0">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{org.name}</p>
                          {org.cnpj && (
                            <p className="text-[10px] sm:text-xs text-text-secondary truncate">
                              {formatCNPJ(org.cnpj)}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 sm:py-4">
                      <Badge
                        variant={org.status === 'ativo' ? 'success' : 'secondary'}
                        className="text-[10px] sm:text-xs"
                      >
                        {org.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-2 sm:py-4">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-text-secondary" />
                        {org.users_count}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell py-2 sm:py-4 text-xs sm:text-sm">
                      {org.city && org.state ? `${org.city}/${org.state}` : '-'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-2 sm:py-4">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-text-secondary">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {formatDate(org.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="py-2 sm:py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                            <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEdit(org)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-error"
                            onClick={() => handleDelete(org)}
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
      <div className="text-xs sm:text-sm text-text-secondary">
        {filteredAndSortedOrgs.length} de {organizations.length} organizações
      </div>

      {/* Sheet de criação/edição */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-4 sm:p-6">
          <SheetHeader>
            <SheetTitle className="text-base sm:text-lg">
              {editingOrg ? 'Editar Organização' : 'Nova Organização'}
            </SheetTitle>
            <SheetDescription className="text-xs sm:text-sm">
              {editingOrg
                ? 'Altere as informações da organização abaixo.'
                : 'Preencha as informações para criar uma nova organização.'}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {/* Dados da Empresa */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-medium text-text-secondary">
                Dados da Empresa
              </h3>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="name" className="text-xs sm:text-sm">Nome/Razão Social *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Razão Social da empresa"
                  required
                  className="text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="cnpj" className="text-xs sm:text-sm">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, cnpj: e.target.value }))
                    }
                    placeholder="00.000.000/0000-00"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="phone" className="text-xs sm:text-sm">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="(00) 00000-0000"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="contato@empresa.com"
                  className="text-sm"
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-medium text-text-secondary">Endereço</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="zip_code" className="text-xs sm:text-sm">CEP</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        zip_code: e.target.value,
                      }))
                    }
                    placeholder="00000-000"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                  <Label htmlFor="address" className="text-xs sm:text-sm">Logradouro</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="Rua, Avenida, número"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2 col-span-2">
                  <Label htmlFor="city" className="text-xs sm:text-sm">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="Nome da cidade"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="state" className="text-xs sm:text-sm">UF</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        state: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="SP"
                    maxLength={2}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="status" className="text-xs sm:text-sm">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'ativo' | 'inativo') =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SheetFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseSheet}
                disabled={saving}
                className="text-sm"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="text-sm">
                {saving
                  ? 'Salvando...'
                  : editingOrg
                    ? 'Atualizar'
                    : 'Criar'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
