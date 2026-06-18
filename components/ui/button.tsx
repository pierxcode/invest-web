import * as React from "react"
import { cn } from "@/lib/utils"

type Variant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "link"
type Size = "sm" | "default" | "lg" | "icon"

const variantStyles: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-zinc-200",
  secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-zinc-800",
  outline: "border border-border bg-transparent text-foreground hover:bg-zinc-900",
  ghost: "bg-transparent text-foreground hover:bg-zinc-900",
  destructive: "bg-danger text-white hover:bg-[#e63b3b]",
  link: "bg-transparent text-accent underline-offset-4 hover:underline",
}

const sizeStyles: Record<Size, string> = {
  sm: "h-8 rounded-md px-3 text-xs",
  default: "h-9 rounded-md px-4 text-sm",
  lg: "h-11 rounded-lg px-6 text-sm",
  icon: "h-9 w-9 rounded-md",
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  )
)
Button.displayName = "Button"
