import { and, eq, gt } from "drizzle-orm"
import type { TripMember } from "@luis-travel/types"
import {
  type Invitation,
  InvitationStatus,
  type InvitationWithInviter,
  type InvitationWithRelations,
} from "@luis-travel/types"
import { db } from ".."
import { invitation, type NewInvitation, tripMember } from "../schema"

export class InvitationRepository {
  async findById(id: string): Promise<InvitationWithRelations | undefined> {
    const result = await db.query.invitation.findFirst({
      where: eq(invitation.id, id),
      with: {
        trip: true,
        inviter: true,
      },
    })
    return result as InvitationWithRelations | undefined
  }

  async findByToken(token: string): Promise<InvitationWithRelations | undefined> {
    const result = await db.query.invitation.findFirst({
      where: and(
        eq(invitation.token, token),
        eq(invitation.status, InvitationStatus.PENDING),
        gt(invitation.expiresAt, new Date())
      ),
      with: {
        trip: true,
        inviter: true,
      },
    })
    return result as InvitationWithRelations | undefined
  }

  async findByTripId(tripId: string): Promise<InvitationWithInviter[]> {
    const results = await db.query.invitation.findMany({
      where: eq(invitation.tripId, tripId),
      with: {
        inviter: true,
      },
    })
    return results as InvitationWithInviter[]
  }

  async findPendingByEmail(email: string): Promise<InvitationWithRelations[]> {
    const results = await db.query.invitation.findMany({
      where: and(
        eq(invitation.invitedEmail, email.toLowerCase()),
        eq(invitation.status, InvitationStatus.PENDING),
        gt(invitation.expiresAt, new Date())
      ),
      with: {
        trip: true,
        inviter: true,
      },
    })
    return results as InvitationWithRelations[]
  }

  async create(data: NewInvitation): Promise<Invitation> {
    const [created] = await db
      .insert(invitation)
      .values({ ...data, invitedEmail: data.invitedEmail.toLowerCase() })
      .returning()
    return created as Invitation
  }

  async updateStatus(
    id: string,
    status:
      | typeof InvitationStatus.ACCEPTED
      | typeof InvitationStatus.DECLINED
      | typeof InvitationStatus.EXPIRED
  ): Promise<Invitation> {
    const [updated] = await db
      .update(invitation)
      .set({ status })
      .where(eq(invitation.id, id))
      .returning()
    return updated as Invitation
  }

  async acceptInvitation(
    invitationId: string,
    userId: string
  ): Promise<{ invitation: Invitation; membership: TripMember }> {
    const invite = await this.findById(invitationId)

    if (!invite) {
      throw new Error("Invitation not found")
    }

    const [updatedInvite] = await db
      .update(invitation)
      .set({ status: InvitationStatus.ACCEPTED })
      .where(eq(invitation.id, invitationId))
      .returning()

    const [membership] = await db
      .insert(tripMember)
      .values({
        tripId: invite.tripId,
        userId,
        role: invite.role,
      })
      .returning()

    return { invitation: updatedInvite as Invitation, membership: membership as TripMember }
  }

  async delete(id: string): Promise<void> {
    await db.delete(invitation).where(eq(invitation.id, id))
  }
}

export const invitationRepository = new InvitationRepository()
