import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { typography } from '@/design-system/tokens'
import { handleError } from '@/lib/error-handler'

/**
 * Props do ConfirmDialog
 */
export interface ConfirmDialogProps {
  /** Se o dialog está aberto */
  open: boolean
  /** Callback quando o estado de abertura muda */
  onOpenChange: (open: boolean) => void
  /** Título do dialog */
  title: string
  /** Descrição/mensagem do dialog */
  description: string
  /** Label do botão de confirmação (padrão: "Confirmar") */
  confirmLabel?: string
  /** Label do botão de cancelamento (padrão: "Cancelar") */
  cancelLabel?: string
  /** Variante do botão de confirmação */
  variant?: 'default' | 'destructive'
  /** Callback quando confirmar */
  onConfirm: () => void | Promise<void>
  /** Se está processando (loading) */
  loading?: boolean
}

/**
 * Componente reutilizável para confirmação de ações
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      // Erro tratado pelo callback
      handleError(error, 'confirmação de ação')
    }
  }

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        />
        <AlertDialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'sm:rounded-lg'
          )}
        >
          <div className="flex flex-col space-y-2 text-center sm:text-left">
            <AlertDialogPrimitive.Title
              className={cn(
                'text-lg font-semibold',
                typography.heading.h3
              )}
            >
              {title}
            </AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description
              className={cn(
                'text-sm text-text-secondary',
                typography.body.small
              )}
            >
              {description}
            </AlertDialogPrimitive.Description>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <AlertDialogPrimitive.Cancel asChild>
              <Button
                variant="outline"
                disabled={loading}
                className={typography.body.small}
              >
                {cancelLabel}
              </Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button
                variant={variant}
                onClick={handleConfirm}
                disabled={loading}
                className={typography.body.small}
              >
                {loading ? 'Processando...' : confirmLabel}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}
