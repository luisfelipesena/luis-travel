import { useMemo } from "react"
import {
  format,
  isSameDay,
  startOfWeek,
  addDays,
  setHours,
  setMinutes,
  addMinutes,
} from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarEvent } from "../calendar-event"
import { cn } from "@/lib/utils"
import type { Activity } from "@/server/db/schema"

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const DAYS = Array.from({ length: 7 }, (_, i) => i)
const SLOT_HEIGHT = 48
const MINUTES_PER_SLOT = 60

interface WeekViewProps {
  currentDate: Date
  activities: Activity[]
  onActivityUpdate: (activityId: string, startTime: Date, endTime: Date) => void
  onSlotSelect: (startTime: Date, endTime: Date) => void
  isLoading?: boolean
}

export function WeekView({
  currentDate,
  activities,
  onActivityUpdate,
  onSlotSelect,
  isLoading,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = DAYS.map((i) => addDays(weekStart, i))

  const activitiesByDay = useMemo(() => {
    const map = new Map<string, Activity[]>()
    weekDays.forEach((day) => {
      const dayKey = format(day, "yyyy-MM-dd")
      map.set(
        dayKey,
        activities.filter((a) => isSameDay(new Date(a.startTime), day))
      )
    })
    return map
  }, [activities, weekDays])

  const handleSlotClick = (day: Date, hour: number) => {
    const startTime = setMinutes(setHours(day, hour), 0)
    const endTime = addMinutes(startTime, 60)
    onSlotSelect(startTime, endTime)
  }

  if (isLoading) {
    return (
      <div className="h-full p-4">
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex border-b">
        <div className="w-16 flex-shrink-0" />
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, new Date())
          return (
            <div
              key={i}
              className={cn(
                "flex-1 text-center py-2 border-l",
                isToday && "bg-primary/5"
              )}
            >
              <div className="text-xs text-muted-foreground">
                {format(day, "EEE")}
              </div>
              <div
                className={cn(
                  "text-lg font-semibold",
                  isToday &&
                    "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          )
        })}
      </div>

      {/* Grid */}
      <ScrollArea className="flex-1">
        <div className="flex">
          {/* Time labels */}
          <div className="w-16 flex-shrink-0 border-r">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="pr-2 text-right text-xs text-muted-foreground"
                style={{ height: SLOT_HEIGHT }}
              >
                {format(setHours(new Date(), hour), "h a")}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            const dayKey = format(day, "yyyy-MM-dd")
            const dayActivities = activitiesByDay.get(dayKey) || []
            const isToday = isSameDay(day, new Date())

            return (
              <div
                key={dayIndex}
                className={cn(
                  "flex-1 relative border-l",
                  isToday && "bg-primary/5"
                )}
              >
                {/* Time slots */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="border-b cursor-pointer hover:bg-muted/50 transition-colors"
                    style={{ height: SLOT_HEIGHT }}
                    onClick={() => handleSlotClick(day, hour)}
                  />
                ))}

                {/* Events */}
                {dayActivities.map((activity) => {
                  const startTime = new Date(activity.startTime)
                  const endTime = new Date(activity.endTime)

                  const startMinutes =
                    startTime.getHours() * 60 + startTime.getMinutes()
                  const endMinutes =
                    endTime.getHours() * 60 + endTime.getMinutes()
                  const duration = endMinutes - startMinutes

                  const top = (startMinutes / MINUTES_PER_SLOT) * SLOT_HEIGHT
                  const height = (duration / MINUTES_PER_SLOT) * SLOT_HEIGHT

                  return (
                    <CalendarEvent
                      key={activity.id}
                      activity={activity}
                      style={{
                        position: "absolute",
                        top,
                        left: 2,
                        right: 2,
                        height: Math.max(height, 20),
                      }}
                      onUpdate={onActivityUpdate}
                      compact
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
