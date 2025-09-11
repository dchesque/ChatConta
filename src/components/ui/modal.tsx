import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { DESIGN_SYSTEM, GLASSMORPHISM, ANIMATIONS } from "@/constants/designSystem"
import { Button } from "./button"
import { BlurBackground } from "./BlurBackground"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full'
  title: string
  subtitle?: string
  icon?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-full mx-4'
}

export function Modal({
  isOpen,
  onClose,
  size = 'md',
  title,
  subtitle,
  icon,
  footer,
  children,
  className,
  showCloseButton = true,
  ...props
}: ModalProps) {
  // Fechar modal com ESC
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Bloquear scroll do body quando modal aberto
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        GLASSMORPHISM.overlay,
        ANIMATIONS.smooth
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
      {...props}
    >
      <div
        className={cn(
          GLASSMORPHISM.modal,
          "w-full max-h-[90vh] flex flex-col relative overflow-hidden",
          // Responsividade: fullscreen em mobile, centrado em desktop
          "lg:max-w-none lg:w-auto lg:max-h-[90vh]",
          sizeClasses[size],
          // Mobile: fullscreen
          "h-full lg:h-auto lg:min-h-0",
          ANIMATIONS.smooth,
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Blur backgrounds abstratos */}
        <BlurBackground variant="modal" />
        
        {/* Conteúdo do modal */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header - SEMPRE flex-shrink-0 */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              {icon && (
                <div className="flex-shrink-0">
                  {icon}
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-sm text-gray-600 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="flex-shrink-0 h-8 w-8 rounded-lg hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Content - SEMPRE flex-1 overflow-y-auto */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>

          {/* Footer - SEMPRE flex-shrink-0 */}
          {footer && (
            <div className="flex-shrink-0 border-t border-white/20 p-6">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Exports para compatibilidade com componentes existentes
export interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  showRequiredNote?: boolean
}

export const ModalContent = ({ children, className, showRequiredNote, ...props }: ModalContentProps) => (
  <div className={cn("flex-1 overflow-y-auto p-6 relative z-10", className)} {...props}>
    {children}
    {showRequiredNote && (
      <p className="text-xs text-gray-500 mt-4">* Campos obrigatórios</p>
    )}
  </div>
)

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  showRequiredNote?: boolean
}

export const ModalFooter = ({ children, className, showRequiredNote, ...props }: ModalFooterProps) => (
  <div className={cn("flex-shrink-0 border-t border-white/20 p-6 relative z-10", className)} {...props}>
    {children}
  </div>
)