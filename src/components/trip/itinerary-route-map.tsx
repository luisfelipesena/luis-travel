import type { LatLngBoundsExpression, LatLngExpression } from "leaflet"
import "leaflet/dist/leaflet.css"
import { useMemo } from "react"
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet"
import { ActivityType } from "@/types"

// Activity type to color mapping
const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  [ActivityType.FLIGHT]: "#3b82f6", // blue
  [ActivityType.ACCOMMODATION]: "#10b981", // emerald
  [ActivityType.TRANSPORT]: "#8b5cf6", // violet
  [ActivityType.MEAL]: "#ef4444", // red
  [ActivityType.ACTIVITY]: "#f59e0b", // amber
  [ActivityType.CUSTOM]: "#6b7280", // gray
  [ActivityType.AI_GENERATED]: "#ec4899", // pink
  default: "#3b82f6",
}

interface ActivityWithLocation {
  id: string
  title: string
  startTime: Date | string
  endTime: Date | string
  location?: string | null
  locationLat?: string | null
  locationLng?: string | null
  type: string
  color?: string | null
}

interface ItineraryRouteMapProps {
  activities: ActivityWithLocation[]
  height?: string
  showPolyline?: boolean
  fitBounds?: boolean
  className?: string
}

function getActivityColor(activity: ActivityWithLocation): string {
  if (activity.color) return activity.color
  return ACTIVITY_TYPE_COLORS[activity.type] || ACTIVITY_TYPE_COLORS.default
}

function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

// Component to auto-fit bounds
function FitBoundsController({ bounds }: { bounds: LatLngBoundsExpression | null }) {
  const map = useMap()

  useMemo(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  }, [map, bounds])

  return null
}

export function ItineraryRouteMap({
  activities,
  height = "300px",
  showPolyline = true,
  fitBounds = true,
  className,
}: ItineraryRouteMapProps) {
  // Filter activities with valid coordinates
  const activitiesWithCoords = useMemo(() => {
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

  // Calculate center and bounds
  const { center, bounds } = useMemo(() => {
    if (activitiesWithCoords.length === 0) {
      return { center: [0, 0] as LatLngExpression, bounds: null }
    }

    const lats = activitiesWithCoords.map((a) => Number.parseFloat(a.locationLat!))
    const lngs = activitiesWithCoords.map((a) => Number.parseFloat(a.locationLng!))

    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    const centerLat = (minLat + maxLat) / 2
    const centerLng = (minLng + maxLng) / 2

    return {
      center: [centerLat, centerLng] as LatLngExpression,
      bounds: [
        [minLat, minLng],
        [maxLat, maxLng],
      ] as LatLngBoundsExpression,
    }
  }, [activitiesWithCoords])

  // Polyline positions in chronological order
  const polylinePositions: LatLngExpression[] = useMemo(() => {
    return activitiesWithCoords.map(
      (a) =>
        [Number.parseFloat(a.locationLat!), Number.parseFloat(a.locationLng!)] as LatLngExpression
    )
  }, [activitiesWithCoords])

  if (activitiesWithCoords.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border bg-muted/50 ${className}`}
        style={{ height }}
      >
        <div className="text-center text-sm text-muted-foreground">
          <p>Nenhuma atividade com localização</p>
          <p className="text-xs">Adicione localizações às atividades para ver o roteiro no mapa</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden rounded-lg border ${className}`} style={{ height }}>
      <MapContainer center={center} zoom={13} className="h-full w-full" scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {fitBounds && bounds && <FitBoundsController bounds={bounds} />}

        {/* Activity markers */}
        {activitiesWithCoords.map((activity, index) => {
          const position: LatLngExpression = [
            Number.parseFloat(activity.locationLat!),
            Number.parseFloat(activity.locationLng!),
          ]
          const color = getActivityColor(activity)

          return (
            <Marker key={activity.id} position={position}>
              <Popup>
                <div className="min-w-[150px]">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: color }}
                    >
                      {index + 1}
                    </span>
                    <span className="font-medium">{activity.title}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                  </div>
                  {activity.location && (
                    <div className="mt-1 text-xs text-muted-foreground">{activity.location}</div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Route polyline */}
        {showPolyline && polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            color="#3b82f6"
            weight={3}
            opacity={0.7}
            dashArray="8, 8"
          />
        )}
      </MapContainer>
    </div>
  )
}

/**
 * Calculate straight-line distance between two coordinates in kilometers
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Calculate total route distance for activities
 */
export function calculateTotalRouteDistance(activities: ActivityWithLocation[]): number {
  const sorted = [...activities]
    .filter(
      (a) =>
        a.locationLat &&
        a.locationLng &&
        !Number.isNaN(Number.parseFloat(a.locationLat)) &&
        !Number.isNaN(Number.parseFloat(a.locationLng))
    )
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  let total = 0
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]
    total += calculateDistance(
      Number.parseFloat(prev.locationLat!),
      Number.parseFloat(prev.locationLng!),
      Number.parseFloat(curr.locationLat!),
      Number.parseFloat(curr.locationLng!)
    )
  }
  return total
}
