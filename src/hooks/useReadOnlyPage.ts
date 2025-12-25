import { useCallback, useEffect,useRef, useState } from 'react'

import { handleError } from '@/lib/error-handler'

import { type SortConfig,useDataPage } from './useDataPage'

// Re-export SortConfig para manter compatibilidade
export type { SortConfig }

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
 * Estende useDataPage com funcionalidades específicas de visualização
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

  // Refs para funções callback (evita loops infinitos)
  const customActionsRef = useRef(customActions)

  // Atualizar refs quando as funções/objetos mudarem
  useEffect(() => {
    customActionsRef.current = customActions
  })

  // Estados específicos de visualização
  const [expandedIds, setExpandedIds] = useState<Set<number | string>>(new Set())

  // Função para expandir/colapsar um item
  const toggleExpand = useCallback((id: number | string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  // Executar ação customizada
  const executeAction = useCallback(
    async (actionName: string, item: T, ...args: unknown[]) => {
      const action = customActionsRef.current[actionName]
      if (!action) {
        handleError(new Error(`Ação customizada '${actionName}' não encontrada`), 'executeAction')
        return
      }

      try {
        await action(item, ...args)
        // Recarregar dados após executar a ação
        await baseHook.loadData()
      } catch (error) {
        const appError = handleError(error, `executar ação '${actionName}'`)
        throw appError.originalError
      }
    },
    [baseHook]
  )

  return {
    // Estados do hook base
    data: baseHook.data,
    loading: baseHook.loading,
    search: baseHook.search,
    setSearch: baseHook.setSearch,
    filters: baseHook.filters,
    setFilter: baseHook.setFilter,
    sortConfig: baseHook.sortConfig,
    handleSort: baseHook.handleSort,

    // Estados específicos de visualização
    expandedIds,
    toggleExpand,

    // Ações do hook base
    loadData: baseHook.loadData,

    // Ações específicas
    executeAction,

    // Dados filtrados
    filteredData: baseHook.filteredData,

    // Contadores
    totalCount: baseHook.totalCount,
    filteredCount: baseHook.filteredCount,
  }
}
