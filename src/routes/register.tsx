import { AuthView } from "@neondatabase/neon-js/auth/react/ui"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/register")({
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: RegisterPage,
})

function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md p-8">
        <AuthView />
      </div>
    </div>
  )
}
