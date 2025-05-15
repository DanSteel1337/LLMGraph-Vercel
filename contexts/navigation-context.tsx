"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

type TabId = "search" | "documents" | "upload" | "feedback" | "analytics" | "settings"

interface NavigationContextType {
  activeTab: TabId
  setActiveTab: (tab: TabId) => void
  navigateToTab: (tab: TabId) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") as TabId | null

  // Initialize with URL param or default to search
  const [activeTab, setActiveTab] = useState<TabId>(tabParam || "search")

  // Update state when URL changes
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [tabParam, activeTab])

  // Navigate to a tab by updating URL
  const navigateToTab = (tab: TabId) => {
    setActiveTab(tab)

    // Create new search params
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set("tab", tab)

    // Update URL without full page reload
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false })
  }

  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab, navigateToTab }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
}
