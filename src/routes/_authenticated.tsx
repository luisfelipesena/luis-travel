import { RedirectToSignIn, SignedIn } from "@neondatabase/neon-js/auth/react/ui"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { authClient } from "@/auth"
import { AppSidebar } from "@/components/layout"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { data: session } = authClient.useSession()

  const user = {
    name: session?.user.name || "Usuário",
    email: session?.user.email || "",
    image: session?.user.image || undefined,
  }

  return (
    <>
      <SignedIn>
        <SidebarProvider>
          <AppSidebar user={user} />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6">
              <Outlet />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </SignedIn>
      <RedirectToSignIn />
    </>
  )
}
