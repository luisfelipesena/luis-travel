import { useQueries } from "@tanstack/react-query"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowRight, Clock, Plane } from "lucide-react-native"
import { useMemo } from "react"
import { ActivityIndicator, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { trpc } from "../../src/lib/trpc"

interface Flight {
  id: string
  flightNumber: string
  departureAirport: string
  arrivalAirport: string
  departureTime: Date | string
  arrivalTime: Date | string
  status: string | null
  duration?: string | null
}

export default function FlightsScreen() {
  const { data: trips, isLoading: tripsLoading } = trpc.trip.list.useQuery()
  const utils = trpc.useUtils()

  // Use useQueries to fetch flights for all trips at once
  const tripIds = trips?.map((t) => t.id) || []
  const flightQueries = useQueries({
    queries: tripIds.map((tripId) => ({
      queryKey: ["flight", "listByTrip", { tripId }],
      queryFn: () => utils.flight.listByTrip.fetch({ tripId }),
      enabled: !!trips && tripIds.length > 0,
    })),
  })

  const isLoading = tripsLoading || flightQueries.some((q) => q.isLoading)

  const allFlights = useMemo(() => {
    return flightQueries.flatMap((q) => (q.data as Flight[]) || [])
  }, [flightQueries])

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    )
  }

  const upcomingFlights = allFlights
    .filter((f) => new Date(f.departureTime) > new Date())
    .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())

  const pastFlights = allFlights
    .filter((f) => new Date(f.departureTime) <= new Date())
    .sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime())

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-foreground">Meus Voos</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {!allFlights || allFlights.length === 0 ? (
          <View className="items-center py-8">
            <Plane size={48} color="#94a3b8" />
            <Text className="text-muted-foreground text-center mt-4">Nenhum voo cadastrado</Text>
          </View>
        ) : (
          <>
            {upcomingFlights && upcomingFlights.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-foreground mb-3">Próximos Voos</Text>
                {upcomingFlights.map((flight) => (
                  <FlightCard key={flight.id} flight={flight} />
                ))}
              </View>
            )}

            {pastFlights && pastFlights.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-foreground mb-3">Voos Anteriores</Text>
                {pastFlights.map((flight) => (
                  <FlightCard key={flight.id} flight={flight} isPast />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function FlightCard({ flight, isPast = false }: { flight: Flight; isPast?: boolean }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "#3b82f6"
      case "active":
        return "#22c55e"
      case "landed":
        return "#6b7280"
      case "cancelled":
        return "#ef4444"
      case "delayed":
        return "#f59e0b"
      default:
        return "#64748b"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Agendado"
      case "active":
        return "Em voo"
      case "landed":
        return "Pousado"
      case "cancelled":
        return "Cancelado"
      case "delayed":
        return "Atrasado"
      default:
        return status
    }
  }

  return (
    <View
      className={`bg-white border border-border p-4 rounded-xl mb-3 ${isPast ? "opacity-60" : ""}`}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Plane size={20} color="#3b82f6" />
          <Text className="ml-2 font-semibold text-foreground">{flight.flightNumber}</Text>
        </View>
        <View
          className="px-2 py-1 rounded"
          style={{ backgroundColor: `${getStatusColor(flight.status || "scheduled")}20` }}
        >
          <Text style={{ color: getStatusColor(flight.status || "scheduled") }} className="text-xs font-medium">
            {getStatusLabel(flight.status || "scheduled")}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-foreground">{flight.departureAirport}</Text>
          <Text className="text-sm text-muted-foreground">
            {format(new Date(flight.departureTime), "HH:mm", { locale: ptBR })}
          </Text>
        </View>

        <View className="flex-1 items-center">
          <ArrowRight size={24} color="#94a3b8" />
          <View className="flex-row items-center mt-1">
            <Clock size={12} color="#64748b" />
            <Text className="text-xs text-muted-foreground ml-1">{flight.duration || "---"}</Text>
          </View>
        </View>

        <View className="flex-1 items-end">
          <Text className="text-2xl font-bold text-foreground">{flight.arrivalAirport}</Text>
          <Text className="text-sm text-muted-foreground">
            {format(new Date(flight.arrivalTime), "HH:mm", { locale: ptBR })}
          </Text>
        </View>
      </View>

      <View className="mt-3 pt-3 border-t border-border">
        <Text className="text-sm text-muted-foreground">
          {format(new Date(flight.departureTime), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </Text>
      </View>
    </View>
  )
}
