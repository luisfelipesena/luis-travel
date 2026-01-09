import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Navigation,
  Plane,
  Settings,
  Sparkles,
  Users,
} from "lucide-react"
import { parseAsString, useQueryState } from "nuqs"
import { useState } from "react"
import { toast } from "sonner"
import { FlightFormDialog } from "@/components/organisms/flight-form-dialog"
import { TripSettingsDialog } from "@/components/organisms/trip-settings-dialog"
import { type AISuggestion, AISuggestionsDialog } from "@/components/trip/ai-suggestions-dialog"
import { DailyItinerary } from "@/components/trip/daily-itinerary"
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
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useQueryState("tab", parseAsString.withDefault("overview"))
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [flightDialogOpen, setFlightDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)

  const utils = trpc.useUtils()
  const { data: trip, isLoading, error } = trpc.trip.byId.useQuery({ id: tripId })
  const { data: activities } = trpc.activity.listByTrip.useQuery({ tripId }, { enabled: !!trip })
  const { data: flights } = trpc.flight.listByTrip.useQuery({ tripId }, { enabled: !!trip })

  const generateMutation = trpc.ai.generateActivities.useMutation()
  const addMutation = trpc.ai.generateActivities.useMutation({
    onSuccess: () => {
      utils.activity.listByTrip.invalidate({ tripId })
      toast.success("Atividades adicionadas com sucesso!")
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao adicionar atividades")
    },
  })

  const handleGenerateSuggestions = async (preferences?: string): Promise<AISuggestion[]> => {
    const result = await generateMutation.mutateAsync({
      tripId,
      preferences,
      autoAdd: false,
    })
    return result.suggestions as AISuggestion[]
  }

  const handleAddSuggestions = async (_suggestions: AISuggestion[]) => {
    // Use autoAdd=true to actually add the suggestions
    await addMutation.mutateAsync({
      tripId,
      autoAdd: true,
    })
  }

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
          <h3 className="mb-2 text-xl font-medium">Viagem não encontrada</h3>
          <p className="mb-4 text-muted-foreground">
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
            <div className="mt-1 flex items-center gap-4 text-muted-foreground">
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
        <Button variant="outline" onClick={() => setSettingsDialogOpen(true)}>
          <Settings className="mr-2 h-4 w-4" />
          Configurações
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="routes">Rotas</TabsTrigger>
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
                  <Calendar className="mr-2 h-4 w-4" />
                  Abrir Calendário
                </Link>
              </Button>
              <Button variant="outline" onClick={() => setFlightDialogOpen(true)}>
                <Plane className="mr-2 h-4 w-4" />
                Adicionar Voo
              </Button>
              <Button variant="outline" onClick={() => setAiDialogOpen(true)}>
                <Sparkles className="mr-2 h-4 w-4" />
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
                <div className="py-8 text-center text-muted-foreground">
                  <Calendar className="mx-auto mb-2 h-8 w-8 opacity-50" />
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
                      className="flex items-center justify-between rounded-lg border p-3"
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
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
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

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Itinerário Diário
              </CardTitle>
              <CardDescription>Visualize o percurso das suas atividades dia a dia</CardDescription>
            </CardHeader>
            <CardContent>
              {activities && activities.length > 0 ? (
                <DailyItinerary
                  activities={activities}
                  tripStartDate={new Date(trip.startDate)}
                  tripEndDate={new Date(trip.endDate)}
                  showNavigation={true}
                />
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Navigation className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>Nenhuma atividade para exibir no mapa</p>
                  <p className="text-sm">Adicione atividades com localização para ver o roteiro</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/dashboard/trips/$tripId/calendar" params={{ tripId }}>
                      Adicionar atividades
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-medium">Visualização do Calendário</h3>
              <p className="mb-4 text-muted-foreground">
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
                <div className="py-8 text-center text-muted-foreground">
                  <Plane className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>Nenhum voo adicionado ainda</p>
                  <Button variant="link" className="mt-2" onClick={() => setFlightDialogOpen(true)}>
                    Adicione seu primeiro voo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {flights?.map((flight) => (
                    <div
                      key={flight.id}
                      className="flex items-center justify-between rounded-lg border p-4"
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
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
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
              <Button variant="outline" className="mt-4 w-full">
                <Users className="mr-2 h-4 w-4" />
                Convidar Membros
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Suggestions Dialog */}
      <AISuggestionsDialog
        open={aiDialogOpen}
        onClose={() => setAiDialogOpen(false)}
        onGenerate={handleGenerateSuggestions}
        onAddSuggestions={handleAddSuggestions}
        isGenerating={generateMutation.isPending}
        isAdding={addMutation.isPending}
      />

      {/* Flight Form Dialog */}
      <FlightFormDialog
        open={flightDialogOpen}
        onClose={() => setFlightDialogOpen(false)}
        tripId={tripId}
      />

      {/* Trip Settings Dialog */}
      {trip && (
        <TripSettingsDialog
          open={settingsDialogOpen}
          onClose={() => setSettingsDialogOpen(false)}
          tripId={tripId}
          initialData={{
            name: trip.name,
            destination: trip.destination,
            description: trip.description,
            startDate: new Date(trip.startDate),
            endDate: new Date(trip.endDate),
          }}
          onSuccess={() => {
            // If trip was deleted, navigate back to trips list
            navigate({ to: "/dashboard/trips" })
          }}
        />
      )}
    </div>
  )
}
