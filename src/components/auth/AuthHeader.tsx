interface AuthHeaderProps {
  title?: string
  subtitle: string
}

export function AuthHeader({ subtitle }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <img
        src="/Est3lar-Colors.png"
        alt="Est3lar"
        className="h-16 w-auto mb-2 select-none pointer-events-none"
        draggable="false"
        onDragStart={(e) => e.preventDefault()}
        onMouseDown={(e) => e.preventDefault()}
        onMouseMove={(e) => e.preventDefault()}
        onMouseUp={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        style={{ height: '4rem', width: 'auto', userSelect: 'none', pointerEvents: 'none' }}
      />
      <p className="text-balance text-black/70 dark:text-white/70">
        {subtitle}
      </p>
    </div>
  )
}
