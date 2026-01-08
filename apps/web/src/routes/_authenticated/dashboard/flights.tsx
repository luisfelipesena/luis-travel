import { createFileRoute } from "@tanstack/react-router"
import { PlaneTakeoff } from "lucide-react"

export const Route = createFileRoute("/_authenticated/dashboard/flights")({
  component: FlightsPage,
})

function FlightsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <PlaneTakeoff className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Voos</h1>
      </div>
      <p className="text-muted-foreground">Acompanhe todos os seus voos em um só lugar.</p>
      <div className="rounded-lg border bg-muted/50 p-8 text-center">
        <p className="text-muted-foreground">Em breve: lista de voos com status em tempo real</p>
      </div>
    </div>
  )
}
