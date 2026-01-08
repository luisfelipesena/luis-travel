import { createFileRoute, Link } from "@tanstack/react-router"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, MapPin, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"

export const Route = createFileRoute("/_authenticated/dashboard/trips/")({
  component: TripsPage,
})

function TripsPage() {
  const { data: trips, isLoading } = trpc.trip.list.useQuery()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Minhas Viagens</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os seus planos de viagem
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/trips/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Viagem
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : trips?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Nenhuma viagem ainda</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Crie sua primeira viagem para começar a planejar sua aventura com atividades, voos e
              muito mais.
            </p>
            <Button asChild size="lg">
              <Link to="/dashboard/trips/new">Criar Sua Primeira Viagem</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trips?.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  )
}

function TripCard({
  trip,
}: {
  trip: {
    id: string
    name: string
    destination: string
    startDate: Date
    endDate: Date
    coverImage?: string | null
    description?: string | null
  }
}) {
  const isUpcoming = new Date(trip.startDate) > new Date()
  const isOngoing = new Date(trip.startDate) <= new Date() && new Date(trip.endDate) >= new Date()

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Link to="/dashboard/trips/$tripId" params={{ tripId: trip.id }}>
        {trip.coverImage ? (
          <div
            className="h-40 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${trip.coverImage})` }}
          >
            {(isUpcoming || isOngoing) && (
              <div className="absolute top-2 right-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    isOngoing ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {isOngoing ? "Em andamento" : "Próxima"}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
            <MapPin className="h-12 w-12 text-primary/30" />
            {(isUpcoming || isOngoing) && (
              <div className="absolute top-2 right-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    isOngoing ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {isOngoing ? "Em andamento" : "Próxima"}
                </span>
              </div>
            )}
          </div>
        )}
        <CardHeader className="pb-2">
          <CardTitle className="text-lg line-clamp-1">{trip.name}</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="line-clamp-1">{trip.destination}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(new Date(trip.startDate), "d 'de' MMM", { locale: ptBR })} -{" "}
            {format(new Date(trip.endDate), "d 'de' MMM, yyyy", { locale: ptBR })}
          </div>
          {trip.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{trip.description}</p>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}
