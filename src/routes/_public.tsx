import { createFileRoute, Link, Outlet } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_public")({
  beforeLoad: ({ context }) => {
    // Login/register pages redirect if authenticated
    return { isAuthenticated: context.isAuthenticated }
  },
  component: PublicLayout,
})

function PublicLayout() {
  const { isAuthenticated } = Route.useRouteContext()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <img src="/luis-travel-icon.svg" alt="Luis Travel" className="h-9 w-9" />
            <span className="text-xl font-bold tracking-tight text-[#2D8B6F]">Luis Travel</span>
          </Link>
          <nav className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/dashboard">Ir para o Painel</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Começar</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-muted/30">
        <div className="container py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <img src="/luis-travel-icon.svg" alt="Luis Travel" className="h-5 w-5" />
              <span className="font-semibold text-[#2D8B6F]">Luis Travel</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Luis Travel. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
