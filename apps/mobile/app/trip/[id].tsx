import { Ionicons } from "@expo/vector-icons"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useState } from "react"
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { ItineraryRouteMap } from "@/src/components/itinerary-route-map"
import { trpc } from "@/src/lib/trpc"

type TabType = "overview" | "routes" | "activities"

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("overview")

  const {
    data: trip,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = trpc.trip.byId.useQuery({ id: id! }, { enabled: !!id })

  const { data: activities } = trpc.activity.listByTrip.useQuery(
    { tripId: id! },
    { enabled: !!id && !!trip }
  )

  const { data: flights } = trpc.flight.listByTrip.useQuery(
    { tripId: id! },
    { enabled: !!id && !!trip }
  )

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    )
  }

  if (isError || !trip) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#94a3b8" />
        <Text style={styles.errorText}>Viagem não encontrada</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const isUpcoming = new Date(trip.startDate) > new Date()
  const isOngoing = new Date(trip.startDate) <= new Date() && new Date(trip.endDate) >= new Date()

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {trip.name}
            </Text>
            {isOngoing && (
              <View style={[styles.badge, styles.badgeGreen]}>
                <Text style={styles.badgeText}>Em andamento</Text>
              </View>
            )}
            {isUpcoming && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Próxima</Text>
              </View>
            )}
          </View>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color="#64748b" />
              <Text style={styles.metaText}>{trip.destination}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color="#64748b" />
              <Text style={styles.metaText}>
                {format(new Date(trip.startDate), "d MMM", { locale: ptBR })} -{" "}
                {format(new Date(trip.endDate), "d MMM, yyyy", { locale: ptBR })}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(["overview", "routes", "activities"] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === "overview" ? "Visão Geral" : tab === "routes" ? "Rotas" : "Atividades"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "overview" && (
          <>
            {trip.description && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Sobre esta viagem</Text>
                <Text style={styles.cardDescription}>{trip.description}</Text>
              </View>
            )}

            {/* Quick Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="calendar" size={24} color="#3b82f6" />
                <Text style={styles.statValue}>{activities?.length || 0}</Text>
                <Text style={styles.statLabel}>Atividades</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="airplane" size={24} color="#3b82f6" />
                <Text style={styles.statValue}>{flights?.length || 0}</Text>
                <Text style={styles.statLabel}>Voos</Text>
              </View>
            </View>

            {/* Map Preview */}
            {activities && activities.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Mapa do Roteiro</Text>
                  <TouchableOpacity onPress={() => setActiveTab("routes")}>
                    <Text style={styles.seeAllText}>Ver detalhes</Text>
                  </TouchableOpacity>
                </View>
                <ItineraryRouteMap
                  activities={activities}
                  height={200}
                  showModeSelector={false}
                  showRouteInfo={false}
                />
              </View>
            )}

            {/* Recent Activities */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Próximas Atividades</Text>
                {activities && activities.length > 0 && (
                  <TouchableOpacity onPress={() => setActiveTab("activities")}>
                    <Text style={styles.seeAllText}>Ver todas</Text>
                  </TouchableOpacity>
                )}
              </View>
              {!activities || activities.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={32} color="#cbd5e1" />
                  <Text style={styles.emptyText}>Nenhuma atividade ainda</Text>
                </View>
              ) : (
                activities.slice(0, 3).map((activity) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <View style={styles.activityDot} />
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityTime}>
                        {format(new Date(activity.startTime), "d MMM, HH:mm", { locale: ptBR })}
                      </Text>
                    </View>
                    {activity.location && (
                      <View style={styles.activityLocation}>
                        <Ionicons name="location-outline" size={12} color="#94a3b8" />
                        <Text style={styles.locationText} numberOfLines={1}>
                          {activity.location}
                        </Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>

            {/* Flights */}
            {flights && flights.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Voos</Text>
                {flights.map((flight) => (
                  <View key={flight.id} style={styles.flightItem}>
                    <Ionicons name="airplane" size={20} color="#3b82f6" />
                    <View style={styles.flightContent}>
                      <Text style={styles.flightNumber}>{flight.flightNumber}</Text>
                      <Text style={styles.flightRoute}>
                        {flight.departureAirport} → {flight.arrivalAirport}
                      </Text>
                    </View>
                    <Text style={styles.flightTime}>
                      {format(new Date(flight.departureTime), "d MMM, HH:mm", { locale: ptBR })}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {activeTab === "routes" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Itinerário no Mapa</Text>
            <Text style={styles.cardDescription}>
              Visualize o percurso das suas atividades dia a dia
            </Text>
            {activities && activities.length > 0 ? (
              <ItineraryRouteMap activities={activities} height={400} />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="map-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>Nenhuma atividade com localização</Text>
                <Text style={styles.emptySubtext}>
                  Adicione atividades com localização para ver o roteiro
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "activities" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Todas as Atividades</Text>
            {!activities || activities.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>Nenhuma atividade</Text>
              </View>
            ) : (
              activities.map((activity) => (
                <View key={activity.id} style={styles.activityItemFull}>
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityType}>{activity.type}</Text>
                  </View>
                  <View style={styles.activityMeta}>
                    <View style={styles.activityMetaItem}>
                      <Ionicons name="time-outline" size={14} color="#64748b" />
                      <Text style={styles.activityMetaText}>
                        {format(new Date(activity.startTime), "d MMM, HH:mm", { locale: ptBR })} -{" "}
                        {format(new Date(activity.endTime), "HH:mm")}
                      </Text>
                    </View>
                    {activity.location && (
                      <View style={styles.activityMetaItem}>
                        <Ionicons name="location-outline" size={14} color="#64748b" />
                        <Text style={styles.activityMetaText} numberOfLines={1}>
                          {activity.location}
                        </Text>
                      </View>
                    )}
                  </View>
                  {activity.description && (
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#64748b",
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
  },
  badge: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeGreen: {
    backgroundColor: "#22c55e",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#64748b",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#3b82f6",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  tabTextActive: {
    color: "#3b82f6",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  cardDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  seeAllText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
  },
  emptySubtext: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3b82f6",
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
  },
  activityTime: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  activityLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: 120,
  },
  locationText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  activityItemFull: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 8,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityType: {
    fontSize: 10,
    color: "#64748b",
    textTransform: "uppercase",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activityMeta: {
    flexDirection: "row",
    gap: 16,
  },
  activityMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  activityMetaText: {
    fontSize: 12,
    color: "#64748b",
  },
  activityDescription: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
  },
  flightItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 12,
  },
  flightContent: {
    flex: 1,
  },
  flightNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  flightRoute: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  flightTime: {
    fontSize: 12,
    color: "#64748b",
  },
})
