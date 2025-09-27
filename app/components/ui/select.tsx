"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

type SelectContextValue = {
  value: string | undefined
  setValue: (v: string) => void
  open: boolean
  setOpen: (o: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

export interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export function Select({ value, defaultValue, onValueChange, children }: SelectProps) {
  const isControlled = typeof value !== "undefined"
  const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue)
  const currentValue = isControlled ? value : internalValue
  const [open, setOpen] = React.useState(false)

  const setValue = (v: string) => {
    if (!isControlled) setInternalValue(v)
    onValueChange?.(v)
  }

  return <SelectContext.Provider value={{ value: currentValue, setValue, open, setOpen }}>{children}</SelectContext.Provider>
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const ctx = React.useContext(SelectContext)
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900",
          className
        )}
        onClick={(e) => {
          props.onClick?.(e)
          ctx?.setOpen(!ctx.open)
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

export interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string
}

export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(({ placeholder, ...props }, ref) => {
  const ctx = React.useContext(SelectContext)
  const label = ctx?.value ?? placeholder ?? ""
  return (
    <span ref={ref} {...props}>
      {label}
    </span>
  )
})
SelectValue.displayName = "SelectValue"

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(({ className, ...props }, ref) => {
  const ctx = React.useContext(SelectContext)
  if (!ctx?.open) return null
  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 w-full rounded-md border border-stone-200 bg-white p-1 shadow-md",
        className
      )}
      {...props}
    />
  )
})
SelectContent.displayName = "SelectContent"

export interface SelectItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export const SelectItem = React.forwardRef<HTMLButtonElement, SelectItemProps>(
  ({ className, value, children, onClick, ...props }, ref) => {
    const ctx = React.useContext(SelectContext)
    const isSelected = ctx?.value === value
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex w-full items-center rounded-sm px-2 py-1 text-left text-sm hover:bg-stone-50",
          isSelected && "bg-stone-100",
          className
        )}
        onClick={(e) => {
          ctx?.setValue(value)
          ctx?.setOpen(false)
          onClick?.(e)
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)
SelectItem.displayName = "SelectItem"






