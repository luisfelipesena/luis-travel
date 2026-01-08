// Activity Types
export const ActivityType = {
  DEFAULT: "default",
  AI_GENERATED: "ai_generated",
  CUSTOM: "custom",
} as const

export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType]

// AI Activity Categories
export const AIActivityCategory = {
  ATTRACTION: "attraction",
  RESTAURANT: "restaurant",
  ACTIVITY: "activity",
  TRANSPORT: "transport",
} as const

export type AIActivityCategory = (typeof AIActivityCategory)[keyof typeof AIActivityCategory]

// Activity Colors by Category
export const ACTIVITY_COLORS: Record<AIActivityCategory, string> = {
  [AIActivityCategory.ATTRACTION]: "#3b82f6",
  [AIActivityCategory.RESTAURANT]: "#f97316",
  [AIActivityCategory.ACTIVITY]: "#10b981",
  [AIActivityCategory.TRANSPORT]: "#8b5cf6",
} as const

export const DEFAULT_ACTIVITY_COLOR = "#6b7280"

// Trip Member Roles
export const TripMemberRole = {
  OWNER: "owner",
  EDITOR: "editor",
  VIEWER: "viewer",
} as const

export type TripMemberRole = (typeof TripMemberRole)[keyof typeof TripMemberRole]

// Invitation Status
export const InvitationStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  EXPIRED: "expired",
} as const

export type InvitationStatus = (typeof InvitationStatus)[keyof typeof InvitationStatus]

// Trip Status (derived from dates)
export const TripStatus = {
  PLANNING: "planning",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const

export type TripStatus = (typeof TripStatus)[keyof typeof TripStatus]

// Calendar View Types
export const CalendarView = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
} as const

export type CalendarView = (typeof CalendarView)[keyof typeof CalendarView]

// Flight Status
export const FlightStatus = {
  SCHEDULED: "scheduled",
  ACTIVE: "active",
  LANDED: "landed",
  CANCELLED: "cancelled",
  DIVERTED: "diverted",
  UNKNOWN: "unknown",
} as const

export type FlightStatus = (typeof FlightStatus)[keyof typeof FlightStatus]

// Utility type for creating discriminated unions
export type DiscriminatedUnion<K extends string, T extends Record<K, string>> = {
  [P in T[K]]: { type: P } & Record<string, unknown>
}[T[K]]
