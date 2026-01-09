import { useNavigate } from "@tanstack/react-router"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowRight, CalendarIcon, ImageIcon, Loader2, MapPin } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
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
 * Fetch image from Wikipedia article by title
 */
async function fetchWikipediaImageByTitle(title: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      {
        headers: {
          "Api-User-Agent": "LuisTravel/1.0 (travel planning app)",
        },
      }
    )

    if (!response.ok) return null

    const data = await response.json()

    if (data.originalimage?.source) {
      return data.originalimage.source
    }
    if (data.thumbnail?.source) {
      return data.thumbnail.source.replace(/\/\d+px-/, "/800px-")
    }
  } catch {
    return null
  }
  return null
}

/**
 * Search Wikipedia for the correct article title
 * Useful when city has disambiguation (e.g., Salvador -> Salvador, Bahia)
 */
async function searchWikipediaForCity(
  cityName: string,
  country?: string
): Promise<string | null> {
  try {
    const searchQuery = country ? `${cityName} ${country} city` : `${cityName} city`
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*&srlimit=5`,
      {
        headers: {
          "Api-User-Agent": "LuisTravel/1.0 (travel planning app)",
        },
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    const results = data.query?.search || []

    // Find first result that looks like a city article
    for (const result of results) {
      const title = result.title as string
      // Skip disambiguation pages and non-city articles
      if (title.includes("disambiguation") || title.includes("(song)") || title.includes("(film)")) {
        continue
      }
      // Prefer articles that contain the city name
      if (title.toLowerCase().includes(cityName.toLowerCase())) {
        return title.replace(/\s+/g, "_")
      }
    }

    // Fallback to first result if none match perfectly
    if (results.length > 0) {
      return (results[0].title as string).replace(/\s+/g, "_")
    }
  } catch {
    return null
  }
  return null
}

/**
 * Fetch city image from Wikipedia API
 * Returns iconic landmark photos from Wikipedia articles
 */
async function fetchWikipediaCityImage(
  cityName: string,
  country?: string
): Promise<string | null> {
  // Build possible Wikipedia article titles to try
  const titlesToTry: string[] = []

  // Format: "City_Name" (most common)
  titlesToTry.push(cityName.replace(/\s+/g, "_"))

  // Format: "City_Name,_Country" or "City_Name,_State"
  if (country) {
    const countryFormatted = country.replace(/\s+/g, "_")
    titlesToTry.push(`${cityName.replace(/\s+/g, "_")},_${countryFormatted}`)
  }

  // Format: "City_Name_(city)" for disambiguation
  titlesToTry.push(`${cityName.replace(/\s+/g, "_")}_(city)`)

  // Try direct title matches first (faster)
  for (const title of titlesToTry) {
    const image = await fetchWikipediaImageByTitle(title)
    if (image) return image
  }

  // Fallback: Use Wikipedia search to find correct article
  const searchTitle = await searchWikipediaForCity(cityName, country)
  if (searchTitle) {
    const image = await fetchWikipediaImageByTitle(searchTitle)
    if (image) return image
  }

  return null
}

/**
 * Hook to fetch Wikipedia city image with caching
 */
function useWikipediaCityImage(city: CitySelection | null) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const cache = useRef<Map<string, string | null>>(new Map())

  const fetchImage = useCallback(async () => {
    if (!city) {
      setImageUrl(null)
      return
    }

    const cacheKey = `${city.name}-${city.country || ""}`

    // Check cache first
    if (cache.current.has(cacheKey)) {
      setImageUrl(cache.current.get(cacheKey) || null)
      return
    }

    setIsLoading(true)

    try {
      const url = await fetchWikipediaCityImage(city.name, city.country)
      cache.current.set(cacheKey, url)
      setImageUrl(url)
    } catch {
      cache.current.set(cacheKey, null)
      setImageUrl(null)
    } finally {
      setIsLoading(false)
    }
  }, [city])

  useEffect(() => {
    fetchImage()
  }, [fetchImage])

  return { imageUrl, isLoading }
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

  // Fetch Wikipedia image for selected city
  const { imageUrl: coverImage, isLoading: isImageLoading } = useWikipediaCityImage(selectedCity)

  const createTripMutation = trpc.trip.create.useMutation({
    onSuccess: (trip) => {
      clearPendingTrip()
      navigate({ to: "/dashboard/trips/$tripId/calendar", params: { tripId: trip.id } })
    },
  })

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

      createTripMutation.mutate({
        name: pending.name || `Viagem para ${pending.destination}`,
        destination: pending.destination,
        coverImage: pending.coverImage,
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
      coverImage: coverImage || undefined,
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
        coverImage: coverImage || undefined,
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
        <div className="absolute -inset-1 rounded-3xl blur-xl opacity-60 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />

        <div className="relative space-y-6 rounded-2xl border bg-card p-6 shadow-xl md:p-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
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
            {selectedCity && (
              <div className="relative overflow-hidden rounded-xl border bg-muted h-36">
                {isImageLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : coverImage ? (
                  <img
                    src={coverImage}
                    alt={`${selectedCity.name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <p className="text-lg font-semibold">{selectedCity.name}</p>
                  {selectedCity.country && (
                    <p className="text-sm opacity-90">{selectedCity.country}</p>
                  )}
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
