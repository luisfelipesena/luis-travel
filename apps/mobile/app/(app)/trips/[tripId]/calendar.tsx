import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { format, addDays, isSameDay, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState, useMemo } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react-native"
import { trpc } from "../../../../src/lib/trpc"

export default function TripCalendarScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>()
  const [selectedDate, setSelectedDate] = useState(new Date())

  const { data: trip, isLoading: tripLoading } = trpc.trip.byId.useQuery({ id: tripId })
  const { data: activities, isLoading: activitiesLoading } = trpc.activity.listByTrip.useQuery(
    { tripId },
    { enabled: !!trip }
  )

  const tripDays = useMemo(() => {
    if (!trip) return []
    const days = []
    let current = startOfDay(new Date(trip.startDate))
    const end = startOfDay(new Date(trip.endDate))
    while (current <= end) {
      days.push(new Date(current))
      current = addDays(current, 1)
    }
    return days
  }, [trip])

  const dayActivities = useMemo(() => {
    if (!activities) return []
    return activities.filter((a) =>
      isSameDay(new Date(a.startTime), selectedDate)
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }, [activities, selectedDate])

  if (tripLoading || !trip) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <Pressable onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={24} color="#0f172a" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground flex-1">
          Calendário - {trip.name}
        </Text>
      </View>

      {/* Days Scroll */}
      <View className="border-b border-border">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-2 py-3"
        >
          {tripDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate)
            const isToday = isSameDay(day, new Date())
            return (
              <Pressable
                key={day.toISOString()}
                onPress={() => setSelectedDate(day)}
                className={`px-4 py-2 mx-1 rounded-xl items-center ${
                  isSelected ? "bg-primary" : isToday ? "bg-primary/10" : "bg-secondary"
                }`}
              >
                <Text
                  className={`text-xs ${
                    isSelected ? "text-white" : "text-muted-foreground"
                  }`}
                >
                  {format(day, "EEE", { locale: ptBR })}
                </Text>
                <Text
                  className={`text-lg font-bold ${
                    isSelected ? "text-white" : "text-foreground"
                  }`}
                >
                  {format(day, "d")}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {/* Selected Date Header */}
      <View className="px-4 py-3 flex-row items-center justify-between">
        <Pressable
          onPress={() => setSelectedDate((d) => addDays(d, -1))}
          disabled={isSameDay(selectedDate, tripDays[0])}
        >
          <ChevronLeft size={24} color="#64748b" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">
          {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </Text>
        <Pressable
          onPress={() => setSelectedDate((d) => addDays(d, 1))}
          disabled={isSameDay(selectedDate, tripDays[tripDays.length - 1])}
        >
          <ChevronRight size={24} color="#64748b" />
        </Pressable>
      </View>

      {/* Activities List */}
      <ScrollView className="flex-1 px-4">
        {activitiesLoading && (
          <ActivityIndicator size="small" color="#3b82f6" className="my-4" />
        )}

        {dayActivities.length === 0 && !activitiesLoading && (
          <View className="items-center py-8">
            <Text className="text-muted-foreground text-center">
              Nenhuma atividade neste dia
            </Text>
          </View>
        )}

        {dayActivities.map((activity) => (
          <View
            key={activity.id}
            className="bg-white border border-border p-4 rounded-xl mb-3"
          >
            <View className="flex-row items-start">
              <View className="bg-primary/10 px-2 py-1 rounded mr-3">
                <Text className="text-primary text-sm font-medium">
                  {format(new Date(activity.startTime), "HH:mm")}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">{activity.title}</Text>
                {activity.description && (
                  <Text className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </Text>
                )}
                {activity.location && (
                  <View className="flex-row items-center mt-2">
                    <MapPin size={14} color="#64748b" />
                    <Text className="text-sm text-muted-foreground ml-1">
                      {activity.location}
                    </Text>
                  </View>
                )}
                <Text className="text-xs text-muted-foreground mt-2">
                  {format(new Date(activity.startTime), "HH:mm")} -{" "}
                  {format(new Date(activity.endTime), "HH:mm")}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}
