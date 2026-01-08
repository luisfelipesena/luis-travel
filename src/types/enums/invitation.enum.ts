import { z } from "zod"
import { enumValues } from "../utils"

// ============================================================================
// Invitation Status
// ============================================================================

export const InvitationStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  EXPIRED: "expired",
} as const

export type InvitationStatus = (typeof InvitationStatus)[keyof typeof InvitationStatus]

export const InvitationStatusValues = enumValues(InvitationStatus)

export const invitationStatusSchema = z.enum(InvitationStatusValues)
