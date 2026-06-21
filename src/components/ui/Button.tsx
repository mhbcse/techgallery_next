import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  loading?: boolean
}

const variants = {
  primary: 'bg-primary text-white hover:bg-secondary',
  secondary: 'bg-secondary text-white hover:brightness-110',
  outline: 'border border-primary text-primary hover:bg-primary hover:text-white',
  ghost: 'text-on-surface-variant hover:text-secondary hover:bg-surface-container-low',
}

const sizes = {
  sm: 'px-4 py-2 text-label-md',
  md: 'px-6 py-3 text-label-md',
  lg: 'px-8 py-4 text-label-md',
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
      className={`inline-flex items-center justify-center gap-2 font-label-md uppercase tracking-widest transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
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
