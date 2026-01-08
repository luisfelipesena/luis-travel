import { View, Text, ScrollView, Pressable, ActivityIndicator, TextInput } from "react-native"
import { Link } from "expo-router"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState, useMemo } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { Search, Plus } from "lucide-react-native"
import { trpc } from "../../../src/lib/trpc"

export default function TripsScreen() {
  const { data: trips, isLoading } = trpc.trip.list.useQuery()
  const [search, setSearch] = useState("")

  const filteredTrips = useMemo(() => {
    if (!trips) return []
    if (!search) return trips
    return trips.filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.destination.toLowerCase().includes(search.toLowerCase())
    )
  }, [trips, search])

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-foreground">Minhas Viagens</Text>
          <Link href="/trips/new" asChild>
            <Pressable className="bg-primary p-2 rounded-lg">
              <Plus size={24} color="white" />
            </Pressable>
          </Link>
        </View>

        <View className="flex-row items-center bg-secondary rounded-xl px-3 py-2 mb-4">
          <Search size={20} color="#64748b" />
          <TextInput
            placeholder="Buscar viagens..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 text-foreground"
            placeholderTextColor="#64748b"
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {filteredTrips.length === 0 && (
          <View className="items-center py-8">
            <Text className="text-muted-foreground text-center">
              {search ? "Nenhuma viagem encontrada" : "Nenhuma viagem criada"}
            </Text>
          </View>
        )}

        {filteredTrips.map((trip) => (
          <Link key={trip.id} href={`/trips/${trip.id}`} asChild>
            <Pressable className="bg-white border border-border p-4 rounded-xl mb-3">
              <Text className="font-semibold text-foreground text-lg">{trip.name}</Text>
              <Text className="text-muted-foreground">{trip.destination}</Text>
              <View className="flex-row mt-2">
                <Text className="text-sm text-muted-foreground">
                  {format(new Date(trip.startDate), "d MMM", { locale: ptBR })} -{" "}
                  {format(new Date(trip.endDate), "d MMM, yyyy", { locale: ptBR })}
                </Text>
              </View>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}
