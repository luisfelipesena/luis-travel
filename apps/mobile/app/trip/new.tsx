import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useRouter } from "expo-router"
import { useMemo, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { trpc } from "@/src/lib/trpc"

/**
 * Generate destination image URL using Unsplash Source
 */
function getDestinationImageUrl(destination: string): string {
  const searchTerms = [destination, "travel", "landmark", "tourism"]
    .filter(Boolean)
    .map((term) => encodeURIComponent(term.toLowerCase()))
    .join(",")

  return `https://source.unsplash.com/featured/800x600/?${searchTerms}`
}

export default function NewTripScreen() {
  const router = useRouter()
  const utils = trpc.useUtils()

  const [name, setName] = useState("")
  const [destination, setDestination] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date
  })
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)

  // Auto-generate cover image from destination
  const coverImage = useMemo(() => {
    if (!destination.trim()) return undefined
    return getDestinationImageUrl(destination.trim())
  }, [destination])

  const createMutation = trpc.trip.create.useMutation({
    onSuccess: (data) => {
      utils.trip.list.invalidate()
      router.replace(`/trip/${data.id}`)
    },
    onError: (error) => {
      Alert.alert("Erro", error.message || "Falha ao criar viagem")
    },
  })

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert("Erro", "Digite um nome para a viagem")
      return
    }

    if (!destination.trim()) {
      Alert.alert("Erro", "Digite um destino")
      return
    }

    if (endDate < startDate) {
      Alert.alert("Erro", "A data de término deve ser após a data de início")
      return
    }

    createMutation.mutate({
      name: name.trim(),
      destination: destination.trim(),
      description: description.trim() || undefined,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      coverImage,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nova Viagem</Text>
          <TouchableOpacity
            onPress={handleCreate}
            disabled={createMutation.isPending}
            style={[styles.saveButton, createMutation.isPending && styles.saveButtonDisabled]}
          >
            {createMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Criar</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Nome da viagem *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Férias em Paris"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Destination */}
          <View style={styles.field}>
            <Text style={styles.label}>Destino *</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="location-outline" size={20} color="#64748b" />
              <TextInput
                style={styles.inputInner}
                placeholder="Ex: Paris, França"
                placeholderTextColor="#94a3b8"
                value={destination}
                onChangeText={setDestination}
              />
            </View>
          </View>

          {/* Destination Preview Image - shows when destination is entered */}
          {coverImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: coverImage }} style={styles.imagePreview} />
              <View style={styles.imageOverlay}>
                <Text style={styles.imageOverlayText}>{destination}</Text>
              </View>
            </View>
          )}

          {/* Dates */}
          <View style={styles.datesRow}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Data de início *</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
                <Ionicons name="calendar-outline" size={20} color="#64748b" />
                <Text style={styles.dateText}>{formatDate(startDate)}</Text>
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  onChange={(_, date) => {
                    setShowStartPicker(false)
                    if (date) setStartDate(date)
                  }}
                />
              )}
            </View>

            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Data de término *</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
                <Ionicons name="calendar-outline" size={20} color="#64748b" />
                <Text style={styles.dateText}>{formatDate(endDate)}</Text>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  minimumDate={startDate}
                  onChange={(_, date) => {
                    setShowEndPicker(false)
                    if (date) setEndDate(date)
                  }}
                />
              )}
            </View>
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Descrição (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Adicione detalhes sobre sua viagem..."
              placeholderTextColor="#94a3b8"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
            <Text style={styles.infoText}>
              Após criar a viagem, você poderá adicionar atividades, voos e convidar membros.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1e293b",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 16,
    gap: 12,
  },
  inputInner: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1e293b",
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  datesRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  dateText: {
    fontSize: 14,
    color: "#1e293b",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#3b82f6",
    lineHeight: 20,
  },
  imagePreviewContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 120,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  imageOverlayText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
})
