import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input, InputProps } from './Input'

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  /**
   * Initial visibility state of the password
   * @default false
   */
  defaultVisible?: boolean
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, defaultVisible = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(defaultVisible)

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev)
    }

    return (
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          className={cn('pr-10', className)}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:text-text-primary"
          tabIndex={-1}
          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
