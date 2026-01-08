import { and, asc, eq, gte, lte } from "drizzle-orm"
import {
  type Activity,
  type ActivityParticipant,
  type ActivityParticipantWithUser,
  type ActivityWithCreator,
  type ActivityWithParticipants,
  ParticipantStatus,
} from "@/types"
import { db } from "../db"
import {
  activity,
  activityParticipant,
  type NewActivity,
  type NewActivityParticipant,
} from "../db/schema"

export class ActivityRepository {
  async findById(id: string): Promise<ActivityWithCreator | undefined> {
    const result = await db.query.activity.findFirst({
      where: eq(activity.id, id),
      with: {
        creator: true,
      },
    })
    return result as ActivityWithCreator | undefined
  }

  async findByTripId(tripId: string): Promise<ActivityWithCreator[]> {
    const results = await db.query.activity.findMany({
      where: eq(activity.tripId, tripId),
      orderBy: [asc(activity.startTime)],
      with: {
        creator: true,
      },
    })
    return results as ActivityWithCreator[]
  }

  async findByDateRange(tripId: string, startDate: Date, endDate: Date): Promise<Activity[]> {
    const results = await db.query.activity.findMany({
      where: and(
        eq(activity.tripId, tripId),
        gte(activity.startTime, startDate),
        lte(activity.endTime, endDate)
      ),
      orderBy: [asc(activity.startTime)],
    })
    return results as Activity[]
  }

  async create(data: NewActivity): Promise<Activity> {
    const [created] = await db.insert(activity).values(data).returning()
    return created as Activity
  }

  async createMany(data: NewActivity[]): Promise<Activity[]> {
    if (data.length === 0) return []
    const results = await db.insert(activity).values(data).returning()
    return results as Activity[]
  }

  async update(
    id: string,
    data: Partial<Omit<NewActivity, "id" | "tripId" | "createdBy" | "createdAt">>
  ): Promise<Activity> {
    const [updated] = await db
      .update(activity)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(activity.id, id))
      .returning()
    return updated as Activity
  }

  async updateTimes(id: string, startTime: Date, endTime: Date): Promise<Activity> {
    const [updated] = await db
      .update(activity)
      .set({ startTime, endTime, updatedAt: new Date() })
      .where(eq(activity.id, id))
      .returning()
    return updated as Activity
  }

  async delete(id: string): Promise<void> {
    await db.delete(activity).where(eq(activity.id, id))
  }

  async deleteByTripId(tripId: string): Promise<void> {
    await db.delete(activity).where(eq(activity.tripId, tripId))
  }

  // Participant methods
  async findByIdWithParticipants(id: string): Promise<ActivityWithParticipants | undefined> {
    const result = await db.query.activity.findFirst({
      where: eq(activity.id, id),
      with: {
        creator: true,
        participants: {
          with: {
            user: true,
          },
        },
      },
    })
    return result as ActivityWithParticipants | undefined
  }

  async findByTripIdWithParticipants(tripId: string): Promise<ActivityWithParticipants[]> {
    const results = await db.query.activity.findMany({
      where: eq(activity.tripId, tripId),
      orderBy: [asc(activity.startTime)],
      with: {
        creator: true,
        participants: {
          with: {
            user: true,
          },
        },
      },
    })
    return results as ActivityWithParticipants[]
  }

  async getParticipants(activityId: string): Promise<ActivityParticipantWithUser[]> {
    const results = await db.query.activityParticipant.findMany({
      where: eq(activityParticipant.activityId, activityId),
      with: {
        user: true,
      },
    })
    return results as ActivityParticipantWithUser[]
  }

  async addParticipant(data: NewActivityParticipant): Promise<ActivityParticipant> {
    const [created] = await db.insert(activityParticipant).values(data).returning()
    return created as ActivityParticipant
  }

  async removeParticipant(activityId: string, userId: string): Promise<void> {
    await db
      .delete(activityParticipant)
      .where(
        and(eq(activityParticipant.activityId, activityId), eq(activityParticipant.userId, userId))
      )
  }

  async setParticipants(activityId: string, userIds: string[]): Promise<void> {
    // Delete existing participants
    await db.delete(activityParticipant).where(eq(activityParticipant.activityId, activityId))

    // Add new participants
    if (userIds.length > 0) {
      await db.insert(activityParticipant).values(
        userIds.map((userId) => ({
          activityId,
          userId,
          status: ParticipantStatus.PENDING,
        }))
      )
    }
  }

  async updateParticipantStatus(
    activityId: string,
    userId: string,
    status: ParticipantStatus
  ): Promise<void> {
    await db
      .update(activityParticipant)
      .set({ status })
      .where(
        and(eq(activityParticipant.activityId, activityId), eq(activityParticipant.userId, userId))
      )
  }
}

export const activityRepository = new ActivityRepository()
