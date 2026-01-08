import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Check, MapPin, Users, X } from "lucide-react-native"
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { trpc } from "../../src/lib/trpc"

export default function InvitationsScreen() {
  const utils = trpc.useUtils()
  const { data: invitations, isLoading } = trpc.invitation.myPendingInvitations.useQuery()

  const acceptMutation = trpc.invitation.accept.useMutation({
    onSuccess: () => {
      utils.invitation.myPendingInvitations.invalidate()
      utils.trip.list.invalidate()
    },
    onError: (error) => {
      Alert.alert("Erro", error.message)
    },
  })

  const declineMutation = trpc.invitation.decline.useMutation({
    onSuccess: () => {
      utils.invitation.myPendingInvitations.invalidate()
    },
    onError: (error) => {
      Alert.alert("Erro", error.message)
    },
  })

  const handleAccept = (token: string) => {
    Alert.alert("Aceitar Convite", "Deseja aceitar este convite?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Aceitar",
        onPress: () => acceptMutation.mutate({ token }),
      },
    ])
  }

  const handleDecline = (id: string) => {
    Alert.alert("Recusar Convite", "Deseja recusar este convite?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Recusar",
        style: "destructive",
        onPress: () => declineMutation.mutate({ id }),
      },
    ])
  }

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
        <Text className="text-2xl font-bold text-foreground">Convites</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {!invitations || invitations.length === 0 ? (
          <View className="items-center py-8">
            <Users size={48} color="#94a3b8" />
            <Text className="text-muted-foreground text-center mt-4">Nenhum convite pendente</Text>
          </View>
        ) : (
          invitations.map((invitation) => (
            <View key={invitation.id} className="bg-white border border-border p-4 rounded-xl mb-3">
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <Text className="font-semibold text-foreground text-lg">
                    {invitation.trip.name}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <MapPin size={14} color="#64748b" />
                    <Text className="text-muted-foreground ml-1">
                      {invitation.trip.destination}
                    </Text>
                  </View>
                </View>
                <View className="bg-primary/10 px-2 py-1 rounded">
                  <Text className="text-primary text-xs font-medium">
                    {getRoleLabel(invitation.role)}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center mb-3">
                <Calendar size={14} color="#64748b" />
                <Text className="text-sm text-muted-foreground ml-1">
                  {format(new Date(invitation.trip.startDate), "d MMM", { locale: ptBR })} -{" "}
                  {format(new Date(invitation.trip.endDate), "d MMM, yyyy", { locale: ptBR })}
                </Text>
              </View>

              <Text className="text-sm text-muted-foreground mb-4">
                Convidado por{" "}
                <Text className="font-medium text-foreground">
                  {invitation.inviter.name || invitation.inviter.email}
                </Text>
              </Text>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => handleDecline(invitation.id)}
                  disabled={declineMutation.isPending}
                  className="flex-1 flex-row items-center justify-center bg-secondary py-3 rounded-xl"
                >
                  <X size={18} color="#64748b" />
                  <Text className="text-muted-foreground font-medium ml-2">Recusar</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleAccept(invitation.token)}
                  disabled={acceptMutation.isPending}
                  className="flex-1 flex-row items-center justify-center bg-primary py-3 rounded-xl"
                >
                  <Check size={18} color="white" />
                  <Text className="text-white font-medium ml-2">Aceitar</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function getRoleLabel(role: string) {
  switch (role) {
    case "editor":
      return "Editor"
    case "viewer":
      return "Visualizador"
    default:
      return role
  }
}
