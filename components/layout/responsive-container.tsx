import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  fullWidth?: boolean
}

export function ResponsiveContainer({ children, className, fullWidth = false }: ResponsiveContainerProps) {
  return (
    <div className={cn("w-full px-4 mx-auto", fullWidth ? "max-w-full" : "max-w-7xl", "sm:px-6 md:px-8", className)}>
      {children}
    </div>
  )
}
