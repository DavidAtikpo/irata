"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

type TabsContextValue = {
  value: string
  setValue: (v: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  children: React.ReactNode
}

export function Tabs({ value, defaultValue, onValueChange, children }: TabsProps) {
  const isControlled = typeof value !== "undefined"
  const [internal, setInternal] = React.useState(defaultValue ?? "")
  const current = isControlled ? (value as string) : internal

  const setValue = (v: string) => {
    if (!isControlled) setInternal(v)
    onValueChange?.(v)
  }

  return <TabsContext.Provider value={{ value: current, setValue }}>{children}</TabsContext.Provider>
}

export const TabsList = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("inline-flex items-center justify-center rounded-md bg-stone-100 p-1", className)} {...props} />
)

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const ctx = React.useContext(TabsContext)
    const isActive = ctx?.value === value
    return (
      <button
        ref={ref}
        type="button"
        onClick={() => ctx?.setValue(value)}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          isActive ? "bg-white text-stone-900 shadow" : "text-stone-600 hover:text-stone-900",
          className
        )}
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(({ className, value, ...props }, ref) => {
  const ctx = React.useContext(TabsContext)
  if (ctx?.value !== value) return null
  return <div ref={ref} className={cn("mt-4", className)} {...props} />
})
TabsContent.displayName = "TabsContent"


