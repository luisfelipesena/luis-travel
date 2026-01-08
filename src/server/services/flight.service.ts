import { TripMemberRole } from "@/types"
import type { Flight, NewFlight } from "../db/schema"
import { type AviationstackFlight, aviationstackClient } from "../external/aviationstack"
import { flightRepository } from "../repositories/flight.repository"
import { tripRepository } from "../repositories/trip.repository"

export class FlightService {
  async getFlightsByTripId(tripId: string, userId: string): Promise<Flight[]> {
    const hasAccess = await tripRepository.userHasAccess(tripId, userId)

    if (!hasAccess) {
      throw new Error("Access denied")
    }

    return flightRepository.findByTripId(tripId)
  }

  async searchFlight(flightNumber: string): Promise<AviationstackFlight | null> {
    return aviationstackClient.searchFlight(flightNumber)
  }

  async createFlight(
    tripId: string,
    userId: string,
    data: Omit<NewFlight, "tripId" | "createdBy" | "createdAt" | "updatedAt">
  ): Promise<Flight> {
    const role = await tripRepository.getUserRole(tripId, userId)

    if (!role || role === TripMemberRole.VIEWER) {
      throw new Error("Access denied")
    }

    return flightRepository.create({
      ...data,
      tripId,
      createdBy: userId,
    })
  }

  async createFlightFromSearch(
    tripId: string,
    userId: string,
    flightNumber: string
  ): Promise<Flight> {
    const role = await tripRepository.getUserRole(tripId, userId)

    if (!role || role === TripMemberRole.VIEWER) {
      throw new Error("Access denied")
    }

    const flightData = await aviationstackClient.searchFlight(flightNumber)

    if (!flightData) {
      throw new Error("Flight not found")
    }

    return flightRepository.create({
      tripId,
      createdBy: userId,
      flightNumber: flightData.flight.iata,
      airline: flightData.airline.name,
      departureAirport: flightData.departure.iata,
      arrivalAirport: flightData.arrival.iata,
      departureTime: new Date(flightData.departure.scheduled),
      arrivalTime: new Date(flightData.arrival.scheduled),
      status: flightData.flight_status,
      externalData: flightData as unknown as Record<string, unknown>,
    })
  }

  async refreshFlightStatus(flightId: string, userId: string): Promise<Flight> {
    const flight = await flightRepository.findById(flightId)

    if (!flight) {
      throw new Error("Flight not found")
    }

    const hasAccess = await tripRepository.userHasAccess(flight.tripId, userId)

    if (!hasAccess) {
      throw new Error("Access denied")
    }

    const flightData = await aviationstackClient.searchFlight(flight.flightNumber)

    if (!flightData) {
      return flight
    }

    return flightRepository.update(flightId, {
      status: flightData.flight_status,
      departureTime: new Date(flightData.departure.scheduled),
      arrivalTime: new Date(flightData.arrival.scheduled),
      externalData: flightData as unknown as Record<string, unknown>,
    })
  }

  async deleteFlight(flightId: string, userId: string): Promise<void> {
    const flight = await flightRepository.findById(flightId)

    if (!flight) {
      throw new Error("Flight not found")
    }

    const role = await tripRepository.getUserRole(flight.tripId, userId)

    if (!role || role === TripMemberRole.VIEWER) {
      throw new Error("Access denied")
    }

    await flightRepository.delete(flightId)
  }
}

export const flightService = new FlightService()
