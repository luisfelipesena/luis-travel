import { and, eq } from "drizzle-orm"
import { type Trip, TripMemberRole, type TripMemberWithUser, type TripWithMembers } from "@/types"
import { db } from "../db"
import { type NewTrip, trip, tripMember } from "../db/schema"

export class TripRepository {
  async findById(id: string): Promise<TripWithMembers | undefined> {
    const result = await db.query.trip.findFirst({
      where: eq(trip.id, id),
      with: {
        owner: true,
        members: {
          with: {
            user: true,
          },
        },
      },
    })
    return result as TripWithMembers | undefined
  }

  async findByUserId(userId: string): Promise<Trip[]> {
    const owned = await db.query.trip.findMany({
      where: eq(trip.ownerId, userId),
      orderBy: (trip, { desc }) => [desc(trip.startDate)],
    })

    const memberOf = await db.query.tripMember.findMany({
      where: eq(tripMember.userId, userId),
      with: {
        trip: true,
      },
    })

    const memberTrips = memberOf.map((m) => m.trip).filter((t): t is Trip => t !== null)

    const allTrips = [...owned, ...memberTrips] as Trip[]

    const uniqueTrips = allTrips.filter(
      (t, index, self) => index === self.findIndex((s) => s.id === t.id)
    )

    return uniqueTrips.sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
  }

  async create(data: NewTrip): Promise<Trip> {
    const [created] = await db.insert(trip).values(data).returning()
    return created as Trip
  }

  async update(
    id: string,
    data: Partial<Omit<NewTrip, "id" | "ownerId" | "createdAt">>
  ): Promise<Trip> {
    const [updated] = await db
      .update(trip)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(trip.id, id))
      .returning()
    return updated as Trip
  }

  async delete(id: string): Promise<void> {
    await db.delete(trip).where(eq(trip.id, id))
  }

  async userHasAccess(tripId: string, userId: string): Promise<boolean> {
    const tripData = await db.query.trip.findFirst({
      where: eq(trip.id, tripId),
    })

    if (!tripData) return false
    if (tripData.ownerId === userId) return true

    const membership = await db.query.tripMember.findFirst({
      where: and(eq(tripMember.tripId, tripId), eq(tripMember.userId, userId)),
    })

    return !!membership
  }

  async getUserRole(tripId: string, userId: string): Promise<TripMemberRole | null> {
    const tripData = await db.query.trip.findFirst({
      where: eq(trip.id, tripId),
    })

    if (!tripData) return null
    if (tripData.ownerId === userId) return TripMemberRole.OWNER

    const membership = await db.query.tripMember.findFirst({
      where: and(eq(tripMember.tripId, tripId), eq(tripMember.userId, userId)),
    })

    if (!membership) return null
    return membership.role as TripMemberRole
  }

  async getMembers(tripId: string): Promise<TripMemberWithUser[]> {
    const results = await db.query.tripMember.findMany({
      where: eq(tripMember.tripId, tripId),
      with: {
        user: true,
      },
    })
    return results as TripMemberWithUser[]
  }
}

export const tripRepository = new TripRepository()
