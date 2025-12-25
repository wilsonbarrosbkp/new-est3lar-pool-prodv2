import { Loader2 } from 'lucide-react'

import { typography } from '@/design-system/tokens'

interface LoadingFallbackProps {
  message?: string
}

export function LoadingFallback({ message = 'Carregando...' }: LoadingFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className={`${typography.body.small} text-text-secondary`}>{message}</p>
      </div>
    </div>
  )
}
