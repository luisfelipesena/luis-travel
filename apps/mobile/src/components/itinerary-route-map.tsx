import { Ionicons } from "@expo/vector-icons"
import { useMemo, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native"
import { WebView } from "react-native-webview"
import { useItineraryRoutes } from "../hooks/use-itinerary-routes"
import {
  type TransportMode,
  formatDistance,
  formatDuration,
  TRANSPORT_MODE_LABELS,
  ROUTE_COLORS,
} from "../lib/routing"

const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  flight: "#3b82f6",
  accommodation: "#10b981",
  transport: "#8b5cf6",
  meal: "#ef4444",
  activity: "#f59e0b",
  custom: "#6b7280",
  ai_generated: "#ec4899",
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

type IconName = "walk-outline" | "car-outline" | "bicycle-outline"
const MODE_ICONS: Record<TransportMode, IconName> = {
  walking: "walk-outline",
  driving: "car-outline",
  cycling: "bicycle-outline",
}

function generateMapHTML(
  activities: ActivityWithLocation[],
  routeSegments: { path: { latitude: number; longitude: number }[] }[],
  routeColor: string
): string {
  const markers = activities
    .filter(
      (a) =>
        a.locationLat &&
        a.locationLng &&
        !Number.isNaN(Number.parseFloat(a.locationLat)) &&
        !Number.isNaN(Number.parseFloat(a.locationLng))
    )
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  if (markers.length === 0) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui; color: #64748b; }
          </style>
        </head>
        <body>
          <p>Nenhuma atividade com localização</p>
        </body>
      </html>
    `
  }

  // Calculate bounds
  const lats = markers.map((m) => Number.parseFloat(m.locationLat!))
  const lngs = markers.map((m) => Number.parseFloat(m.locationLng!))
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const centerLat = (minLat + maxLat) / 2
  const centerLng = (minLng + maxLng) / 2

  // Build markers JS
  const markersJS = markers
    .map((m, i) => {
      const lat = Number.parseFloat(m.locationLat!)
      const lng = Number.parseFloat(m.locationLng!)
      const color = getActivityColor(m)
      const time = formatTime(m.startTime)
      return `
        L.circleMarker([${lat}, ${lng}], {
          radius: 12,
          fillColor: '${color}',
          fillOpacity: 1,
          color: '#fff',
          weight: 2
        }).addTo(map).bindPopup('<strong>${m.title.replace(/'/g, "\\'")}</strong><br>${time}${m.location ? `<br><small>${m.location.replace(/'/g, "\\'")}</small>` : ""}');

        L.marker([${lat}, ${lng}], {
          icon: L.divIcon({
            className: 'number-marker',
            html: '<div style="width:20px;height:20px;display:flex;align-items:center;justify-content:center;background:${color};color:#fff;border-radius:50%;font-size:11px;font-weight:600;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.2)">${i + 1}</div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        }).addTo(map);
      `
    })
    .join("\n")

  // Build route polylines JS
  const routeJS = routeSegments
    .map((seg) => {
      const coords = seg.path.map((p) => `[${p.latitude}, ${p.longitude}]`).join(",")
      return `L.polyline([${coords}], { color: '${routeColor}', weight: 4, opacity: 0.8 }).addTo(map);`
    })
    .join("\n")

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body, #map { width: 100%; height: 100%; }
          .number-marker { background: none !important; border: none !important; }
          .leaflet-popup-content-wrapper { border-radius: 8px; }
          .leaflet-popup-content { margin: 10px 12px; font-family: system-ui; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([${centerLat}, ${centerLng}], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
          }).addTo(map);

          ${routeJS}
          ${markersJS}

          ${markers.length > 1 ? `map.fitBounds([[${minLat}, ${minLng}], [${maxLat}, ${maxLng}]], { padding: [30, 30] });` : ""}
        </script>
      </body>
    </html>
  `
}

export function ItineraryRouteMap({
  activities,
  height = 300,
  showRoute = true,
  defaultMode = "walking",
  showModeSelector = true,
  showRouteInfo = true,
}: ItineraryRouteMapProps) {
  const [transportMode, setTransportMode] = useState<TransportMode>(defaultMode)

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

  const {
    segments: routeSegments,
    totalDistance,
    totalDuration,
    isLoading: routesLoading,
  } = useItineraryRoutes(activitiesWithCoords, transportMode, showRoute)

  const mapHTML = useMemo(
    () => generateMapHTML(activitiesWithCoords, routeSegments, ROUTE_COLORS[transportMode]),
    [activitiesWithCoords, routeSegments, transportMode]
  )

  if (activitiesWithCoords.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height }]}>
        <Ionicons name="map-outline" size={32} color="#94a3b8" />
        <Text style={styles.emptyText}>Nenhuma atividade com localização</Text>
        <Text style={styles.emptySubtext}>
          Adicione localizações às atividades para ver o roteiro
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {(showModeSelector || showRouteInfo) && (
        <View style={styles.controlsBar}>
          {showModeSelector && (
            <View style={styles.modeSelector}>
              {(["walking", "driving", "cycling"] as TransportMode[]).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.modeButton, transportMode === mode && styles.modeButtonActive]}
                  onPress={() => setTransportMode(mode)}
                  disabled={routesLoading}
                >
                  <Ionicons
                    name={MODE_ICONS[mode]}
                    size={16}
                    color={transportMode === mode ? "#fff" : "#64748b"}
                  />
                  <Text
                    style={[
                      styles.modeButtonText,
                      transportMode === mode && styles.modeButtonTextActive,
                    ]}
                  >
                    {TRANSPORT_MODE_LABELS[mode]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {showRouteInfo && (
            <View style={styles.routeInfo}>
              {routesLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#3b82f6" />
                  <Text style={styles.loadingText}>Calculando...</Text>
                </View>
              ) : totalDistance > 0 ? (
                <>
                  <View style={styles.infoItem}>
                    <Ionicons name="location-outline" size={14} color="#64748b" />
                    <Text style={styles.infoText}>{formatDistance(totalDistance)}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="time-outline" size={14} color="#64748b" />
                    <Text style={styles.infoText}>{formatDuration(totalDuration)}</Text>
                  </View>
                </>
              ) : null}
            </View>
          )}
        </View>
      )}

      <View style={[styles.mapContainer, { height }]}>
        <WebView
          source={{ html: mapHTML }}
          style={styles.webview}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={["*"]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  emptySubtext: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  controlsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  modeSelector: {
    flexDirection: "row",
    gap: 4,
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
  },
  modeButtonActive: {
    backgroundColor: "#3b82f6",
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  modeButtonTextActive: {
    color: "#fff",
  },
  routeInfo: {
    flexDirection: "row",
    gap: 12,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  loadingText: {
    fontSize: 12,
    color: "#64748b",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#64748b",
  },
  mapContainer: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
})
