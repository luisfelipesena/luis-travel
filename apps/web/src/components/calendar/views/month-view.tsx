import type { Activity } from "@luis-travel/db/schema"
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface MonthViewProps {
  currentDate: Date
  activities: Activity[]
  onDateSelect: (date: Date) => void
  isLoading?: boolean
}

export function MonthView({ currentDate, activities, onDateSelect, isLoading }: MonthViewProps) {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const days: Date[] = []
    let day = calendarStart

    while (day <= calendarEnd) {
      days.push(day)
      day = addDays(day, 1)
    }

    return days
  }, [currentDate])

  const activitiesByDay = useMemo(() => {
    const map = new Map<string, Activity[]>()
    activities.forEach((activity) => {
      const dayKey = format(new Date(activity.startTime), "yyyy-MM-dd")
      const existing = map.get(dayKey) || []
      map.set(dayKey, [...existing, activity])
    })
    return map
  }, [activities])

  if (isLoading) {
    return (
      <div className="h-full p-4">
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  const weeks: Date[][] = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center py-2 text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-rows-[repeat(auto-fill,minmax(100px,1fr))]">
        {weeks.map((week) => {
          const weekKey = format(week[0], "yyyy-MM-dd")
          return (
            <div key={weekKey} className="grid grid-cols-7 border-b">
              {week.map((day) => {
                const dayKey = format(day, "yyyy-MM-dd")
                const dayActivities = activitiesByDay.get(dayKey) || []
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isToday = isSameDay(day, new Date())

                return (
                  <div
                    key={dayKey}
                    role="button"
                    tabIndex={0}
                    className={cn(
                      "border-l first:border-l-0 p-1 min-h-[100px] cursor-pointer hover:bg-muted/50 transition-colors",
                      !isCurrentMonth && "bg-muted/20"
                    )}
                    onClick={() => onDateSelect(day)}
                    onKeyDown={(e) => e.key === "Enter" && onDateSelect(day)}
                  >
                    <div
                      className={cn(
                        "text-sm font-medium mb-1",
                        !isCurrentMonth && "text-muted-foreground",
                        isToday &&
                          "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                      )}
                    >
                      {format(day, "d")}
                    </div>

                    <div className="space-y-0.5">
                      {dayActivities.slice(0, 3).map((activity) => (
                        <div
                          key={activity.id}
                          className="text-xs truncate px-1 py-0.5 rounded"
                          style={{
                            backgroundColor: activity.color || "#3b82f6",
                            color: "white",
                          }}
                        >
                          {activity.title}
                        </div>
                      ))}
                      {dayActivities.length > 3 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{dayActivities.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
