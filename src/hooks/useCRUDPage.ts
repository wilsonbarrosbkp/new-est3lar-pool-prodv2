import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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

  /** Função customizada para carregar dados (substitui a lógica padrão) */
  customLoadData?: () => Promise<T[]>

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

  /** Função customizada para submit (substitui a lógica padrão de create/update) */
  customSubmit?: (formData: F, editing: T | null) => Promise<void>

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
    customLoadData,
    onDataLoaded,
    onBeforeCreate,
    onBeforeUpdate,
    onAfterCreate,
    onAfterUpdate,
    onAfterDelete,
    customSubmit,
    messages = {},
    entityName = 'registro',
  } = options

  // Refs para funções callback e objetos (evita loops infinitos)
  const customLoadDataRef = useRef(customLoadData)
  const customSubmitRef = useRef(customSubmit)
  const onDataLoadedRef = useRef(onDataLoaded)
  const onBeforeCreateRef = useRef(onBeforeCreate)
  const onBeforeUpdateRef = useRef(onBeforeUpdate)
  const onAfterCreateRef = useRef(onAfterCreate)
  const onAfterUpdateRef = useRef(onAfterUpdate)
  const onAfterDeleteRef = useRef(onAfterDelete)
  const validateFormRef = useRef(validateForm)
  const mapFormToDataRef = useRef(mapFormToData)
  const mapDataToFormRef = useRef(mapDataToForm)
  const defaultOrderByRef = useRef(defaultOrderBy)
  const messagesRef = useRef(messages)

  // Atualizar refs quando as funções/objetos mudarem
  useEffect(() => {
    customLoadDataRef.current = customLoadData
    customSubmitRef.current = customSubmit
    onDataLoadedRef.current = onDataLoaded
    onBeforeCreateRef.current = onBeforeCreate
    onBeforeUpdateRef.current = onBeforeUpdate
    onAfterCreateRef.current = onAfterCreate
    onAfterUpdateRef.current = onAfterUpdate
    onAfterDeleteRef.current = onAfterDelete
    validateFormRef.current = validateForm
    mapFormToDataRef.current = mapFormToData
    mapDataToFormRef.current = mapDataToForm
    defaultOrderByRef.current = defaultOrderBy
    messagesRef.current = messages
  })

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

  // Função para obter mensagens (usa refs para evitar loops)
  const getMessages = useCallback(() => {
    const msgs = messagesRef.current
    return {
      loadError: msgs.loadError ?? `Erro ao carregar ${entityName}s`,
      createSuccess: msgs.createSuccess ?? `${capitalize(entityName)} criado(a) com sucesso!`,
      updateSuccess: msgs.updateSuccess ?? `${capitalize(entityName)} atualizado(a) com sucesso!`,
      deleteSuccess: msgs.deleteSuccess ?? `${capitalize(entityName)} excluído(a) com sucesso!`,
      deleteConfirm: msgs.deleteConfirm ?? ((_item: T) => `Tem certeza que deseja excluir este(a) ${entityName}?`),
      saveError: msgs.saveError ?? `Erro ao salvar ${entityName}`,
      deleteError: msgs.deleteError ?? `Erro ao excluir ${entityName}`,
    }
  }, [entityName])

  // Função para definir um filtro
  const setFilter = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  // Carregar dados
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      let items: T[]

      if (customLoadDataRef.current) {
        // Usar função customizada se fornecida
        items = await customLoadDataRef.current()
      } else {
        // Query padrão
        let query = supabase.from(tableName).select(selectFields)

        // Ordenação
        const orderBy = defaultOrderByRef.current
        if (orderBy) {
          query = query.order(orderBy.column, {
            ascending: orderBy.ascending ?? false,
          })
        }

        // Limite
        if (limit) {
          query = query.limit(limit)
        }

        const { data: result, error } = await query

        if (error) throw error

        items = (result as unknown as T[]) || []
      }

      setData(items)
      onDataLoadedRef.current?.(items)
    } catch (error) {
      console.error(`Erro ao carregar ${entityName}s:`, error)
      toast.error(getMessages().loadError)
    } finally {
      setLoading(false)
    }
  }, [tableName, selectFields, limit, entityName, getMessages])

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
      setFormData(mapDataToFormRef.current(item))
      setSheetOpen(true)
    },
    []
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
      if (validateFormRef.current) {
        const error = validateFormRef.current(formData)
        if (error) {
          toast.error(error)
          return
        }
      }

      setSaving(true)
      const msgs = getMessages()

      try {
        // Usar submit customizado se fornecido
        if (customSubmitRef.current) {
          await customSubmitRef.current(formData, editing)
          handleCloseSheet()
          loadData()
          return
        }

        // Mapear dados do formulário
        let dataToSave = mapFormToDataRef.current
          ? mapFormToDataRef.current(formData)
          : (formData as unknown as Record<string, unknown>)

        if (editing) {
          // Update
          if (onBeforeUpdateRef.current) {
            dataToSave = await onBeforeUpdateRef.current(dataToSave, editing.id)
          }

          const { data: updated, error } = await supabase
            .from(tableName)
            .update(dataToSave)
            .eq('id', editing.id)
            .select()
            .single()

          if (error) throw error

          toast.success(msgs.updateSuccess)
          onAfterUpdateRef.current?.(updated as T)
        } else {
          // Create
          if (onBeforeCreateRef.current) {
            dataToSave = await onBeforeCreateRef.current(dataToSave)
          }

          const { data: created, error } = await supabase
            .from(tableName)
            .insert(dataToSave)
            .select()
            .single()

          if (error) throw error

          toast.success(msgs.createSuccess)
          onAfterCreateRef.current?.(created as T)
        }

        handleCloseSheet()
        loadData()
      } catch (error) {
        console.error(`Erro ao salvar ${entityName}:`, error)
        toast.error(msgs.saveError)
      } finally {
        setSaving(false)
      }
    },
    [
      formData,
      editing,
      tableName,
      handleCloseSheet,
      loadData,
      entityName,
      getMessages,
    ]
  )

  // Deletar item
  const handleDelete = useCallback(
    async (item: T) => {
      const msgs = getMessages()
      const confirmMessage = msgs.deleteConfirm(item)
      if (!confirm(confirmMessage)) {
        return
      }

      try {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', item.id)

        if (error) throw error

        toast.success(msgs.deleteSuccess)
        onAfterDeleteRef.current?.(item.id)
        loadData()
      } catch (error) {
        console.error(`Erro ao excluir ${entityName}:`, error)
        toast.error(msgs.deleteError)
      }
    },
    [tableName, loadData, entityName, getMessages]
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
