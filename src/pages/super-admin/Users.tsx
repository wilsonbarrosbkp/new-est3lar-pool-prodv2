import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  UserCog,
  Plus,
  MoreHorizontal,
  Calendar,
  Download,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
  Shield,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
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
import { formatDate } from '@/lib/formatters'
import type { User, Role, Organization } from '@/types/super-admin'
import { supabase } from '@/lib/supabase/client'

type SortConfig = {
  key: keyof User
  direction: 'asc' | 'desc'
} | null

type FormData = {
  name: string
  email: string
  password: string
  phone: string
  organization_id: string
  role_id: string
  status: 'ativo' | 'inativo'
}

const initialFormData: FormData = {
  name: '',
  email: '',
  password: '',
  phone: '',
  organization_id: '',
  role_id: '',
  status: 'ativo',
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [organizations, setOrganizations] = useState<Pick<Organization, 'id' | 'name'>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterOrg, setFilterOrg] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [saving, setSaving] = useState(false)

  // Carregar dados do Supabase
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Carregar usuários via view
      const { data: usersData, error: usersError } = await supabase
        .from('v_users_details')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError
      setUsers(usersData || [])

      // Carregar roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('level', { ascending: false })

      if (rolesError) throw rolesError
      setRoles(rolesData?.map(r => ({
        ...r,
        role_type_id: r.level,
        permissions: []
      })) || [])

      // Carregar organizações
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('status', 'ativo')
        .order('name')

      if (orgsError) throw orgsError
      setOrganizations(orgsData || [])

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

  // Filtrar e ordenar usuários
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users]

    // Filtrar por busca
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.phone?.includes(search) ||
          user.organization_name?.toLowerCase().includes(searchLower)
      )
    }

    // Filtrar por status
    if (filterStatus !== 'all') {
      result = result.filter((user) => user.status === filterStatus)
    }

    // Filtrar por role
    if (filterRole !== 'all') {
      result = result.filter((user) => user.role_id === Number(filterRole))
    }

    // Filtrar por organização
    if (filterOrg !== 'all') {
      result = result.filter((user) => user.organization_id === Number(filterOrg))
    }

    // Ordenar
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: string | number = a[sortConfig.key] ?? ''
        let bValue: string | number = b[sortConfig.key] ?? ''

        if (sortConfig.key === 'created_at') {
          aValue = new Date(aValue as string).getTime()
          bValue = new Date(bValue as string).getTime()
        }

        if (sortConfig.key === 'role_level') {
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
  }, [users, search, filterStatus, filterRole, filterOrg, sortConfig])

  const handleSort = (key: keyof User) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const SortIcon = ({ columnKey }: { columnKey: keyof User }) => {
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
    setEditingUser(null)
    setFormData(initialFormData)
    setSheetOpen(true)
  }

  const handleOpenEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      phone: user.phone || '',
      organization_id: user.organization_id?.toString() || '',
      role_id: user.role_id.toString(),
      status: user.status,
    })
    setSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setSheetOpen(false)
    setEditingUser(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    if (!formData.email.trim()) {
      toast.error('E-mail é obrigatório')
      return
    }

    if (!editingUser && !formData.password) {
      toast.error('Senha é obrigatória para novos usuários')
      return
    }

    if (!formData.role_id) {
      toast.error('Selecione uma role')
      return
    }

    setSaving(true)

    try {
      if (editingUser) {
        // Atualizar usuário existente
        const { error } = await supabase
          .from('users')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            organization_id: formData.organization_id ? Number(formData.organization_id) : null,
            role_id: Number(formData.role_id),
            status: formData.status,
          })
          .eq('id', editingUser.id)

        if (error) throw error
        toast.success('Usuário atualizado com sucesso!')
      } else {
        // Criar novo usuário via Supabase Auth Admin
        // Nota: Isso requer Edge Function ou backend com service_role
        toast.error('Criação de usuários requer configuração do Auth Admin')
        return
      }

      handleCloseSheet()
      loadData() // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      toast.error('Erro ao salvar usuário')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`Tem certeza que deseja excluir "${user.name}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)

      if (error) throw error

      toast.success('Usuário excluído com sucesso!')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      toast.error('Erro ao excluir usuário')
    }
  }

  const handleExport = () => {
    toast.info('Exportação em desenvolvimento')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadgeVariant = (level: number) => {
    if (level >= 100) return 'destructive'
    if (level >= 50) return 'warning'
    return 'success'
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Busca */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Buscar por nome, e-mail, telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros e Ações */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro Status */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro Role */}
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro Organização */}
          <Select value={filterOrg} onValueChange={setFilterOrg}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Organização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id.toString()}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
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
          ) : filteredAndSortedUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserCog className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">
                {search || filterStatus !== 'all' || filterRole !== 'all' || filterOrg !== 'all'
                  ? 'Nenhum usuário encontrado para os filtros aplicados'
                  : 'Nenhum usuário cadastrado'}
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
                      Usuário
                      <SortIcon columnKey="name" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                      onClick={() => handleSort('role_name')}
                    >
                      Role
                      <SortIcon columnKey="role_name" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                      onClick={() => handleSort('organization_name')}
                    >
                      Organização
                      <SortIcon columnKey="organization_name" />
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
                  <TableHead className="hidden lg:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                      onClick={() => handleSort('created_at')}
                    >
                      Criado em
                      <SortIcon columnKey="created_at" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-12">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url} alt={user.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getRoleBadgeVariant(user.role_level)}
                        style={{
                          backgroundColor: user.role_badge_color
                            ? `${user.role_badge_color}20`
                            : undefined,
                          color: user.role_badge_color || undefined,
                          borderColor: user.role_badge_color || undefined,
                        }}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.organization_name ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Building2 className="h-4 w-4 text-text-secondary" />
                          {user.organization_name}
                        </div>
                      ) : (
                        <span className="text-text-secondary">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'ativo' ? 'success' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                        <Calendar className="h-4 w-4" />
                        {formatDate(user.created_at)}
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
                          <DropdownMenuItem onClick={() => handleOpenEdit(user)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-error"
                            onClick={() => handleDelete(user)}
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
        {filteredAndSortedUsers.length} de {users.length} usuários
      </div>

      {/* Sheet de criação/edição */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </SheetTitle>
            <SheetDescription>
              {editingUser
                ? 'Altere as informações do usuário abaixo.'
                : 'Preencha as informações para criar um novo usuário.'}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-secondary">
                Dados Pessoais
              </h3>

              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="email@exemplo.com"
                  required
                />
              </div>

              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                </div>
              )}

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

            {/* Vinculação */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-secondary">
                Vinculação
              </h3>

              <div className="space-y-2">
                <Label htmlFor="organization_id">Organização</Label>
                <Select
                  value={formData.organization_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, organization_id: value }))
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
                <p className="text-xs text-text-secondary">
                  Super Admins podem não ter organização vinculada
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role_id">Role *</Label>
                <Select
                  value={formData.role_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, role_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: role.badge_color }}
                          />
                          {role.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  : editingUser
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
