import { RedirectToSignIn, SignedIn, UserButton } from "@neondatabase/neon-js/auth/react/ui"
import { createFileRoute, Link, Outlet } from "@tanstack/react-router"
import { Plane } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
              <Link to="/dashboard" className="flex items-center gap-2">
                <Plane className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Luis Travel</span>
              </Link>

              <nav className="flex items-center gap-4">
                <Button variant="ghost" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/dashboard/trips">My Trips</Link>
                </Button>
                <UserButton />
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main className="container py-6">
            <Outlet />
          </main>
        </div>
      </SignedIn>
      <RedirectToSignIn />
    </>
  )
}
