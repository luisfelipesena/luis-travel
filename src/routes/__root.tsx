import { NeonAuthUIProvider } from "@neondatabase/neon-js/auth/react"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { NuqsAdapter } from "nuqs/adapters/tanstack-router"
import { useState } from "react"
import { toast } from "sonner"
import { authClient } from "@/auth"
import { Toaster } from "@/components/ui/sonner"
import type { RouterContext } from "@/lib/router-context"
import { getTRPCClient, trpc } from "@/lib/trpc"

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    const sessionResult = await authClient.getSession()
    const session = sessionResult.data
    const user = session?.user
      ? {
          id: session.user.id,
          name: session.user.name || session.user.email?.split("@")[0] || "User",
          email: session.user.email,
          image: session.user.image || undefined,
        }
      : null
    return { user, isAuthenticated: !!user }
  },
  component: RootComponent,
})

function RootComponent() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  const [trpcClient] = useState(() => getTRPCClient())

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      toast={({ variant = "default", message }) => {
        if (variant === "error") toast.error(message)
        else if (variant === "success") toast.success(message)
        else toast(message)
      }}
    >
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <NuqsAdapter>
            <div className="min-h-screen bg-background">
              <Outlet />
            </div>
            <Toaster position="top-right" />
            <TanStackDevtools
              config={{
                position: "bottom-right",
              }}
              plugins={[
                {
                  name: "TanStack Router",
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
          </NuqsAdapter>
        </QueryClientProvider>
      </trpc.Provider>
    </NeonAuthUIProvider>
  )
}
