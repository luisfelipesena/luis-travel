import type {
  Coordinate,
  ItineraryRouteData,
  OSRMRouteResponse,
  RouteLeg,
  RouteSegment,
  TransportMode,
} from "@luis-travel/types"
import { RouteStatus } from "@luis-travel/types"

const OSRM_BASE_URL = "https://router.project-osrm.org"

/**
 * Decode OSRM polyline (polyline5 precision)
 * Returns array of [lat, lng] coordinates
 */
export function decodePolyline(encoded: string): [number, number][] {
  const coordinates: [number, number][] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let shift = 0
    let result = 0
    let byte: number

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1
    lat += deltaLat

    shift = 0
    result = 0

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1
    lng += deltaLng

    coordinates.push([lat / 1e5, lng / 1e5])
  }

  return coordinates
}

/**
 * Get route between two points using OSRM
 */
export async function getRouteBetweenPoints(
  from: Coordinate,
  to: Coordinate,
  mode: TransportMode = "walking"
): Promise<RouteLeg | null> {
  try {
    // OSRM uses lng,lat order (opposite of Leaflet)
    const url = `${OSRM_BASE_URL}/route/v1/${mode}/${from.lng},${from.lat};${to.lng},${to.lat}?geometries=polyline&overview=full`

    const response = await fetch(url)
    if (!response.ok) {
      console.error("OSRM request failed:", response.status)
      return null
    }

    const data = (await response.json()) as OSRMRouteResponse

    if (data.code !== "Ok" || !data.routes?.[0]) {
      console.error("OSRM returned no route:", data.code)
      return null
    }

    const route = data.routes[0]

    return {
      from,
      to,
      distance: route.distance, // meters
      duration: route.duration, // seconds
      polyline: route.geometry, // encoded polyline
      mode,
    }
  } catch (error) {
    console.error("Error fetching route:", error)
    return null
  }
}

/**
 * Get routes for multiple waypoints (full itinerary)
 */
export async function getItineraryRoutes(
  waypoints: Coordinate[],
  mode: TransportMode = "walking"
): Promise<ItineraryRouteData | null> {
  if (waypoints.length < 2) {
    return null
  }

  try {
    // Build coordinates string for OSRM
    const coordsString = waypoints.map((w) => `${w.lng},${w.lat}`).join(";")
    const url = `${OSRM_BASE_URL}/route/v1/${mode}/${coordsString}?geometries=polyline&overview=full&steps=false`

    const response = await fetch(url)
    if (!response.ok) {
      console.error("OSRM request failed:", response.status)
      return null
    }

    const data = (await response.json()) as OSRMRouteResponse

    if (data.code !== "Ok" || !data.routes?.[0]) {
      console.error("OSRM returned no route:", data.code)
      return null
    }

    const route = data.routes[0]

    // Create segments from legs
    const segments: RouteSegment[] = route.legs.map((leg, i) => ({
      id: `segment-${i}`,
      fromActivityId: `waypoint-${i}`,
      toActivityId: `waypoint-${i + 1}`,
      status: RouteStatus.SUCCESS,
      leg: {
        from: waypoints[i],
        to: waypoints[i + 1],
        distance: leg.distance,
        duration: leg.duration,
        polyline: "", // Individual leg polylines not available in overview
        mode,
      },
      error: null,
    }))

    return {
      segments,
      totalDistance: route.distance,
      totalDuration: route.duration,
      mode,
    }
  } catch (error) {
    console.error("Error fetching itinerary routes:", error)
    return null
  }
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  return `${minutes} min`
}

/**
 * Transport mode labels in Portuguese
 */
export const TRANSPORT_MODE_LABELS: Record<TransportMode, string> = {
  driving: "Carro",
  walking: "A pé",
  cycling: "Bicicleta",
}

/**
 * Transport mode icons
 */
export const TRANSPORT_MODE_ICONS: Record<TransportMode, string> = {
  driving: "car",
  walking: "footprints",
  cycling: "bike",
}
