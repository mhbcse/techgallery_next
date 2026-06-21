import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  loading?: boolean
}

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/25',
  secondary: 'bg-slate-900 text-white hover:bg-slate-800',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  ghost: 'text-slate-600 hover:text-primary hover:bg-rose-blush',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
      )}
      {children}
    </button>
  )
}
