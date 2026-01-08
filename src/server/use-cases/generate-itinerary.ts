import {
  ACTIVITY_COLORS,
  ActivityType,
  type AIActivityCategory,
  createAIMetadata,
  DEFAULT_ACTIVITY_COLOR,
  TripMemberRole,
} from "@/types"
import type { Activity } from "../db/schema"
import { createRequestLogger } from "../lib/logger"
import { tripRepository } from "../repositories/trip.repository"
import { activityService } from "../services/activity.service"
import { aiService } from "../services/ai.service"

interface GenerateItineraryParams {
  tripId: string
  userId: string
  preferences?: string
  autoAdd?: boolean
}

interface AISuggestion {
  title: string
  description: string
  suggestedStartTime: string
  durationMinutes: number
  location: string
  locationLat: number
  locationLng: number
  category: AIActivityCategory
  day: number
}

interface GenerateItineraryResult {
  suggestions: AISuggestion[]
  addedActivities?: Activity[]
}

export class GenerateItineraryUseCase {
  async execute(params: GenerateItineraryParams): Promise<GenerateItineraryResult> {
    const log = createRequestLogger("GenerateItinerary")
    const { tripId, userId, preferences, autoAdd } = params

    log.info({ tripId, userId, autoAdd }, "Generating itinerary")

    const role = await tripRepository.getUserRole(tripId, userId)

    if (!role || role === TripMemberRole.VIEWER) {
      log.warn({ tripId, userId, role }, "Access denied for itinerary generation")
      throw new Error("Access denied")
    }

    const suggestions = await aiService.generateActivitySuggestions(tripId, userId, preferences)

    if (!autoAdd) {
      log.info(
        { tripId, suggestionsCount: suggestions.length },
        "Returning suggestions without adding"
      )
      return { suggestions }
    }

    const activitiesToCreate = suggestions.map((s) => ({
      title: s.title,
      description: s.description,
      startTime: new Date(s.suggestedStartTime),
      endTime: new Date(new Date(s.suggestedStartTime).getTime() + s.durationMinutes * 60000),
      location: s.location,
      locationLat: s.locationLat ? String(s.locationLat) : undefined,
      locationLng: s.locationLng ? String(s.locationLng) : undefined,
      type: ActivityType.AI_GENERATED,
      color: this.getColorByCategory(s.category),
      metadata: createAIMetadata(s.category),
    }))

    const addedActivities = await activityService.createManyActivities(
      tripId,
      userId,
      activitiesToCreate
    )

    log.info({ tripId, addedCount: addedActivities.length }, "Activities added successfully")

    return { suggestions, addedActivities }
  }

  private getColorByCategory(category: AIActivityCategory): string {
    return ACTIVITY_COLORS[category] || DEFAULT_ACTIVITY_COLOR
  }
}

export const generateItineraryUseCase = new GenerateItineraryUseCase()
