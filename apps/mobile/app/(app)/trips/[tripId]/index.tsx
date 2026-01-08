import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Link, router, useLocalSearchParams } from "expo-router"
import { Calendar, ChevronLeft, MapPin, Plane, Users, Clock, Navigation } from "lucide-react-native"
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { ItineraryRouteMap } from "../../../../src/components/map/itinerary-route-map"
import { formatDistance, formatDuration } from "../../../../src/lib/routing"
import { useItineraryRoutes } from "../../../../src/hooks/use-itinerary-routes"
import { trpc } from "../../../../src/lib/trpc"

export default function TripDetailScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>()

  const { data: trip, isLoading } = trpc.trip.byId.useQuery({ id: tripId })
  const { data: activities } = trpc.activity.listByTrip.useQuery({ tripId }, { enabled: !!trip })
  const { data: flights } = trpc.flight.listByTrip.useQuery({ tripId }, { enabled: !!trip })

  // Get route info for all activities
  const { totalDistance, totalDuration } = useItineraryRoutes(activities || [], "walking", !!activities?.length)

  if (isLoading || !trip) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    )
  }

  const activitiesWithLocation = activities?.filter(
    (a) => a.locationLat && a.locationLng
  ) || []

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <Pressable onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={24} color="#0f172a" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground">{trip.name}</Text>
          <Text className="text-sm text-muted-foreground">{trip.destination}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Date Range */}
        <View className="flex-row items-center mt-4 mb-4">
          <Calendar size={20} color="#64748b" />
          <Text className="ml-2 text-muted-foreground">
            {format(new Date(trip.startDate), "d 'de' MMMM", { locale: ptBR })} -{" "}
            {format(new Date(trip.endDate), "d 'de' MMMM, yyyy", { locale: ptBR })}
          </Text>
        </View>

        {/* Itinerary Map */}
        {activitiesWithLocation.length > 0 && (
          <View className="mb-4">
            <Text className="text-lg font-semibold text-foreground mb-2">Roteiro no Mapa</Text>
            <ItineraryRouteMap
              activities={activitiesWithLocation}
              height={250}
              showModeSelector={true}
              showRouteInfo={true}
            />
          </View>
        )}

        {/* Stats */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-secondary p-4 rounded-xl flex-row items-center">
            <MapPin size={20} color="#3b82f6" />
            <View className="ml-3">
              <Text className="text-2xl font-bold text-foreground">{activities?.length || 0}</Text>
              <Text className="text-sm text-muted-foreground">Atividades</Text>
            </View>
          </View>
          <View className="flex-1 bg-secondary p-4 rounded-xl flex-row items-center">
            <Plane size={20} color="#3b82f6" />
            <View className="ml-3">
              <Text className="text-2xl font-bold text-foreground">{flights?.length || 0}</Text>
              <Text className="text-sm text-muted-foreground">Voos</Text>
            </View>
          </View>
          <View className="flex-1 bg-secondary p-4 rounded-xl flex-row items-center">
            <Users size={20} color="#3b82f6" />
            <View className="ml-3">
              <Text className="text-2xl font-bold text-foreground">
                {trip.members?.length || 1}
              </Text>
              <Text className="text-sm text-muted-foreground">Membros</Text>
            </View>
          </View>
        </View>

        {/* Route Summary */}
        {totalDistance > 0 && (
          <View className="bg-secondary p-4 rounded-xl mb-6">
            <Text className="text-sm font-medium text-foreground mb-2">Resumo do Roteiro</Text>
            <View className="flex-row">
              <View className="flex-1 flex-row items-center">
                <Navigation size={16} color="#64748b" />
                <Text className="ml-2 text-muted-foreground">{formatDistance(totalDistance)}</Text>
              </View>
              <View className="flex-1 flex-row items-center">
                <Clock size={16} color="#64748b" />
                <Text className="ml-2 text-muted-foreground">{formatDuration(totalDuration)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Activities Preview */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-foreground">Atividades</Text>
            <Link href={`/trips/${tripId}/calendar`} asChild>
              <Pressable>
                <Text className="text-primary">Ver calendário</Text>
              </Pressable>
            </Link>
          </View>
          {activities?.length === 0 && (
            <Text className="text-muted-foreground">Nenhuma atividade planejada</Text>
          )}
          {activities?.slice(0, 5).map((activity, index) => (
            <View key={activity.id} className="bg-white border border-border p-3 rounded-xl mb-2">
              <View className="flex-row items-start">
                <View
                  className="w-6 h-6 rounded-full items-center justify-center mr-2"
                  style={{ backgroundColor: activity.color || "#3b82f6" }}
                >
                  <Text className="text-white text-xs font-bold">{index + 1}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-foreground">{activity.title}</Text>
                  <Text className="text-sm text-muted-foreground">
                    {format(new Date(activity.startTime), "d MMM, HH:mm", { locale: ptBR })}
                  </Text>
                  {activity.location && (
                    <View className="flex-row items-center mt-1">
                      <MapPin size={14} color="#64748b" />
                      <Text className="text-sm text-muted-foreground ml-1">{activity.location}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Flights Preview */}
        {flights && flights.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">Voos</Text>
            {flights.map((flight) => (
              <View key={flight.id} className="bg-white border border-border p-3 rounded-xl mb-2">
                <Text className="font-medium text-foreground">{flight.flightNumber}</Text>
                <Text className="text-sm text-muted-foreground">
                  {flight.departureAirport} → {flight.arrivalAirport}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {format(new Date(flight.departureTime), "d MMM, HH:mm", {
                    locale: ptBR,
                  })}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Button */}
        <Link href={`/trips/${tripId}/calendar`} asChild>
          <Pressable className="bg-primary p-4 rounded-xl mb-8">
            <Text className="text-white text-center font-semibold">Abrir Calendário</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </SafeAreaView>
  )
}
