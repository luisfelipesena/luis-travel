import { isTripDestinationsArray, type TripDestinationsArray } from "@/types"
import { type ActivitySuggestion, openaiClient } from "../external/openai"
import { activityRepository } from "../repositories/activity.repository"
import { tripRepository } from "../repositories/trip.repository"

export class AIService {
  async generateActivitySuggestions(
    tripId: string,
    userId: string,
    preferences?: string
  ): Promise<ActivitySuggestion[]> {
    const trip = await tripRepository.findById(tripId)

    if (!trip) {
      throw new Error("Trip not found")
    }

    const hasAccess = await tripRepository.userHasAccess(tripId, userId)

    if (!hasAccess) {
      throw new Error("Access denied")
    }

    const existingActivities = await activityRepository.findByTripId(tripId)
    const existingTitles = existingActivities.map((a) => a.title)

    // Extract coordinates from destinations JSONB if available
    let destinationLat: number | undefined
    let destinationLng: number | undefined

    if (trip.destinations && isTripDestinationsArray(trip.destinations)) {
      const destinations = trip.destinations as TripDestinationsArray
      const sorted = [...destinations].sort((a, b) => a.order - b.order)
      if (sorted.length > 0) {
        destinationLat = sorted[0].lat
        destinationLng = sorted[0].lng
      }
    }

    return openaiClient.generateActivities({
      destination: trip.destination,
      destinationLat,
      destinationLng,
      startDate: trip.startDate,
      endDate: trip.endDate,
      preferences,
      existingActivities: existingTitles,
    })
  }
}

export const aiService = new AIService()
