import { z } from "zod"
import { enumValues } from "../utils"

// ============================================================================
// Flight Status
// ============================================================================

export const FlightStatus = {
  SCHEDULED: "scheduled",
  ACTIVE: "active",
  LANDED: "landed",
  CANCELLED: "cancelled",
  DIVERTED: "diverted",
  UNKNOWN: "unknown",
} as const

export type FlightStatus = (typeof FlightStatus)[keyof typeof FlightStatus]

export const FlightStatusValues = enumValues(FlightStatus)

export const flightStatusSchema = z.enum(FlightStatusValues)
