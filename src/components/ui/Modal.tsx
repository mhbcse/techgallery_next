'use client'

import { ReactNode, useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <span className="material-icons-outlined">close</span>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
