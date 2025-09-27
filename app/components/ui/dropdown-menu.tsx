"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

type DropdownContextValue = {
  open: boolean
  setOpen: (v: boolean) => void
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null)

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  return <DropdownContext.Provider value={{ open, setOpen }}>{children}</DropdownContext.Provider>
}

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ asChild, onClick, children, ...props }, ref) => {
    const ctx = React.useContext(DropdownContext)
    if (!ctx) return null
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      ctx.setOpen(!ctx.open)
      onClick?.(e)
    }
    if (asChild && children && React.isValidElement(children)) {
      const child = children as React.ReactElement<any>
      const mergedOnClick: React.MouseEventHandler<any> = (e) => {
        child.props?.onClick?.(e)
        handleClick(e as any)
      }
      return React.cloneElement(child, { onClick: mergedOnClick })
    }
    return (
      <button ref={ref} type="button" onClick={handleClick} {...props} />
    )
  }
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end"
}

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, style, align, ...props }, ref) => {
    const ctx = React.useContext(DropdownContext)
    if (!ctx || !ctx.open) return null
    const alignClass = align === "end" ? "right-0" : "left-0"
    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 mt-2 min-w-[12rem] rounded-md border border-stone-200 bg-white p-1 shadow-md",
          alignClass,
          className
        )}
        style={{ ...style }}
        {...props}
      />
    )
  }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

export const DropdownMenuLabel = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
)

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm hover:bg-stone-50", className)} {...props} />
  )
)
DropdownMenuItem.displayName = "DropdownMenuItem"

export const DropdownMenuSeparator = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("-mx-1 my-1 h-px bg-stone-200", className)} {...props} />
)


