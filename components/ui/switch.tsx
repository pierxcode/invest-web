"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function Switch({
  checked,
  onCheckedChange,
  className,
}: {
  checked?: boolean
  onCheckedChange?: (value: boolean) => void
  className?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        checked ? "bg-white" : "bg-zinc-700",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full transition-transform",
          checked ? "translate-x-[18px] bg-black" : "translate-x-0.5 bg-white"
        )}
      />
    </button>
  )
}
