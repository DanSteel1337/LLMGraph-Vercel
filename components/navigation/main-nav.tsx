"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { shouldUseMockData } from "@/lib/environment"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function MainNav() {
  const pathname = usePathname()
  const isMockData = shouldUseMockData()

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
    },
    {
      name: "Documents",
      href: "/documents",
    },
    {
      name: "Search",
      href: "/search",
    },
    {
      name: "Upload",
      href: "/upload",
    },
    {
      name: "Analytics",
      href: "/analytics",
    },
    {
      name: "Feedback",
      href: "/feedback",
    },
    {
      name: "Settings",
      href: "/settings",
    },
  ]

  return (
    <div className="flex flex-col">
      {isMockData && (
        <Alert variant="warning" className="mb-2 py-1 px-2">
          <AlertCircle className="h-3 w-3" />
          <AlertDescription className="text-xs">Preview Mode</AlertDescription>
        </Alert>
      )}
      <nav className="flex items-center space-x-4 lg:space-x-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === item.href ? "text-primary" : "text-muted-foreground",
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}
