import Link from "next/link"
import { MainNav } from "@/components/navigation/main-nav"
import { Button } from "@/components/ui/button"
import { UserCircle } from "lucide-react"

export function Header() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="font-bold text-xl mr-6">
          UE Documentation
        </Link>
        <MainNav />
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            <span className="hidden md:block">Account</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
