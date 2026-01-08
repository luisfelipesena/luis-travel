import { AuthView } from "@neondatabase/neon-js/auth/react/ui"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/login")({
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md p-8">
        <AuthView />
      </div>
    </div>
  )
}
