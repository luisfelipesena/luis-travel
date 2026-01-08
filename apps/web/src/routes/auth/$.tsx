import { AuthView } from "@daveyplate/better-auth-ui"
import { createFileRoute, Link, redirect, useParams } from "@tanstack/react-router"

export const Route = createFileRoute("/auth/$")({
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: AuthPage,
})

function AuthPage() {
  const { _splat: pathname } = useParams({ from: "/auth/$" })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Branding */}
        <div className="flex flex-col items-center gap-2 text-center">
          <img src="/luis-travel-icon.svg" alt="Luis Travel" className="h-14 w-14" />
          <h1 className="text-2xl font-bold text-[#2D8B6F]">Luis Travel</h1>
          <p className="text-sm text-muted-foreground">Planeje sua viagem em segundos</p>
        </div>

        {/* Auth Form */}
        <AuthView pathname={pathname || "sign-in"} />

        {/* Back to home link */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  )
}
