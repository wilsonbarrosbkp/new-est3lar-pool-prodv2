import { useState, useCallback, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { capitalize } from '@/lib/formatters'
import { useDataPage, type SortConfig } from './useDataPage'

// Re-export SortConfig para manter compatibilidade
export type { SortConfig }

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

  // Estados do ConfirmDialog
  deleteDialogOpen: boolean
  setDeleteDialogOpen: (open: boolean) => void
  itemToDelete: T | null
  deleteConfirmMessage: string

  // Ações
  loadData: () => Promise<void>
  handleOpenCreate: () => void
  handleOpenEdit: (item: T) => void
  handleCloseSheet: () => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  handleDelete: (item: T) => void
  handleConfirmDelete: () => Promise<void>
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
 * Estende useDataPage com funcionalidades de CRUD
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

  // Usar o hook base para dados, busca, filtros e ordenação
  const baseHook = useDataPage<T>({
    tableName,
    selectFields,
    searchFields,
    defaultOrderBy,
    limit,
    customLoadData,
    onDataLoaded,
    loadErrorMessage: messages.loadError,
    entityName,
  })

  // Refs para callbacks CRUD (evita loops infinitos)
  const customSubmitRef = useRef(customSubmit)
  const onBeforeCreateRef = useRef(onBeforeCreate)
  const onBeforeUpdateRef = useRef(onBeforeUpdate)
  const onAfterCreateRef = useRef(onAfterCreate)
  const onAfterUpdateRef = useRef(onAfterUpdate)
  const onAfterDeleteRef = useRef(onAfterDelete)
  const validateFormRef = useRef(validateForm)
  const mapFormToDataRef = useRef(mapFormToData)
  const mapDataToFormRef = useRef(mapDataToForm)
  const messagesRef = useRef(messages)

  // Atualizar refs quando as funções/objetos mudarem
  useEffect(() => {
    customSubmitRef.current = customSubmit
    onBeforeCreateRef.current = onBeforeCreate
    onBeforeUpdateRef.current = onBeforeUpdate
    onAfterCreateRef.current = onAfterCreate
    onAfterUpdateRef.current = onAfterUpdate
    onAfterDeleteRef.current = onAfterDelete
    validateFormRef.current = validateForm
    mapFormToDataRef.current = mapFormToData
    mapDataToFormRef.current = mapDataToForm
    messagesRef.current = messages
  })

  // Estados específicos do CRUD
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [formData, setFormData] = useState<F>(initialFormData)
  const [saving, setSaving] = useState(false)

  // Estados do ConfirmDialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<T | null>(null)
  const [deleteConfirmMessage, setDeleteConfirmMessage] = useState('')

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

  // Abrir sheet para criar
  const handleOpenCreate = useCallback(() => {
    setEditing(null)
    setFormData(initialFormData)
    setSheetOpen(true)
  }, [initialFormData])

  // Abrir sheet para editar
  const handleOpenEdit = useCallback((item: T) => {
    setEditing(item)
    setFormData(mapDataToFormRef.current(item))
    setSheetOpen(true)
  }, [])

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
        const validationError = validateFormRef.current(formData)
        if (validationError) {
          toast.error(validationError)
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
          baseHook.loadData()
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
        baseHook.loadData()
      } catch (error) {
        console.error(`Erro ao salvar ${entityName}:`, error)
        toast.error(msgs.saveError)
      } finally {
        setSaving(false)
      }
    },
    [formData, editing, tableName, handleCloseSheet, baseHook, entityName, getMessages]
  )

  // Abrir dialog de confirmação de delete
  const handleDelete = useCallback(
    (item: T) => {
      const msgs = getMessages()
      const confirmMessage = msgs.deleteConfirm(item)
      setItemToDelete(item)
      setDeleteConfirmMessage(confirmMessage)
      setDeleteDialogOpen(true)
    },
    [getMessages]
  )

  // Executar delete após confirmação
  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDelete) return

    const msgs = getMessages()

    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', itemToDelete.id)

      if (error) throw error

      toast.success(msgs.deleteSuccess)
      onAfterDeleteRef.current?.(itemToDelete.id)
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      baseHook.loadData()
    } catch (error) {
      console.error(`Erro ao excluir ${entityName}:`, error)
      toast.error(msgs.deleteError)
    }
  }, [itemToDelete, tableName, baseHook, entityName, getMessages])

  return {
    // Estados do hook base
    data: baseHook.data,
    loading: baseHook.loading,
    search: baseHook.search,
    setSearch: baseHook.setSearch,
    filters: baseHook.filters,
    setFilter: baseHook.setFilter,
    sortConfig: baseHook.sortConfig,
    setSortConfig: baseHook.setSortConfig,

    // Estados específicos CRUD
    sheetOpen,
    setSheetOpen,
    editing,
    formData,
    setFormData,
    saving,

    // Estados do ConfirmDialog
    deleteDialogOpen,
    setDeleteDialogOpen,
    itemToDelete,
    deleteConfirmMessage,

    // Ações do hook base
    loadData: baseHook.loadData,
    handleSort: baseHook.handleSort,

    // Ações específicas CRUD
    handleOpenCreate,
    handleOpenEdit,
    handleCloseSheet,
    handleSubmit,
    handleDelete,
    handleConfirmDelete,

    // Dados filtrados
    filteredData: baseHook.filteredData,

    // Contadores
    totalCount: baseHook.totalCount,
    filteredCount: baseHook.filteredCount,
  }
}
