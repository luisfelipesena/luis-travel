import { Link } from "@tanstack/react-router"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TripCardProps {
  trip: {
    id: string
    name: string
    destination: string
    startDate: Date
    endDate: Date
    coverImage?: string | null
  }
}

export function TripCard({ trip }: TripCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Link to="/dashboard/trips/$tripId" params={{ tripId: trip.id }}>
        {trip.coverImage ? (
          <div
            className="h-32 bg-cover bg-center"
            style={{ backgroundImage: `url(${trip.coverImage})` }}
          />
        ) : (
          <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <MapPin className="h-8 w-8 text-primary/50" />
          </div>
        )}
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{trip.name}</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {trip.destination}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {format(new Date(trip.startDate), "d 'de' MMM", { locale: ptBR })} -{" "}
          {format(new Date(trip.endDate), "d 'de' MMM, yyyy", { locale: ptBR })}
        </CardContent>
      </Link>
    </Card>
  )
}
