import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { STATUS_BADGES, BORDER_RADIUS, type StatusType } from "@/constants/designSystem"

const badgeVariants = cva(
  `inline-flex items-center text-xs font-medium ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${BORDER_RADIUS.badge}`,
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Status específicos brasileiros
        ativo: STATUS_BADGES.ativo.container,
        inativo: STATUS_BADGES.inativo.container,
        pendente: STATUS_BADGES.pendente.container,
        pago: STATUS_BADGES.pago.container,
        vencido: STATUS_BADGES.vencido.container,
        cancelado: STATUS_BADGES.cancelado.container,
        processando: STATUS_BADGES.processando.container,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  status?: StatusType
  showDot?: boolean
  children?: React.ReactNode
}

function Badge({ className, variant, status, showDot = true, children, ...props }: BadgeProps) {
  // Se status for fornecido, usar ele como variant
  const actualVariant = status || variant

  return (
    <div className={cn(badgeVariants({ variant: actualVariant, className }))} {...props}>
      {showDot && status && (
        <div 
          className={cn(
            "w-2 h-2 rounded-full mr-2",
            STATUS_BADGES[status]?.dot?.replace('w-2 h-2 rounded-full mr-2 ', '') || 'bg-gray-600'
          )}
        />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }