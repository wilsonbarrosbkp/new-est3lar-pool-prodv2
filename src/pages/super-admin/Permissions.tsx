import { useState, useCallback } from 'react'
import {
  Shield,
  Plus,
  MoreHorizontal,
  Search,
  Users,
  Lock,
  Unlock,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
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
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { typography } from '@/design-system/tokens'
import { useCRUDPage } from '@/hooks/useCRUDPage'
import type { Permission } from '@/types/super-admin'

/**
 * Role estendido com contagem de permissões
 */
interface RoleWithPermissions {
  id: number
  name: string
  description: string | null
  level: number
  badge_color: string | null
  is_system: boolean
  created_at: string
  permissions_count?: number
}

/**
 * Relação many-to-many entre roles e permissões
 */
interface RolePermission {
  role_id: number
  permission_id: number
}

/**
 * Dados do formulário de role
 */
type RoleFormData = {
  name: string
  description: string
  level: number
  badge_color: string
}

const initialFormData: RoleFormData = {
  name: '',
  description: '',
  level: 10,
  badge_color: '#6366f1',
}

export default function PermissionsPage() {
  // Estados customizados para a matriz de permissões (não gerenciados pelo hook)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [loadingPermissions, setLoadingPermissions] = useState(true)

  // Hook CRUD para roles (gerencia CRUD de roles)
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
    handleOpenCreate,
    handleOpenEdit,
    handleCloseSheet,
    handleSubmit,
    handleDelete: handleDeleteBase,
    filteredData: filteredRoles,
    loadData,
  } = useCRUDPage<RoleWithPermissions, RoleFormData>({
    tableName: 'roles',
    initialFormData,
    customLoadData: async () => {
      // Carregar roles, permissions e role_permissions em paralelo
      const [rolesResult, permissionsResult, rolePermissionsResult] = await Promise.all([
        supabase.from('roles').select('*').order('level', { ascending: false }),
        supabase.from('permissions').select('*').order('module, action'),
        supabase.from('role_permissions').select('*'),
      ])

      if (rolesResult.error) throw rolesResult.error
      if (permissionsResult.error) throw permissionsResult.error
      if (rolePermissionsResult.error) throw rolePermissionsResult.error

      // Atualizar estados de permissões (fora do hook)
      setPermissions(permissionsResult.data || [])
      setRolePermissions(rolePermissionsResult.data || [])
      setLoadingPermissions(false)

      // Contar permissões por role
      const rpMap = rolePermissionsResult.data?.reduce((acc, rp) => {
        acc[rp.role_id] = (acc[rp.role_id] || 0) + 1
        return acc
      }, {} as Record<number, number>) || {}

      const rolesWithCount = rolesResult.data?.map(role => ({
        ...role,
        permissions_count: rpMap[role.id] || 0
      })) || []

      return rolesWithCount
    },
    mapDataToForm: (role) => ({
      name: role.name,
      description: role.description || '',
      level: role.level,
      badge_color: role.badge_color || '#6366f1',
    }),
    mapFormToData: (data) => ({
      name: data.name,
      description: data.description || null,
      level: data.level,
      badge_color: data.badge_color,
      is_system: false,
    }),
    validateForm: (data) => {
      if (!data.name.trim()) return 'Nome da role é obrigatório'
      return null
    },
    searchFields: ['name', 'description'],
    entityName: 'role',
    messages: {
      deleteConfirm: (role) => `Tem certeza que deseja excluir a role "${role.name}"?`,
    },
    onBeforeUpdate: async (data, id) => {
      // Verificar se é role do sistema antes de atualizar
      const role = filteredRoles.find(r => r.id === id)
      if (role?.is_system) {
        throw new Error('Roles do sistema não podem ser editadas')
      }
      return data
    },
  })

  // Handler de delete com proteção para roles do sistema
  const handleDeleteRole = useCallback(async (role: RoleWithPermissions) => {
    if (role.is_system) {
      toast.error('Roles do sistema não podem ser excluídas')
      return
    }
    await handleDeleteBase(role)
  }, [handleDeleteBase])

  // ============================================
  // Lógica customizada da matriz de permissões
  // ============================================

  /**
   * Toggle de permissão na matriz many-to-many
   */
  const togglePermission = useCallback(async (roleId: number, permissionId: number) => {
    const exists = rolePermissions.some(
      rp => rp.role_id === roleId && rp.permission_id === permissionId
    )

    try {
      if (exists) {
        // Remover permissão
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', roleId)
          .eq('permission_id', permissionId)

        if (error) throw error
      } else {
        // Adicionar permissão
        const { error } = await supabase
          .from('role_permissions')
          .insert({ role_id: roleId, permission_id: permissionId })

        if (error) throw error
      }

      // Recarregar dados após mudança
      loadData()
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error)
      toast.error('Erro ao atualizar permissão')
    }
  }, [rolePermissions, loadData])

  /**
   * Verifica se uma role tem determinada permissão
   */
  const hasPermission = useCallback((roleId: number, permissionId: number) => {
    return rolePermissions.some(
      rp => rp.role_id === roleId && rp.permission_id === permissionId
    )
  }, [rolePermissions])

  /**
   * Agrupar permissões por módulo para exibição organizada
   */
  const permissionsByModule = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = []
    }
    acc[perm.module].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Buscar roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Role
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Roles */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className={`${typography.card.title} flex items-center gap-2`}>
              <Shield className="h-5 w-5" />
              Roles ({filteredRoles.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="mx-auto h-10 w-10 text-text-secondary mb-2" />
                <p className={`${typography.body.small} text-text-secondary`}>Nenhuma role encontrada</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredRoles.map((role) => (
                  <div
                    key={role.id}
                    className={`p-4 cursor-pointer hover:bg-surface/50 transition-colors ${
                      selectedRoleId === role.id ? 'bg-surface' : ''
                    }`}
                    onClick={() => setSelectedRoleId(role.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: role.badge_color || '#6366f1' }}
                        />
                        <div>
                          <p className={typography.weight.medium}>{role.name}</p>
                          <p className={`${typography.table.small} text-text-secondary`}>
                            Nível {role.level} | {role.permissions_count} permissões
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEdit(role)}>
                            Editar
                          </DropdownMenuItem>
                          {!role.is_system && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-error"
                                onClick={() => handleDeleteRole(role)}
                              >
                                Excluir
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {role.is_system && (
                      <Badge variant="secondary" className={`mt-2 ${typography.badge.small}`}>
                        Sistema
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Matriz de Permissões */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className={`${typography.card.title} flex items-center gap-2`}>
              <Lock className="h-5 w-5" />
              Permissões
              {selectedRoleId && (
                <Badge variant="outline" className="ml-2">
                  {filteredRoles.find(r => r.id === selectedRoleId)?.name}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedRoleId ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-text-secondary mb-4" />
                <p className="text-text-secondary">
                  Selecione uma role para gerenciar permissões
                </p>
              </div>
            ) : loadingPermissions ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(permissionsByModule).map(([module, perms]) => (
                  <div key={module}>
                    <h4 className={`${typography.body.small} ${typography.weight.medium} text-text-secondary mb-2 uppercase`}>
                      {module}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {perms.map((perm) => {
                        const has = hasPermission(selectedRoleId, perm.id)
                        return (
                          <button
                            key={perm.id}
                            onClick={() => togglePermission(selectedRoleId, perm.id)}
                            className={`flex items-center gap-2 p-2 rounded-md text-left ${typography.body.small} transition-colors ${
                              has
                                ? 'bg-success/10 text-success border border-success/20'
                                : 'bg-surface hover:bg-surface/80 border border-border'
                            }`}
                          >
                            {has ? (
                              <Unlock className="h-4 w-4 flex-shrink-0" />
                            ) : (
                              <Lock className="h-4 w-4 flex-shrink-0 text-text-secondary" />
                            )}
                            <div>
                              <p className={typography.weight.medium}>{perm.action}</p>
                              {perm.description && (
                                <p className={`${typography.table.small} text-text-secondary truncate`}>
                                  {perm.description}
                                </p>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sheet de criação/edição de Role */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {editing ? 'Editar Role' : 'Nova Role'}
            </SheetTitle>
            <SheetDescription>
              {editing
                ? 'Altere as informações da role abaixo.'
                : 'Preencha as informações para criar uma nova role.'}
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
                placeholder="Nome da role"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Descrição da role"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Nível (0-100)</Label>
                <Input
                  id="level"
                  type="number"
                  min={0}
                  max={100}
                  value={formData.level}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, level: Number(e.target.value) }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge_color">Cor do Badge</Label>
                <div className="flex gap-2">
                  <Input
                    id="badge_color"
                    type="color"
                    value={formData.badge_color}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, badge_color: e.target.value }))
                    }
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.badge_color}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, badge_color: e.target.value }))
                    }
                    placeholder="#6366f1"
                    className="flex-1"
                  />
                </div>
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
