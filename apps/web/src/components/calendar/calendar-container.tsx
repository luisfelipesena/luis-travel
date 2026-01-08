import { addDays, format, startOfWeek } from "date-fns"
import { useState } from "react"
import type { Activity } from "@luis-travel/db/schema"
import { ActivityFormDialog } from "./activity-form-dialog"
import { CalendarToolbar } from "./calendar-toolbar"
import { DayView } from "./views/day-view"
import { MonthView } from "./views/month-view"
import { WeekView } from "./views/week-view"

export type CalendarView = "day" | "week" | "month"

interface TripMember {
  id: string
  userId: string
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

interface ActivityFormData {
  title: string
  description?: string | null
  type: string
  startTime: Date
  endTime: Date
  location?: string | null
  locationLat?: string | null
  locationLng?: string | null
  color?: string | null
  participantIds?: string[]
}

interface CalendarContainerProps {
  activities: Activity[]
  tripStartDate: Date
  tripEndDate: Date
  onActivityUpdate: (activityId: string, startTime: Date, endTime: Date) => void
  onActivityCreate: (data: ActivityFormData) => void
  onActivityEdit?: (activityId: string, data: ActivityFormData) => void
  members?: TripMember[]
  ownerId?: string
  isLoading?: boolean
}

export function CalendarContainer({
  activities,
  tripStartDate,
  tripEndDate,
  onActivityUpdate,
  onActivityCreate,
  onActivityEdit,
  members = [],
  ownerId,
  isLoading,
}: CalendarContainerProps) {
  const [view, setView] = useState<CalendarView>("week")
  const [currentDate, setCurrentDate] = useState(tripStartDate)
  const [selectedSlot, setSelectedSlot] = useState<{
    startTime: Date
    endTime: Date
  } | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

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
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1))
        break
    }
  }

  const handleSlotSelect = (startTime: Date, endTime: Date) => {
    setSelectedSlot({ startTime, endTime })
    setSelectedActivity(null)
  }

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity)
    setSelectedSlot(null)
  }

  const handleCloseDialog = () => {
    setSelectedSlot(null)
    setSelectedActivity(null)
  }

  const handleFormSubmit = (data: Omit<ActivityFormData, "id">) => {
    if (selectedActivity) {
      // Edit mode
      onActivityEdit?.(selectedActivity.id, data)
    } else if (selectedSlot) {
      // Create mode
      onActivityCreate(data)
    }
    handleCloseDialog()
  }

  const getDateRangeLabel = () => {
    switch (view) {
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy")
      case "week": {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
        const weekEnd = addDays(weekStart, 6)
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
      }
      case "month":
        return format(currentDate, "MMMM yyyy")
    }
  }

  // Convert selected activity to form data format
  const activityFormData = selectedActivity
    ? {
        id: selectedActivity.id,
        title: selectedActivity.title,
        description: selectedActivity.description,
        type: selectedActivity.type,
        startTime: new Date(selectedActivity.startTime),
        endTime: new Date(selectedActivity.endTime),
        location: selectedActivity.location,
        locationLat: selectedActivity.locationLat,
        locationLng: selectedActivity.locationLng,
        color: selectedActivity.color,
        participantIds: [], // Would need to be passed from parent if needed
      }
    : undefined

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[600px] flex-col rounded-lg border bg-background">
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
            onActivityClick={handleActivityClick}
            onSlotSelect={handleSlotSelect}
            isLoading={isLoading}
          />
        )}
        {view === "week" && (
          <WeekView
            currentDate={currentDate}
            activities={activities}
            onActivityUpdate={onActivityUpdate}
            onActivityClick={handleActivityClick}
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
        open={!!selectedSlot || !!selectedActivity}
        onClose={handleCloseDialog}
        onSubmit={handleFormSubmit}
        startTime={selectedSlot?.startTime || selectedActivity?.startTime}
        endTime={selectedSlot?.endTime || selectedActivity?.endTime}
        activity={activityFormData}
        members={members}
        ownerId={ownerId}
        isLoading={isLoading}
      />
    </div>
  )
}
