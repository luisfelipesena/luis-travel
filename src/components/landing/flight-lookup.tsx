import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowRight, Check, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { trpc } from "@/lib/trpc"
import { cn } from "@/lib/utils"

interface FlightLookupProps {
  flightNumber: string
  onFlightFound?: (flight: {
    flightNumber: string
    departure: { iata: string; scheduled: string }
    arrival: { iata: string; scheduled: string }
  }) => void
}

export function FlightLookup({ flightNumber, onFlightFound }: FlightLookupProps) {
  const [debouncedNumber, setDebouncedNumber] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      if (flightNumber.length >= 3) {
        setDebouncedNumber(flightNumber)
      } else {
        setDebouncedNumber("")
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [flightNumber])

  const {
    data: flight,
    isLoading,
    isError,
  } = trpc.flight.search.useQuery(
    { flightNumber: debouncedNumber },
    {
      enabled: debouncedNumber.length >= 3,
      retry: false,
    }
  )

  useEffect(() => {
    if (flight && onFlightFound) {
      onFlightFound({
        flightNumber: flight.flightNumber,
        departure: {
          iata: flight.departure.iata,
          scheduled: flight.departure.scheduled,
        },
        arrival: {
          iata: flight.arrival.iata,
          scheduled: flight.arrival.scheduled,
        },
      })
    }
  }, [flight, onFlightFound])

  if (!debouncedNumber) return null

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
        <Loader2 className="h-4 w-4 animate-spin" />
        Buscando voo...
      </div>
    )
  }

  if (isError || !flight) {
    return <div className="text-sm text-muted-foreground">Voo não encontrado</div>
  }

  const departureDate = new Date(flight.departure.scheduled)

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg text-sm",
        "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
      )}
    >
      <Check className="h-4 w-4 text-green-600 shrink-0" />
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <span className="font-medium">{flight.airline}</span>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>{flight.departure.iata}</span>
          <ArrowRight className="h-3 w-3" />
          <span>{flight.arrival.iata}</span>
        </div>
        <span className="text-muted-foreground">
          {format(departureDate, "dd MMM HH:mm", { locale: ptBR })}
        </span>
      </div>
    </div>
  )
}
