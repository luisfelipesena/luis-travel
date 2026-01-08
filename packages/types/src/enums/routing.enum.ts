import { enumValues } from "../utils"

/**
 * Transport modes supported by OSRM routing
 */
export const TransportMode = {
  DRIVING: "driving",
  WALKING: "walking",
  CYCLING: "cycling",
} as const

export type TransportMode = (typeof TransportMode)[keyof typeof TransportMode]
export const TransportModeValues = enumValues(TransportMode)

/**
 * Route segment status
 */
export const RouteStatus = {
  PENDING: "pending",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const

export type RouteStatus = (typeof RouteStatus)[keyof typeof RouteStatus]
export const RouteStatusValues = enumValues(RouteStatus)
