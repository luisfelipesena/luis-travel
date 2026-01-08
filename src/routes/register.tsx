import { AuthView, SignedIn } from "@neondatabase/neon-js/auth/react/ui"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { authClient } from "@/auth"

export const Route = createFileRoute("/register")({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()

  useEffect(() => {
    if (session?.user) {
      navigate({ to: "/dashboard" })
    }
  }, [session, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md p-8">
        <SignedIn>
          <div className="text-center">
            <p>Você já está logado. Redirecionando...</p>
          </div>
        </SignedIn>
        <AuthView />
      </div>
    </div>
  )
}
