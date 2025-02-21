
import { useLocation } from "wouter"
import { Link } from "wouter"
import { cn } from "@/lib/utils"

export default function Navigation() {
  const [location] = useLocation()

  return (
    <nav className="fixed top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/learn-sensei-logo-icon.png" className="h-6 w-6" />
            <span className="font-bold">Learn Sensei</span>
          </Link>
          <div className="flex gap-6">
            <Link 
              href="/dashboard"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location === "/dashboard" && "text-primary"
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/learning-paths"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location === "/learning-paths" && "text-primary" 
              )}
            >
              Learning Paths
            </Link>
            <Link
              href="/sensei"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location === "/sensei" && "text-primary"
              )}
            >
              Sensei Mode
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
