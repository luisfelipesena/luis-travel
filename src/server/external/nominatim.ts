/**
 * Nominatim API Client
 * OpenStreetMap geocoding service
 * https://nominatim.org/release-docs/develop/api/Search/
 *
 * Usage Policy:
 * - Max 1 request per second
 * - Must provide User-Agent header
 * - No heavy usage without permission
 */

const BASE_URL = "https://nominatim.openstreetmap.org"
const USER_AGENT = "LuisTravel/1.0 (travel planning application)"

// Simple in-memory cache with TTL
const cache = new Map<string, { data: NominatimPlace[]; timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

// Rate limiting - track last request time
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 1000 // 1 second between requests

export interface NominatimPlace {
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
  lat: string
  lon: string
  class: string
  type: string
  place_rank: number
  importance: number
  addresstype: string
  name: string
  display_name: string
  address?: {
    city?: string
    town?: string
    village?: string
    municipality?: string
    county?: string
    state?: string
    country?: string
    country_code?: string
  }
  boundingbox: [string, string, string, string]
}

export interface CitySearchResult {
  placeId: number
  name: string
  displayName: string
  lat: number
  lng: number
  country?: string
  countryCode?: string
  type: string
}

export class NominatimClient {
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestTime

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise((resolve) =>
        setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
      )
    }

    lastRequestTime = Date.now()
  }

  private getCacheKey(query: string): string {
    return `city:${query.toLowerCase().trim()}`
  }

  private getCachedResult(key: string): NominatimPlace[] | null {
    const cached = cache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > CACHE_TTL) {
      cache.delete(key)
      return null
    }

    return cached.data
  }

  private setCachedResult(key: string, data: NominatimPlace[]): void {
    cache.set(key, { data, timestamp: Date.now() })
  }

  /**
   * Search for cities by name
   * Returns cities, towns, and villages matching the query
   */
  async searchCities(query: string, limit = 10): Promise<CitySearchResult[]> {
    if (!query || query.trim().length < 2) {
      return []
    }

    const cacheKey = this.getCacheKey(query)
    const cached = this.getCachedResult(cacheKey)

    if (cached) {
      return this.mapPlacesToCities(cached).slice(0, limit)
    }

    await this.waitForRateLimit()

    const params = new URLSearchParams({
      q: query,
      format: "json",
      addressdetails: "1",
      limit: String(Math.min(limit * 2, 20)), // Fetch more to filter
      featuretype: "city", // Focus on cities
      "accept-language": "en,pt-BR", // Prefer English, fallback to Portuguese
    })

    const url = `${BASE_URL}/search?${params.toString()}`

    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`)
    }

    const data: NominatimPlace[] = await response.json()

    // Filter to only include places that are likely cities/towns
    const cityPlaces = data.filter((place) =>
      ["city", "town", "village", "municipality", "administrative"].includes(place.type)
    )

    this.setCachedResult(cacheKey, cityPlaces)

    return this.mapPlacesToCities(cityPlaces).slice(0, limit)
  }

  private mapPlacesToCities(places: NominatimPlace[]): CitySearchResult[] {
    return places.map((place) => ({
      placeId: place.place_id,
      name: this.extractCityName(place),
      displayName: place.display_name,
      lat: Number.parseFloat(place.lat),
      lng: Number.parseFloat(place.lon),
      country: place.address?.country,
      countryCode: place.address?.country_code?.toUpperCase(),
      type: place.type,
    }))
  }

  private extractCityName(place: NominatimPlace): string {
    // Try to get the most relevant city name
    const address = place.address
    if (address) {
      return (
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        place.name ||
        place.display_name.split(",")[0]
      )
    }
    return place.name || place.display_name.split(",")[0]
  }

  /**
   * Reverse geocode coordinates to get city information
   */
  async reverseGeocode(lat: number, lng: number): Promise<CitySearchResult | null> {
    await this.waitForRateLimit()

    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: "json",
      addressdetails: "1",
      zoom: "10", // City level
    })

    const url = `${BASE_URL}/reverse?${params.toString()}`

    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`)
    }

    const place: NominatimPlace = await response.json()

    if (!place || !place.place_id) {
      return null
    }

    return {
      placeId: place.place_id,
      name: this.extractCityName(place),
      displayName: place.display_name,
      lat: Number.parseFloat(place.lat),
      lng: Number.parseFloat(place.lon),
      country: place.address?.country,
      countryCode: place.address?.country_code?.toUpperCase(),
      type: place.type,
    }
  }
}

export const nominatimClient = new NominatimClient()
