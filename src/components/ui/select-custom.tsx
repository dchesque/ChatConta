import * as React from "react"
import { cn } from "@/lib/utils"
import { DESIGN_SYSTEM } from "@/constants/designSystem"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  erro?: string
  sucesso?: boolean
  obrigatorio?: boolean
  label?: string
  helper?: string
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    erro, 
    sucesso, 
    obrigatorio, 
    label,
    helper,
    placeholder,
    children,
    ...props 
  }, ref) => {
    const hasError = Boolean(erro)
    const hasSuccess = sucesso && !hasError

    const selectClasses = cn(
      DESIGN_SYSTEM.glassmorphism.input,
      "flex h-10 w-full px-3 py-2 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      hasError && "border-red-500/70 focus:ring-red-500 bg-red-50/80",
      hasSuccess && "border-green-500/70 focus:ring-green-500 bg-green-50/80",
      className
    )

    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {obrigatorio && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            className={selectClasses}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          
          {hasSuccess && (
            <div className="absolute inset-y-0 right-8 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {hasError && (
            <div className="absolute inset-y-0 right-8 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          
          {/* Seta customizada */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {(erro || helper) && (
          <div className="text-xs">
            {erro ? (
              <span className="text-red-600 font-medium">{erro}</span>
            ) : helper ? (
              <span className="text-gray-500">{helper}</span>
            ) : null}
          </div>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }