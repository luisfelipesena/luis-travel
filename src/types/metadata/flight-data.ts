import { z } from "zod"

// ============================================================================
// Flight External Data - Typed Aviationstack Response
// ============================================================================

const airportInfoSchema = z.object({
  airport: z.string(),
  timezone: z.string(),
  iata: z.string(),
  scheduled: z.string(),
  estimated: z.string().nullable(),
  actual: z.string().nullable(),
  delay: z.number().nullable(),
})

const airlineInfoSchema = z.object({
  name: z.string(),
  iata: z.string(),
})

const flightInfoSchema = z.object({
  number: z.string(),
  iata: z.string(),
})

/** Schema for Aviationstack API response stored in externalData */
export const flightExternalDataSchema = z.object({
  provider: z.literal("aviationstack"),
  flight_date: z.string(),
  flight_status: z.string(),
  departure: airportInfoSchema,
  arrival: airportInfoSchema,
  airline: airlineInfoSchema,
  flight: flightInfoSchema,
  fetchedAt: z.string().datetime(),
})

export type FlightExternalData = z.infer<typeof flightExternalDataSchema>

// ============================================================================
// Type Guards & Validators
// ============================================================================

export function isFlightExternalData(data: unknown): data is FlightExternalData {
  return flightExternalDataSchema.safeParse(data).success
}

/** Safely parse external data, return null if invalid */
export function parseFlightExternalData(data: unknown): FlightExternalData | null {
  const result = flightExternalDataSchema.safeParse(data)
  return result.success ? result.data : null
}

// ============================================================================
// Factory Function
// ============================================================================

interface AviationstackRawResponse {
  flight_date: string
  flight_status: string
  departure: {
    airport: string
    timezone: string
    iata: string
    scheduled: string
    estimated?: string | null
    actual?: string | null
    delay?: number | null
  }
  arrival: {
    airport: string
    timezone: string
    iata: string
    scheduled: string
    estimated?: string | null
    actual?: string | null
    delay?: number | null
  }
  airline: {
    name: string
    iata: string
  }
  flight: {
    number: string
    iata: string
  }
}

export function createFlightExternalData(raw: AviationstackRawResponse): FlightExternalData {
  return {
    provider: "aviationstack",
    flight_date: raw.flight_date,
    flight_status: raw.flight_status,
    departure: {
      airport: raw.departure.airport,
      timezone: raw.departure.timezone,
      iata: raw.departure.iata,
      scheduled: raw.departure.scheduled,
      estimated: raw.departure.estimated ?? null,
      actual: raw.departure.actual ?? null,
      delay: raw.departure.delay ?? null,
    },
    arrival: {
      airport: raw.arrival.airport,
      timezone: raw.arrival.timezone,
      iata: raw.arrival.iata,
      scheduled: raw.arrival.scheduled,
      estimated: raw.arrival.estimated ?? null,
      actual: raw.arrival.actual ?? null,
      delay: raw.arrival.delay ?? null,
    },
    airline: raw.airline,
    flight: raw.flight,
    fetchedAt: new Date().toISOString(),
  }
}
