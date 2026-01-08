import { createFileRoute, Link } from "@tanstack/react-router"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowLeft, Calendar, MapPin, Plane, Settings, Sparkles, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trpc } from "@/lib/trpc"

export const Route = createFileRoute("/_authenticated/dashboard/trips/$tripId/")({
  component: TripDetailPage,
})

function TripDetailPage() {
  const { tripId } = Route.useParams()
  const { data: trip, isLoading, error } = trpc.trip.byId.useQuery({ id: tripId })
  const { data: activities } = trpc.activity.listByTrip.useQuery({ tripId }, { enabled: !!trip })
  const { data: flights } = trpc.flight.listByTrip.useQuery({ tripId }, { enabled: !!trip })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error || !trip) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <h3 className="text-xl font-medium mb-2">Viagem não encontrada</h3>
          <p className="text-muted-foreground mb-4">
            A viagem que você procura não existe ou você não tem acesso.
          </p>
          <Button asChild>
            <Link to="/dashboard/trips">Voltar para Viagens</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const isUpcoming = new Date(trip.startDate) > new Date()
  const isOngoing = new Date(trip.startDate) <= new Date() && new Date(trip.endDate) >= new Date()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard/trips">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{trip.name}</h1>
              {isOngoing && <Badge className="bg-green-500">Em andamento</Badge>}
              {isUpcoming && <Badge>Próxima</Badge>}
            </div>
            <div className="flex items-center gap-4 mt-1 text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {trip.destination}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(trip.startDate), "d 'de' MMM", { locale: ptBR })} -{" "}
                {format(new Date(trip.endDate), "d 'de' MMM, yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link to="/dashboard/trips/$tripId" params={{ tripId }}>
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Voos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flights?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Membros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="flights">Voos</TabsTrigger>
          <TabsTrigger value="members">Membros</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {trip.description && (
            <Card>
              <CardHeader>
                <CardTitle>Sobre esta viagem</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{trip.description}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Comece a planejar sua viagem</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/dashboard/trips/$tripId/calendar" params={{ tripId }}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Abrir Calendário
                </Link>
              </Button>
              <Button variant="outline">
                <Plane className="h-4 w-4 mr-2" />
                Adicionar Voo
              </Button>
              <Button variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                Sugestões IA
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Próximas Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              {activities?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma atividade ainda</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/dashboard/trips/$tripId/calendar" params={{ tripId }}>
                      Adicione sua primeira atividade
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {activities?.slice(0, 5).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(activity.startTime), "d 'de' MMM, HH:mm", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      {activity.location && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {activity.location}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Visualização do Calendário</h3>
              <p className="text-muted-foreground mb-4">
                Visualize e gerencie suas atividades em um layout de calendário
              </p>
              <Button asChild>
                <Link to="/dashboard/trips/$tripId/calendar" params={{ tripId }}>
                  Abrir Calendário Completo
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flights">
          <Card>
            <CardHeader>
              <CardTitle>Voos</CardTitle>
              <CardDescription>Acompanhe seus voos para esta viagem</CardDescription>
            </CardHeader>
            <CardContent>
              {flights?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Plane className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum voo adicionado ainda</p>
                  <Button variant="link" className="mt-2">
                    Adicione seu primeiro voo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {flights?.map((flight) => (
                    <div
                      key={flight.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <Plane className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{flight.flightNumber}</p>
                          <p className="text-sm text-muted-foreground">{flight.airline}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {flight.departureAirport} → {flight.arrivalAirport}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(flight.departureTime), "d 'de' MMM, HH:mm", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      {flight.status && <Badge variant="outline">{flight.status}</Badge>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Membros da Viagem</CardTitle>
              <CardDescription>Pessoas que têm acesso a esta viagem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Você</p>
                      <p className="text-sm text-muted-foreground">Proprietário</p>
                    </div>
                  </div>
                  <Badge>Proprietário</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Users className="h-4 w-4 mr-2" />
                Convidar Membros
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
