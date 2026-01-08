import { addDays } from "date-fns"
import { router } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { CitySearch, type CitySelection } from "../../../src/components/city-search"
import { DateRangePicker } from "../../../src/components/date-picker"
import { trpc } from "../../../src/lib/trpc"

export default function NewTripScreen() {
  const utils = trpc.useUtils()
  const [name, setName] = useState("")
  const [destination, setDestination] = useState<CitySelection | null>(null)
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(addDays(new Date(), 7))

  const createMutation = trpc.trip.create.useMutation({
    onSuccess: (trip) => {
      utils.trip.list.invalidate()
      router.replace(`/trips/${trip.id}`)
    },
    onError: (error) => {
      Alert.alert("Erro", error.message)
    },
  })

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert("Erro", "Digite o nome da viagem")
      return
    }
    if (!destination) {
      Alert.alert("Erro", "Selecione o destino")
      return
    }
    if (startDate >= endDate) {
      Alert.alert("Erro", "A data de início deve ser anterior à data de fim")
      return
    }

    createMutation.mutate({
      name: name.trim(),
      destination: destination.name,
      startDate,
      endDate,
      // Include coordinates in destinations array
      destinations: [
        {
          name: destination.displayName,
          lat: destination.lat,
          lng: destination.lng,
          order: 0,
          country: destination.country,
          countryCode: destination.countryCode,
        },
      ],
    })
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <Pressable onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={24} color="#0f172a" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Nova Viagem</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Name */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">Nome da Viagem</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: Férias em Paris"
            placeholderTextColor="#94a3b8"
            className="bg-secondary rounded-xl px-4 py-3 text-foreground"
          />
        </View>

        {/* Destination with City Search */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">Destino</Text>
          <CitySearch
            value={destination}
            onChange={setDestination}
            placeholder="Buscar cidade de destino..."
          />
        </View>

        {/* Dates with Date Picker */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-foreground mb-2">Período</Text>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </View>

        {/* Quick Date Options */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-foreground mb-2">Duração Rápida</Text>
          <View className="flex-row flex-wrap gap-2">
            {[
              { label: "1 semana", days: 7 },
              { label: "2 semanas", days: 14 },
              { label: "1 mês", days: 30 },
            ].map((option) => (
              <Pressable
                key={option.days}
                onPress={() => setEndDate(addDays(startDate, option.days))}
                className="bg-primary/10 px-4 py-2 rounded-full"
              >
                <Text className="text-primary text-sm font-medium">{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Create Button */}
      <View className="px-4 py-4 border-t border-border">
        <Pressable
          onPress={handleCreate}
          disabled={createMutation.isPending}
          className="bg-primary py-4 rounded-xl flex-row items-center justify-center"
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">Criar Viagem</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
