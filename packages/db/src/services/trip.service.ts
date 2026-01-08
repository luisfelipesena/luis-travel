import { type Trip, TripMemberRole, type TripWithMembers } from "@luis-travel/types"
import { tripRepository } from "../repositories/trip.repository"
import type { NewTrip } from "../schema"

export class TripService {
  async getUserTrips(userId: string): Promise<Trip[]> {
    return tripRepository.findByUserId(userId)
  }

  async getTripById(tripId: string, userId: string): Promise<TripWithMembers> {
    const trip = await tripRepository.findById(tripId)

    if (!trip) {
      throw new Error("Trip not found")
    }

    const hasAccess = await tripRepository.userHasAccess(tripId, userId)

    if (!hasAccess) {
      throw new Error("Access denied")
    }

    return trip
  }

  async createTrip(
    userId: string,
    data: Omit<NewTrip, "ownerId" | "createdAt" | "updatedAt">
  ): Promise<Trip> {
    return tripRepository.create({
      ...data,
      ownerId: userId,
    })
  }

  async updateTrip(
    tripId: string,
    userId: string,
    data: Partial<Omit<NewTrip, "id" | "ownerId" | "createdAt">>
  ): Promise<Trip> {
    const role = await tripRepository.getUserRole(tripId, userId)

    if (!role || role === TripMemberRole.VIEWER) {
      throw new Error("Access denied")
    }

    return tripRepository.update(tripId, data)
  }

  async deleteTrip(tripId: string, userId: string): Promise<void> {
    const tripWithMembers = await tripRepository.findById(tripId)

    if (!tripWithMembers) {
      throw new Error("Trip not found")
    }

    if (tripWithMembers.ownerId !== userId) {
      throw new Error("Only trip owner can delete")
    }

    await tripRepository.delete(tripId)
  }

  async checkUserAccess(tripId: string, userId: string): Promise<boolean> {
    return tripRepository.userHasAccess(tripId, userId)
  }

  async checkUserCanEdit(tripId: string, userId: string): Promise<boolean> {
    const role = await tripRepository.getUserRole(tripId, userId)
    return role === TripMemberRole.OWNER || role === TripMemberRole.EDITOR
  }
}

export const tripService = new TripService()
