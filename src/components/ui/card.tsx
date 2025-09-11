import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { DESIGN_SYSTEM } from "@/constants/designSystem"

const cardVariants = cva(
  "text-card-foreground",
  {
    variants: {
      variant: {
        default: DESIGN_SYSTEM.glassmorphism.card,
        metric: `${DESIGN_SYSTEM.glassmorphism.card} p-6`,
        dashboard: `${DESIGN_SYSTEM.glassmorphism.card} overflow-hidden`,
        outline: "border border-white/20 rounded-2xl bg-transparent backdrop-blur-sm hover:bg-white/5 transition-all duration-200",
        solid: "bg-white rounded-2xl shadow-lg hover:shadow-lg transition-all duration-200",
      },
      hover: {
        true: "cursor-pointer",
        false: "",
      },
      gradient: {
        true: "",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      hover: true,
      gradient: false,
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  gradientFrom?: string
  gradientTo?: string
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, gradient, gradientFrom, gradientTo, style, ...props }, ref) => {
    const gradientStyle = gradient && gradientFrom && gradientTo 
      ? { 
          ...style,
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` 
        }
      : style

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, hover, gradient, className }))}
        style={gradientStyle}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }