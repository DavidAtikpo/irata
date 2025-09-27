import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "md" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild = false, children, ...props }, ref) => {
    const variantClasses =
      variant === "default"
        ? "bg-stone-900 text-white hover:bg-stone-800"
        : variant === "outline"
        ? "border border-stone-300 bg-white text-stone-900 hover:bg-stone-50"
        : "bg-transparent text-stone-700 hover:bg-stone-100"

    const sizeClasses =
      size === "sm"
        ? "h-8 px-3 text-xs"
        : size === "lg"
        ? "h-12 px-6 text-sm"
        : size === "icon"
        ? "h-10 w-10"
        : "h-10 px-4 text-sm"

    const classes = cn(
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-stone-500 disabled:pointer-events-none disabled:opacity-50",
      variantClasses,
      sizeClasses,
      className
    )

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn((children as React.ReactElement<any>).props.className, classes),
        ref,
        ...props,
      })
    }

    return (
      <button className={classes} ref={ref} {...props}>
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }