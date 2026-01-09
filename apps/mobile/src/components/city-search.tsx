import { Check, MapPin, Search, X } from "lucide-react-native"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { trpc } from "../lib/trpc"

export interface CitySelection {
  name: string
  displayName: string
  lat: number
  lng: number
  country?: string
  countryCode?: string
}

interface CitySearchProps {
  value?: CitySelection | null
  onChange: (city: CitySelection | null) => void
  placeholder?: string
  disabled?: boolean
}

export function CitySearch({
  value,
  onChange,
  placeholder = "Buscar cidade...",
  disabled = false,
}: CitySearchProps) {
  const [modalVisible, setModalVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: cities, isLoading } = trpc.geo.searchCities.useQuery(
    { query: debouncedQuery, limit: 10 },
    {
      enabled: debouncedQuery.length >= 2,
      staleTime: 1000 * 60 * 5,
    }
  )

  const handleSelect = (city: NonNullable<typeof cities>[number]) => {
    onChange({
      name: city.name,
      displayName: city.displayName,
      lat: city.lat,
      lng: city.lng,
      country: city.country,
      countryCode: city.countryCode,
    })
    setModalVisible(false)
    setSearchQuery("")
  }

  const handleClear = () => {
    onChange(null)
    setSearchQuery("")
  }

  const displayValue = value ? `${value.name}${value.country ? `, ${value.country}` : ""}` : ""

  return (
    <>
      {/* Selected value or trigger button */}
      <Pressable
        onPress={() => !disabled && setModalVisible(true)}
        className={`flex-row items-center bg-secondary rounded-xl px-4 py-3 ${
          disabled ? "opacity-50" : ""
        }`}
        disabled={disabled}
      >
        <MapPin size={20} color="#64748b" />
        <Text
          className={`flex-1 ml-2 ${value ? "text-foreground" : "text-muted-foreground"}`}
          numberOfLines={1}
        >
          {value ? displayValue : placeholder}
        </Text>
        {value && (
          <Pressable onPress={handleClear} hitSlop={8}>
            <X size={18} color="#64748b" />
          </Pressable>
        )}
      </Pressable>

      {/* Search Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-border">
              <Pressable onPress={() => setModalVisible(false)} className="mr-3">
                <X size={24} color="#0f172a" />
              </Pressable>
              <Text className="text-lg font-semibold text-foreground flex-1">Buscar Cidade</Text>
            </View>

            {/* Search Input */}
            <View className="px-4 py-3">
              <View className="flex-row items-center bg-secondary rounded-xl px-4 py-3">
                <Search size={20} color="#64748b" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Digite o nome da cidade..."
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-2 text-foreground"
                  autoFocus
                  autoCapitalize="words"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery("")}>
                    <X size={18} color="#64748b" />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Results */}
            {searchQuery.length < 2 ? (
              <View className="flex-1 items-center justify-center px-4">
                <MapPin size={48} color="#94a3b8" />
                <Text className="text-muted-foreground text-center mt-4">
                  Digite pelo menos 2 caracteres para buscar
                </Text>
              </View>
            ) : isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-muted-foreground mt-2">Buscando cidades...</Text>
              </View>
            ) : cities && cities.length > 0 ? (
              <FlatList
                data={cities}
                keyExtractor={(item) => String(item.placeId)}
                renderItem={({ item }) => {
                  const isSelected = value?.lat === item.lat && value?.lng === item.lng
                  return (
                    <Pressable
                      onPress={() => handleSelect(item)}
                      className={`flex-row items-center px-4 py-3 border-b border-border ${
                        isSelected ? "bg-primary/10" : ""
                      }`}
                    >
                      <MapPin size={20} color="#64748b" />
                      <View className="flex-1 ml-3">
                        <View className="flex-row items-center">
                          <Text className="font-medium text-foreground" numberOfLines={1}>
                            {item.name}
                          </Text>
                          {item.countryCode && (
                            <View className="ml-2 bg-secondary px-1.5 py-0.5 rounded">
                              <Text className="text-[10px] font-medium text-muted-foreground">
                                {item.countryCode}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                          {item.displayName}
                        </Text>
                      </View>
                      {isSelected && <Check size={20} color="#3b82f6" />}
                    </Pressable>
                  )
                }}
              />
            ) : (
              <View className="flex-1 items-center justify-center px-4">
                <Text className="text-muted-foreground text-center">Nenhuma cidade encontrada</Text>
              </View>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  )
}
