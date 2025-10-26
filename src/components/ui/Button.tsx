import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nfe-gold disabled:pointer-events-none disabled:opacity-50'
    
    const variants = {
      primary: 'bg-nfe-green text-nfe-paper hover:bg-nfe-green-700',
      secondary: 'bg-nfe-gold text-nfe-ink hover:bg-nfe-gold/90',
      ghost: 'text-nfe-green hover:bg-nfe-green/10',
      outline: 'border border-nfe-green text-nfe-green hover:bg-nfe-green hover:text-nfe-paper',
    }
    
    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-8',
    }

    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }


