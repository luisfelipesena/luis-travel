import type { Activity } from "../db/schema"
import { tripRepository } from "../repositories/trip.repository"
import { activityService } from "../services/activity.service"
import { aiService } from "../services/ai.service"

interface GenerateItineraryParams {
  tripId: string
  userId: string
  preferences?: string
  autoAdd?: boolean
}

interface GenerateItineraryResult {
  suggestions: {
    title: string
    description: string
    suggestedStartTime: string
    durationMinutes: number
    location: string
    type: string
  }[]
  addedActivities?: Activity[]
}

export class GenerateItineraryUseCase {
  async execute(params: GenerateItineraryParams): Promise<GenerateItineraryResult> {
    const { tripId, userId, preferences, autoAdd } = params

    const role = await tripRepository.getUserRole(tripId, userId)

    if (!role || role === "viewer") {
      throw new Error("Access denied")
    }

    const suggestions = await aiService.generateActivitySuggestions(tripId, userId, preferences)

    if (!autoAdd) {
      return { suggestions }
    }

    const activitiesToCreate = suggestions.map((s) => ({
      title: s.title,
      description: s.description,
      startTime: new Date(s.suggestedStartTime),
      endTime: new Date(new Date(s.suggestedStartTime).getTime() + s.durationMinutes * 60000),
      location: s.location,
      type: "ai_generated" as const,
      color: this.getColorByType(s.type),
      metadata: { aiType: s.type },
    }))

    const addedActivities = await activityService.createManyActivities(
      tripId,
      userId,
      activitiesToCreate
    )

    return { suggestions, addedActivities }
  }

  private getColorByType(type: string): string {
    const colors: Record<string, string> = {
      attraction: "#3b82f6",
      restaurant: "#f97316",
      activity: "#10b981",
      transport: "#8b5cf6",
    }
    return colors[type] || "#6b7280"
  }
}

export const generateItineraryUseCase = new GenerateItineraryUseCase()
