import { AuthView } from "@daveyplate/better-auth-ui"
import { createFileRoute, Link, redirect, useParams } from "@tanstack/react-router"
import { ArrowLeft, Globe, Plane } from "lucide-react"

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
  const isSignUp = pathname === "sign-up"

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#2D8B6F] to-[#1a5c47] p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/luis-travel-icon.svg"
              alt="Luis Travel"
              className="h-10 w-10 brightness-0 invert"
            />
            <span className="text-2xl font-bold text-white">Luis Travel</span>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Planeje sua próxima
            <br />
            aventura com facilidade
          </h2>
          <p className="text-white/80 text-lg max-w-md">
            Crie roteiros personalizados, acompanhe voos em tempo real e compartilhe suas viagens
            com amigos e família.
          </p>

          <div className="flex gap-6 pt-4">
            <div className="flex items-center gap-2 text-white/90">
              <Plane className="h-5 w-5" />
              <span>Rastreio de voos</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Globe className="h-5 w-5" />
              <span>Roteiros inteligentes</span>
            </div>
          </div>
        </div>

        <p className="text-white/60 text-sm">© 2024 Luis Travel. Todos os direitos reservados.</p>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Mobile branding */}
          <div className="lg:hidden flex flex-col items-center gap-3 text-center">
            <img src="/luis-travel-icon.svg" alt="Luis Travel" className="h-12 w-12" />
            <h1 className="text-2xl font-bold text-[#2D8B6F]">Luis Travel</h1>
          </div>

          {/* Page title for desktop */}
          <div className="hidden lg:block space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {isSignUp ? "Criar conta" : "Bem-vindo de volta"}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp
                ? "Comece a planejar suas viagens hoje"
                : "Entre para continuar planejando suas aventuras"}
            </p>
          </div>

          {/* Auth Form with custom styling wrapper */}
          <div className="[&_form]:space-y-4 [&_input]:h-11 [&_button[type='submit']]:h-11 [&_button[type='submit']]:bg-[#2D8B6F] [&_button[type='submit']]:hover:bg-[#236b56] [&_button[type='submit']]:font-medium">
            <AuthView pathname={pathname || "sign-in"} />
          </div>

          {/* Back to home link */}
          <div className="text-center pt-4 border-t">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#2D8B6F] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o início
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
