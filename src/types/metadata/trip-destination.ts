import { z } from "zod"

// ============================================================================
// Trip Destination Schema (for JSONB array in trips table)
// ============================================================================

export const tripDestinationSchema = z.object({
  name: z.string().min(1, "Destination name is required"),
  lat: z.number(),
  lng: z.number(),
  order: z.number().int().min(0),
  country: z.string().optional(),
  countryCode: z.string().length(2).optional(),
  fromFlight: z.string().optional(), // Flight number if derived from flight lookup
})

export type TripDestination = z.infer<typeof tripDestinationSchema>

export const tripDestinationsArraySchema = z.array(tripDestinationSchema)

export type TripDestinationsArray = z.infer<typeof tripDestinationsArraySchema>

// ============================================================================
// Factory Functions
// ============================================================================

export function createTripDestination(params: {
  name: string
  lat: number
  lng: number
  order: number
  country?: string
  countryCode?: string
  fromFlight?: string
}): TripDestination {
  return tripDestinationSchema.parse(params)
}

// ============================================================================
// Type Guards
// ============================================================================

export function isTripDestination(value: unknown): value is TripDestination {
  return tripDestinationSchema.safeParse(value).success
}

export function isTripDestinationsArray(value: unknown): value is TripDestinationsArray {
  return tripDestinationsArraySchema.safeParse(value).success
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the primary destination name from destinations array
 */
export function getPrimaryDestinationName(destinations: TripDestinationsArray): string {
  if (destinations.length === 0) return ""
  const sorted = [...destinations].sort((a, b) => a.order - b.order)
  return sorted[0].name
}

/**
 * Format destinations as a display string
 * e.g., "Paris, Tokyo, New York" or "Paris → Tokyo → New York"
 */
export function formatDestinations(
  destinations: TripDestinationsArray,
  separator: "comma" | "arrow" = "comma"
): string {
  if (destinations.length === 0) return ""
  const sorted = [...destinations].sort((a, b) => a.order - b.order)
  const names = sorted.map((d) => d.name.split(",")[0]) // Get city name only
  return separator === "arrow" ? names.join(" → ") : names.join(", ")
}
