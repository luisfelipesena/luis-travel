import type { Coordinate, TransportMode } from "@luis-travel/types"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { decodePolyline, getRouteBetweenPoints } from "@/lib/routing"

interface ActivityWithLocation {
  id: string
  locationLat?: string | null
  locationLng?: string | null
  startTime: Date | string
}

interface RouteSegmentWithPath {
  fromActivityId: string
  toActivityId: string
  path: [number, number][] // decoded polyline coordinates
  distance: number // meters
  duration: number // seconds
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
  // Filter and sort activities with valid coordinates
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

  // Create unique cache key based on activity coordinates and mode
  const cacheKey = useMemo(() => {
    const coordsHash = sortedActivities
      .map((a) => `${a.id}:${a.locationLat}:${a.locationLng}`)
      .join("|")
    return `routes-${mode}-${coordsHash}`
  }, [sortedActivities, mode])

  // Fetch all route segments
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

      // Fetch routes between consecutive activities in parallel
      const promises = sortedActivities.slice(0, -1).map(async (activity, index) => {
        const nextActivity = sortedActivities[index + 1]

        const from: Coordinate = {
          lat: Number.parseFloat(activity.locationLat!),
          lng: Number.parseFloat(activity.locationLng!),
        }
        const to: Coordinate = {
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
            [from.lat, from.lng],
            [to.lat, to.lng],
          ] as [number, number][],
          distance: 0,
          duration: 0,
        }
      })

      const resolved = await Promise.all(promises)
      return resolved
    },
    enabled: enabled && sortedActivities.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  })

  // Calculate totals
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
