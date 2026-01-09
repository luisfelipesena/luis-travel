import { format, setHours, setMinutes } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Clock, Loader2, Plane } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { trpc } from "@/lib/trpc"
import { cn } from "@/lib/utils"

interface FlightFormDialogProps {
  open: boolean
  onClose: () => void
  tripId: string
  onSuccess?: () => void
}

export function FlightFormDialog({ open, onClose, tripId, onSuccess }: FlightFormDialogProps) {
  const [flightNumber, setFlightNumber] = useState("")
  const [airline, setAirline] = useState("")
  const [departureAirport, setDepartureAirport] = useState("")
  const [arrivalAirport, setArrivalAirport] = useState("")
  const [departureDate, setDepartureDate] = useState<Date | undefined>()
  const [departureTime, setDepartureTime] = useState("09:00")
  const [arrivalDate, setArrivalDate] = useState<Date | undefined>()
  const [arrivalTime, setArrivalTime] = useState("11:00")

  const utils = trpc.useUtils()

  const createMutation = trpc.flight.create.useMutation({
    onSuccess: () => {
      utils.flight.listByTrip.invalidate({ tripId })
      toast.success("Voo adicionado com sucesso!")
      onSuccess?.()
      handleClose()
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao adicionar voo")
    },
  })

  useEffect(() => {
    if (open) {
      // Reset form
      setFlightNumber("")
      setAirline("")
      setDepartureAirport("")
      setArrivalAirport("")
      setDepartureDate(undefined)
      setDepartureTime("09:00")
      setArrivalDate(undefined)
      setArrivalTime("11:00")
    }
  }, [open])

  const parseTime = (timeStr: string, date: Date): Date => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return setMinutes(setHours(date, hours), minutes)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!flightNumber.trim() || !departureAirport.trim() || !arrivalAirport.trim()) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    if (!departureDate || !arrivalDate) {
      toast.error("Selecione as datas de partida e chegada")
      return
    }

    const finalDepartureTime = parseTime(departureTime, departureDate)
    const finalArrivalTime = parseTime(arrivalTime, arrivalDate)

    if (finalDepartureTime >= finalArrivalTime) {
      toast.error("A hora de chegada deve ser posterior à hora de partida")
      return
    }

    createMutation.mutate({
      tripId,
      flightNumber: flightNumber.trim(),
      airline: airline.trim() || undefined,
      departureAirport: departureAirport.trim().toUpperCase(),
      arrivalAirport: arrivalAirport.trim().toUpperCase(),
      departureTime: finalDepartureTime,
      arrivalTime: finalArrivalTime,
    })
  }

  const handleClose = () => {
    if (!createMutation.isPending) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Adicionar Voo
          </DialogTitle>
          <DialogDescription>
            Adicione um voo à sua viagem. Insira os códigos IATA dos aeroportos (ex: GRU, LAX).
          </DialogDescription>
        </DialogHeader>

        <form id="flight-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Flight Number */}
            <div className="space-y-2">
              <Label htmlFor="flightNumber">Número do Voo *</Label>
              <Input
                id="flightNumber"
                placeholder="Ex: AA123"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                autoFocus
              />
            </div>

            {/* Airline */}
            <div className="space-y-2">
              <Label htmlFor="airline">Companhia Aérea</Label>
              <Input
                id="airline"
                placeholder="Ex: American Airlines"
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Departure Airport */}
            <div className="space-y-2">
              <Label htmlFor="departureAirport">Aeroporto de Partida (IATA) *</Label>
              <Input
                id="departureAirport"
                placeholder="Ex: GRU"
                value={departureAirport}
                onChange={(e) => setDepartureAirport(e.target.value)}
                maxLength={10}
              />
            </div>

            {/* Arrival Airport */}
            <div className="space-y-2">
              <Label htmlFor="arrivalAirport">Aeroporto de Chegada (IATA) *</Label>
              <Input
                id="arrivalAirport"
                placeholder="Ex: LAX"
                value={arrivalAirport}
                onChange={(e) => setArrivalAirport(e.target.value)}
                maxLength={10}
              />
            </div>
          </div>

          {/* Departure Date/Time */}
          <div className="space-y-2">
            <Label>Data e Hora de Partida *</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !departureDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {departureDate ? format(departureDate, "dd/MM/yyyy", { locale: ptBR }) : "Data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={departureDate}
                    onSelect={setDepartureDate}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <div className="relative w-32">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Arrival Date/Time */}
          <div className="space-y-2">
            <Label>Data e Hora de Chegada *</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !arrivalDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {arrivalDate ? format(arrivalDate, "dd/MM/yyyy", { locale: ptBR }) : "Data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={arrivalDate}
                    onSelect={setArrivalDate}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <div className="relative w-32">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="time"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createMutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" form="flight-form" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Adicionar Voo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
