import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "lucide-react-native"
import { useState } from "react"
import { Modal, Platform, Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

interface DatePickerProps {
  value: Date
  onChange: (date: Date) => void
  label?: string
  minimumDate?: Date
  maximumDate?: Date
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  label,
  minimumDate,
  maximumDate,
  disabled = false,
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [tempDate, setTempDate] = useState(value)

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false)
      if (event.type === "set" && selectedDate) {
        onChange(selectedDate)
      }
    } else {
      // iOS - update temp date
      if (selectedDate) {
        setTempDate(selectedDate)
      }
    }
  }

  const handleConfirm = () => {
    onChange(tempDate)
    setShowPicker(false)
  }

  const handleCancel = () => {
    setTempDate(value)
    setShowPicker(false)
  }

  return (
    <View>
      <Pressable
        onPress={() => !disabled && setShowPicker(true)}
        className={`bg-secondary rounded-xl px-4 py-3 ${disabled ? "opacity-50" : ""}`}
        disabled={disabled}
      >
        <View className="flex-row items-center">
          <Calendar size={18} color="#64748b" />
          {label && <Text className="ml-2 text-xs text-muted-foreground">{label}</Text>}
        </View>
        <Text className="text-foreground font-medium mt-1">
          {format(value, "d MMM, yyyy", { locale: ptBR })}
        </Text>
      </Pressable>

      {Platform.OS === "ios" ? (
        <Modal visible={showPicker} transparent animationType="slide" onRequestClose={handleCancel}>
          <View className="flex-1 justify-end bg-black/50">
            <SafeAreaView className="bg-white rounded-t-2xl">
              {/* Header */}
              <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
                <Pressable onPress={handleCancel}>
                  <Text className="text-muted-foreground">Cancelar</Text>
                </Pressable>
                <Text className="text-lg font-semibold text-foreground">
                  {label || "Selecionar Data"}
                </Text>
                <Pressable onPress={handleConfirm}>
                  <Text className="text-primary font-semibold">Confirmar</Text>
                </Pressable>
              </View>

              {/* Picker */}
              <View className="py-4">
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={handleChange}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  locale="pt-BR"
                />
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={value}
            mode="date"
            display="default"
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )
      )}
    </View>
  )
}

interface DateRangePickerProps {
  startDate: Date
  endDate: Date
  onStartDateChange: (date: Date) => void
  onEndDateChange: (date: Date) => void
  disabled?: boolean
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disabled = false,
}: DateRangePickerProps) {
  return (
    <View className="flex-row gap-3">
      <View className="flex-1">
        <DatePicker
          value={startDate}
          onChange={(date) => {
            onStartDateChange(date)
            // If end date is before new start date, update it
            if (date > endDate) {
              onEndDateChange(date)
            }
          }}
          label="Início"
          maximumDate={endDate}
          disabled={disabled}
        />
      </View>
      <View className="flex-1">
        <DatePicker
          value={endDate}
          onChange={onEndDateChange}
          label="Fim"
          minimumDate={startDate}
          disabled={disabled}
        />
      </View>
    </View>
  )
}
