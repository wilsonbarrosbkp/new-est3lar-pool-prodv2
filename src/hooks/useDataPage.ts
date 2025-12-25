import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { handleError, showErrorToast } from '@/lib/error-handler'

/**
 * Configuração de ordenação - compartilhado entre todos os hooks de página
 */
export type SortConfig<T> = {
  key: keyof T
  direction: 'asc' | 'desc'
} | null

/**
 * Filtra itens por busca textual
 */
export function filterBySearch<T>(
  items: T[],
  search: string,
  searchFields: (keyof T)[]
): T[] {
  if (!search || searchFields.length === 0) return items

  const searchLower = search.toLowerCase()
  return items.filter((item) =>
    searchFields.some((field) => {
      const value = item[field]
      if (value == null) return false
      return String(value).toLowerCase().includes(searchLower)
    })
  )
}

/**
 * Ordena itens baseado na configuração de ordenação
 */
export function sortItems<T>(items: T[], sortConfig: SortConfig<T>): T[] {
  if (!sortConfig) return items

  return [...items].sort((a, b) => {
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    // Null/undefined handling
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1
    if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1

    // Date handling
    if (
      sortConfig.key.toString().includes('_at') ||
      sortConfig.key.toString().includes('date')
    ) {
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

/**
 * Opções base para hooks de página de dados
 */
export interface UseDataPageOptions<T extends { id: number | string }> {
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

  /** Mensagem de erro ao carregar */
  loadErrorMessage?: string

  /** Nome de exibição da entidade (ex: "registro", "usuário") */
  entityName?: string
}

/**
 * Retorno base do hook de página de dados
 */
export interface UseDataPageReturn<T extends { id: number | string }> {
  // Estados
  data: T[]
  loading: boolean
  search: string
  setSearch: (value: string) => void
  filters: Record<string, string>
  setFilter: (key: string, value: string) => void
  sortConfig: SortConfig<T>
  setSortConfig: React.Dispatch<React.SetStateAction<SortConfig<T>>>
  handleSort: (key: keyof T) => void

  // Ações
  loadData: () => Promise<void>

  // Dados filtrados
  filteredData: T[]

  // Contadores
  totalCount: number
  filteredCount: number
}

/**
 * Hook base para páginas de dados
 * Encapsula lógica comum de listagem, busca, filtros e ordenação
 */
export function useDataPage<T extends { id: number | string }>(
  options: UseDataPageOptions<T>
): UseDataPageReturn<T> {
  const {
    tableName,
    selectFields = '*',
    searchFields = [],
    defaultOrderBy = { column: 'created_at', ascending: false },
    limit,
    customLoadData,
    onDataLoaded,
    loadErrorMessage,
    entityName = 'registro',
  } = options

  // Refs para funções callback e objetos (evita loops infinitos)
  const customLoadDataRef = useRef(customLoadData)
  const onDataLoadedRef = useRef(onDataLoaded)
  const defaultOrderByRef = useRef(defaultOrderBy)

  // Atualizar refs quando as funções/objetos mudarem
  useEffect(() => {
    customLoadDataRef.current = customLoadData
    onDataLoadedRef.current = onDataLoaded
    defaultOrderByRef.current = defaultOrderBy
  })

  // Estados principais
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(null)

  // Função para definir um filtro
  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
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
      const appError = handleError(error, `carregar ${entityName}s`)
      showErrorToast(appError)
    } finally {
      setLoading(false)
    }
  }, [tableName, selectFields, limit, entityName, loadErrorMessage])

  // Carregar dados na montagem
  useEffect(() => {
    loadData()
  }, [loadData])

  // Dados filtrados e ordenados
  const filteredData = useMemo(() => {
    const searched = filterBySearch(data, search, searchFields)
    return sortItems(searched, sortConfig)
  }, [data, search, searchFields, sortConfig])

  // Handler de ordenação
  const handleSort = useCallback((key: keyof T) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null
      }
      return { key, direction: 'asc' }
    })
  }, [])

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
    handleSort,

    // Ações
    loadData,

    // Dados filtrados
    filteredData,

    // Contadores
    totalCount: data.length,
    filteredCount: filteredData.length,
  }
}
