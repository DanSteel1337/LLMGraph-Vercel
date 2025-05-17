import Link from "next/link"
import { MainNav } from "@/components/navigation/main-nav"
import { UserProfile } from "@/lib/auth-simple"

export function Header() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="font-bold text-xl mr-6">
          UE Documentation
        </Link>
        <MainNav />
        <div className="ml-auto flex items-center space-x-4">
          <UserProfile />
        </div>
      </div>
    </header>
  )
}
