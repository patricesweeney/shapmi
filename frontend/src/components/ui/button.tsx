import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary' | 'ghost'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-normal ease-standard focus:outline-none disabled:opacity-50 disabled:pointer-events-none h-9 px-4 py-2'
    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      default: 'bg-black text-white hover:bg-black/90',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
      ghost: 'hover:bg-gray-100',
    }
    return (
      <button ref={ref} className={cn(base, variants[variant], className)} {...props} />
    )
  },
)
Button.displayName = 'Button'


