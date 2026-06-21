import { ReactNode } from 'react'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">{icon}</span>
      <h3 className="font-headline-lg text-headline-lg-mobile font-black text-on-surface mb-2 uppercase">{title}</h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mb-6">{description}</p>
      {action}
    </div>
  )
}
