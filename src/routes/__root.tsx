import { NeonAuthUIProvider } from "@neondatabase/neon-js/auth/react"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { NuqsAdapter } from "nuqs/adapters/tanstack-router"
import { useState } from "react"
import { authClient } from "@/auth"
import { Toaster } from "@/components/ui/sonner"
import { getTRPCClient, trpc } from "@/lib/trpc"

export const Route = createRootRoute({
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
    <NeonAuthUIProvider authClient={authClient}>
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
