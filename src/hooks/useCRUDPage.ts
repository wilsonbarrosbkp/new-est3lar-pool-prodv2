import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

/**
 * Configuração de ordenação
 */
export type SortConfig<T> = {
  key: keyof T
  direction: 'asc' | 'desc'
} | null

/**
 * Opções para configurar o hook useCRUDPage
 */
export interface UseCRUDPageOptions<T extends { id: number | string }, F> {
  /** Nome da tabela no Supabase */
  tableName: string

  /** Campos a serem selecionados (default: '*') */
  selectFields?: string

  /** Dados iniciais do formulário */
  initialFormData: F

  /** Função para mapear item para o formulário (edição) */
  mapDataToForm: (item: T) => F

  /** Função de validação do formulário (retorna mensagem de erro ou null) */
  validateForm?: (data: F) => string | null

  /** Função para mapear formData para dados do banco (create/update) */
  mapFormToData?: (data: F) => Record<string, unknown>

  /** Campos de busca - quais propriedades do item filtrar */
  searchFields?: (keyof T)[]

  /** Ordenação padrão */
  defaultOrderBy?: { column: string; ascending?: boolean }

  /** Limite de registros */
  limit?: number

  /** Callback após carregar dados */
  onDataLoaded?: (data: T[]) => void

  /** Callback antes de criar (pode modificar os dados) */
  onBeforeCreate?: (data: Record<string, unknown>) => Promise<Record<string, unknown>>

  /** Callback antes de atualizar (pode modificar os dados) */
  onBeforeUpdate?: (data: Record<string, unknown>, id: number | string) => Promise<Record<string, unknown>>

  /** Callback após criar com sucesso */
  onAfterCreate?: (item: T) => void

  /** Callback após atualizar com sucesso */
  onAfterUpdate?: (item: T) => void

  /** Callback após deletar com sucesso */
  onAfterDelete?: (id: number | string) => void

  /** Mensagens customizadas */
  messages?: {
    loadError?: string
    createSuccess?: string
    updateSuccess?: string
    deleteSuccess?: string
    deleteConfirm?: (item: T) => string
    saveError?: string
    deleteError?: string
  }

  /** Nome de exibição da entidade (ex: "organização", "pagamento") */
  entityName?: string
}

/**
 * Retorno do hook useCRUDPage
 */
export interface UseCRUDPageReturn<T extends { id: number | string }, F> {
  // Estados
  data: T[]
  loading: boolean
  search: string
  setSearch: (value: string) => void
  filters: Record<string, string>
  setFilter: (key: string, value: string) => void
  sortConfig: SortConfig<T>
  setSortConfig: React.Dispatch<React.SetStateAction<SortConfig<T>>>
  sheetOpen: boolean
  setSheetOpen: (open: boolean) => void
  editing: T | null
  formData: F
  setFormData: React.Dispatch<React.SetStateAction<F>>
  saving: boolean

  // Ações
  loadData: () => Promise<void>
  handleOpenCreate: () => void
  handleOpenEdit: (item: T) => void
  handleCloseSheet: () => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  handleDelete: (item: T) => Promise<void>
  handleSort: (key: keyof T) => void

  // Dados filtrados e ordenados
  filteredData: T[]

  // Contadores
  totalCount: number
  filteredCount: number
}

/**
 * Hook genérico para páginas CRUD
 * Encapsula lógica comum de listagem, criação, edição e exclusão
 */
export function useCRUDPage<T extends { id: number | string }, F>(
  options: UseCRUDPageOptions<T, F>
): UseCRUDPageReturn<T, F> {
  const {
    tableName,
    selectFields = '*',
    initialFormData,
    mapDataToForm,
    validateForm,
    mapFormToData,
    searchFields = [],
    defaultOrderBy = { column: 'created_at', ascending: false },
    limit,
    onDataLoaded,
    onBeforeCreate,
    onBeforeUpdate,
    onAfterCreate,
    onAfterUpdate,
    onAfterDelete,
    messages = {},
    entityName = 'registro',
  } = options

  // Estados principais
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [formData, setFormData] = useState<F>(initialFormData)
  const [saving, setSaving] = useState(false)

  // Mensagens padrão
  const defaultMessages = {
    loadError: `Erro ao carregar ${entityName}s`,
    createSuccess: `${capitalize(entityName)} criado(a) com sucesso!`,
    updateSuccess: `${capitalize(entityName)} atualizado(a) com sucesso!`,
    deleteSuccess: `${capitalize(entityName)} excluído(a) com sucesso!`,
    deleteConfirm: (_item: T) => `Tem certeza que deseja excluir este(a) ${entityName}?`,
    saveError: `Erro ao salvar ${entityName}`,
    deleteError: `Erro ao excluir ${entityName}`,
    ...messages,
  }

  // Função para definir um filtro
  const setFilter = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  // Carregar dados
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase.from(tableName).select(selectFields)

      // Ordenação
      if (defaultOrderBy) {
        query = query.order(defaultOrderBy.column, {
          ascending: defaultOrderBy.ascending ?? false,
        })
      }

      // Limite
      if (limit) {
        query = query.limit(limit)
      }

      const { data: result, error } = await query

      if (error) throw error

      const items = (result as unknown as T[]) || []
      setData(items)
      onDataLoaded?.(items)
    } catch (error) {
      console.error(`Erro ao carregar ${entityName}s:`, error)
      toast.error(defaultMessages.loadError)
    } finally {
      setLoading(false)
    }
  }, [tableName, selectFields, defaultOrderBy, limit, entityName, defaultMessages.loadError, onDataLoaded])

  // Carregar dados na montagem
  useEffect(() => {
    loadData()
  }, [loadData])

  // Dados filtrados e ordenados
  const filteredData = useMemo(() => {
    let result = [...data]

    // Busca textual
    if (search && searchFields.length > 0) {
      const searchLower = search.toLowerCase()
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field]
          if (value == null) return false
          return String(value).toLowerCase().includes(searchLower)
        })
      )
    }

    // Filtros customizados (aplicados externamente via filteredData customizado se necessário)
    // Os filtros específicos devem ser aplicados pelo componente que usa o hook

    // Ordenação
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        // Null/undefined handling
        if (aValue == null && bValue == null) return 0
        if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1
        if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1

        // Date handling
        if (sortConfig.key.toString().includes('_at') || sortConfig.key.toString().includes('date')) {
          const aTime = new Date(String(aValue)).getTime()
          const bTime = new Date(String(bValue)).getTime()
          return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime
        }

        // Number handling
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }

        // String handling
        const aStr = String(aValue).toLowerCase()
        const bStr = String(bValue).toLowerCase()
        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, search, searchFields, sortConfig])

  // Handler de ordenação
  const handleSort = useCallback((key: keyof T) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return prev.direction === 'asc'
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }, [])

  // Abrir sheet para criar
  const handleOpenCreate = useCallback(() => {
    setEditing(null)
    setFormData(initialFormData)
    setSheetOpen(true)
  }, [initialFormData])

  // Abrir sheet para editar
  const handleOpenEdit = useCallback(
    (item: T) => {
      setEditing(item)
      setFormData(mapDataToForm(item))
      setSheetOpen(true)
    },
    [mapDataToForm]
  )

  // Fechar sheet
  const handleCloseSheet = useCallback(() => {
    setSheetOpen(false)
    setEditing(null)
    setFormData(initialFormData)
  }, [initialFormData])

  // Submit do formulário
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // Validação
      if (validateForm) {
        const error = validateForm(formData)
        if (error) {
          toast.error(error)
          return
        }
      }

      setSaving(true)

      try {
        // Mapear dados do formulário
        let dataToSave = mapFormToData
          ? mapFormToData(formData)
          : (formData as unknown as Record<string, unknown>)

        if (editing) {
          // Update
          if (onBeforeUpdate) {
            dataToSave = await onBeforeUpdate(dataToSave, editing.id)
          }

          const { data: updated, error } = await supabase
            .from(tableName)
            .update(dataToSave)
            .eq('id', editing.id)
            .select()
            .single()

          if (error) throw error

          toast.success(defaultMessages.updateSuccess)
          onAfterUpdate?.(updated as T)
        } else {
          // Create
          if (onBeforeCreate) {
            dataToSave = await onBeforeCreate(dataToSave)
          }

          const { data: created, error } = await supabase
            .from(tableName)
            .insert(dataToSave)
            .select()
            .single()

          if (error) throw error

          toast.success(defaultMessages.createSuccess)
          onAfterCreate?.(created as T)
        }

        handleCloseSheet()
        loadData()
      } catch (error) {
        console.error(`Erro ao salvar ${entityName}:`, error)
        toast.error(defaultMessages.saveError)
      } finally {
        setSaving(false)
      }
    },
    [
      formData,
      editing,
      tableName,
      validateForm,
      mapFormToData,
      onBeforeCreate,
      onBeforeUpdate,
      onAfterCreate,
      onAfterUpdate,
      handleCloseSheet,
      loadData,
      entityName,
      defaultMessages,
    ]
  )

  // Deletar item
  const handleDelete = useCallback(
    async (item: T) => {
      const confirmMessage = defaultMessages.deleteConfirm(item)
      if (!confirm(confirmMessage)) {
        return
      }

      try {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', item.id)

        if (error) throw error

        toast.success(defaultMessages.deleteSuccess)
        onAfterDelete?.(item.id)
        loadData()
      } catch (error) {
        console.error(`Erro ao excluir ${entityName}:`, error)
        toast.error(defaultMessages.deleteError)
      }
    },
    [tableName, loadData, entityName, defaultMessages, onAfterDelete]
  )

  return {
    // Estados
    data,
    loading,
    search,
    setSearch,
    filters,
    setFilter,
    sortConfig,
    setSortConfig,
    sheetOpen,
    setSheetOpen,
    editing,
    formData,
    setFormData,
    saving,

    // Ações
    loadData,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseSheet,
    handleSubmit,
    handleDelete,
    handleSort,

    // Dados filtrados
    filteredData,

    // Contadores
    totalCount: data.length,
    filteredCount: filteredData.length,
  }
}

/**
 * Capitaliza a primeira letra de uma string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default useCRUDPage
