import { FormEvent, ReactNode } from 'react'

import { Button } from '@/components/ui/Button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/Sheet'

interface CRUDFormSheetProps {
  /** Estado de abertura do sheet */
  open: boolean
  /** Handler para mudança de estado */
  onOpenChange: (open: boolean) => void
  /** Título do sheet */
  title: string
  /** Descrição do sheet */
  description?: string
  /** Handler de submit do formulário */
  onSubmit: (e: FormEvent) => void | Promise<void>
  /** Handler de cancelar */
  onCancel: () => void
  /** Estado de salvando */
  saving?: boolean
  /** Se está editando (altera texto do botão) */
  isEditing?: boolean
  /** Texto do botão de submit quando criando */
  createLabel?: string
  /** Texto do botão de submit quando editando */
  updateLabel?: string
  /** Texto do botão de cancelar */
  cancelLabel?: string
  /** Largura máxima do sheet */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  /** Conteúdo do formulário */
  children: ReactNode
}

const maxWidthClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
}

/**
 * Sheet com formulário para operações CRUD
 * Encapsula a estrutura comum de criar/editar registros
 */
export function CRUDFormSheet({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  onCancel,
  saving = false,
  isEditing = false,
  createLabel = 'Criar',
  updateLabel = 'Atualizar',
  cancelLabel = 'Cancelar',
  maxWidth = 'lg',
  children,
}: CRUDFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={`w-full ${maxWidthClasses[maxWidth]} overflow-y-auto p-4 sm:p-6`}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {children}

          <SheetFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={saving}
            >
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : isEditing ? updateLabel : createLabel}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
