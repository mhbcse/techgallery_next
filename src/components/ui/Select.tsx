import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block font-label-md text-label-md uppercase tracking-wider text-on-surface-variant mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full border border-outline-variant bg-white px-4 py-3 text-body-sm transition-all focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary appearance-none ${error ? 'border-red-400 focus:ring-red-400' : ''} ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
export default Select
