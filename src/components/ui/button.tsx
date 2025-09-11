import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { GRADIENTES, ANIMATIONS, BORDER_RADIUS } from "@/constants/designSystem"

const buttonVariants = cva(
  `inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 ${BORDER_RADIUS.button}`,
  {
    variants: {
      variant: {
        default: `bg-gradient-to-r ${GRADIENTES.primary} text-white shadow-lg hover:${GRADIENTES.primaryHover} ${ANIMATIONS.hoverButton}`,
        destructive: `bg-gradient-to-r ${GRADIENTES.erro} text-white shadow-lg hover:${GRADIENTES.erroHover} ${ANIMATIONS.hoverButton}`,
        outline: "border border-input bg-white/80 backdrop-blur-sm hover:bg-white/95 hover:text-gray-900",
        secondary: `bg-gradient-to-r ${GRADIENTES.secundario} text-gray-700 hover:${GRADIENTES.secundarioHover} shadow-md ${ANIMATIONS.hoverButton}`,
        ghost: "hover:bg-white/20 hover:text-gray-900 backdrop-blur-sm",
        link: "text-blue-600 underline-offset-4 hover:underline",
        success: `bg-gradient-to-r ${GRADIENTES.sucesso} text-white shadow-lg hover:${GRADIENTES.sucessoHover} ${ANIMATIONS.hoverButton}`,
        warning: `bg-gradient-to-r ${GRADIENTES.aviso} text-white shadow-lg hover:${GRADIENTES.avisoHover} ${ANIMATIONS.hoverButton}`,
        premium: `bg-gradient-to-r ${GRADIENTES.empresa} text-white shadow-lg hover:${GRADIENTES.empresaHover} ${ANIMATIONS.hoverButton}`,
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }