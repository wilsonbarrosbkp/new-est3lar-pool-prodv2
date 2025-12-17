import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

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
          <div className="p-8 md:p-12 min-h-[480px] flex flex-col justify-center bg-[#0F1720]">
            {children}
          </div>

          {/* Coluna 2 - Imagem */}
          <div className="relative hidden md:block">
            <img
              src="/placeholder.webp"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-100 select-none pointer-events-none"
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
      <div className="text-center text-xs text-balance text-white/70">
        Ao continuar, você concorda com nossos{' '}
        <a
          href="https://est3lar.io/TermosUso"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-[var(--primary)]"
        >
          Termos de Uso
        </a>
        ,{' '}
        <a
          href="https://est3lar.io/PoliticaPrivacidade"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-[var(--primary)]"
        >
          Política de Privacidade
        </a>
        {' '}e{' '}
        <a
          href="https://est3lar.io/LGPD"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-[var(--primary)]"
        >
          LGPD
        </a>
        .
      </div>
    </div>
  )
}
