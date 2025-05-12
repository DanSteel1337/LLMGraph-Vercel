"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, FileText, FolderSearch, Home, LogOut, MessageSquare, Settings, Upload, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  variant: "default" | "ghost"
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { logout } = useAuth()

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: Home,
      variant: pathname === "/" ? "default" : "ghost",
    },
    {
      title: "Documents",
      href: "/documents",
      icon: FileText,
      variant: pathname === "/documents" ? "default" : "ghost",
    },
    {
      title: "Upload",
      href: "/upload",
      icon: Upload,
      variant: pathname === "/upload" ? "default" : "ghost",
    },
    {
      title: "Search",
      href: "/search",
      icon: FolderSearch,
      variant: pathname === "/search" ? "default" : "ghost",
    },
    {
      title: "Feedback",
      href: "/feedback",
      icon: MessageSquare,
      variant: pathname === "/feedback" ? "default" : "ghost",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="px-2 py-6">
                  <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setIsOpen(false)}>
                    <BarChart3 className="h-6 w-6" />
                    <span>UE Documentation RAG</span>
                  </Link>
                </div>
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <div className="flex flex-col gap-2 px-2">
                    {navItems.map((item) => (
                      <Link key={item.title} href={item.href} onClick={() => setIsOpen(false)}>
                        <Button variant={item.variant} className="w-full justify-start">
                          <item.icon className="mr-2 h-5 w-5" />
                          {item.title}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
                <div className="absolute bottom-4 left-4 right-4">
                  <Button variant="outline" className="w-full justify-start" onClick={logout}>
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <BarChart3 className="h-6 w-6" />
              <span className="hidden md:inline-block">UE Documentation RAG</span>
            </Link>
          </div>
          <nav className="hidden gap-2 md:flex">
            {navItems.map((item) => (
              <Link key={item.title} href={item.href}>
                <Button variant={item.variant} size="sm">
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Settings" className="rounded-full" asChild>
              <Link href="/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" aria-label="Account" className="rounded-full" asChild>
              <Link href="/account">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="hidden md:flex" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}

function Menu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}
