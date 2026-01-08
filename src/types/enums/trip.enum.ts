import { z } from "zod"
import { enumValues } from "../utils"

// ============================================================================
// Trip Member Role
// ============================================================================

export const TripMemberRole = {
  OWNER: "owner",
  EDITOR: "editor",
  VIEWER: "viewer",
} as const

export type TripMemberRole = (typeof TripMemberRole)[keyof typeof TripMemberRole]

export const TripMemberRoleValues = enumValues(TripMemberRole)

export const tripMemberRoleSchema = z.enum(TripMemberRoleValues)

/** Roles that can be assigned via invitation (excludes OWNER) */
export const AssignableRoleValues = [TripMemberRole.EDITOR, TripMemberRole.VIEWER] as const
export type AssignableRole = (typeof AssignableRoleValues)[number]
export const assignableRoleSchema = z.enum(AssignableRoleValues)

// ============================================================================
// Trip Status (derived from dates)
// ============================================================================

export const TripStatus = {
  PLANNING: "planning",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const

export type TripStatus = (typeof TripStatus)[keyof typeof TripStatus]

export const TripStatusValues = enumValues(TripStatus)

export const tripStatusSchema = z.enum(TripStatusValues)
