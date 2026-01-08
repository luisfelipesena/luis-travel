import { format } from "date-fns"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ActivityFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (title: string) => void
  startTime?: Date
  endTime?: Date
}

export function ActivityFormDialog({
  open,
  onClose,
  onSubmit,
  startTime,
  endTime,
}: ActivityFormDialogProps) {
  const [title, setTitle] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onSubmit(title.trim())
      setTitle("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Atividade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Nome da atividade"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            {startTime && endTime && (
              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Início:</strong> {format(startTime, "PPP p")}
                </p>
                <p>
                  <strong>Fim:</strong> {format(endTime, "PPP p")}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Criar Atividade
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
