import type { Flight, FlightExternalData } from "@luis-travel/types"
import { asc, eq, inArray } from "drizzle-orm"
import { db } from ".."
import { flight, type NewFlight, trip, tripMember } from "../schema"

export class FlightRepository {
  async findById(id: string): Promise<Flight | undefined> {
    return db.query.flight.findFirst({
      where: eq(flight.id, id),
      with: {
        creator: true,
      },
    })
  }

  async findByUserId(userId: string): Promise<Flight[]> {
    // Get all trips where user is owner or member
    const userTrips = await db
      .selectDistinct({ id: trip.id })
      .from(trip)
      .leftJoin(tripMember, eq(trip.id, tripMember.tripId))
      .where(eq(trip.ownerId, userId))
      .union(
        db
          .selectDistinct({ id: trip.id })
          .from(trip)
          .innerJoin(tripMember, eq(trip.id, tripMember.tripId))
          .where(eq(tripMember.userId, userId))
      )

    const tripIds = userTrips.map((t) => t.id)

    if (tripIds.length === 0) {
      return []
    }

    return db.query.flight.findMany({
      where: inArray(flight.tripId, tripIds),
      orderBy: [asc(flight.departureTime)],
      with: {
        trip: {
          columns: {
            id: true,
            name: true,
            destination: true,
          },
        },
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

  async updateExternalData(id: string, externalData: FlightExternalData): Promise<Flight> {
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
