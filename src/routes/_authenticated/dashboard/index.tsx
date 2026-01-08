import { createFileRoute, Link } from "@tanstack/react-router"
import { Calendar, MapPin, Plane, Plus } from "lucide-react"
import { authClient } from "@/auth"
import { StatsCard } from "@/components/molecules"
import { EmptyState, TripCard } from "@/components/organisms"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: session } = authClient.useSession()
  const { data: trips, isLoading } = trpc.trip.list.useQuery()

  const upcomingTrips = trips?.filter((trip) => new Date(trip.startDate) > new Date())
  const pastTrips = trips?.filter((trip) => new Date(trip.endDate) < new Date())

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {session?.user.name?.split(" ")[0]}!</h1>
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
          <EmptyState
            icon={<Plane className="h-12 w-12" />}
            title="No upcoming trips"
            description="Start planning your next adventure!"
            action={{ label: "Create a Trip", href: "/dashboard/trips/new" }}
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
