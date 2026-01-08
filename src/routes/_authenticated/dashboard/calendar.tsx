import { createFileRoute } from "@tanstack/react-router"
import { Calendar as CalendarIcon } from "lucide-react"

export const Route = createFileRoute("/_authenticated/dashboard/calendar")({
  component: CalendarPage,
})

function CalendarPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Calendário</h1>
      </div>
      <p className="text-muted-foreground">
        Visualize todas as suas atividades em um calendário unificado.
      </p>
      <div className="rounded-lg border bg-muted/50 p-8 text-center">
        <p className="text-muted-foreground">Em breve: calendário global com todas as viagens</p>
      </div>
    </div>
  )
}
