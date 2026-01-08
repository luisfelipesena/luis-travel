import { z } from "zod"
import { geoService } from "../../services/geo.service"
import { publicProcedure, router } from "../init"

// ============================================================================
// Input Schemas
// ============================================================================

const searchCitiesInputSchema = z.object({
  query: z.string().min(2, "Query must be at least 2 characters"),
  limit: z.number().min(1).max(20).default(10),
})

const reverseGeocodeInputSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

// ============================================================================
// Output Schemas
// ============================================================================

const cityResultSchema = z.object({
  placeId: z.number(),
  name: z.string(),
  displayName: z.string(),
  lat: z.number(),
  lng: z.number(),
  country: z.string().optional(),
  countryCode: z.string().optional(),
  type: z.string(),
})

// ============================================================================
// Router
// ============================================================================

export const geoRouter = router({
  /**
   * Search for cities by name
   * Public procedure - no auth required for city search
   */
  searchCities: publicProcedure
    .input(searchCitiesInputSchema)
    .output(z.array(cityResultSchema))
    .query(async ({ input }) => {
      const results = await geoService.searchCities(input.query, input.limit)
      return results
    }),

  /**
   * Reverse geocode coordinates to get city info
   */
  reverseGeocode: publicProcedure
    .input(reverseGeocodeInputSchema)
    .output(cityResultSchema.nullable())
    .query(async ({ input }) => {
      const result = await geoService.getCityFromCoordinates(input.lat, input.lng)
      return result
    }),
})
