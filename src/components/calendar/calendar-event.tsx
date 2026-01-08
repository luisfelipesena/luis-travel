import { format } from "date-fns"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type { Activity } from "@/server/db/schema"

const SLOT_HEIGHT = 48
const MINUTES_PER_SLOT = 60
const MIN_DURATION_MINUTES = 15

interface CalendarEventProps {
  activity: Activity
  style?: React.CSSProperties
  onUpdate: (activityId: string, startTime: Date, endTime: Date) => void
  onClick?: (activity: Activity) => void
  compact?: boolean
}

export function CalendarEvent({ activity, style, onUpdate, onClick, compact }: CalendarEventProps) {
  const startTime = new Date(activity.startTime)
  const endTime = new Date(activity.endTime)

  const [isResizing, setIsResizing] = useState(false)
  const [resizeStartY, setResizeStartY] = useState(0)
  const [originalEndTime, setOriginalEndTime] = useState(endTime)
  const resizeRef = useRef<HTMLDivElement>(null)

  const handleClick = (e: React.MouseEvent) => {
    if (isResizing) return
    e.stopPropagation()
    onClick?.(activity)
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsResizing(true)
    setResizeStartY(e.clientY)
    setOriginalEndTime(endTime)
  }

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return

      const deltaY = e.clientY - resizeStartY
      const minutesDelta = Math.round((deltaY / SLOT_HEIGHT) * MINUTES_PER_SLOT)
      const newEndTime = new Date(originalEndTime.getTime() + minutesDelta * 60000)

      // Enforce minimum duration
      const durationMinutes = (newEndTime.getTime() - startTime.getTime()) / 60000
      if (durationMinutes < MIN_DURATION_MINUTES) return

      // Don't allow past midnight
      if (newEndTime.getHours() === 0 && newEndTime.getMinutes() === 0) return
      if (newEndTime.getDate() !== startTime.getDate()) return

      onUpdate(activity.id, startTime, newEndTime)
    },
    [isResizing, resizeStartY, originalEndTime, startTime, activity.id, onUpdate]
  )

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleResizeMove)
      document.addEventListener("mouseup", handleResizeEnd)
      return () => {
        document.removeEventListener("mousemove", handleResizeMove)
        document.removeEventListener("mouseup", handleResizeEnd)
      }
    }
  }, [isResizing, handleResizeMove, handleResizeEnd])

  return (
    <div
      className={cn(
        "relative rounded px-2 py-1 text-white overflow-hidden cursor-pointer transition-all",
        "hover:opacity-90 hover:shadow-md",
        compact ? "text-xs" : "text-sm",
        isResizing && "select-none"
      )}
      style={{
        ...style,
        backgroundColor: activity.color || "#3b82f6",
      }}
      title={`${activity.title}\n${format(startTime, "h:mm a")} - ${format(endTime, "h:mm a")}${activity.location ? `\n${activity.location}` : ""}`}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick(e as unknown as React.MouseEvent)}
      role="button"
      tabIndex={0}
    >
      <div className="font-medium truncate">{activity.title}</div>
      {!compact && (
        <div className="text-xs opacity-90 truncate">
          {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
        </div>
      )}
      {!compact && activity.location && (
        <div className="text-xs opacity-75 truncate">{activity.location}</div>
      )}
      {/* Resize handle - biome-ignore lint/a11y/noStaticElementInteractions: resize handle uses mouse events */}
      <div
        ref={resizeRef}
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-white/30 transition-colors"
        onMouseDown={handleResizeStart}
      />
    </div>
  )
}
