import { ActivityType } from "@luis-travel/types"
import { format, setHours, setMinutes } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Clock, Loader2, MapPin, Palette, Users as UsersIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { LocationMapPicker } from "./location-map-picker"

const ACTIVITY_TYPES = [
  { value: ActivityType.FLIGHT, label: "Voo", color: "#8b5cf6" },
  { value: ActivityType.ACCOMMODATION, label: "Hospedagem", color: "#f59e0b" },
  { value: ActivityType.TRANSPORT, label: "Transporte", color: "#10b981" },
  { value: ActivityType.MEAL, label: "Refeição", color: "#ef4444" },
  { value: ActivityType.ACTIVITY, label: "Atividade", color: "#3b82f6" },
  { value: ActivityType.CUSTOM, label: "Outro", color: "#6b7280" },
]

const COLOR_PRESETS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#6b7280", // gray
]

interface TripMember {
  id: string
  userId: string
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

interface ActivityData {
  id?: string
  title: string
  description?: string | null
  type: string
  startTime: Date
  endTime: Date
  location?: string | null
  locationLat?: string | null
  locationLng?: string | null
  color?: string | null
  participantIds?: string[]
}

interface ActivityFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<ActivityData, "id">) => void
  startTime?: Date
  endTime?: Date
  activity?: ActivityData
  members?: TripMember[]
  ownerId?: string
  isLoading?: boolean
}

export function ActivityFormDialog({
  open,
  onClose,
  onSubmit,
  startTime: initialStartTime,
  endTime: initialEndTime,
  activity,
  members = [],
  ownerId,
  isLoading = false,
}: ActivityFormDialogProps) {
  const isEditMode = !!activity?.id

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<string>(ActivityType.ACTIVITY)
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [startTimeStr, setStartTimeStr] = useState("09:00")
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [endTimeStr, setEndTimeStr] = useState("10:00")
  const [location, setLocation] = useState<string | undefined>()
  const [locationLat, setLocationLat] = useState<string | undefined>()
  const [locationLng, setLocationLng] = useState<string | undefined>()
  const [color, setColor] = useState(COLOR_PRESETS[0])
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("details")

  // All trip participants (members + owner)
  const allParticipants = useMemo(() => {
    const participants: { id: string; name: string; email: string }[] = []

    // Add owner first
    if (ownerId) {
      const ownerMember = members.find((m) => m.userId === ownerId)
      if (ownerMember) {
        participants.push({
          id: ownerMember.userId,
          name: ownerMember.user.name,
          email: ownerMember.user.email,
        })
      }
    }

    // Add other members
    for (const m of members) {
      if (m.userId !== ownerId) {
        participants.push({
          id: m.userId,
          name: m.user.name,
          email: m.user.email,
        })
      }
    }

    return participants
  }, [members, ownerId])

  const allSelected = selectedParticipants.length === allParticipants.length

  // Initialize form from activity or initial times
  useEffect(() => {
    if (activity) {
      setTitle(activity.title)
      setDescription(activity.description || "")
      setType(activity.type)
      setStartDate(activity.startTime)
      setStartTimeStr(format(activity.startTime, "HH:mm"))
      setEndDate(activity.endTime)
      setEndTimeStr(format(activity.endTime, "HH:mm"))
      setLocation(activity.location || undefined)
      setLocationLat(activity.locationLat || undefined)
      setLocationLng(activity.locationLng || undefined)
      setColor(activity.color || COLOR_PRESETS[0])
      setSelectedParticipants(activity.participantIds || [])
    } else {
      // Reset for new activity
      setTitle("")
      setDescription("")
      setType(ActivityType.ACTIVITY)
      setStartDate(initialStartTime)
      setStartTimeStr(initialStartTime ? format(initialStartTime, "HH:mm") : "09:00")
      setEndDate(initialEndTime)
      setEndTimeStr(initialEndTime ? format(initialEndTime, "HH:mm") : "10:00")
      setLocation(undefined)
      setLocationLat(undefined)
      setLocationLng(undefined)
      setColor(COLOR_PRESETS[0])
      setSelectedParticipants([])
      setActiveTab("details")
    }
  }, [activity, initialStartTime, initialEndTime])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedParticipants(allParticipants.map((p) => p.id))
    } else {
      setSelectedParticipants([])
    }
  }

  const toggleParticipant = (id: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const parseTime = (timeStr: string, date: Date): Date => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return setMinutes(setHours(date, hours), minutes)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !startDate || !endDate) return

    const finalStartTime = parseTime(startTimeStr, startDate)
    const finalEndTime = parseTime(endTimeStr, endDate)

    if (finalStartTime >= finalEndTime) {
      return
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      startTime: finalStartTime,
      endTime: finalEndTime,
      location: location || undefined,
      locationLat: locationLat || undefined,
      locationLng: locationLng || undefined,
      color,
      participantIds: selectedParticipants.length > 0 ? selectedParticipants : undefined,
    })
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="flex max-h-[85vh] w-full max-w-2xl flex-col gap-0 p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle>{isEditMode ? "Editar Atividade" : "Nova Atividade"}</DialogTitle>
        </DialogHeader>

        <form id="activity-form" onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex min-h-0 flex-1 flex-col"
          >
            <TabsList className="mx-6 mt-4 grid w-auto grid-cols-3">
              <TabsTrigger value="details" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Detalhes</span>
              </TabsTrigger>
              <TabsTrigger value="location" className="gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Local</span>
              </TabsTrigger>
              <TabsTrigger value="options" className="gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Opções</span>
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="mt-0 flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Nome da atividade"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                  />
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: t.color }}
                            />
                            {t.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date/Time Row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Start */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Início *
                    </Label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "flex-1 justify-start text-left font-normal",
                              !startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "dd/MM", { locale: ptBR }) : "Data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        type="time"
                        value={startTimeStr}
                        onChange={(e) => setStartTimeStr(e.target.value)}
                        className="w-24"
                      />
                    </div>
                  </div>

                  {/* End */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Fim *
                    </Label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "flex-1 justify-start text-left font-normal",
                              !endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "dd/MM", { locale: ptBR }) : "Data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        type="time"
                        value={endTimeStr}
                        onChange={(e) => setEndTimeStr(e.target.value)}
                        className="w-24"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Detalhes sobre a atividade..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Location Tab */}
            <TabsContent value="location" className="mt-0 flex-1 overflow-y-auto px-6 py-4">
              <LocationMapPicker
                location={location}
                lat={locationLat}
                lng={locationLng}
                onLocationChange={setLocation}
                onCoordsChange={(lat, lng) => {
                  setLocationLat(lat)
                  setLocationLng(lng)
                }}
              />
            </TabsContent>

            {/* Options Tab */}
            <TabsContent value="options" className="mt-0 flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                {/* Color Selection */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Cor do Evento
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={cn(
                          "h-10 w-10 rounded-full transition-all hover:scale-110",
                          color === c && "ring-2 ring-offset-2 ring-primary"
                        )}
                        style={{ backgroundColor: c }}
                        aria-label={`Selecionar cor ${c}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Participants */}
                {allParticipants.length > 0 && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4" />
                      Participantes
                    </Label>
                    <div className="space-y-2 rounded-lg border p-3">
                      {/* Select All */}
                      <div className="flex items-center space-x-2 border-b pb-2">
                        <Checkbox
                          id="select-all"
                          checked={allSelected}
                          onCheckedChange={handleSelectAll}
                        />
                        <label
                          htmlFor="select-all"
                          className="cursor-pointer text-sm font-medium leading-none"
                        >
                          Selecionar Todos
                        </label>
                      </div>

                      {/* Individual participants */}
                      <div className="max-h-40 space-y-2 overflow-y-auto pt-1">
                        {allParticipants.map((p) => (
                          <div key={p.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`participant-${p.id}`}
                              checked={selectedParticipants.includes(p.id)}
                              onCheckedChange={() => toggleParticipant(p.id)}
                            />
                            <label
                              htmlFor={`participant-${p.id}`}
                              className="cursor-pointer text-sm leading-none"
                            >
                              {p.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </form>

        <DialogFooter className="shrink-0 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="activity-form"
            disabled={!title.trim() || !startDate || !endDate || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
