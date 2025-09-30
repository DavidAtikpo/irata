import * as React from "react"
import { cn } from "../../lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

export function Progress({ value = 0, max = 100, className, ...props }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))

  return (
    <div
      className={cn("w-full bg-stone-200 rounded-full h-2", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      {...props}
    >
      <div
        className="bg-amber-500 h-full rounded-full"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}













