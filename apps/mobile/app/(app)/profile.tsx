import { router } from "expo-router"
import { Bell, ChevronRight, HelpCircle, LogOut, Settings, User } from "lucide-react-native"
import { Alert, Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { logout } from "../../src/lib/auth"
import { trpc } from "../../src/lib/trpc"

export default function ProfileScreen() {
  const { data: trips } = trpc.trip.list.useQuery()

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout()
          router.replace("/(auth)/login")
        },
      },
    ])
  }

  const stats = {
    totalTrips: trips?.length || 0,
    upcomingTrips: trips?.filter((t) => new Date(t.startDate) > new Date()).length || 0,
    pastTrips: trips?.filter((t) => new Date(t.endDate) < new Date()).length || 0,
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="items-center py-8 border-b border-border">
          <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-4">
            <User size={48} color="#3b82f6" />
          </View>
          <Text className="text-xl font-semibold text-foreground">Minha Conta</Text>
        </View>

        {/* Stats */}
        <View className="flex-row px-4 py-6 border-b border-border">
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-foreground">{stats.totalTrips}</Text>
            <Text className="text-sm text-muted-foreground">Total</Text>
          </View>
          <View className="flex-1 items-center border-x border-border">
            <Text className="text-2xl font-bold text-primary">{stats.upcomingTrips}</Text>
            <Text className="text-sm text-muted-foreground">Próximas</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-foreground">{stats.pastTrips}</Text>
            <Text className="text-sm text-muted-foreground">Anteriores</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-4 py-4">
          <MenuItem
            icon={<Settings size={22} color="#64748b" />}
            label="Configurações"
            onPress={() => Alert.alert("Em breve", "Funcionalidade em desenvolvimento")}
          />
          <MenuItem
            icon={<Bell size={22} color="#64748b" />}
            label="Notificações"
            onPress={() => Alert.alert("Em breve", "Funcionalidade em desenvolvimento")}
          />
          <MenuItem
            icon={<HelpCircle size={22} color="#64748b" />}
            label="Ajuda e Suporte"
            onPress={() => Alert.alert("Em breve", "Funcionalidade em desenvolvimento")}
          />
        </View>

        {/* Logout */}
        <View className="px-4 py-4">
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center py-4 px-4 bg-red-50 rounded-xl"
          >
            <LogOut size={22} color="#ef4444" />
            <Text className="flex-1 ml-3 text-red-500 font-medium">Sair</Text>
          </Pressable>
        </View>

        {/* Version */}
        <View className="items-center py-8">
          <Text className="text-sm text-muted-foreground">Luis Travel v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode
  label: string
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center py-4 border-b border-border">
      {icon}
      <Text className="flex-1 ml-3 text-foreground">{label}</Text>
      <ChevronRight size={20} color="#94a3b8" />
    </Pressable>
  )
}
