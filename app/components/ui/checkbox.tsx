"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, onCheckedChange, checked, defaultChecked, ...props }, ref) => {
  const [internalChecked, setInternalChecked] = React.useState<boolean>(Boolean(defaultChecked))

  const isControlled = typeof checked !== "undefined"
  const currentChecked = isControlled ? Boolean(checked) : internalChecked

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalChecked(e.target.checked)
    onCheckedChange?.(e.target.checked)
  }

  return (
    <input
      type="checkbox"
      ref={ref}
      className={cn(
        "h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500",
        className
      )}
      checked={currentChecked}
      onChange={handleChange}
      {...props}
    />
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }









