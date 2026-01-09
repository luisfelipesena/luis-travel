import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AlertTriangle, Calendar as CalendarIcon, Loader2, MapPin, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import { Textarea } from "@/components/ui/textarea"
import { trpc } from "@/lib/trpc"
import { cn } from "@/lib/utils"

interface TripSettingsDialogProps {
  open: boolean
  onClose: () => void
  tripId: string
  initialData: {
    name: string
    destination: string
    description?: string | null
    startDate: Date
    endDate: Date
  }
  onSuccess?: () => void
}

export function TripSettingsDialog({
  open,
  onClose,
  tripId,
  initialData,
  onSuccess,
}: TripSettingsDialogProps) {
  const [name, setName] = useState("")
  const [destination, setDestination] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const utils = trpc.useUtils()

  const updateMutation = trpc.trip.update.useMutation({
    onSuccess: () => {
      utils.trip.byId.invalidate({ id: tripId })
      utils.trip.list.invalidate()
      toast.success("Viagem atualizada com sucesso!")
      onSuccess?.()
      onClose()
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar viagem")
    },
  })

  const deleteMutation = trpc.trip.delete.useMutation({
    onSuccess: () => {
      utils.trip.list.invalidate()
      toast.success("Viagem excluída com sucesso!")
      onSuccess?.()
      onClose()
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir viagem")
    },
  })

  // Initialize form with trip data
  useEffect(() => {
    if (open) {
      setName(initialData.name)
      setDestination(initialData.destination)
      setDescription(initialData.description || "")
      setStartDate(new Date(initialData.startDate))
      setEndDate(new Date(initialData.endDate))
    }
  }, [open, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !destination.trim() || !startDate || !endDate) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    if (startDate >= endDate) {
      toast.error("A data de início deve ser anterior à data de término")
      return
    }

    updateMutation.mutate({
      id: tripId,
      name: name.trim(),
      destination: destination.trim(),
      description: description.trim() || undefined,
      startDate,
      endDate,
    })
  }

  const handleDelete = () => {
    deleteMutation.mutate({ id: tripId })
    setShowDeleteDialog(false)
  }

  const hasChanges =
    name !== initialData.name ||
    destination !== initialData.destination ||
    description !== (initialData.description || "") ||
    startDate?.getTime() !== new Date(initialData.startDate).getTime() ||
    endDate?.getTime() !== new Date(initialData.endDate).getTime()

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Configurações da Viagem</DialogTitle>
            <DialogDescription>Edite as informações da sua viagem</DialogDescription>
          </DialogHeader>

          <form id="trip-settings-form" onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="trip-name">Nome da Viagem *</Label>
              <Input
                id="trip-name"
                placeholder="Ex: Férias em Paris"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <Label htmlFor="trip-destination">Destino *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="trip-destination"
                  placeholder="Ex: Paris, França"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="trip-description">Descrição</Label>
              <Textarea
                id="trip-description"
                placeholder="Adicione detalhes sobre sua viagem..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Dates */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Data de Início *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
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
              </div>

              <div className="space-y-2">
                <Label>Data de Término *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
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
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <h4 className="text-sm font-semibold text-destructive">Zona de Perigo</h4>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">
                Excluir esta viagem removerá permanentemente todas as atividades, voos e dados
                associados.
              </p>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Viagem
              </Button>
            </div>
          </form>

          <DialogFooter className="border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="trip-settings-form"
              disabled={
                !name.trim() ||
                !destination.trim() ||
                !startDate ||
                !endDate ||
                !hasChanges ||
                updateMutation.isPending
              }
            >
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a viagem "{name}" e
              todos os dados associados, incluindo atividades e voos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
