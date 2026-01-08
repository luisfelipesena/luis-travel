import { Link } from "@tanstack/react-router"
import { Plane } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LandingLayoutProps {
  isAuthenticated: boolean
  children: React.ReactNode
}

export function LandingLayout({ isAuthenticated, children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Luis Travel</span>
          </div>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Luis Travel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
