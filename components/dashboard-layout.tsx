"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search, BarChart, FileText, MessageSquare, Upload, LogOut } from "lucide-react"
import { UserProfile } from "@/components/auth/user-profile"

interface NavProps {
  isCollapsed: boolean
  links: {
    title: string
    label?: string
    icon: React.ReactNode
    variant: "default" | "ghost"
    href: string
  }[]
}

export function Nav({ links, isCollapsed }: NavProps) {
  const pathname = usePathname()

  return (
    <div data-collapsed={isCollapsed} className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2">
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === link.href ? "bg-accent" : "transparent",
              isCollapsed ? "h-9 w-9 justify-center" : "",
            )}
          >
            {link.icon}
            {!isCollapsed && <span>{link.title}</span>}
            {!isCollapsed && link.label && <span className="ml-auto text-xs">{link.label}</span>}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const links = [
    {
      title: "Dashboard",
      icon: <BarChart className="h-4 w-4" />,
      variant: pathname === "/" ? "default" : "ghost",
      href: "/",
    },
    {
      title: "Search",
      icon: <Search className="h-4 w-4" />,
      variant: pathname === "/search" ? "default" : "ghost",
      href: "/search",
    },
    {
      title: "Documents",
      icon: <FileText className="h-4 w-4" />,
      variant: pathname === "/documents" ? "default" : "ghost",
      href: "/documents",
    },
    {
      title: "Upload",
      icon: <Upload className="h-4 w-4" />,
      variant: pathname === "/upload" ? "default" : "ghost",
      href: "/upload",
    },
    {
      title: "Feedback",
      icon: <MessageSquare className="h-4 w-4" />,
      variant: pathname === "/feedback" ? "default" : "ghost",
      href: "/feedback",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56">
            <div className="flex flex-col h-full">
              <div className="py-4">
                <h2 className="text-lg font-semibold">UE RAG Dashboard</h2>
              </div>
              <ScrollArea className="flex-1">
                <Nav links={links} isCollapsed={false} />
              </ScrollArea>
              <div className="mt-auto border-t pt-4">
                <UserProfile />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <img src="/stylized-UE.png" alt="UE Logo" className="h-8 w-8" />
            <span className="font-bold">UE RAG Dashboard</span>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <UserProfile />
        </div>
      </header>
      <div className="flex flex-1">
        <aside className={cn("hidden border-r bg-background md:block", isCollapsed ? "w-16" : "w-56")}>
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center px-4">
              <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <Nav links={links} isCollapsed={isCollapsed} />
            </ScrollArea>
            <div className="mt-auto border-t p-4">
              <Link href="/logout">
                <Button variant="ghost" className="w-full justify-start">
                  <LogOut className="mr-2 h-4 w-4" />
                  {!isCollapsed && <span>Logout</span>}
                </Button>
              </Link>
            </div>
          </div>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
