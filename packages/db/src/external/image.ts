/**
 * Destination Image Service
 * Uses Lorem Picsum for reliable, consistent destination images
 */

const PICSUM_BASE_URL = "https://picsum.photos"

interface ImageOptions {
  width?: number
  height?: number
}

/**
 * Generate a stable destination image URL using Lorem Picsum
 * Uses seed based on city/country for consistent images per destination
 */
export function getDestinationImageUrl(
  cityName: string,
  country?: string,
  options: ImageOptions = {}
): string {
  const { width = 800, height = 600 } = options

  // Create seed from city name and country for consistency
  const seed = [cityName, country]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")

  return `${PICSUM_BASE_URL}/seed/${encodeURIComponent(seed)}/${width}/${height}`
}

export const imageService = {
  getDestinationImageUrl,
}
