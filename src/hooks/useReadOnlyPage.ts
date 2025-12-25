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
 * Opções para configurar o hook useReadOnlyPage
 */
export interface UseReadOnlyPageOptions<T extends { id: number | string }> {
  /** Nome da tabela no Supabase */
  tableName: string

  /** Campos a serem selecionados (default: '*') */
  selectFields?: string

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

  /** Mensagens customizadas */
  messages?: {
    loadError?: string
  }

  /** Nome de exibição da entidade (ex: "round", "log de auditoria") */
  entityName?: string

  /** Suporte a ações customizadas (ex: updateStatus em Rounds) */
  customActions?: Record<string, (item: T, ...args: unknown[]) => Promise<void>>
}

/**
 * Retorno do hook useReadOnlyPage
 */
export interface UseReadOnlyPageReturn<T extends { id: number | string }> {
  // Estados
  data: T[]
  loading: boolean
  search: string
  setSearch: (value: string) => void
  filters: Record<string, string>
  setFilter: (key: string, value: string) => void
  sortConfig: SortConfig<T>
  handleSort: (key: keyof T) => void
  expandedIds: Set<number | string>
  toggleExpand: (id: number | string) => void

  // Ações
  loadData: () => Promise<void>
  executeAction: (actionName: string, item: T, ...args: unknown[]) => Promise<void>

  // Dados filtrados
  filteredData: T[]

  // Contadores
  totalCount: number
  filteredCount: number
}

/**
 * Hook genérico para páginas read-only (somente leitura)
 * Simplificado em relação ao useCRUDPage, focado em listagem e visualização
 */
export function useReadOnlyPage<T extends { id: number | string }>(
  options: UseReadOnlyPageOptions<T>
): UseReadOnlyPageReturn<T> {
  const {
    tableName,
    selectFields = '*',
    searchFields = [],
    defaultOrderBy = { column: 'created_at', ascending: false },
    limit,
    customLoadData,
    onDataLoaded,
    messages = {},
    entityName = 'registro',
    customActions = {},
  } = options

  // Refs para funções callback e objetos (evita loops infinitos)
  const customLoadDataRef = useRef(customLoadData)
  const onDataLoadedRef = useRef(onDataLoaded)
  const defaultOrderByRef = useRef(defaultOrderBy)
  const customActionsRef = useRef(customActions)
  const messagesRef = useRef(messages)

  // Atualizar refs quando as funções/objetos mudarem
  useEffect(() => {
    customLoadDataRef.current = customLoadData
    onDataLoadedRef.current = onDataLoaded
    defaultOrderByRef.current = defaultOrderBy
    customActionsRef.current = customActions
    messagesRef.current = messages
  })

  // Estados principais
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(null)
  const [expandedIds, setExpandedIds] = useState<Set<number | string>>(new Set())

  // Função para definir um filtro
  const setFilter = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  // Função para expandir/colapsar um item
  const toggleExpand = useCallback((id: number | string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
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
      const msgs = messagesRef.current
      toast.error(msgs.loadError || `Erro ao carregar ${entityName}s`)
    } finally {
      setLoading(false)
    }
  }, [tableName, selectFields, limit, entityName])

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

    // Nota: filtros customizados (filters state) devem ser aplicados
    // pelo componente que usa o hook, pois cada página tem lógica diferente

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

  // Executar ação customizada
  const executeAction = useCallback(
    async (actionName: string, item: T, ...args: unknown[]) => {
      const action = customActionsRef.current[actionName]
      if (!action) {
        console.error(`Ação customizada '${actionName}' não encontrada`)
        return
      }

      try {
        await action(item, ...args)
        // Recarregar dados após executar a ação
        await loadData()
      } catch (error) {
        console.error(`Erro ao executar ação '${actionName}':`, error)
        throw error
      }
    },
    [loadData]
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
    handleSort,
    expandedIds,
    toggleExpand,

    // Ações
    loadData,
    executeAction,

    // Dados filtrados
    filteredData,

    // Contadores
    totalCount: data.length,
    filteredCount: filteredData.length,
  }
}
