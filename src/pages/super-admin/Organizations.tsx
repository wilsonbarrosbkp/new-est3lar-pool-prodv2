import { useState, useMemo } from 'react'
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

// Mock data - será substituído por dados do Supabase
const mockOrganizations: Organization[] = [
  {
    id: 1,
    name: 'Est3lar Mining Corp',
    cnpj: '12345678000199',
    email: 'contato@est3lar.com',
    phone: '85999999999',
    city: 'Fortaleza',
    state: 'CE',
    status: 'ativo',
    created_at: '2024-01-15T10:00:00Z',
    users_count: 45,
  },
  {
    id: 2,
    name: 'Bitcoin Brasil Ltda',
    cnpj: '98765432000188',
    email: 'contato@bitcoinbrasil.com',
    phone: '11988888888',
    city: 'São Paulo',
    state: 'SP',
    status: 'ativo',
    created_at: '2024-02-20T14:30:00Z',
    users_count: 32,
  },
  {
    id: 3,
    name: 'Crypto Mining Solutions',
    cnpj: '11222333000144',
    email: 'info@cryptomining.com',
    phone: '21977777777',
    city: 'Rio de Janeiro',
    state: 'RJ',
    status: 'inativo',
    created_at: '2024-03-10T09:15:00Z',
    users_count: 18,
  },
  {
    id: 4,
    name: 'HashPower Brasil',
    cnpj: '44555666000122',
    email: 'suporte@hashpower.com.br',
    phone: '31966666666',
    city: 'Belo Horizonte',
    state: 'MG',
    status: 'ativo',
    created_at: '2024-04-05T16:45:00Z',
    users_count: 27,
  },
  {
    id: 5,
    name: 'Mineração Digital SA',
    cnpj: '77888999000155',
    email: 'contato@mineracaodigital.com',
    phone: '41955555555',
    city: 'Curitiba',
    state: 'PR',
    status: 'ativo',
    created_at: '2024-05-12T11:20:00Z',
    users_count: 53,
  },
]

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
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations)
  const [loading] = useState(false)
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [saving, setSaving] = useState(false)

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

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (editingOrg) {
      // Atualizar organização existente
      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === editingOrg.id
            ? { ...org, ...formData, updated_at: new Date().toISOString() }
            : org
        )
      )
      toast.success('Organização atualizada com sucesso!')
    } else {
      // Criar nova organização
      const newOrg: Organization = {
        id: Math.max(...organizations.map((o) => o.id)) + 1,
        ...formData,
        created_at: new Date().toISOString(),
        users_count: 0,
      }
      setOrganizations((prev) => [newOrg, ...prev])
      toast.success('Organização criada com sucesso!')
    }

    setSaving(false)
    handleCloseSheet()
  }

  const handleDelete = async (org: Organization) => {
    if (!confirm(`Tem certeza que deseja excluir "${org.name}"?`)) {
      return
    }

    // Simular delete
    setOrganizations((prev) => prev.filter((o) => o.id !== org.id))
    toast.success('Organização excluída com sucesso!')
  }

  const handleExport = () => {
    toast.info('Exportação em desenvolvimento')
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Busca */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Buscar por nome, CNPJ, cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Organização
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
                      className="h-auto p-0 font-semibold hover:bg-transparent"
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
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      <SortIcon columnKey="status" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                      onClick={() => handleSort('users_count')}
                    >
                      Usuários
                      <SortIcon columnKey="users_count" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Cidade/UF</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                      onClick={() => handleSort('created_at')}
                    >
                      Criada em
                      <SortIcon columnKey="created_at" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-12">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedOrgs.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{org.name}</p>
                          {org.cnpj && (
                            <p className="text-xs text-text-secondary">
                              {formatCNPJ(org.cnpj)}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={org.status === 'ativo' ? 'success' : 'secondary'}
                      >
                        {org.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Users className="h-4 w-4 text-text-secondary" />
                        {org.users_count}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {org.city && org.state ? `${org.city}/${org.state}` : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                        <Calendar className="h-4 w-4" />
                        {formatDate(org.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
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
      <div className="text-sm text-text-secondary">
        {filteredAndSortedOrgs.length} de {organizations.length} organizações
      </div>

      {/* Sheet de criação/edição */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingOrg ? 'Editar Organização' : 'Nova Organização'}
            </SheetTitle>
            <SheetDescription>
              {editingOrg
                ? 'Altere as informações da organização abaixo.'
                : 'Preencha as informações para criar uma nova organização.'}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {/* Dados da Empresa */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-secondary">
                Dados da Empresa
              </h3>

              <div className="space-y-2">
                <Label htmlFor="name">Nome/Razão Social *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Razão Social da empresa"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, cnpj: e.target.value }))
                    }
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="contato@empresa.com"
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-secondary">Endereço</h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip_code">CEP</Label>
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
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">Logradouro</Label>
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
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="Nome da cidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">UF</Label>
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
                  />
                </div>
              </div>
            </div>

            {/* Status */}
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

            <SheetFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseSheet}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
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
