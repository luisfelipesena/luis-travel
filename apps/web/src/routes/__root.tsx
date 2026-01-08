import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRootRouteWithContext, Link, Outlet, useRouter } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { NuqsAdapter } from "nuqs/adapters/tanstack-router"
import { useState } from "react"
import { authClient } from "@/auth"
import { authLocalizationPtBR } from "@/lib/auth-localization"
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
  const router = useRouter()
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
    <AuthUIProvider
      authClient={authClient}
      localization={authLocalizationPtBR}
      navigate={(path) => router.navigate({ to: path })}
      replace={(path) => router.navigate({ to: path, replace: true })}
      Link={({ href, children, ...props }) => (
        <Link to={href} {...props}>
          {children}
        </Link>
      )}
      onSessionChange={() => router.invalidate()}
      redirectTo="/dashboard"
      credentials={{
        forgotPassword: true,
      }}
      signUp={{
        fields: ["name"],
      }}
    >
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <NuqsAdapter>
            <div className="min-h-screen bg-background">
              <Outlet />
            </div>
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
    </AuthUIProvider>
  )
}
