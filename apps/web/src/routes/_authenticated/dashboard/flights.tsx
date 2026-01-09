import { createFileRoute, Link } from "@tanstack/react-router"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowRight, Calendar, MapPin, Plane, PlaneTakeoff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"

export const Route = createFileRoute("/_authenticated/dashboard/flights")({
  component: FlightsPage,
})

function FlightsPage() {
  const { data: flights, isLoading } = trpc.flight.list.useQuery()

  // Group flights by trip
  const flightsByTrip = flights?.reduce(
    (acc, flight) => {
      const tripId = flight.tripId
      if (!acc[tripId]) {
        acc[tripId] = {
          trip: flight.trip!,
          flights: [],
        }
      }
      acc[tripId].flights.push(flight)
      return acc
    },
    {} as Record<
      string,
      { trip: { id: string; name: string; destination: string }; flights: typeof flights }
    >
  )

  const getStatusVariant = (status?: string | null) => {
    if (!status) return "outline"
    switch (status.toLowerCase()) {
      case "scheduled":
        return "secondary"
      case "active":
        return "default"
      case "landed":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusLabel = (status?: string | null) => {
    if (!status) return "Agendado"
    switch (status.toLowerCase()) {
      case "scheduled":
        return "Agendado"
      case "active":
        return "Em voo"
      case "landed":
        return "Aterrissou"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <PlaneTakeoff className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Voos</h1>
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <PlaneTakeoff className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Voos</h1>
        </div>
        <p className="mt-1 text-muted-foreground">Acompanhe todos os seus voos em um só lugar.</p>
      </div>

      {!flights || flights.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Plane className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-medium">Nenhum voo cadastrado</h3>
            <p className="mb-4 text-muted-foreground">
              Adicione voos às suas viagens para acompanhar todos em um só lugar.
            </p>
            <Button asChild>
              <Link to="/dashboard/trips">Ver Viagens</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(flightsByTrip || {}).map(([tripId, { trip, flights: tripFlights }]) => (
            <Card key={tripId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      {trip.name}
                    </CardTitle>
                    <CardDescription>{trip.destination}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/dashboard/trips/$tripId" params={{ tripId }}>
                      Ver Viagem
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {tripFlights.map((flight) => (
                  <div
                    key={flight.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Plane className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{flight.flightNumber}</p>
                          {flight.status && (
                            <Badge variant={getStatusVariant(flight.status)}>
                              {getStatusLabel(flight.status)}
                            </Badge>
                          )}
                        </div>
                        {flight.airline && (
                          <p className="text-sm text-muted-foreground">{flight.airline}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium">{flight.departureAirport}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(flight.departureTime), "d MMM, HH:mm", {
                            locale: ptBR,
                          })}
                        </div>
                      </div>

                      <ArrowRight className="h-4 w-4 text-muted-foreground" />

                      <div className="text-left">
                        <p className="font-medium">{flight.arrivalAirport}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(flight.arrivalTime), "d MMM, HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
