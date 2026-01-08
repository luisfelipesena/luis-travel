import OpenAI from "openai"
import type { AIActivityCategory } from "@luis-travel/types"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ActivitySuggestion {
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

export interface GenerateActivitiesParams {
  destination: string
  destinationLat?: number
  destinationLng?: number
  startDate: Date
  endDate: Date
  preferences?: string
  existingActivities?: string[]
}

function calculateTripDays(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

export class OpenAIClient {
  async generateActivities(params: GenerateActivitiesParams): Promise<ActivitySuggestion[]> {
    const {
      destination,
      destinationLat,
      destinationLng,
      startDate,
      endDate,
      preferences,
      existingActivities,
    } = params

    const tripDays = calculateTripDays(startDate, endDate)
    const activitiesPerDay = Math.min(3, Math.ceil(9 / tripDays))
    const totalActivities = Math.min(9, tripDays * activitiesPerDay)

    const existingText = existingActivities?.length
      ? `\nExisting activities to avoid duplicating: ${existingActivities.join(", ")}`
      : ""

    const preferencesText = preferences ? `\nUser preferences: ${preferences}` : ""

    const coordsHint =
      destinationLat && destinationLng
        ? `\nDestination coordinates: lat ${destinationLat}, lng ${destinationLng}. Use these as reference for nearby locations.`
        : ""

    const prompt = `Generate ${totalActivities} activity suggestions for a ${tripDays}-day trip to ${destination} from ${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}.${preferencesText}${existingText}${coordsHint}

IMPORTANT REQUIREMENTS:
1. Distribute activities across ALL ${tripDays} days of the trip (roughly ${activitiesPerDay} per day)
2. Include REAL coordinates (latitude/longitude) for each location - these must be accurate
3. Plan activities in logical order by geography and time
4. Include a mix of attractions, restaurants, and experiences
5. Consider realistic travel times between locations

Return a JSON object with an "activities" array. Each activity MUST have:
- title: string (activity name in Portuguese)
- description: string (brief description in Portuguese, 1-2 sentences)
- suggestedStartTime: string (ISO 8601 datetime, distribute across trip days, start at 9:00 first activity of day)
- durationMinutes: number (estimated duration: attractions 90-180, restaurants 60-90, activities 120)
- location: string (specific location name and address)
- locationLat: number (exact latitude, e.g., -22.9519)
- locationLng: number (exact longitude, e.g., -43.2105)
- category: "attraction" | "restaurant" | "activity" | "transport"
- day: number (which day of the trip, 1 to ${tripDays})

Focus on:
- Iconic tourist attractions and landmarks
- Highly-rated local restaurants (breakfast/lunch/dinner timing)
- Unique cultural experiences
- Logical routing to minimize travel between activities`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert travel planner. Return only valid JSON. Always include accurate GPS coordinates for locations. Respond in Portuguese (Brazil).",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    })

    const content = completion.choices[0].message.content

    if (!content) {
      return []
    }

    const parsed = JSON.parse(content) as { activities: ActivitySuggestion[] }

    return parsed.activities || []
  }
}

export const openaiClient = new OpenAIClient()
