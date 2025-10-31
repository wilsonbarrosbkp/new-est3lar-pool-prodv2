import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AuthFormProps {
  children: ReactNode
  className?: string
}

export function AuthForm({ children, className }: AuthFormProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="mx-auto max-w-[480px] w-full">
        <div className="p-8 md:p-12 rounded-lg shadow-lg border border-[var(--border)] bg-[#0F1720]/95 backdrop-blur-sm">
          {children}
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
