import { z } from "zod"
import { enumValues } from "../utils"

// ============================================================================
// Activity Type
// ============================================================================

export const ActivityType = {
  FLIGHT: "flight",
  ACCOMMODATION: "accommodation",
  TRANSPORT: "transport",
  MEAL: "meal",
  ACTIVITY: "activity",
  CUSTOM: "custom",
  AI_GENERATED: "ai_generated",
} as const

export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType]

export const ActivityTypeValues = enumValues(ActivityType)

export const activityTypeSchema = z.enum(ActivityTypeValues)

// ============================================================================
// AI Activity Category
// ============================================================================

export const AIActivityCategory = {
  ATTRACTION: "attraction",
  RESTAURANT: "restaurant",
  ACTIVITY: "activity",
  TRANSPORT: "transport",
} as const

export type AIActivityCategory = (typeof AIActivityCategory)[keyof typeof AIActivityCategory]

export const AIActivityCategoryValues = enumValues(AIActivityCategory)

export const aiActivityCategorySchema = z.enum(AIActivityCategoryValues)

// ============================================================================
// Activity Colors (derived from AIActivityCategory)
// ============================================================================

export const ACTIVITY_COLORS: Record<AIActivityCategory, string> = {
  [AIActivityCategory.ATTRACTION]: "#3b82f6",
  [AIActivityCategory.RESTAURANT]: "#f97316",
  [AIActivityCategory.ACTIVITY]: "#10b981",
  [AIActivityCategory.TRANSPORT]: "#8b5cf6",
} as const

export const DEFAULT_ACTIVITY_COLOR = "#6b7280"

// ============================================================================
// Participant Status
// ============================================================================

export const ParticipantStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  DECLINED: "declined",
} as const

export type ParticipantStatus = (typeof ParticipantStatus)[keyof typeof ParticipantStatus]

export const ParticipantStatusValues = enumValues(ParticipantStatus)

export const participantStatusSchema = z.enum(ParticipantStatusValues)
