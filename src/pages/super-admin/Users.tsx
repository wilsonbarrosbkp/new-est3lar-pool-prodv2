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
  phone: string
  organization_id: string
  role_id: string
  status: 'ativo' | 'inativo'
}

const initialFormData: FormData = {
  name: '',
  email: '',
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

    if (!formData.role_id) {
      toast.error('Selecione uma role')
      return
    }

    if (!formData.organization_id) {
      toast.error('Selecione uma organização')
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
        // Criar novo usuário via Edge Function
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.access_token) {
          toast.error('Sessão expirada. Por favor, faça login novamente.')
          return
        }

        const response = await supabase.functions.invoke('create-user', {
          body: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            organization_id: Number(formData.organization_id),
            role_id: Number(formData.role_id),
            status: formData.status,
          },
        })

        if (response.error) {
          throw new Error(response.error.message || 'Erro ao criar usuário')
        }

        if (response.data?.error) {
          throw new Error(response.data.error)
        }

        toast.success('Usuário criado com sucesso! Um e-mail para definir a senha será enviado.')
      }

      handleCloseSheet()
      loadData() // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar usuário')
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Busca */}
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Buscar nome, e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>

        {/* Filtros e Ações */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro Status */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full xs:w-[100px] sm:w-[120px] text-xs sm:text-sm">
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
            <SelectTrigger className="w-full xs:w-[110px] sm:w-[130px] text-xs sm:text-sm">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro Organização - oculto em mobile pequeno */}
          <Select value={filterOrg} onValueChange={setFilterOrg}>
            <SelectTrigger className="hidden sm:flex w-[140px] text-xs sm:text-sm">
              <SelectValue placeholder="Org" />
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

          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Novo Usuário</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </div>
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
                      className="h-auto p-0 font-semibold hover:bg-transparent text-xs sm:text-sm"
                      onClick={() => handleSort('name')}
                    >
                      Usuário
                      <SortIcon columnKey="name" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold hover:bg-transparent text-xs sm:text-sm"
                      onClick={() => handleSort('role_name')}
                    >
                      Role
                      <SortIcon columnKey="role_name" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold hover:bg-transparent text-xs sm:text-sm"
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
                      className="h-auto p-0 font-semibold hover:bg-transparent text-xs sm:text-sm"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      <SortIcon columnKey="status" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold hover:bg-transparent text-xs sm:text-sm"
                      onClick={() => handleSort('created_at')}
                    >
                      Criado em
                      <SortIcon columnKey="created_at" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-10 sm:w-12">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="py-2 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                          <AvatarImage src={user.avatar_url} alt={user.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm font-medium">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{user.name}</p>
                          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-text-secondary">
                            <Mail className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                            <span className="truncate max-w-[80px] sm:max-w-none">{user.email}</span>
                          </div>
                          {/* Role visível apenas em mobile */}
                          <div className="sm:hidden mt-1">
                            <Badge
                              variant={getRoleBadgeVariant(user.role_level)}
                              className="text-[9px] px-1.5 py-0"
                              style={{
                                backgroundColor: user.role_badge_color
                                  ? `${user.role_badge_color}20`
                                  : undefined,
                                color: user.role_badge_color || undefined,
                              }}
                            >
                              {user.role_name}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-2 sm:py-4">
                      <Badge
                        variant={getRoleBadgeVariant(user.role_level)}
                        className="text-[10px] sm:text-xs"
                        style={{
                          backgroundColor: user.role_badge_color
                            ? `${user.role_badge_color}20`
                            : undefined,
                          color: user.role_badge_color || undefined,
                          borderColor: user.role_badge_color || undefined,
                        }}
                      >
                        <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                        {user.role_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell py-2 sm:py-4">
                      {user.organization_name ? (
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                          <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-text-secondary shrink-0" />
                          <span className="truncate max-w-[120px]">{user.organization_name}</span>
                        </div>
                      ) : (
                        <span className="text-text-secondary text-xs sm:text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2 sm:py-4">
                      <Badge
                        variant={user.status === 'ativo' ? 'success' : 'secondary'}
                        className="text-[10px] sm:text-xs"
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell py-2 sm:py-4">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-text-secondary">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {formatDate(user.created_at)}
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
      <div className="text-xs sm:text-sm text-text-secondary">
        {filteredAndSortedUsers.length} de {users.length} usuários
      </div>

      {/* Sheet de criação/edição */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-4 sm:p-6">
          <SheetHeader>
            <SheetTitle className="text-base sm:text-lg">
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </SheetTitle>
            <SheetDescription className="text-xs sm:text-sm">
              {editingUser
                ? 'Altere as informações do usuário abaixo.'
                : 'Preencha as informações para criar um novo usuário.'}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {/* Dados Pessoais */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-medium text-text-secondary">
                Dados Pessoais
              </h3>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="name" className="text-xs sm:text-sm">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Nome completo"
                  required
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="email@exemplo.com"
                  required
                  className="text-sm"
                />
              </div>

              {!editingUser && (
                <p className="text-[10px] sm:text-xs text-text-secondary bg-surface-secondary p-2 rounded-md">
                  O usuário receberá um e-mail para definir sua própria senha.
                </p>
              )}

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

            {/* Vinculação */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-medium text-text-secondary">
                Vinculação
              </h3>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="organization_id" className="text-xs sm:text-sm">Organização</Label>
                <Select
                  value={formData.organization_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, organization_id: value }))
                  }
                >
                  <SelectTrigger className="text-sm">
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
                <p className="text-[10px] sm:text-xs text-text-secondary">
                  Super Admins podem não ter organização vinculada
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="role_id" className="text-xs sm:text-sm">Role *</Label>
                <Select
                  value={formData.role_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, role_id: value }))
                  }
                >
                  <SelectTrigger className="text-sm">
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
