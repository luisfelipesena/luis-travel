import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { LatLngExpression } from "leaflet"
import { GripVertical, Plus, Trash2 } from "lucide-react"
import "leaflet/dist/leaflet.css"
import { useMemo } from "react"
import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet"
import { CitySearchCombobox, type CitySelection } from "@/components/molecules/city-search-combobox"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface Destination extends CitySelection {
  order: number
}

interface DestinationListProps {
  destinations: Destination[]
  onChange: (destinations: Destination[]) => void
  maxDestinations?: number
  showMap?: boolean
  className?: string
}

interface SortableDestinationItemProps {
  destination: Destination
  index: number
  onUpdate: (index: number, city: CitySelection | null) => void
  onRemove: (index: number) => void
  canRemove: boolean
}

function SortableDestinationItem({
  destination,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: SortableDestinationItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `destination-${destination.order}`,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-background p-2",
        isDragging && "ring-2 ring-primary"
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none p-1 text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
        {index + 1}
      </div>

      <div className="flex-1">
        <CitySearchCombobox
          value={destination}
          onChange={(city) => onUpdate(index, city)}
          placeholder={index === 0 ? "Primeira cidade..." : "Próxima cidade..."}
        />
      </div>

      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

export function DestinationList({
  destinations,
  onChange,
  maxDestinations = 10,
  showMap = true,
  className,
}: DestinationListProps) {
  const handleAddDestination = () => {
    if (destinations.length >= maxDestinations) return

    const newOrder = destinations.length > 0 ? Math.max(...destinations.map((d) => d.order)) + 1 : 0

    onChange([
      ...destinations,
      {
        name: "",
        displayName: "",
        lat: 0,
        lng: 0,
        order: newOrder,
      },
    ])
  }

  const handleUpdateDestination = (index: number, city: CitySelection | null) => {
    const updated = [...destinations]
    if (city) {
      updated[index] = {
        ...city,
        order: updated[index].order,
      }
    } else {
      updated[index] = {
        ...updated[index],
        name: "",
        displayName: "",
        lat: 0,
        lng: 0,
      }
    }
    onChange(updated)
  }

  const handleRemoveDestination = (index: number) => {
    const updated = destinations.filter((_, i) => i !== index)
    // Reorder
    updated.forEach((d, i) => {
      d.order = i
    })
    onChange(updated)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = destinations.findIndex((d) => `destination-${d.order}` === active.id)
    const newIndex = destinations.findIndex((d) => `destination-${d.order}` === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const updated = [...destinations]
    const [moved] = updated.splice(oldIndex, 1)
    updated.splice(newIndex, 0, moved)

    // Reorder
    updated.forEach((d, i) => {
      d.order = i
    })

    onChange(updated)
  }

  // Filter valid destinations for map
  const validDestinations = destinations.filter((d) => d.lat !== 0 && d.lng !== 0)

  // Calculate map center and bounds
  const mapCenter: LatLngExpression = useMemo(() => {
    if (validDestinations.length === 0) {
      return [0, 0] as LatLngExpression
    }
    const avgLat = validDestinations.reduce((sum, d) => sum + d.lat, 0) / validDestinations.length
    const avgLng = validDestinations.reduce((sum, d) => sum + d.lng, 0) / validDestinations.length
    return [avgLat, avgLng] as LatLngExpression
  }, [validDestinations])

  const polylinePositions: LatLngExpression[] = useMemo(() => {
    return validDestinations
      .sort((a, b) => a.order - b.order)
      .map((d) => [d.lat, d.lng] as LatLngExpression)
  }, [validDestinations])

  return (
    <div className={cn("space-y-4", className)}>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={destinations.map((d) => `destination-${d.order}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {destinations.map((destination, index) => (
              <SortableDestinationItem
                key={`destination-${destination.order}`}
                destination={destination}
                index={index}
                onUpdate={handleUpdateDestination}
                onRemove={handleRemoveDestination}
                canRemove={destinations.length > 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {destinations.length < maxDestinations && (
        <Button type="button" variant="outline" className="w-full" onClick={handleAddDestination}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar cidade
        </Button>
      )}

      {showMap && validDestinations.length > 0 && (
        <div className="h-[200px] overflow-hidden rounded-lg border">
          <MapContainer
            center={mapCenter}
            zoom={validDestinations.length === 1 ? 10 : 4}
            className="h-full w-full"
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {validDestinations.map((destination, index) => (
              <Marker
                key={`marker-${destination.order}`}
                position={[destination.lat, destination.lng]}
                title={`${index + 1}. ${destination.name}`}
              />
            ))}

            {polylinePositions.length > 1 && (
              <Polyline
                positions={polylinePositions}
                color="#3b82f6"
                weight={3}
                dashArray="10, 5"
              />
            )}
          </MapContainer>
        </div>
      )}
    </div>
  )
}
