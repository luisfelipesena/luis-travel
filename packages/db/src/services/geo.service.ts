import { imageService } from "../external/image"
import { type CitySearchResult, nominatimClient } from "../external/nominatim"

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
   * Uses Lorem Picsum for reliable images
   */
  getDestinationImageUrl(
    cityName: string,
    country?: string,
    options?: { width?: number; height?: number }
  ): string {
    return imageService.getDestinationImageUrl(cityName, country, options)
  }
}

export const geoService = new GeoService()
