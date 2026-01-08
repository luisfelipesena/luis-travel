import { createFileRoute } from "@tanstack/react-router"
import { Check, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"

export const Route = createFileRoute("/_authenticated/dashboard/invitations")({
  component: InvitationsPage,
})

function InvitationsPage() {
  const { data: invitations, isLoading, refetch } = trpc.invitation.myPendingInvitations.useQuery()
  const acceptMutation = trpc.invitation.accept.useMutation({ onSuccess: () => refetch() })
  const declineMutation = trpc.invitation.decline.useMutation({ onSuccess: () => refetch() })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Convites</h1>
      </div>
      <p className="text-muted-foreground">Gerencie os convites para participar de viagens.</p>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : invitations?.length === 0 ? (
        <div className="rounded-lg border bg-muted/50 p-8 text-center">
          <p className="text-muted-foreground">Nenhum convite pendente</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations?.map((invitation) => {
            const invitationWithRelations = invitation as typeof invitation & {
              trip?: { name: string }
              inviter?: { name: string }
            }

            return (
              <Card key={invitation.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {invitationWithRelations.trip?.name || "Viagem"}
                  </CardTitle>
                  <CardDescription>
                    Você foi convidado como{" "}
                    {invitation.role === "editor" ? "Editor" : "Visualizador"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => acceptMutation.mutate({ token: invitation.token })}
                    disabled={acceptMutation.isPending}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Aceitar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => declineMutation.mutate({ id: invitation.id })}
                    disabled={declineMutation.isPending}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Recusar
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
