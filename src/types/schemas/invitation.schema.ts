import { z } from "zod"
import { assignableRoleSchema, invitationStatusSchema, tripMemberRoleSchema } from "../enums"
import { dateTimeSchema, emailSchema, idSchema, titleSchema } from "./base.schema"

// ============================================================================
// Invitation Output Schemas (for tRPC .output())
// ============================================================================

/** User reference in relations */
const userRefSchema = z.object({
  id: idSchema,
  name: z.string(),
  email: emailSchema,
})

/** Trip reference in relations */
const tripRefSchema = z.object({
  id: idSchema,
  name: titleSchema,
  destination: titleSchema,
  startDate: dateTimeSchema,
  endDate: dateTimeSchema,
})

/** Base invitation fields - uses tripMemberRoleSchema because DB stores TripMemberRole */
const invitationBaseSchema = z.object({
  id: idSchema,
  tripId: idSchema,
  invitedEmail: emailSchema,
  role: tripMemberRoleSchema, // DB stores TripMemberRole, not AssignableRole
  status: invitationStatusSchema,
  token: z.string(),
  invitedBy: idSchema,
  expiresAt: dateTimeSchema,
  createdAt: dateTimeSchema,
})

/** Invitation with inviter relation (for listByTrip) */
export const invitationWithInviterSchema = invitationBaseSchema.extend({
  inviter: userRefSchema,
})

export type InvitationWithInviterOutput = z.infer<typeof invitationWithInviterSchema>

/** Invitation with all relations (for myPendingInvitations, findById, findByToken) */
export const invitationWithRelationsSchema = invitationBaseSchema.extend({
  trip: tripRefSchema,
  inviter: userRefSchema,
})

export type InvitationWithRelationsOutput = z.infer<typeof invitationWithRelationsSchema>

// ============================================================================
// Invitation Query Inputs
// ============================================================================

export const invitationsByTripInputSchema = z.object({ tripId: idSchema })

export type InvitationsByTripInput = z.infer<typeof invitationsByTripInputSchema>

// ============================================================================
// Invitation Mutation Inputs
// ============================================================================

export const sendInvitationInputSchema = z.object({
  tripId: idSchema,
  email: emailSchema,
  role: assignableRoleSchema,
})

export type SendInvitationInput = z.infer<typeof sendInvitationInputSchema>

export const acceptInvitationInputSchema = z.object({
  token: z.string().min(1),
})

export type AcceptInvitationInput = z.infer<typeof acceptInvitationInputSchema>

export const declineInvitationInputSchema = z.object({ id: idSchema })

export type DeclineInvitationInput = z.infer<typeof declineInvitationInputSchema>

export const cancelInvitationInputSchema = z.object({ id: idSchema })

export type CancelInvitationInput = z.infer<typeof cancelInvitationInputSchema>
