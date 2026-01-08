import { and, asc, eq, gte, lte } from "drizzle-orm"
import { db } from "../db"
import { type Activity, activity, type NewActivity } from "../db/schema"

export class ActivityRepository {
  async findById(id: string): Promise<Activity | undefined> {
    return db.query.activity.findFirst({
      where: eq(activity.id, id),
      with: {
        creator: true,
      },
    })
  }

  async findByTripId(tripId: string): Promise<Activity[]> {
    return db.query.activity.findMany({
      where: eq(activity.tripId, tripId),
      orderBy: [asc(activity.startTime)],
      with: {
        creator: true,
      },
    })
  }

  async findByDateRange(tripId: string, startDate: Date, endDate: Date): Promise<Activity[]> {
    return db.query.activity.findMany({
      where: and(
        eq(activity.tripId, tripId),
        gte(activity.startTime, startDate),
        lte(activity.endTime, endDate)
      ),
      orderBy: [asc(activity.startTime)],
    })
  }

  async create(data: NewActivity): Promise<Activity> {
    const [created] = await db.insert(activity).values(data).returning()
    return created
  }

  async createMany(data: NewActivity[]): Promise<Activity[]> {
    if (data.length === 0) return []
    return db.insert(activity).values(data).returning()
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
    return updated
  }

  async updateTimes(id: string, startTime: Date, endTime: Date): Promise<Activity> {
    const [updated] = await db
      .update(activity)
      .set({ startTime, endTime, updatedAt: new Date() })
      .where(eq(activity.id, id))
      .returning()
    return updated
  }

  async delete(id: string): Promise<void> {
    await db.delete(activity).where(eq(activity.id, id))
  }

  async deleteByTripId(tripId: string): Promise<void> {
    await db.delete(activity).where(eq(activity.tripId, tripId))
  }
}

export const activityRepository = new ActivityRepository()
