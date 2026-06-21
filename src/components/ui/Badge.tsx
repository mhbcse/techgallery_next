import { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'primary' | 'sale' | 'new' | 'success' | 'warning' | 'danger' | 'info'
  children: ReactNode
  className?: string
}

const variants = {
  primary: 'bg-secondary/10 text-secondary',
  sale: 'bg-secondary text-white',
  new: 'bg-primary text-white',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-secondary/10 text-secondary',
}

export default function Badge({ variant = 'primary', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 font-label-sm text-label-sm uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
