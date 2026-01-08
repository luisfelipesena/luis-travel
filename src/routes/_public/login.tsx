import { AuthView } from "@neondatabase/neon-js/auth/react/ui"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_public/login")({
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center py-12">
      <div className="w-full max-w-md animate-fade-in">
        <AuthView />
      </div>
    </div>
  )
}
