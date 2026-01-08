import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ActivitySuggestion {
  title: string
  description: string
  suggestedStartTime: string
  durationMinutes: number
  location: string
  type: "attraction" | "restaurant" | "activity" | "transport"
}

export interface GenerateActivitiesParams {
  destination: string
  startDate: Date
  endDate: Date
  preferences?: string
  existingActivities?: string[]
}

export class OpenAIClient {
  async generateActivities(params: GenerateActivitiesParams): Promise<ActivitySuggestion[]> {
    const { destination, startDate, endDate, preferences, existingActivities } = params

    const existingText = existingActivities?.length
      ? `\nExisting activities to avoid duplicating: ${existingActivities.join(", ")}`
      : ""

    const preferencesText = preferences ? `\nUser preferences: ${preferences}` : ""

    const prompt = `Generate 5 activity suggestions for a trip to ${destination} from ${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}.${preferencesText}${existingText}

Return a JSON object with an "activities" array. Each activity should have:
- title: string (activity name)
- description: string (brief description, 1-2 sentences)
- suggestedStartTime: string (ISO 8601 datetime within trip dates)
- durationMinutes: number (estimated duration)
- location: string (specific location or address)
- type: "attraction" | "restaurant" | "activity" | "transport"

Focus on popular tourist attractions, local restaurants, and unique experiences.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a travel planning assistant. Return only valid JSON.",
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
