import {
  createSerializer,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs"

export const calendarViewOptions = ["day", "week", "month"] as const
export type CalendarView = (typeof calendarViewOptions)[number]

export const tripStatusOptions = ["planning", "active", "completed", "cancelled"] as const
export type TripStatus = (typeof tripStatusOptions)[number]

export const searchParamsParsers = {
  // Pagination
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),

  // Search & Filtering
  search: parseAsString.withDefault(""),
  status: parseAsStringLiteral(tripStatusOptions),

  // Calendar
  view: parseAsStringLiteral(calendarViewOptions).withDefault("week"),
  date: parseAsString,

  // Modal/Dialog state
  modal: parseAsString,
  editId: parseAsString,
  createNew: parseAsBoolean.withDefault(false),

  // Sorting
  sortBy: parseAsString,
  sortOrder: parseAsStringLiteral(["asc", "desc"] as const).withDefault("desc"),
}

export const serialize = createSerializer(searchParamsParsers)
