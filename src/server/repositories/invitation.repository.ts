import { eq, and, gt } from "drizzle-orm"
import { db } from "../db"
import { invitation, tripMember, type NewInvitation, type Invitation } from "../db/schema"

export class InvitationRepository {
  async findById(id: string): Promise<Invitation | undefined> {
    return db.query.invitation.findFirst({
      where: eq(invitation.id, id),
      with: {
        trip: true,
        inviter: true,
      },
    })
  }

  async findByToken(token: string): Promise<Invitation | undefined> {
    return db.query.invitation.findFirst({
      where: and(
        eq(invitation.token, token),
        eq(invitation.status, "pending"),
        gt(invitation.expiresAt, new Date())
      ),
      with: {
        trip: true,
        inviter: true,
      },
    })
  }

  async findByTripId(tripId: string): Promise<Invitation[]> {
    return db.query.invitation.findMany({
      where: eq(invitation.tripId, tripId),
      with: {
        inviter: true,
      },
    })
  }

  async findPendingByEmail(email: string): Promise<Invitation[]> {
    return db.query.invitation.findMany({
      where: and(
        eq(invitation.invitedEmail, email.toLowerCase()),
        eq(invitation.status, "pending"),
        gt(invitation.expiresAt, new Date())
      ),
      with: {
        trip: true,
        inviter: true,
      },
    })
  }

  async create(data: NewInvitation): Promise<Invitation> {
    const [created] = await db
      .insert(invitation)
      .values({ ...data, invitedEmail: data.invitedEmail.toLowerCase() })
      .returning()
    return created
  }

  async updateStatus(
    id: string,
    status: "accepted" | "declined" | "expired"
  ): Promise<Invitation> {
    const [updated] = await db
      .update(invitation)
      .set({ status })
      .where(eq(invitation.id, id))
      .returning()
    return updated
  }

  async acceptInvitation(
    invitationId: string,
    userId: string
  ): Promise<{ invitation: Invitation; membership: typeof tripMember.$inferSelect }> {
    const invite = await this.findById(invitationId)

    if (!invite) {
      throw new Error("Invitation not found")
    }

    const [updatedInvite] = await db
      .update(invitation)
      .set({ status: "accepted" })
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

    return { invitation: updatedInvite, membership }
  }

  async delete(id: string): Promise<void> {
    await db.delete(invitation).where(eq(invitation.id, id))
  }
}

export const invitationRepository = new InvitationRepository()
