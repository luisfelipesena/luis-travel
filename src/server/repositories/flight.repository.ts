import { asc, eq } from "drizzle-orm"
import { db } from "../db"
import { type Flight, flight, type NewFlight } from "../db/schema"

export class FlightRepository {
  async findById(id: string): Promise<Flight | undefined> {
    return db.query.flight.findFirst({
      where: eq(flight.id, id),
      with: {
        creator: true,
      },
    })
  }

  async findByTripId(tripId: string): Promise<Flight[]> {
    return db.query.flight.findMany({
      where: eq(flight.tripId, tripId),
      orderBy: [asc(flight.departureTime)],
      with: {
        creator: true,
      },
    })
  }

  async create(data: NewFlight): Promise<Flight> {
    const [created] = await db.insert(flight).values(data).returning()
    return created
  }

  async update(
    id: string,
    data: Partial<Omit<NewFlight, "id" | "tripId" | "createdBy" | "createdAt">>
  ): Promise<Flight> {
    const [updated] = await db
      .update(flight)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(flight.id, id))
      .returning()
    return updated
  }

  async updateExternalData(id: string, externalData: Record<string, unknown>): Promise<Flight> {
    const [updated] = await db
      .update(flight)
      .set({ externalData, updatedAt: new Date() })
      .where(eq(flight.id, id))
      .returning()
    return updated
  }

  async delete(id: string): Promise<void> {
    await db.delete(flight).where(eq(flight.id, id))
  }
}

export const flightRepository = new FlightRepository()
