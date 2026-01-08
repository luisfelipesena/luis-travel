import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { addDays, addMinutes, format, isSameDay, setHours, setMinutes, startOfWeek } from "date-fns"
import { useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Activity } from "@/server/db/schema"
import { calculateNewTimes, DraggableEvent } from "../draggable-event"

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const DAYS = Array.from({ length: 7 }, (_, i) => i)
const SLOT_HEIGHT = 48
const MINUTES_PER_SLOT = 60

interface WeekViewProps {
  currentDate: Date
  activities: Activity[]
  onActivityUpdate: (activityId: string, startTime: Date, endTime: Date) => void
  onActivityClick?: (activity: Activity) => void
  onSlotSelect: (startTime: Date, endTime: Date) => void
  isLoading?: boolean
}

export function WeekView({
  currentDate,
  activities,
  onActivityUpdate,
  onActivityClick,
  onSlotSelect,
  isLoading,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = DAYS.map((i) => addDays(weekStart, i))

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const activitiesByDay = useMemo(() => {
    const map = new Map<string, Activity[]>()
    for (const day of weekDays) {
      const dayKey = format(day, "yyyy-MM-dd")
      map.set(
        dayKey,
        activities.filter((a) => isSameDay(new Date(a.startTime), day))
      )
    }
    return map
  }, [activities, weekDays])

  const handleSlotClick = (day: Date, hour: number) => {
    const startTime = setMinutes(setHours(day, hour), 0)
    const endTime = addMinutes(startTime, 60)
    onSlotSelect(startTime, endTime)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event
    const activity = active.data.current?.activity as Activity | undefined

    if (!activity) return

    const newTimes = calculateNewTimes(event, activity, SLOT_HEIGHT, MINUTES_PER_SLOT)

    if (newTimes) {
      onActivityUpdate(activity.id, newTimes.startTime, newTimes.endTime)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full p-4">
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex border-b">
          <div className="w-16 flex-shrink-0" />
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date())
            const dayKey = format(day, "yyyy-MM-dd")
            return (
              <div
                key={dayKey}
                className={cn("flex-1 border-l py-2 text-center", isToday && "bg-primary/5")}
              >
                <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
                <div
                  className={cn(
                    "text-lg font-semibold",
                    isToday &&
                      "mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
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
            {weekDays.map((day) => {
              const dayKey = format(day, "yyyy-MM-dd")
              const dayActivities = activitiesByDay.get(dayKey) || []
              const isToday = isSameDay(day, new Date())

              return (
                <div
                  key={dayKey}
                  className={cn("relative flex-1 border-l", isToday && "bg-primary/5")}
                >
                  {/* Time slots */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer border-b transition-colors hover:bg-muted/50"
                      style={{ height: SLOT_HEIGHT }}
                      onClick={() => handleSlotClick(day, hour)}
                      onKeyDown={(e) => e.key === "Enter" && handleSlotClick(day, hour)}
                    />
                  ))}

                  {/* Events */}
                  {dayActivities.map((activity) => {
                    const startTime = new Date(activity.startTime)
                    const endTime = new Date(activity.endTime)

                    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes()
                    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes()
                    const duration = endMinutes - startMinutes

                    const top = (startMinutes / MINUTES_PER_SLOT) * SLOT_HEIGHT
                    const height = (duration / MINUTES_PER_SLOT) * SLOT_HEIGHT

                    return (
                      <DraggableEvent
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
                        onClick={onActivityClick}
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
    </DndContext>
  )
}
