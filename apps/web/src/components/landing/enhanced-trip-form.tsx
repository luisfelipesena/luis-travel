import { useNavigate } from "@tanstack/react-router"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowRight, CalendarIcon, Loader2, MapPin, Sparkles } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import type { DateRange } from "react-day-picker"
import { CitySearchCombobox, type CitySelection } from "@/components/molecules/city-search-combobox"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { trpc } from "@/lib/trpc"
import { cn } from "@/lib/utils"

/**
 * Generate destination image URL using Unsplash Source
 * This creates a high-quality travel image for any destination
 */
function getDestinationImageUrl(cityName: string, country?: string): string {
  const searchTerms = [cityName, country, "travel", "landmark", "tourism"]
    .filter(Boolean)
    .map((term) => encodeURIComponent(term!.toLowerCase()))
    .join(",")

  return `https://source.unsplash.com/featured/800x600/?${searchTerms}`
}

const STORAGE_KEY = "luis_travel_pending_trip"

interface PendingTrip {
  name: string
  coverImage?: string
  destination: string
  destinationData?: CitySelection
  dateRange: { from: string; to: string }
}

export function savePendingTrip(trip: PendingTrip) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trip))
}

export function getPendingTrip(): PendingTrip | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function clearPendingTrip() {
  localStorage.removeItem(STORAGE_KEY)
}

interface EnhancedTripFormProps {
  isAuthenticated: boolean
}

export function EnhancedTripForm({ isAuthenticated }: EnhancedTripFormProps) {
  const navigate = useNavigate()
  const [tripName, setTripName] = useState("")
  const [selectedCity, setSelectedCity] = useState<CitySelection | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasTriggeredAutoCreate = useRef(false)

  const createTripMutation = trpc.trip.create.useMutation({
    onSuccess: (trip) => {
      clearPendingTrip()
      navigate({ to: "/dashboard/trips/$tripId/calendar", params: { tripId: trip.id } })
    },
  })

  // Auto-generate cover image URL based on selected city
  const coverImage = useMemo(() => {
    if (!selectedCity) return undefined
    return getDestinationImageUrl(selectedCity.name, selectedCity.country)
  }, [selectedCity])

  // Restore pending trip on load
  useEffect(() => {
    const pending = getPendingTrip()
    if (pending) {
      setTripName(pending.name)
      if (pending.destinationData) setSelectedCity(pending.destinationData)
      setDateRange({
        from: new Date(pending.dateRange.from),
        to: new Date(pending.dateRange.to),
      })
    }
  }, [])

  // Auto-create trip if authenticated and has pending trip
  useEffect(() => {
    if (hasTriggeredAutoCreate.current) return

    const pending = getPendingTrip()
    if (isAuthenticated && pending) {
      hasTriggeredAutoCreate.current = true

      const destinationData = pending.destinationData
      // Generate cover image from destination
      const autoCoverImage = destinationData
        ? getDestinationImageUrl(destinationData.name, destinationData.country)
        : undefined

      createTripMutation.mutate({
        name: pending.name || `Viagem para ${pending.destination}`,
        destination: pending.destination,
        coverImage: autoCoverImage,
        destinations: destinationData
          ? [
              {
                name: destinationData.name,
                lat: destinationData.lat,
                lng: destinationData.lng,
                order: 0,
                country: destinationData.country,
                countryCode: destinationData.countryCode,
              },
            ]
          : undefined,
        startDate: new Date(pending.dateRange.from),
        endDate: new Date(pending.dateRange.to),
      })
    }
  }, [isAuthenticated, createTripMutation])

  const destination = selectedCity
    ? `${selectedCity.name}${selectedCity.country ? `, ${selectedCity.country}` : ""}`
    : ""

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCity || !dateRange?.from || !dateRange?.to) return

    setIsSubmitting(true)

    const name = tripName.trim() || `Viagem para ${destination}`

    const tripData: PendingTrip = {
      name,
      coverImage,
      destination,
      destinationData: selectedCity,
      dateRange: {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      },
    }

    if (isAuthenticated) {
      createTripMutation.mutate({
        name,
        destination,
        coverImage,
        destinations: [
          {
            name: selectedCity.name,
            lat: selectedCity.lat,
            lng: selectedCity.lng,
            order: 0,
            country: selectedCity.country,
            countryCode: selectedCity.countryCode,
          },
        ],
        startDate: new Date(tripData.dateRange.from),
        endDate: new Date(tripData.dateRange.to),
      })
    } else {
      savePendingTrip(tripData)
      window.location.href = "/auth/sign-in"
    }
  }

  const isLoading = isSubmitting || createTripMutation.isPending
  const isValid = selectedCity && dateRange?.from && dateRange?.to

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-xl opacity-70" />

        <div className="relative space-y-6 rounded-2xl border bg-card p-6 shadow-2xl md:p-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Planeje sua viagem</h2>
              <p className="text-sm text-muted-foreground">
                Preencha os dados e comece a organizar
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Trip Name */}
            <div className="space-y-2">
              <Label htmlFor="trip-name">Nome da viagem</Label>
              <Input
                id="trip-name"
                placeholder="Ex: Férias de Verão 2025"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Para onde você vai?
              </Label>
              <CitySearchCombobox
                value={selectedCity}
                onChange={setSelectedCity}
                placeholder="Buscar cidade..."
              />
            </div>

            {/* Destination Preview Image - shows when city is selected */}
            {coverImage && (
              <div className="relative overflow-hidden rounded-xl border">
                <img
                  src={coverImage}
                  alt={`Preview de ${selectedCity?.name}`}
                  className="w-full h-32 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-3 text-white text-sm font-medium">
                  {destination}
                </div>
              </div>
            )}

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                Quando?
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd MMM", { locale: ptBR })} -{" "}
                          {format(dateRange.to, "dd MMM yyyy", { locale: ptBR })}
                        </>
                      ) : (
                        format(dateRange.from, "dd MMM yyyy", { locale: ptBR })
                      )
                    ) : (
                      "Selecione as datas da viagem"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={ptBR}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25"
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Criando viagem...
              </>
            ) : (
              <>
                Começar a Planejar
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          {!isAuthenticated && (
            <p className="text-center text-xs text-muted-foreground">
              Você será redirecionado para criar uma conta ou fazer login
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
