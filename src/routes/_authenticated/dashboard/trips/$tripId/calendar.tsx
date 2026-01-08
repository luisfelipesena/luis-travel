import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { CalendarContainer } from "@/components/calendar/calendar-container"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"

export const Route = createFileRoute("/_authenticated/dashboard/trips/$tripId/calendar")({
  component: TripCalendarPage,
})

function TripCalendarPage() {
  const { tripId } = Route.useParams()
  const { data: trip, isLoading: tripLoading } = trpc.trip.byId.useQuery({ id: tripId })
  const { data: activities, isLoading: activitiesLoading } = trpc.activity.listByTrip.useQuery({
    tripId,
  })

  const utils = trpc.useUtils()

  const updateActivity = trpc.activity.updateTimes.useMutation({
    onSuccess: () => {
      utils.activity.listByTrip.invalidate({ tripId })
    },
  })

  const createActivity = trpc.activity.create.useMutation({
    onSuccess: () => {
      utils.activity.listByTrip.invalidate({ tripId })
    },
  })

  if (tripLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="text-center py-16">
        <p>Trip not found</p>
        <Button asChild className="mt-4">
          <Link to="/dashboard/trips">Back to Trips</Link>
        </Button>
      </div>
    )
  }

  const handleActivityUpdate = (activityId: string, startTime: Date, endTime: Date) => {
    updateActivity.mutate({ id: activityId, startTime, endTime })
  }

  const handleActivityCreate = (data: { title: string; startTime: Date; endTime: Date }) => {
    createActivity.mutate({
      tripId,
      title: data.title,
      startTime: data.startTime,
      endTime: data.endTime,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/trips/$tripId" params={{ tripId }}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{trip.name} - Calendar</h1>
          <p className="text-muted-foreground">{trip.destination}</p>
        </div>
      </div>

      <CalendarContainer
        activities={activities || []}
        tripStartDate={new Date(trip.startDate)}
        tripEndDate={new Date(trip.endDate)}
        onActivityUpdate={handleActivityUpdate}
        onActivityCreate={handleActivityCreate}
        isLoading={activitiesLoading}
      />
    </div>
  )
}
