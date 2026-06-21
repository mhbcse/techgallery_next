import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons-outlined text-slate-400 text-xl">{icon}</span>
            </span>
          )}
          <input
            ref={ref}
            className={`w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${icon ? 'pl-10' : ''} ${error ? 'border-red-400 focus:ring-red-400' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
