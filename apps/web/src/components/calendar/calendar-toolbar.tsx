import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { CalendarView } from "./calendar-container"

interface CalendarToolbarProps {
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  onNavigate: (direction: "prev" | "next" | "today") => void
  dateRangeLabel: string
  isAtStart?: boolean
  isAtEnd?: boolean
  tripStartDate?: Date
  tripEndDate?: Date
}

export function CalendarToolbar({
  view,
  onViewChange,
  onNavigate,
  dateRangeLabel,
  isAtStart = false,
  isAtEnd = false,
  tripStartDate,
  tripEndDate,
}: CalendarToolbarProps) {
  const startTooltip = tripStartDate
    ? `Início da viagem: ${format(tripStartDate, "d 'de' MMM, yyyy", { locale: ptBR })}`
    : "Início da viagem"

  const endTooltip = tripEndDate
    ? `Fim da viagem: ${format(tripEndDate, "d 'de' MMM, yyyy", { locale: ptBR })}`
    : "Fim da viagem"

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onNavigate("today")}>
          Hoje
        </Button>
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onNavigate("prev")}
                  disabled={isAtStart}
                  aria-label="Período anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              {isAtStart && <TooltipContent>{startTooltip}</TooltipContent>}
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onNavigate("next")}
                  disabled={isAtEnd}
                  aria-label="Próximo período"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              {isAtEnd && <TooltipContent>{endTooltip}</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        </div>
        <h2 className="text-lg font-semibold ml-2">{dateRangeLabel}</h2>
      </div>

      <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
        <Button
          variant={view === "day" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewChange("day")}
        >
          Dia
        </Button>
        <Button
          variant={view === "week" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewChange("week")}
        >
          Semana
        </Button>
        <Button
          variant={view === "month" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewChange("month")}
        >
          Mês
        </Button>
      </div>
    </div>
  )
}
