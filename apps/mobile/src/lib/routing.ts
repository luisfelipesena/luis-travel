// OSRM (Open Source Routing Machine) integration for mobile
const OSRM_BASE_URL = "https://router.project-osrm.org"

export type TransportMode = "walking" | "driving" | "cycling"

export interface Coordinate {
  lat: number
  lng: number
}

export interface RouteLeg {
  from: Coordinate
  to: Coordinate
  distance: number // meters
  duration: number // seconds
  polyline: string
  mode: TransportMode
}

interface OSRMRoute {
  distance: number
  duration: number
  geometry: string
  legs: { distance: number; duration: number }[]
}

interface OSRMRouteResponse {
  code: string
  routes: OSRMRoute[]
}

/**
 * Decode OSRM polyline (polyline5 precision)
 * Returns array of { latitude, longitude } for react-native-maps
 */
export function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  const coordinates: { latitude: number; longitude: number }[] = []
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

    coordinates.push({ latitude: lat / 1e5, longitude: lng / 1e5 })
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
      distance: route.distance,
      duration: route.duration,
      polyline: route.geometry,
      mode,
    }
  } catch (error) {
    console.error("Error fetching route:", error)
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

export const TRANSPORT_MODE_LABELS: Record<TransportMode, string> = {
  driving: "Carro",
  walking: "A pé",
  cycling: "Bicicleta",
}

export const ROUTE_COLORS: Record<TransportMode, string> = {
  walking: "#22c55e",
  driving: "#3b82f6",
  cycling: "#f59e0b",
}
