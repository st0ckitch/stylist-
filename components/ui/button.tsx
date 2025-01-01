import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'primary'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30': variant === 'primary',
          'border-2 border-gray-200 hover:border-gray-300 text-gray-700': variant === 'outline',
          'hover:bg-gray-100': variant === 'ghost',
          'bg-white text-gray-900 hover:bg-gray-100': variant === 'default',
          'h-9 px-4 text-sm': size === 'sm',
          'h-11 px-6': size === 'md',
          'h-14 px-8 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
