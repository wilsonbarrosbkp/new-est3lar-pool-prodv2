import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { borders, gradients, shadows, typography } from '@/design-system'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  `inline-flex items-center justify-center whitespace-nowrap rounded-md ${typography.button.default} ${typography.weight.medium} transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`,
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:opacity-90',
        gradient: [
          'bg-gradient-to-r',
          gradients.action,
          'text-white',
          borders.dark,
          `shadow-[${shadows.button}]`,
          'hover:opacity-90 transition-opacity',
        ].join(' '),
        destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
        outline: 'border border-border bg-background hover:bg-card hover:text-text-primary',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-surface',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: `h-8 rounded-md px-3 ${typography.button.small}`,
        lg: `h-12 rounded-md px-6 ${typography.button.default}`,
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
