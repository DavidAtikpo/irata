"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label className={cn("relative inline-flex items-center cursor-pointer", className)}>
        <input
          ref={ref}
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => {
            props.onChange?.(e)
            onCheckedChange?.(e.currentTarget.checked)
          }}
          {...props}
        />
        <div className="w-10 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-300 peer-checked:bg-stone-900 transition-colors"></div>
        <div className="absolute left-0.5 top-0.5 h-5 w-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow" />
      </label>
    )
  }
)
Switch.displayName = "Switch"

export default Switch


