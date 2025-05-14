"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, FileText, Search, Settings, Upload, Home, MessageSquare } from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    title: "Documents",
    href: "/admin?tab=documents",
    icon: FileText,
  },
  {
    title: "Upload",
    href: "/admin?tab=upload",
    icon: Upload,
  },
  {
    title: "Search",
    href: "/search",
    icon: Search,
  },
  {
    title: "Feedback",
    href: "/feedback",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 border-r bg-background h-screen sticky top-0">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h1 className="text-xl font-bold">Vector RAG Admin</h1>
          <p className="text-sm text-muted-foreground">Knowledge Base Management</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname === "/admin" && item.href === "/admin") ||
              (pathname.startsWith("/admin/document/") && item.href === "/admin?tab=documents")

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 hover:text-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>

        <div className="p-6 border-t">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium">VA</span>
            </div>
            <div>
              <p className="text-sm font-medium">Vector RAG</p>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
