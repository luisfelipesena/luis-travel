import type { DragEndEvent } from "@dnd-kit/core"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import type { Activity } from "@/server/db/schema"
import { CalendarEvent } from "./calendar-event"

interface DraggableEventProps {
  activity: Activity
  style?: React.CSSProperties
  onUpdate: (activityId: string, startTime: Date, endTime: Date) => void
  onClick?: (activity: Activity) => void
  compact?: boolean
}

export function DraggableEvent({
  activity,
  style,
  onUpdate,
  onClick,
  compact,
}: DraggableEventProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: activity.id,
    data: { activity },
  })

  const dragStyle = {
    ...style,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : undefined,
    cursor: isDragging ? "grabbing" : "grab",
  }

  return (
    <div ref={setNodeRef} style={dragStyle} {...listeners} {...attributes}>
      <CalendarEvent activity={activity} onUpdate={onUpdate} onClick={onClick} compact={compact} />
    </div>
  )
}

export function calculateNewTimes(
  event: DragEndEvent,
  activity: Activity,
  slotHeight: number,
  minutesPerSlot: number
): { startTime: Date; endTime: Date } | null {
  const { delta } = event

  if (!delta) return null

  // Calculate how many slots the event was moved
  const slotsMovedY = Math.round(delta.y / slotHeight)

  if (slotsMovedY === 0) return null

  const minutesMoved = slotsMovedY * minutesPerSlot

  const originalStart = new Date(activity.startTime)
  const originalEnd = new Date(activity.endTime)

  const newStart = new Date(originalStart.getTime() + minutesMoved * 60000)
  const newEnd = new Date(originalEnd.getTime() + minutesMoved * 60000)

  // Don't allow events to go before midnight or after 11:59 PM
  if (newStart.getHours() < 0 || newEnd.getHours() >= 24) {
    return null
  }

  return { startTime: newStart, endTime: newEnd }
}
