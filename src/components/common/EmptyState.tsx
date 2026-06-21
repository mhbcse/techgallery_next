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
      <span className="material-icons-outlined text-6xl text-slate-200 mb-4">{icon}</span>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm max-w-md mb-6">{description}</p>
      {action}
    </div>
  )
}
