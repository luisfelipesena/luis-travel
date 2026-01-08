import { createFileRoute, Link } from "@tanstack/react-router"
import { format, isToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowRight, Calendar, MapPin, Navigation, Plane, Plus } from "lucide-react"
import { useMemo } from "react"
import { StatsCard } from "@/components/molecules"
import { EmptyState, TripCard } from "@/components/organisms"
import { DailyItinerary } from "@/components/trip/daily-itinerary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = Route.useRouteContext()
  const { data: trips, isLoading } = trpc.trip.list.useQuery()

  // Find ongoing trip (startDate <= today <= endDate)
  const ongoingTrip = useMemo(() => {
    if (!trips) return null
    const now = new Date()
    return trips.find((trip) => {
      const start = new Date(trip.startDate)
      const end = new Date(trip.endDate)
      return start <= now && end >= now
    })
  }, [trips])

  // Fetch activities for ongoing trip
  const { data: ongoingTripActivities, isLoading: activitiesLoading } =
    trpc.activity.listByTrip.useQuery({ tripId: ongoingTrip?.id || "" }, { enabled: !!ongoingTrip })

  // Filter today's activities
  const todaysActivities = useMemo(() => {
    if (!ongoingTripActivities) return []
    return ongoingTripActivities.filter((activity) => isToday(new Date(activity.startTime)))
  }, [ongoingTripActivities])

  const upcomingTrips = trips?.filter((trip) => new Date(trip.startDate) > new Date())
  const pastTrips = trips?.filter((trip) => new Date(trip.endDate) < new Date())

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bem-vindo de volta, {user?.name?.split(" ")[0]}!</h1>
          <p className="mt-1 text-muted-foreground">
            Planeje sua próxima aventura ou gerencie suas viagens existentes.
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/trips/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Viagem
          </Link>
        </Button>
      </div>

      {/* Today's Itinerary - Only show if there's an ongoing trip */}
      {ongoingTrip && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  Itinerário de Hoje
                </CardTitle>
                <CardDescription>
                  {ongoingTrip.name} - {ongoingTrip.destination}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/trips/$tripId" params={{ tripId: ongoingTrip.id }}>
                  Ver viagem
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-[250px] w-full" />
                <Skeleton className="h-[100px] w-full" />
              </div>
            ) : todaysActivities.length > 0 ? (
              <DailyItinerary
                activities={ongoingTripActivities || []}
                tripStartDate={new Date(ongoingTrip.startDate)}
                tripEndDate={new Date(ongoingTrip.endDate)}
                initialDate={new Date()}
                showNavigation={false}
              />
            ) : (
              <div className="py-8 text-center">
                <Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">Nenhuma atividade agendada para hoje</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
                </p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/dashboard/trips/$tripId/calendar" params={{ tripId: ongoingTrip.id }}>
                    Adicionar atividade
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total de Viagens"
          value={trips?.length || 0}
          icon={<Plane className="h-4 w-4" />}
          loading={isLoading}
        />
        <StatsCard
          title="Próximas"
          value={upcomingTrips?.length || 0}
          icon={<Calendar className="h-4 w-4" />}
          loading={isLoading}
        />
        <StatsCard
          title="Viagens Passadas"
          value={pastTrips?.length || 0}
          icon={<MapPin className="h-4 w-4" />}
          loading={isLoading}
        />
      </div>

      {/* Upcoming Trips */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Próximas Viagens</h2>
          <Button variant="ghost" asChild>
            <Link to="/dashboard/trips">Ver todas</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : upcomingTrips?.length === 0 ? (
          <EmptyState
            icon={<Plane className="h-12 w-12" />}
            title="Nenhuma viagem próxima"
            description="Comece a planejar sua próxima aventura!"
            action={{ label: "Criar Viagem", href: "/dashboard/trips/new" }}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingTrips?.slice(0, 3).map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
