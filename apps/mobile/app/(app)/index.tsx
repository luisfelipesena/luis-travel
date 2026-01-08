import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Link } from "expo-router"
import { useMemo } from "react"
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { trpc } from "../../src/lib/trpc"

export default function DashboardScreen() {
  const { data: trips, isLoading } = trpc.trip.list.useQuery()

  const ongoingTrip = useMemo(() => {
    if (!trips) return null
    const now = new Date()
    return trips.find((trip) => {
      const start = new Date(trip.startDate)
      const end = new Date(trip.endDate)
      return start <= now && end >= now
    })
  }, [trips])

  const upcomingTrips = trips?.filter((t) => new Date(t.startDate) > new Date())

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4">
        <Text className="text-2xl font-bold text-foreground mt-4 mb-1">Bem-vindo de volta!</Text>
        <Text className="text-muted-foreground mb-6">Planeje sua próxima aventura</Text>

        {/* Stats */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-secondary p-4 rounded-xl">
            <Text className="text-muted-foreground text-sm">Total</Text>
            <Text className="text-2xl font-bold text-foreground">{trips?.length || 0}</Text>
          </View>
          <View className="flex-1 bg-secondary p-4 rounded-xl">
            <Text className="text-muted-foreground text-sm">Próximas</Text>
            <Text className="text-2xl font-bold text-foreground">{upcomingTrips?.length || 0}</Text>
          </View>
        </View>

        {/* Ongoing Trip */}
        {ongoingTrip && (
          <Link href={`/trips/${ongoingTrip.id}`} asChild>
            <Pressable className="bg-primary/10 p-4 rounded-xl mb-6 border border-primary/20">
              <Text className="text-primary font-semibold mb-1">Em andamento</Text>
              <Text className="text-lg font-bold text-foreground">{ongoingTrip.name}</Text>
              <Text className="text-muted-foreground">{ongoingTrip.destination}</Text>
            </Pressable>
          </Link>
        )}

        {/* Upcoming Trips */}
        <Text className="text-lg font-semibold text-foreground mb-3">Próximas Viagens</Text>
        {upcomingTrips?.length === 0 && (
          <Text className="text-muted-foreground mb-4">Nenhuma viagem planejada</Text>
        )}
        {upcomingTrips?.slice(0, 3).map((trip) => (
          <Link key={trip.id} href={`/trips/${trip.id}`} asChild>
            <Pressable className="bg-white border border-border p-4 rounded-xl mb-3">
              <Text className="font-semibold text-foreground">{trip.name}</Text>
              <Text className="text-muted-foreground">{trip.destination}</Text>
              <Text className="text-sm text-muted-foreground mt-1">
                {format(new Date(trip.startDate), "d 'de' MMM", { locale: ptBR })}
              </Text>
            </Pressable>
          </Link>
        ))}

        <Link href="/trips/new" asChild>
          <Pressable className="bg-primary p-4 rounded-xl mt-4 mb-8">
            <Text className="text-white text-center font-semibold">+ Nova Viagem</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </SafeAreaView>
  )
}
