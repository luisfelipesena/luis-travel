import { addDays } from "date-fns"
import { nanoid } from "nanoid"
import { InvitationStatus, TripMemberRole } from "@/types"
import type { Invitation } from "../db/schema"
import { createRequestLogger } from "../lib/logger"
import { invitationRepository } from "../repositories/invitation.repository"
import { tripRepository } from "../repositories/trip.repository"

interface InviteMemberParams {
  tripId: string
  invitedEmail: string
  role: typeof TripMemberRole.EDITOR | typeof TripMemberRole.VIEWER
  invitedBy: string
}

export class InviteMemberUseCase {
  async execute(params: InviteMemberParams): Promise<Invitation> {
    const log = createRequestLogger("InviteMember")
    const { tripId, invitedEmail, role, invitedBy } = params

    log.info({ tripId, invitedEmail, role }, "Processing invitation")

    const trip = await tripRepository.findById(tripId)

    if (!trip) {
      log.warn({ tripId }, "Trip not found")
      throw new Error("Trip not found")
    }

    const userRole = await tripRepository.getUserRole(tripId, invitedBy)

    if (userRole !== TripMemberRole.OWNER) {
      log.warn({ tripId, invitedBy, userRole }, "Only owner can invite")
      throw new Error("Only trip owner can invite members")
    }

    const existingInvitations = await invitationRepository.findByTripId(tripId)
    const pendingInvite = existingInvitations.find(
      (i) =>
        i.invitedEmail.toLowerCase() === invitedEmail.toLowerCase() &&
        i.status === InvitationStatus.PENDING
    )

    if (pendingInvite) {
      log.warn({ tripId, invitedEmail }, "Pending invitation already exists")
      throw new Error("User already has a pending invitation")
    }

    const token = nanoid(32)
    const expiresAt = addDays(new Date(), 7)

    const invitation = await invitationRepository.create({
      tripId,
      invitedEmail,
      role,
      invitedBy,
      token,
      expiresAt,
    })

    log.info({ tripId, invitationId: invitation.id }, "Invitation created successfully")

    return invitation
  }
}

export const inviteMemberUseCase = new InviteMemberUseCase()
