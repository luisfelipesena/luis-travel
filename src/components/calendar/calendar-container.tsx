import { useState } from "react"
import { addDays, startOfWeek, format } from "date-fns"
import { CalendarToolbar } from "./calendar-toolbar"
import { DayView } from "./views/day-view"
import { WeekView } from "./views/week-view"
import { MonthView } from "./views/month-view"
import { ActivityFormDialog } from "./activity-form-dialog"
import type { Activity } from "@/server/db/schema"

export type CalendarView = "day" | "week" | "month"

interface CalendarContainerProps {
  activities: Activity[]
  tripStartDate: Date
  tripEndDate: Date
  onActivityUpdate: (activityId: string, startTime: Date, endTime: Date) => void
  onActivityCreate: (data: { title: string; startTime: Date; endTime: Date }) => void
  isLoading?: boolean
}

export function CalendarContainer({
  activities,
  tripStartDate,
  tripEndDate,
  onActivityUpdate,
  onActivityCreate,
  isLoading,
}: CalendarContainerProps) {
  const [view, setView] = useState<CalendarView>("week")
  const [currentDate, setCurrentDate] = useState(tripStartDate)
  const [selectedSlot, setSelectedSlot] = useState<{
    startTime: Date
    endTime: Date
  } | null>(null)

  const handleNavigate = (direction: "prev" | "next" | "today") => {
    if (direction === "today") {
      const today = new Date()
      if (today >= tripStartDate && today <= tripEndDate) {
        setCurrentDate(today)
      } else {
        setCurrentDate(tripStartDate)
      }
      return
    }

    const offset = direction === "next" ? 1 : -1

    switch (view) {
      case "day":
        setCurrentDate(addDays(currentDate, offset))
        break
      case "week":
        setCurrentDate(addDays(currentDate, offset * 7))
        break
      case "month":
        setCurrentDate(
          new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)
        )
        break
    }
  }

  const handleSlotSelect = (startTime: Date, endTime: Date) => {
    setSelectedSlot({ startTime, endTime })
  }

  const handleCloseDialog = () => {
    setSelectedSlot(null)
  }

  const handleCreateActivity = (title: string) => {
    if (selectedSlot) {
      onActivityCreate({
        title,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      })
      setSelectedSlot(null)
    }
  }

  const getDateRangeLabel = () => {
    switch (view) {
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy")
      case "week":
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
        const weekEnd = addDays(weekStart, 6)
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
      case "month":
        return format(currentDate, "MMMM yyyy")
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px] border rounded-lg bg-background">
      <CalendarToolbar
        view={view}
        onViewChange={setView}
        onNavigate={handleNavigate}
        dateRangeLabel={getDateRangeLabel()}
      />

      <div className="flex-1 overflow-hidden">
        {view === "day" && (
          <DayView
            date={currentDate}
            activities={activities}
            onActivityUpdate={onActivityUpdate}
            onSlotSelect={handleSlotSelect}
            isLoading={isLoading}
          />
        )}
        {view === "week" && (
          <WeekView
            currentDate={currentDate}
            activities={activities}
            onActivityUpdate={onActivityUpdate}
            onSlotSelect={handleSlotSelect}
            isLoading={isLoading}
          />
        )}
        {view === "month" && (
          <MonthView
            currentDate={currentDate}
            activities={activities}
            onDateSelect={(date) => {
              setCurrentDate(date)
              setView("day")
            }}
            isLoading={isLoading}
          />
        )}
      </div>

      <ActivityFormDialog
        open={!!selectedSlot}
        onClose={handleCloseDialog}
        onSubmit={handleCreateActivity}
        startTime={selectedSlot?.startTime}
        endTime={selectedSlot?.endTime}
      />
    </div>
  )
}
