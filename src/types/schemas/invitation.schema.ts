import { z } from "zod"
import { assignableRoleSchema } from "../enums"
import { emailSchema, idSchema } from "./base.schema"

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
