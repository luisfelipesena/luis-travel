import { useMemo } from "react"
import { format, isSameDay, setHours, setMinutes, addMinutes } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarEvent } from "../calendar-event"
import type { Activity } from "@/server/db/schema"

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const SLOT_HEIGHT = 60
const MINUTES_PER_SLOT = 60

interface DayViewProps {
  date: Date
  activities: Activity[]
  onActivityUpdate: (activityId: string, startTime: Date, endTime: Date) => void
  onSlotSelect: (startTime: Date, endTime: Date) => void
  isLoading?: boolean
}

export function DayView({
  date,
  activities,
  onActivityUpdate,
  onSlotSelect,
  isLoading,
}: DayViewProps) {
  const dayActivities = useMemo(
    () =>
      activities.filter((activity) =>
        isSameDay(new Date(activity.startTime), date)
      ),
    [activities, date]
  )

  const handleSlotClick = (hour: number) => {
    const startTime = setMinutes(setHours(date, hour), 0)
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
    <ScrollArea className="h-full">
      <div className="flex">
        {/* Time labels */}
        <div className="w-16 flex-shrink-0 border-r">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-[60px] pr-2 text-right text-xs text-muted-foreground"
              style={{ height: SLOT_HEIGHT }}
            >
              {format(setHours(new Date(), hour), "h a")}
            </div>
          ))}
        </div>

        {/* Day column */}
        <div className="flex-1 relative">
          {/* Time slots */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="border-b cursor-pointer hover:bg-muted/50 transition-colors"
              style={{ height: SLOT_HEIGHT }}
              onClick={() => handleSlotClick(hour)}
            />
          ))}

          {/* Events */}
          {dayActivities.map((activity) => {
            const startTime = new Date(activity.startTime)
            const endTime = new Date(activity.endTime)

            const startMinutes =
              startTime.getHours() * 60 + startTime.getMinutes()
            const endMinutes = endTime.getHours() * 60 + endTime.getMinutes()
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
                  left: 4,
                  right: 4,
                  height: Math.max(height, 24),
                }}
                onUpdate={onActivityUpdate}
              />
            )
          })}
        </div>
      </div>
    </ScrollArea>
  )
}
