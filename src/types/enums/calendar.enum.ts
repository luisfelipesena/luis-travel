import { z } from "zod"
import { enumValues } from "../utils"

// ============================================================================
// Calendar View
// ============================================================================

export const CalendarView = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
} as const

export type CalendarView = (typeof CalendarView)[keyof typeof CalendarView]

export const CalendarViewValues = enumValues(CalendarView)

export const calendarViewSchema = z.enum(CalendarViewValues)
