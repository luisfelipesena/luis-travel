import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CalendarView } from "./calendar-container"

interface CalendarToolbarProps {
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  onNavigate: (direction: "prev" | "next" | "today") => void
  dateRangeLabel: string
}

export function CalendarToolbar({
  view,
  onViewChange,
  onNavigate,
  dateRangeLabel,
}: CalendarToolbarProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onNavigate("today")}>
          Today
        </Button>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onNavigate("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-lg font-semibold ml-2">{dateRangeLabel}</h2>
      </div>

      <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
        <Button
          variant={view === "day" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewChange("day")}
        >
          Day
        </Button>
        <Button
          variant={view === "week" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewChange("week")}
        >
          Week
        </Button>
        <Button
          variant={view === "month" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewChange("month")}
        >
          Month
        </Button>
      </div>
    </div>
  )
}
