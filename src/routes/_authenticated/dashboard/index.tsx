import { createFileRoute, Link } from "@tanstack/react-router"
import { trpc } from "@/lib/trpc"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Plane, Calendar, MapPin } from "lucide-react"
import { format } from "date-fns"

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: session } = useSession()
  const { data: trips, isLoading } = trpc.trip.list.useQuery()

  const upcomingTrips = trips?.filter(
    (trip) => new Date(trip.startDate) > new Date()
  )
  const pastTrips = trips?.filter(
    (trip) => new Date(trip.endDate) < new Date()
  )

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {session?.user.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Plan your next adventure or manage your existing trips.
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/trips/new">
            <Plus className="mr-2 h-4 w-4" />
            New Trip
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Trips"
          value={trips?.length || 0}
          icon={<Plane className="h-4 w-4" />}
          loading={isLoading}
        />
        <StatsCard
          title="Upcoming"
          value={upcomingTrips?.length || 0}
          icon={<Calendar className="h-4 w-4" />}
          loading={isLoading}
        />
        <StatsCard
          title="Past Trips"
          value={pastTrips?.length || 0}
          icon={<MapPin className="h-4 w-4" />}
          loading={isLoading}
        />
      </div>

      {/* Upcoming Trips */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Upcoming Trips</h2>
          <Button variant="ghost" asChild>
            <Link to="/dashboard/trips">View all</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : upcomingTrips?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Plane className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No upcoming trips</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start planning your next adventure!
              </p>
              <Button asChild>
                <Link to="/dashboard/trips/new">Create a Trip</Link>
              </Button>
            </CardContent>
          </Card>
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

function StatsCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string
  value: number
  icon: React.ReactNode
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  )
}

function TripCard({ trip }: { trip: { id: string; name: string; destination: string; startDate: Date; endDate: Date; coverImage?: string | null } }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/dashboard/trips/${trip.id}`}>
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
          {format(new Date(trip.startDate), "MMM d")} -{" "}
          {format(new Date(trip.endDate), "MMM d, yyyy")}
        </CardContent>
      </Link>
    </Card>
  )
}
