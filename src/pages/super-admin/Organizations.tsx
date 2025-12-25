import {
  Building2,
  Calendar,
  Download,
  Plus,
  Search,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'

import { CRUDFormSheet,DataTableSortHeader, TableActionMenu } from '@/components/crud'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
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
import { useCRUDPage } from '@/hooks/useCRUDPage'
import { formatCNPJ,formatDate } from '@/lib/formatters'
import { supabase } from '@/lib/supabase/client'

import type { Organization } from '@/types/super-admin'

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
  const {
    loading,
    search,
    setSearch,
    sortConfig,
    sheetOpen,
    setSheetOpen,
    editing,
    formData,
    setFormData,
    saving,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleteConfirmMessage,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseSheet,
    handleSubmit,
    handleDelete,
    handleConfirmDelete,
    handleSort,
    filteredData,
    totalCount,
  } = useCRUDPage<Organization, FormData>({
    tableName: 'organizations',
    initialFormData,
    entityName: 'organização',
    searchFields: ['name', 'email', 'cnpj', 'city'],

    customLoadData: async () => {
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false })

      if (orgsError) throw orgsError

      const { data: userCounts, error: countError } = await supabase
        .from('users')
        .select('organization_id')

      if (countError) throw countError

      const countMap = userCounts?.reduce((acc, user) => {
        if (user.organization_id) {
          acc[user.organization_id] = (acc[user.organization_id] || 0) + 1
        }
        return acc
      }, {} as Record<number, number>) || {}

      return orgsData?.map(org => ({
        ...org,
        users_count: countMap[org.id] || 0
      })) || []
    },

    mapDataToForm: (org) => ({
      name: org.name || '',
      cnpj: org.cnpj || '',
      email: org.email || '',
      phone: org.phone || '',
      address: org.address || '',
      city: org.city || '',
      state: org.state || '',
      zip_code: org.zip_code || '',
      status: org.status,
    }),

    mapFormToData: (data) => ({
      name: data.name,
      cnpj: data.cnpj || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zip_code: data.zip_code || null,
      status: data.status,
    }),

    validateForm: (data) => {
      if (!data.name.trim()) {
        return 'Nome da organização é obrigatório'
      }
      return null
    },

    messages: {
      deleteConfirm: (org) => `Tem certeza que deseja excluir "${org.name}"?`,
    },
  })

  const handleExport = () => {
    toast.info('Exportação em desenvolvimento')
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Buscar nome, CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`pl-10 ${typography.body.small}`}
          />
        </div>

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
          ) : filteredData.length === 0 ? (
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
                  <DataTableSortHeader
                    label="Nome"
                    columnKey="name"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <DataTableSortHeader
                    label="Status"
                    columnKey="status"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <DataTableSortHeader
                    label="Usuários"
                    columnKey="users_count"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    className="hidden sm:table-cell"
                  />
                  <TableHead className="hidden lg:table-cell">Cidade/UF</TableHead>
                  <DataTableSortHeader
                    label="Criada em"
                    columnKey="created_at"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    className="hidden md:table-cell"
                  />
                  <TableHead className="w-10 sm:w-12">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="py-2 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`h-8 w-8 sm:h-10 sm:w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center ${typography.body.small} ${typography.weight.medium} shrink-0`}>
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className={`${typography.weight.medium} ${typography.body.small} truncate max-w-[120px] sm:max-w-none`}>{org.name}</p>
                          {org.cnpj && (
                            <p className={`${typography.body.tiny} text-text-secondary truncate`}>
                              {formatCNPJ(org.cnpj)}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 sm:py-4">
                      <Badge
                        variant={org.status === 'ativo' ? 'success' : 'secondary'}
                        className={typography.body.tiny}
                      >
                        {org.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-2 sm:py-4">
                      <div className={`flex items-center gap-1.5 ${typography.body.small}`}>
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-text-secondary" />
                        {org.users_count}
                      </div>
                    </TableCell>
                    <TableCell className={`hidden lg:table-cell py-2 sm:py-4 ${typography.body.small}`}>
                      {org.city && org.state ? `${org.city}/${org.state}` : '-'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-2 sm:py-4">
                      <div className={`flex items-center gap-1.5 ${typography.body.small} text-text-secondary`}>
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {formatDate(org.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="py-2 sm:py-4">
                      <TableActionMenu
                        actions={[
                          { label: 'Editar', onClick: () => handleOpenEdit(org) },
                          { label: 'Excluir', onClick: () => handleDelete(org), variant: 'destructive' },
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

      {/* Resumo */}
      <div className={`${typography.body.small} text-text-secondary`}>
        {filteredData.length} de {totalCount} organizações
      </div>

      {/* Sheet de criação/edição */}
      <CRUDFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editing ? 'Editar Organização' : 'Nova Organização'}
        description={editing
          ? 'Altere as informações da organização abaixo.'
          : 'Preencha as informações para criar uma nova organização.'}
        onSubmit={handleSubmit}
        onCancel={handleCloseSheet}
        saving={saving}
        isEditing={!!editing}
      >
        {/* Dados da Empresa */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className={`${typography.body.small} ${typography.weight.medium} text-text-secondary`}>
            Dados da Empresa
          </h3>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="name" className={typography.body.small}>Nome/Razão Social *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Razão Social da empresa"
              required
              className={typography.body.small}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="cnpj" className={typography.body.small}>CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cnpj: e.target.value }))
                }
                placeholder="00.000.000/0000-00"
                className={typography.body.small}
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="phone" className={typography.body.small}>Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="(00) 00000-0000"
                className={typography.body.small}
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className={typography.body.small}>E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="contato@empresa.com"
              className={typography.body.small}
            />
          </div>
        </div>

        {/* Endereço */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className={`${typography.body.small} ${typography.weight.medium} text-text-secondary`}>Endereço</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="zip_code" className={typography.body.small}>CEP</Label>
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
                className={typography.body.small}
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
              <Label htmlFor="address" className={typography.body.small}>Logradouro</Label>
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
                className={typography.body.small}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2 col-span-2">
              <Label htmlFor="city" className={typography.body.small}>Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                placeholder="Nome da cidade"
                className={typography.body.small}
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="state" className={typography.body.small}>UF</Label>
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
                className={typography.body.small}
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="status" className={typography.body.small}>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: 'ativo' | 'inativo') =>
              setFormData((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className={typography.body.small}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CRUDFormSheet>

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Confirmar Exclusão"
        description={deleteConfirmMessage}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
