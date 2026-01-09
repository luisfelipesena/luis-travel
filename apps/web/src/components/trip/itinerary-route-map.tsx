import type { LatLngBoundsExpression, LatLngExpression } from "leaflet"
import "leaflet/dist/leaflet.css"
import { ActivityType, TransportMode } from "@luis-travel/types"
import { Bike, Car, Clock, Footprints, Loader2, MapPin } from "lucide-react"
import { useMemo, useState } from "react"
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet"
import { useItineraryRoutes } from "@/hooks/use-itinerary-routes"
import { formatDistance, formatDuration, TRANSPORT_MODE_LABELS } from "@/lib/routing"
import { cn } from "@/lib/utils"

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

// Route colors per transport mode
const ROUTE_COLORS: Record<TransportMode, string> = {
  [TransportMode.WALKING]: "#22c55e", // green
  [TransportMode.DRIVING]: "#3b82f6", // blue
  [TransportMode.CYCLING]: "#f59e0b", // amber
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
  showRoute?: boolean
  fitBounds?: boolean
  className?: string
  defaultMode?: TransportMode
  showModeSelector?: boolean
  showRouteInfo?: boolean
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

// Transport mode selector button
function ModeButton({
  mode,
  isActive,
  onClick,
  isLoading,
}: {
  mode: TransportMode
  isActive: boolean
  onClick: () => void
  isLoading: boolean
}) {
  const icons = {
    [TransportMode.WALKING]: Footprints,
    [TransportMode.DRIVING]: Car,
    [TransportMode.CYCLING]: Bike,
  }
  const Icon = icons[mode]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-muted hover:bg-muted/80 text-muted-foreground"
      )}
      title={TRANSPORT_MODE_LABELS[mode]}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{TRANSPORT_MODE_LABELS[mode]}</span>
    </button>
  )
}

export function ItineraryRouteMap({
  activities,
  height = "300px",
  showRoute = true,
  fitBounds = true,
  className,
  defaultMode = TransportMode.WALKING,
  showModeSelector = true,
  showRouteInfo = true,
}: ItineraryRouteMapProps) {
  const [transportMode, setTransportMode] = useState<TransportMode>(defaultMode)

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

  // Fetch real routes from OSRM
  const {
    segments: routeSegments,
    totalDistance,
    totalDuration,
    isLoading: routesLoading,
  } = useItineraryRoutes(activitiesWithCoords, transportMode, showRoute)

  // Calculate center and bounds
  const { center, bounds } = useMemo(() => {
    if (activitiesWithCoords.length === 0) {
      return { center: [0, 0] as LatLngExpression, bounds: null }
    }

    // Include all route points in bounds calculation
    const allPoints: [number, number][] = [
      ...activitiesWithCoords.map(
        (a) =>
          [Number.parseFloat(a.locationLat!), Number.parseFloat(a.locationLng!)] as [number, number]
      ),
      ...routeSegments.flatMap((seg) => seg.path),
    ]

    const lats = allPoints.map((p) => p[0])
    const lngs = allPoints.map((p) => p[1])

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
  }, [activitiesWithCoords, routeSegments])

  if (activitiesWithCoords.length === 0) {
    return (
      <div
        className={cn("flex items-center justify-center rounded-lg border bg-muted/50", className)}
        style={{ height }}
      >
        <div className="text-center text-sm text-muted-foreground">
          <MapPin className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>Nenhuma atividade com localização</p>
          <p className="text-xs">Adicione localizações às atividades para ver o roteiro no mapa</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Controls bar */}
      {(showModeSelector || showRouteInfo) && (
        <div className="flex items-center justify-between gap-4 px-1">
          {/* Transport mode selector */}
          {showModeSelector && (
            <div className="flex items-center gap-1">
              {Object.values(TransportMode).map((mode) => (
                <ModeButton
                  key={mode}
                  mode={mode}
                  isActive={transportMode === mode}
                  onClick={() => setTransportMode(mode)}
                  isLoading={routesLoading}
                />
              ))}
            </div>
          )}

          {/* Route info */}
          {showRouteInfo && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {routesLoading ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Calculando rota...
                </span>
              ) : totalDistance > 0 ? (
                <>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {formatDistance(totalDistance)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(totalDuration)}
                  </span>
                </>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Map */}
      <div className="overflow-hidden rounded-lg border" style={{ height }}>
        <MapContainer center={center} zoom={13} className="h-full w-full" scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {fitBounds && bounds && <FitBoundsController bounds={bounds} />}

          {/* Route polylines (real paths from OSRM) */}
          {showRoute &&
            routeSegments.map((segment, index) => (
              <Polyline
                key={`route-${segment.fromActivityId}-${segment.toActivityId}`}
                positions={segment.path as LatLngExpression[]}
                color={ROUTE_COLORS[transportMode]}
                weight={4}
                opacity={0.8}
              >
                <Popup>
                  <div className="text-xs">
                    <p className="font-medium">
                      Trecho {index + 1} → {index + 2}
                    </p>
                    {segment.distance > 0 && (
                      <>
                        <p>Distância: {formatDistance(segment.distance)}</p>
                        <p>Tempo: {formatDuration(segment.duration)}</p>
                      </>
                    )}
                  </div>
                </Popup>
              </Polyline>
            ))}

          {/* Activity markers */}
          {activitiesWithCoords.map((activity, index) => {
            const position: LatLngExpression = [
              Number.parseFloat(activity.locationLat!),
              Number.parseFloat(activity.locationLng!),
            ]
            const color = getActivityColor(activity)

            return (
              <CircleMarker
                key={activity.id}
                center={position}
                radius={12}
                fillColor={color}
                fillOpacity={1}
                color="#fff"
                weight={2}
              >
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
              </CircleMarker>
            )
          })}

          {/* Number labels on markers */}
          {activitiesWithCoords.map((activity, index) => {
            const position: LatLngExpression = [
              Number.parseFloat(activity.locationLat!),
              Number.parseFloat(activity.locationLng!),
            ]

            return (
              <Marker
                key={`label-${activity.id}`}
                position={position}
                icon={
                  new (window as unknown as { L: typeof import("leaflet") }).L.DivIcon({
                    className: "activity-number-marker",
                    html: `<div style="
                      width: 20px;
                      height: 20px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      background: ${getActivityColor(activity)};
                      color: white;
                      border-radius: 50%;
                      font-size: 11px;
                      font-weight: 600;
                      border: 2px solid white;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    ">${index + 1}</div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                  })
                }
              />
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}

/**
 * Calculate straight-line distance between two coordinates in kilometers
 * @deprecated Use useItineraryRoutes for real route distances
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
 * @deprecated Use useItineraryRoutes for real route distances
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
