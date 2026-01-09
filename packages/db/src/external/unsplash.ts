/**
 * Unsplash Image Service
 * Uses Unsplash Source for destination images (no API key required)
 *
 * For production, consider upgrading to Unsplash API with proper attribution
 * https://unsplash.com/documentation
 */

const UNSPLASH_SOURCE_URL = "https://source.unsplash.com"

interface DestinationImageOptions {
  width?: number
  height?: number
  keywords?: string[]
}

/**
 * Generate a destination image URL using Unsplash Source
 * Uses city name and country to create relevant search terms
 */
export function getDestinationImageUrl(
  cityName: string,
  country?: string,
  options: DestinationImageOptions = {}
): string {
  const { width = 800, height = 600, keywords = ["travel", "city", "landmark"] } = options

  // Build search query with city name and optional country
  const searchTerms = [cityName, country, ...keywords]
    .filter(Boolean)
    .map((term) => encodeURIComponent(term!.toLowerCase()))
    .join(",")

  // Using Unsplash Source featured endpoint
  // Format: https://source.unsplash.com/featured/{width}x{height}/?{query}
  return `${UNSPLASH_SOURCE_URL}/featured/${width}x${height}/?${searchTerms}`
}

/**
 * Generate a stable destination image URL using a seed
 * This ensures the same city always gets the same image
 */
export function getStableDestinationImageUrl(
  cityName: string,
  country?: string,
  options: DestinationImageOptions = {}
): string {
  const { width = 800, height = 600 } = options

  // Create a simple hash from city name for consistency
  const seed = `${cityName}-${country || ""}`.toLowerCase().replace(/\s+/g, "-")

  // Using picsum.photos with seed for stable images
  // This is more reliable than Unsplash Source for consistent images
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`
}

/**
 * Get a high-quality destination image using multiple fallback sources
 */
export async function fetchDestinationImage(
  cityName: string,
  country?: string
): Promise<string> {
  // Primary: Unsplash Source (random but high quality)
  const unsplashUrl = getDestinationImageUrl(cityName, country)

  // Fallback: Stable image from picsum
  const fallbackUrl = getStableDestinationImageUrl(cityName, country)

  // Try to verify Unsplash URL is accessible
  try {
    const response = await fetch(unsplashUrl, { method: "HEAD" })
    if (response.ok) {
      return unsplashUrl
    }
  } catch {
    // Unsplash source failed, use fallback
  }

  return fallbackUrl
}

export const unsplashService = {
  getDestinationImageUrl,
  getStableDestinationImageUrl,
  fetchDestinationImage,
}
