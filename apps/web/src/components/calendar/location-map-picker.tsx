import type { LatLngExpression, LeafletMouseEvent } from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapPin } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LocationMapPickerProps {
  location?: string
  lat?: string
  lng?: string
  onLocationChange: (location: string | undefined) => void
  onCoordsChange: (lat: string | undefined, lng: string | undefined) => void
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e: LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export function LocationMapPicker({
  location,
  lat,
  lng,
  onLocationChange,
  onCoordsChange,
}: LocationMapPickerProps) {
  const [mapKey, setMapKey] = useState(0)
  const hasCoords = lat && lng

  const center: LatLngExpression = useMemo(() => {
    if (hasCoords) {
      return [Number.parseFloat(lat), Number.parseFloat(lng)]
    }
    // Default to a central location (São Paulo, Brazil)
    return [-23.5505, -46.6333]
  }, [lat, lng, hasCoords])

  const markerPosition: LatLngExpression | null = useMemo(() => {
    if (hasCoords) {
      return [Number.parseFloat(lat), Number.parseFloat(lng)]
    }
    return null
  }, [lat, lng, hasCoords])

  // Force map re-render when center changes significantly
  useEffect(() => {
    setMapKey((prev) => prev + 1)
  }, [])

  const handleMapClick = async (clickLat: number, clickLng: number) => {
    onCoordsChange(clickLat.toString(), clickLng.toString())

    // Reverse geocode to get address
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickLat}&lon=${clickLng}`
      )
      const data = await response.json()
      if (data.display_name) {
        // Extract a shorter address
        const parts = data.display_name.split(", ")
        const shortAddress = parts.slice(0, 3).join(", ")
        onLocationChange(shortAddress)
      }
    } catch {
      // If geocoding fails, just use coordinates
      onLocationChange(`${clickLat.toFixed(6)}, ${clickLng.toFixed(6)}`)
    }
  }

  const handleLocationInputChange = (value: string) => {
    onLocationChange(value || undefined)
  }

  const handleClearLocation = () => {
    onLocationChange(undefined)
    onCoordsChange(undefined, undefined)
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="location">Localização</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="location"
            placeholder="Nome do local ou endereço"
            value={location || ""}
            onChange={(e) => handleLocationInputChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="relative h-[200px] w-full overflow-hidden rounded-lg border">
        <MapContainer
          key={mapKey}
          center={center}
          zoom={hasCoords ? 15 : 4}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {markerPosition && <Marker position={markerPosition} />}
        </MapContainer>

        {/* Instructions overlay */}
        {!hasCoords && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
            <span className="rounded-md bg-background/90 px-3 py-1.5 text-sm font-medium">
              Clique no mapa para marcar
            </span>
          </div>
        )}
      </div>

      {hasCoords && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {Number.parseFloat(lat).toFixed(6)}, {Number.parseFloat(lng).toFixed(6)}
          </p>
          <button
            type="button"
            onClick={handleClearLocation}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            Limpar
          </button>
        </div>
      )}
    </div>
  )
}
