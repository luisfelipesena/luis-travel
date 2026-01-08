import { z } from "zod"
import { TransportModeValues, RouteStatusValues } from "../enums/routing.enum"

// ============================================================================
// Transport mode schema
// ============================================================================

export const transportModeSchema = z.enum(TransportModeValues)

// ============================================================================
// Coordinate schema
// ============================================================================

export const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export type Coordinate = z.infer<typeof coordinateSchema>

// ============================================================================
// Route leg (segment between two points)
// ============================================================================

export const routeLegSchema = z.object({
  from: coordinateSchema,
  to: coordinateSchema,
  distance: z.number(), // meters
  duration: z.number(), // seconds
  polyline: z.string(), // encoded polyline from OSRM
  mode: transportModeSchema,
})

export type RouteLeg = z.infer<typeof routeLegSchema>

// ============================================================================
// Full route response from OSRM
// ============================================================================

export const osrmRouteResponseSchema = z.object({
  code: z.string(),
  routes: z.array(
    z.object({
      distance: z.number(),
      duration: z.number(),
      geometry: z.string(), // encoded polyline
      legs: z.array(
        z.object({
          distance: z.number(),
          duration: z.number(),
          steps: z.array(z.unknown()).optional(),
        })
      ),
    })
  ),
  waypoints: z
    .array(
      z.object({
        name: z.string(),
        location: z.tuple([z.number(), z.number()]),
      })
    )
    .optional(),
})

export type OSRMRouteResponse = z.infer<typeof osrmRouteResponseSchema>

// ============================================================================
// Route segment with status (for UI state management)
// ============================================================================

export const routeStatusSchema = z.enum(RouteStatusValues)

export const routeSegmentSchema = z.object({
  id: z.string(), // fromActivityId-toActivityId
  fromActivityId: z.string(),
  toActivityId: z.string(),
  status: routeStatusSchema,
  leg: routeLegSchema.nullable(),
  error: z.string().nullable(),
})

export type RouteSegment = z.infer<typeof routeSegmentSchema>

// ============================================================================
// Complete itinerary route data
// ============================================================================

export const itineraryRouteDataSchema = z.object({
  segments: z.array(routeSegmentSchema),
  totalDistance: z.number(), // meters
  totalDuration: z.number(), // seconds
  mode: transportModeSchema,
})

export type ItineraryRouteData = z.infer<typeof itineraryRouteDataSchema>

// ============================================================================
// Route request input
// ============================================================================

export const getRouteInputSchema = z.object({
  waypoints: z.array(coordinateSchema).min(2),
  mode: transportModeSchema.default("walking"),
})

export type GetRouteInput = z.infer<typeof getRouteInputSchema>
