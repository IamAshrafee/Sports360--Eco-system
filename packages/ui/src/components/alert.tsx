import * as React from "react"

import { cn } from "../lib/utils"

function Alert({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "destructive" | "success"
}) {
  return (
    <div
      role="alert"
      data-slot="alert"
      data-variant={variant}
      className={cn(
        "grid gap-1 rounded-lg border p-4 text-sm",
        variant === "destructive" &&
          "border-destructive/40 bg-destructive/5 text-destructive",
        variant === "success" &&
          "border-emerald-600/30 bg-emerald-600/5 text-emerald-800 dark:text-emerald-300",
        className,
      )}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("font-medium", className)} {...props} />
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("text-current/80", className)} {...props} />
}

export { Alert, AlertDescription, AlertTitle }
