import { ActivityType, TransportMode } from "@luis-travel/types"
import { Bike, Car, Clock, Footprints, MapPin } from "lucide-react-native"
import { useMemo, useRef, useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native"
import MapView, { Marker, Polyline, type Region } from "react-native-maps"
import { useItineraryRoutes } from "../../hooks/use-itinerary-routes"
import { formatDistance, formatDuration, TRANSPORT_MODE_LABELS } from "../../lib/routing"

// Activity type to color mapping
const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  [ActivityType.FLIGHT]: "#3b82f6",
  [ActivityType.ACCOMMODATION]: "#10b981",
  [ActivityType.TRANSPORT]: "#8b5cf6",
  [ActivityType.MEAL]: "#ef4444",
  [ActivityType.ACTIVITY]: "#f59e0b",
  [ActivityType.CUSTOM]: "#6b7280",
  [ActivityType.AI_GENERATED]: "#ec4899",
  default: "#3b82f6",
}

// Route colors per transport mode
const ROUTE_COLORS: Record<TransportMode, string> = {
  [TransportMode.WALKING]: "#22c55e",
  [TransportMode.DRIVING]: "#3b82f6",
  [TransportMode.CYCLING]: "#f59e0b",
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
  height?: number
  showRoute?: boolean
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

function ModeButton({
  mode,
  isActive,
  onPress,
  isLoading,
}: {
  mode: TransportMode
  isActive: boolean
  onPress: () => void
  isLoading: boolean
}) {
  const icons = {
    [TransportMode.WALKING]: Footprints,
    [TransportMode.DRIVING]: Car,
    [TransportMode.CYCLING]: Bike,
  }
  const Icon = icons[mode]

  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      className={`flex-row items-center px-3 py-2 rounded-lg mr-2 ${
        isActive ? "bg-primary" : "bg-secondary"
      }`}
    >
      <Icon size={16} color={isActive ? "#fff" : "#64748b"} />
      <Text
        className={`ml-1.5 text-xs font-medium ${
          isActive ? "text-white" : "text-muted-foreground"
        }`}
      >
        {TRANSPORT_MODE_LABELS[mode]}
      </Text>
    </Pressable>
  )
}

export function ItineraryRouteMap({
  activities,
  height = 300,
  showRoute = true,
  defaultMode = TransportMode.WALKING,
  showModeSelector = true,
  showRouteInfo = true,
}: ItineraryRouteMapProps) {
  const [transportMode, setTransportMode] = useState<TransportMode>(defaultMode)
  const mapRef = useRef<MapView>(null)

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

  // Calculate initial region
  const initialRegion: Region | undefined = useMemo(() => {
    if (activitiesWithCoords.length === 0) return undefined

    const lats = activitiesWithCoords.map((a) => Number.parseFloat(a.locationLat!))
    const lngs = activitiesWithCoords.map((a) => Number.parseFloat(a.locationLng!))

    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    const centerLat = (minLat + maxLat) / 2
    const centerLng = (minLng + maxLng) / 2
    const latDelta = Math.max((maxLat - minLat) * 1.5, 0.02)
    const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.02)

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    }
  }, [activitiesWithCoords])

  // Fit map to show all markers and routes
  const fitToMarkers = () => {
    if (activitiesWithCoords.length > 0 && mapRef.current) {
      const coordinates = activitiesWithCoords.map((a) => ({
        latitude: Number.parseFloat(a.locationLat!),
        longitude: Number.parseFloat(a.locationLng!),
      }))

      // Include route points if available
      const routePoints = routeSegments.flatMap((seg) => seg.path)
      const allPoints = [...coordinates, ...routePoints]

      mapRef.current.fitToCoordinates(allPoints, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      })
    }
  }

  if (activitiesWithCoords.length === 0) {
    return (
      <View
        className="items-center justify-center rounded-xl border border-border bg-secondary/50"
        style={{ height }}
      >
        <MapPin size={32} color="#94a3b8" />
        <Text className="text-muted-foreground text-center mt-2">
          Nenhuma atividade com localização
        </Text>
        <Text className="text-muted-foreground text-xs text-center mt-1">
          Adicione localizações às atividades
        </Text>
      </View>
    )
  }

  return (
    <View className="flex-col">
      {/* Controls bar */}
      {(showModeSelector || showRouteInfo) && (
        <View className="flex-row items-center justify-between mb-2 px-1">
          {/* Transport mode selector */}
          {showModeSelector && (
            <View className="flex-row">
              {Object.values(TransportMode).map((mode) => (
                <ModeButton
                  key={mode}
                  mode={mode}
                  isActive={transportMode === mode}
                  onPress={() => setTransportMode(mode)}
                  isLoading={routesLoading}
                />
              ))}
            </View>
          )}

          {/* Route info */}
          {showRouteInfo && (
            <View className="flex-row items-center">
              {routesLoading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#3b82f6" />
                  <Text className="text-muted-foreground text-xs ml-1">Calculando...</Text>
                </View>
              ) : totalDistance > 0 ? (
                <>
                  <View className="flex-row items-center mr-3">
                    <MapPin size={12} color="#64748b" />
                    <Text className="text-muted-foreground text-xs ml-1">
                      {formatDistance(totalDistance)}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Clock size={12} color="#64748b" />
                    <Text className="text-muted-foreground text-xs ml-1">
                      {formatDuration(totalDuration)}
                    </Text>
                  </View>
                </>
              ) : null}
            </View>
          )}
        </View>
      )}

      {/* Map */}
      <View className="rounded-xl overflow-hidden border border-border" style={{ height }}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={initialRegion}
          onMapReady={fitToMarkers}
          showsUserLocation
          showsMyLocationButton
        >
          {/* Route polylines */}
          {showRoute &&
            routeSegments.map((segment) => (
              <Polyline
                key={`route-${segment.fromActivityId}-${segment.toActivityId}`}
                coordinates={segment.path}
                strokeColor={ROUTE_COLORS[transportMode]}
                strokeWidth={4}
              />
            ))}

          {/* Activity markers */}
          {activitiesWithCoords.map((activity, index) => {
            const coordinate = {
              latitude: Number.parseFloat(activity.locationLat!),
              longitude: Number.parseFloat(activity.locationLng!),
            }
            const color = getActivityColor(activity)

            return (
              <Marker
                key={activity.id}
                coordinate={coordinate}
                pinColor={color}
                title={`${index + 1}. ${activity.title}`}
                description={`${formatTime(activity.startTime)} - ${formatTime(activity.endTime)}${
                  activity.location ? `\n${activity.location}` : ""
                }`}
              />
            )
          })}
        </MapView>
      </View>
    </View>
  )
}
