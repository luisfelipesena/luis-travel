import { format, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Clock, MapPin, Navigation } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Activity } from "@luis-travel/db/schema"
import { ActivityType } from "@luis-travel/types"
import {
  calculateDistance,
  calculateTotalRouteDistance,
  ItineraryRouteMap,
} from "./itinerary-route-map"

// Activity type icons and labels
const ACTIVITY_TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  [ActivityType.FLIGHT]: {
    label: "Voo",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-950",
  },
  [ActivityType.ACCOMMODATION]: {
    label: "Hospedagem",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-950",
  },
  [ActivityType.TRANSPORT]: {
    label: "Transporte",
    color: "text-violet-600",
    bgColor: "bg-violet-100 dark:bg-violet-950",
  },
  [ActivityType.MEAL]: {
    label: "Refeição",
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-950",
  },
  [ActivityType.ACTIVITY]: {
    label: "Atividade",
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-950",
  },
  [ActivityType.CUSTOM]: {
    label: "Personalizado",
    color: "text-gray-600",
    bgColor: "bg-gray-100 dark:bg-gray-900",
  },
  [ActivityType.AI_GENERATED]: {
    label: "IA",
    color: "text-pink-600",
    bgColor: "bg-pink-100 dark:bg-pink-950",
  },
}

interface DailyItineraryProps {
  activities: Activity[]
  tripStartDate: Date
  tripEndDate: Date
  initialDate?: Date
  showNavigation?: boolean
  className?: string
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  return `${km.toFixed(1)} km`
}

export function DailyItinerary({
  activities,
  tripStartDate,
  tripEndDate,
  initialDate,
  showNavigation = true,
  className,
}: DailyItineraryProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || tripStartDate)

  // Filter activities for selected day
  const dayActivities = useMemo(() => {
    return activities
      .filter((activity) => {
        const activityDate = new Date(activity.startTime)
        return isSameDay(activityDate, selectedDate)
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }, [activities, selectedDate])

  // Calculate total distance for the day
  const totalDistance = useMemo(() => {
    return calculateTotalRouteDistance(dayActivities)
  }, [dayActivities])

  // Calculate distances between consecutive activities
  const distancesBetween = useMemo(() => {
    const distances: Record<string, number> = {}
    const sorted = [...dayActivities]
      .filter(
        (a) =>
          a.locationLat &&
          a.locationLng &&
          !Number.isNaN(Number.parseFloat(a.locationLat)) &&
          !Number.isNaN(Number.parseFloat(a.locationLng))
      )
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const curr = sorted[i]
      distances[curr.id] = calculateDistance(
        Number.parseFloat(prev.locationLat!),
        Number.parseFloat(prev.locationLng!),
        Number.parseFloat(curr.locationLat!),
        Number.parseFloat(curr.locationLng!)
      )
    }
    return distances
  }, [dayActivities])

  const handlePrevDay = () => {
    const prev = new Date(selectedDate)
    prev.setDate(prev.getDate() - 1)
    if (prev >= tripStartDate) {
      setSelectedDate(prev)
    }
  }

  const handleNextDay = () => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + 1)
    if (next <= tripEndDate) {
      setSelectedDate(next)
    }
  }

  const canGoPrev = selectedDate > tripStartDate
  const canGoNext = selectedDate < tripEndDate

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Date Navigation */}
      {showNavigation && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" disabled={!canGoPrev} onClick={handlePrevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-center">
            <h3 className="font-semibold">{format(selectedDate, "EEEE", { locale: ptBR })}</h3>
            <p className="text-sm text-muted-foreground">
              {format(selectedDate, "d 'de' MMMM, yyyy", { locale: ptBR })}
            </p>
          </div>

          <Button variant="outline" size="icon" disabled={!canGoNext} onClick={handleNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Map */}
      <ItineraryRouteMap activities={dayActivities} height="250px" />

      {/* Stats */}
      {dayActivities.length > 0 && (
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{dayActivities.length} atividades</span>
          </div>
          {totalDistance > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Navigation className="h-4 w-4" />
              <span>~{formatDistance(totalDistance)} percorridos</span>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      {dayActivities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Clock className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma atividade para este dia</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {dayActivities.map((activity, _index) => {
              const config =
                ACTIVITY_TYPE_CONFIG[activity.type] || ACTIVITY_TYPE_CONFIG[ActivityType.CUSTOM]
              const distance = distancesBetween[activity.id]

              return (
                <div key={activity.id}>
                  {/* Distance indicator between activities */}
                  {distance !== undefined && distance > 0 && (
                    <div className="my-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <div className="h-px flex-1 bg-border" />
                      <Navigation className="h-3 w-3" />
                      <span>{formatDistance(distance)}</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  )}

                  <Card className="overflow-hidden">
                    <div className="flex">
                      {/* Time column */}
                      <div className="flex w-16 shrink-0 flex-col items-center justify-center border-r bg-muted/50 p-2">
                        <span className="text-xs font-medium">
                          {format(new Date(activity.startTime), "HH:mm")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(activity.endTime), "HH:mm")}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-medium leading-tight">{activity.title}</h4>
                            {activity.location && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span className="line-clamp-1">{activity.location}</span>
                              </div>
                            )}
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${config.bgColor} ${config.color}`}
                          >
                            {config.label}
                          </span>
                        </div>

                        {activity.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
