import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary' | 'ghost'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-[8px] text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none disabled:opacity-50 disabled:pointer-events-none px-6 py-3'
    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      default: 'bg-neutral-900 text-white hover:bg-neutral-800',
      secondary: 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900',
      ghost: 'hover:bg-neutral-100',
    }
    return (
      <button ref={ref} className={cn(base, variants[variant], className)} {...props} />
    )
  },
)
Button.displayName = 'Button'


