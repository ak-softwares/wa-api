import * as React from "react"
import { cn } from "@/lib/utils"

export function Prose({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("prose prose-slate dark:prose-invert max-w-none", className)}
      {...props}
    />
  )
}
