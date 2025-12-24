import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { typography } from '@/design-system/tokens'

interface AuthFormProps {
  children: ReactNode
  className?: string
}

export function AuthForm({ children, className }: AuthFormProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="relative overflow-hidden p-1 mx-auto max-w-[960px] w-full rounded-lg">
        <div className="grid p-0 md:grid-cols-2 rounded-lg shadow-lg border border-[var(--border)] overflow-hidden">
          {/* Coluna 1 - Formulário */}
          <div className="p-8 md:p-12 min-h-[480px] flex flex-col justify-center bg-[#0d1f17]">
            {children}
          </div>

          {/* Coluna 2 - Imagem/Logo Genesis */}
          <div className="relative hidden md:flex items-center justify-center bg-[#123326]">
            <img
              src="/genesis-bg.png"
              alt="Genesis Pool"
              className="w-full max-w-[400px] h-auto object-contain select-none pointer-events-none p-8"
              draggable="false"
              onDragStart={(e) => e.preventDefault()}
              onMouseDown={(e) => e.preventDefault()}
              onMouseMove={(e) => e.preventDefault()}
              onMouseUp={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Footer - Terms */}
      <div className={`text-center ${typography.body.tiny} text-balance text-white/70`}>
        Ao continuar, você concorda com nossos{' '}
        <a
          href="/termos-de-uso"
          className="underline underline-offset-4 hover:text-[var(--primary)]"
        >
          Termos de Uso
        </a>
        ,{' '}
        <a
          href="/politica-de-privacidade"
          className="underline underline-offset-4 hover:text-[var(--primary)]"
        >
          Política de Privacidade
        </a>
        {' '}e{' '}
        <a
          href="/lgpd"
          className="underline underline-offset-4 hover:text-[var(--primary)]"
        >
          LGPD
        </a>
        .
      </div>
    </div>
  )
}
