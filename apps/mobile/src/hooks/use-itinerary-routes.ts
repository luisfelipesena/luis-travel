import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { decodePolyline, getRouteBetweenPoints, type TransportMode } from "../lib/routing"

interface ActivityWithLocation {
  id: string
  locationLat?: string | null
  locationLng?: string | null
  startTime: Date | string
}

interface RouteSegmentWithPath {
  fromActivityId: string
  toActivityId: string
  path: { latitude: number; longitude: number }[]
  distance: number
  duration: number
}

interface UseItineraryRoutesResult {
  segments: RouteSegmentWithPath[]
  totalDistance: number
  totalDuration: number
  isLoading: boolean
  error: Error | null
}

/**
 * Fetch routes between consecutive activities
 * Uses OSRM for real walking/driving/cycling routes
 */
export function useItineraryRoutes(
  activities: ActivityWithLocation[],
  mode: TransportMode = "walking",
  enabled = true
): UseItineraryRoutesResult {
  const sortedActivities = useMemo(() => {
    return activities
      .filter(
        (a) =>
          a.locationLat &&
          a.locationLng &&
          !Number.isNaN(Number.parseFloat(a.locationLat)) &&
          !Number.isNaN(Number.parseFloat(a.locationLng))
      )
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }, [activities])

  const cacheKey = useMemo(() => {
    const coordsHash = sortedActivities
      .map((a) => `${a.id}:${a.locationLat}:${a.locationLng}`)
      .join("|")
    return `routes-${mode}-${coordsHash}`
  }, [sortedActivities, mode])

  const {
    data: segments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["itinerary-routes", cacheKey],
    queryFn: async () => {
      if (sortedActivities.length < 2) {
        return []
      }

      const promises = sortedActivities.slice(0, -1).map(async (activity, index) => {
        const nextActivity = sortedActivities[index + 1]

        const from = {
          lat: Number.parseFloat(activity.locationLat!),
          lng: Number.parseFloat(activity.locationLng!),
        }
        const to = {
          lat: Number.parseFloat(nextActivity.locationLat!),
          lng: Number.parseFloat(nextActivity.locationLng!),
        }

        const route = await getRouteBetweenPoints(from, to, mode)

        if (route) {
          return {
            fromActivityId: activity.id,
            toActivityId: nextActivity.id,
            path: decodePolyline(route.polyline),
            distance: route.distance,
            duration: route.duration,
          }
        }

        // Fallback to straight line if route fails
        return {
          fromActivityId: activity.id,
          toActivityId: nextActivity.id,
          path: [
            { latitude: from.lat, longitude: from.lng },
            { latitude: to.lat, longitude: to.lng },
          ],
          distance: 0,
          duration: 0,
        }
      })

      return Promise.all(promises)
    },
    enabled: enabled && sortedActivities.length >= 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  const { totalDistance, totalDuration } = useMemo(() => {
    return segments.reduce(
      (acc, seg) => ({
        totalDistance: acc.totalDistance + seg.distance,
        totalDuration: acc.totalDuration + seg.duration,
      }),
      { totalDistance: 0, totalDuration: 0 }
    )
  }, [segments])

  return {
    segments,
    totalDistance,
    totalDuration,
    isLoading,
    error: error as Error | null,
  }
}
