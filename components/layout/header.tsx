import Link from "next/link"
import { MainNav } from "@/components/navigation/main-nav"
import { UserProfile } from "@/components/auth/user-profile"
import { shouldUseMockData } from "@/lib/environment"

export function Header() {
  const isMockData = shouldUseMockData()

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="font-bold text-xl mr-6">
          UE Documentation
          {isMockData && <span className="text-xs text-muted-foreground ml-2">(Preview)</span>}
        </Link>
        <MainNav />
        <div className="ml-auto flex items-center space-x-4">
          <UserProfile />
        </div>
      </div>
    </header>
  )
}
