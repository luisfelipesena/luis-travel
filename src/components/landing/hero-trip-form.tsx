import { useNavigate } from "@tanstack/react-router"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowRight, CalendarIcon, Loader2, MapPin, Plane } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { trpc } from "@/lib/trpc"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "luis_travel_pending_trip"

interface PendingTrip {
  destination: string
  dateRange: { from: string; to: string }
  flightNumber?: string
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

interface HeroTripFormProps {
  isAuthenticated: boolean
}

export function HeroTripForm({ isAuthenticated }: HeroTripFormProps) {
  const navigate = useNavigate()
  const [destination, setDestination] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [flightNumber, setFlightNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasTriggeredAutoCreate = useRef(false)

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
      setDestination(pending.destination)
      setDateRange({
        from: new Date(pending.dateRange.from),
        to: new Date(pending.dateRange.to),
      })
      if (pending.flightNumber) setFlightNumber(pending.flightNumber)
    }
  }, [])

  // Auto-create trip if authenticated and has pending trip (runs once)
  useEffect(() => {
    if (hasTriggeredAutoCreate.current) return

    const pending = getPendingTrip()
    if (isAuthenticated && pending) {
      hasTriggeredAutoCreate.current = true
      createTripMutation.mutate({
        name: `Viagem para ${pending.destination}`,
        destination: pending.destination,
        startDate: pending.dateRange.from,
        endDate: pending.dateRange.to,
      })
    }
  }, [isAuthenticated, createTripMutation])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!destination || !dateRange?.from || !dateRange?.to) return

    setIsSubmitting(true)

    const tripData: PendingTrip = {
      destination,
      dateRange: {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      },
      flightNumber: flightNumber || undefined,
    }

    if (isAuthenticated) {
      createTripMutation.mutate({
        name: `Viagem para ${destination}`,
        destination,
        startDate: tripData.dateRange.from,
        endDate: tripData.dateRange.to,
      })
    } else {
      savePendingTrip(tripData)
      navigate({ to: "/login" })
    }
  }

  const isLoading = isSubmitting || createTripMutation.isPending

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl shadow-xl border p-6 md:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Comece sua viagem agora</h2>
          <p className="text-muted-foreground text-sm">
            Preencha o destino e as datas para criar seu roteiro
          </p>
        </div>

        <div className="space-y-4">
          {/* Destination */}
          <div className="space-y-2">
            <Label htmlFor="destination">Para onde você vai?</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="destination"
                placeholder="Ex: Paris, Tokyo, New York..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Quando?</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
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
                    "Selecione as datas"
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

          {/* Flight Number (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="flight" className="flex items-center gap-2">
              Número do voo <span className="text-muted-foreground text-xs">(opcional)</span>
            </Label>
            <div className="relative">
              <Plane className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="flight"
                placeholder="Ex: LA8084, AA1234..."
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                className="pl-10"
              />
            </div>
            {flightNumber && (
              <p className="text-xs text-muted-foreground">
                Buscaremos informações do voo automaticamente
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!destination || !dateRange?.from || !dateRange?.to || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando viagem...
            </>
          ) : (
            <>
              Começar a Planejar
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        {!isAuthenticated && (
          <p className="text-center text-xs text-muted-foreground">
            Você será redirecionado para criar uma conta ou fazer login
          </p>
        )}
      </div>
    </form>
  )
}
