import { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'primary' | 'sale' | 'new' | 'success' | 'warning' | 'danger' | 'info'
  children: ReactNode
  className?: string
}

const variants = {
  primary: 'bg-primary/10 text-primary',
  sale: 'bg-emerald-100 text-emerald-700',
  new: 'bg-primary text-white',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  info: 'bg-pink-100 text-pink-600',
}

export default function Badge({ variant = 'primary', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
