import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

interface ActionItem {
  /** Texto do item */
  label: string
  /** Handler de clique */
  onClick: () => void
  /** Variante visual (destructive para ações perigosas como excluir) */
  variant?: 'default' | 'destructive'
  /** Desabilitar item */
  disabled?: boolean
}

interface TableActionMenuProps {
  /** Lista de ações */
  actions: ActionItem[]
  /** Alinhamento do menu */
  align?: 'start' | 'center' | 'end'
}

/**
 * Menu de ações para linhas de tabela
 * Usado para Editar, Excluir e outras ações contextuais
 */
export function TableActionMenu({ actions, align = 'end' }: TableActionMenuProps) {
  // Separar ações destrutivas das normais
  const normalActions = actions.filter((a) => a.variant !== 'destructive')
  const destructiveActions = actions.filter((a) => a.variant === 'destructive')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
          <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {normalActions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.label}
          </DropdownMenuItem>
        ))}

        {normalActions.length > 0 && destructiveActions.length > 0 && (
          <DropdownMenuSeparator />
        )}

        {destructiveActions.map((action, index) => (
          <DropdownMenuItem
            key={`destructive-${index}`}
            onClick={action.onClick}
            disabled={action.disabled}
            className="text-error focus:text-error"
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
