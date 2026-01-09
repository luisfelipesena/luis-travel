import { geoService } from "@luis-travel/db/services"
import { z } from "zod"
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

const getDestinationImageInputSchema = z.object({
  cityName: z.string().min(1),
  country: z.string().optional(),
  width: z.number().min(100).max(2000).default(800),
  height: z.number().min(100).max(2000).default(600),
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

  /**
   * Get a destination image URL for a city
   * Returns a high-quality travel image URL from Unsplash
   */
  getDestinationImage: publicProcedure
    .input(getDestinationImageInputSchema)
    .output(z.object({ imageUrl: z.string() }))
    .query(({ input }) => {
      const imageUrl = geoService.getDestinationImageUrl(input.cityName, input.country, {
        width: input.width,
        height: input.height,
      })
      return { imageUrl }
    }),
})
