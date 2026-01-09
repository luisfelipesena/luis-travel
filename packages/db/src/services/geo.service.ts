import { type CitySearchResult, nominatimClient } from "../external/nominatim"
import { unsplashService } from "../external/unsplash"

export class GeoService {
  /**
   * Search for cities matching the query
   * Returns a list of cities with coordinates
   */
  async searchCities(query: string, limit = 10): Promise<CitySearchResult[]> {
    if (!query || query.trim().length < 2) {
      return []
    }

    return nominatimClient.searchCities(query.trim(), limit)
  }

  /**
   * Get city information from coordinates
   */
  async getCityFromCoordinates(lat: number, lng: number): Promise<CitySearchResult | null> {
    return nominatimClient.reverseGeocode(lat, lng)
  }

  /**
   * Format city for display
   */
  formatCityDisplay(city: CitySearchResult): string {
    if (city.country) {
      return `${city.name}, ${city.country}`
    }
    return city.name
  }

  /**
   * Get a destination image URL for a city
   * Uses Unsplash for high-quality travel images
   */
  getDestinationImageUrl(
    cityName: string,
    country?: string,
    options?: { width?: number; height?: number }
  ): string {
    return unsplashService.getDestinationImageUrl(cityName, country, {
      ...options,
      keywords: ["travel", "landmark", "tourism"],
    })
  }

  /**
   * Get a stable (consistent) destination image URL for a city
   * Same city always returns same image
   */
  getStableDestinationImageUrl(
    cityName: string,
    country?: string,
    options?: { width?: number; height?: number }
  ): string {
    return unsplashService.getStableDestinationImageUrl(cityName, country, options)
  }
}

export const geoService = new GeoService()
