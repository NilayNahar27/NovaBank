import { forwardRef } from 'react'

const FormInput = forwardRef(function FormInput(
  { label, error, hint, className = '', id, ...props },
  ref
) {
  const inputId = id || props.name
  return (
    <label className={`block ${className}`} htmlFor={inputId}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
          error ? 'border-red-300' : 'border-slate-200'
        }`}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </label>
  )
})

export default FormInput
