import * as React from "react"
import { cn } from "@/lib/utils"
import { GLASSMORPHISM, MENSAGENS } from "@/constants/designSystem"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  erro?: string
  sucesso?: boolean
  obrigatorio?: boolean
  mascara?: (valor: string) => string
  validacao?: (valor: string) => string | null
  label?: string
  helper?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = "text", 
    erro, 
    sucesso, 
    obrigatorio, 
    mascara, 
    validacao,
    label,
    helper,
    onChange,
    value,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value || "")
    const [validationError, setValidationError] = React.useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value

      // Aplicar máscara se fornecida
      if (mascara) {
        newValue = mascara(newValue)
      }

      // Validação em tempo real
      if (validacao) {
        const errorMessage = validacao(newValue)
        setValidationError(errorMessage)
      }

      setInternalValue(newValue)
      
      // Criar novo evento com valor mascarado
      const maskedEvent = {
        ...e,
        target: {
          ...e.target,
          value: newValue
        }
      }
      
      onChange?.(maskedEvent as React.ChangeEvent<HTMLInputElement>)
    }

    const currentError = erro || validationError
    const hasError = Boolean(currentError)
    const hasSuccess = sucesso && !hasError

    const inputClasses = cn(
      GLASSMORPHISM.input,
      "flex h-10 w-full px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
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
          <input
            type={type}
            className={inputClasses}
            ref={ref}
            value={value !== undefined ? value : internalValue}
            onChange={handleChange}
            {...props}
          />
          
          {hasSuccess && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {hasError && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {(currentError || helper) && (
          <div className="text-xs">
            {currentError ? (
              <span className="text-red-600 font-medium">{currentError}</span>
            ) : helper ? (
              <span className="text-gray-500">{helper}</span>
            ) : null}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }