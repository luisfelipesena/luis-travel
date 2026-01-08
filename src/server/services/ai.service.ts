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

    return openaiClient.generateActivities({
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      preferences,
      existingActivities: existingTitles,
    })
  }
}

export const aiService = new AIService()
