import type { Invitation, TripMember } from "../db/schema"
import { invitationRepository } from "../repositories/invitation.repository"
import { tripRepository } from "../repositories/trip.repository"

interface AcceptInvitationResult {
  invitation: Invitation
  membership: TripMember
}

export class AcceptInvitationUseCase {
  async execute(token: string, userId: string): Promise<AcceptInvitationResult> {
    const invitation = await invitationRepository.findByToken(token)

    if (!invitation) {
      throw new Error("Invalid or expired invitation")
    }

    if (new Date() > invitation.expiresAt) {
      await invitationRepository.updateStatus(invitation.id, "expired")
      throw new Error("Invitation has expired")
    }

    const existingAccess = await tripRepository.userHasAccess(invitation.tripId, userId)

    if (existingAccess) {
      throw new Error("You already have access to this trip")
    }

    return invitationRepository.acceptInvitation(invitation.id, userId)
  }
}

export const acceptInvitationUseCase = new AcceptInvitationUseCase()
