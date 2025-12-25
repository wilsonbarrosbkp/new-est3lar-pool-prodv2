import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TableHead } from '@/components/ui/Table'
import { typography } from '@/design-system/tokens'
import type { SortConfig } from '@/hooks/useDataPage'

interface DataTableSortHeaderProps<T> {
  /** Texto do header */
  label: string
  /** Chave da coluna para ordenação */
  columnKey: keyof T
  /** Configuração atual de ordenação */
  sortConfig: SortConfig<T>
  /** Handler de ordenação */
  onSort: (key: keyof T) => void
  /** Classes CSS adicionais para o TableHead */
  className?: string
}

/**
 * Header de tabela com suporte a ordenação
 * Mostra ícone indicando estado atual (não ordenado, asc, desc)
 */
export function DataTableSortHeader<T>({
  label,
  columnKey,
  sortConfig,
  onSort,
  className = '',
}: DataTableSortHeaderProps<T>) {
  const isActive = sortConfig?.key === columnKey
  const direction = sortConfig?.direction

  return (
    <TableHead className={className}>
      <Button
        variant="ghost"
        size="sm"
        className={`h-auto p-0 ${typography.weight.semibold} hover:bg-transparent ${typography.table.header}`}
        onClick={() => onSort(columnKey)}
      >
        {label}
        {!isActive && <ArrowUpDown className="ml-2 h-4 w-4" />}
        {isActive && direction === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
        {isActive && direction === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
      </Button>
    </TableHead>
  )
}
