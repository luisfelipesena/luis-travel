import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Activity } from "@/server/db/schema"

interface CalendarEventProps {
  activity: Activity
  style?: React.CSSProperties
  onUpdate: (activityId: string, startTime: Date, endTime: Date) => void
  compact?: boolean
}

export function CalendarEvent({ activity, style, onUpdate, compact }: CalendarEventProps) {
  const startTime = new Date(activity.startTime)
  const endTime = new Date(activity.endTime)

  return (
    <div
      className={cn(
        "rounded px-2 py-1 text-white overflow-hidden cursor-pointer hover:opacity-90 transition-opacity",
        compact ? "text-xs" : "text-sm"
      )}
      style={{
        ...style,
        backgroundColor: activity.color || "#3b82f6",
      }}
      title={`${activity.title}\n${format(startTime, "h:mm a")} - ${format(endTime, "h:mm a")}${activity.location ? `\n${activity.location}` : ""}`}
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
    </div>
  )
}
