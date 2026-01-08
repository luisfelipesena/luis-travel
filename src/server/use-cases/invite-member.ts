import { addDays } from "date-fns"
import { nanoid } from "nanoid"
import type { Invitation } from "../db/schema"
import { invitationRepository } from "../repositories/invitation.repository"
import { tripRepository } from "../repositories/trip.repository"

interface InviteMemberParams {
  tripId: string
  invitedEmail: string
  role: "editor" | "viewer"
  invitedBy: string
}

export class InviteMemberUseCase {
  async execute(params: InviteMemberParams): Promise<Invitation> {
    const { tripId, invitedEmail, role, invitedBy } = params

    const trip = await tripRepository.findById(tripId)

    if (!trip) {
      throw new Error("Trip not found")
    }

    const userRole = await tripRepository.getUserRole(tripId, invitedBy)

    if (userRole !== "owner") {
      throw new Error("Only trip owner can invite members")
    }

    if (invitedEmail.toLowerCase() === trip.owner?.email?.toLowerCase()) {
      throw new Error("Cannot invite the trip owner")
    }

    const existingInvitations = await invitationRepository.findByTripId(tripId)
    const pendingInvite = existingInvitations.find(
      (i) => i.invitedEmail.toLowerCase() === invitedEmail.toLowerCase() && i.status === "pending"
    )

    if (pendingInvite) {
      throw new Error("User already has a pending invitation")
    }

    const token = nanoid(32)
    const expiresAt = addDays(new Date(), 7)

    return invitationRepository.create({
      tripId,
      invitedEmail,
      role,
      invitedBy,
      token,
      expiresAt,
    })
  }
}

export const inviteMemberUseCase = new InviteMemberUseCase()
