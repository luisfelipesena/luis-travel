const BASE_URL = "https://api.aviationstack.com/v1"

export interface AviationstackFlight {
  flight_date: string
  flight_status: string
  departure: {
    airport: string
    timezone: string
    iata: string
    scheduled: string
    estimated: string
    actual: string | null
    delay: number | null
  }
  arrival: {
    airport: string
    timezone: string
    iata: string
    scheduled: string
    estimated: string
    actual: string | null
    delay: number | null
  }
  airline: {
    name: string
    iata: string
  }
  flight: {
    number: string
    iata: string
  }
}

interface AviationstackResponse {
  pagination: {
    limit: number
    offset: number
    count: number
    total: number
  }
  data: AviationstackFlight[]
}

export class AviationstackClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async searchFlight(flightIata: string): Promise<AviationstackFlight | null> {
    const url = `${BASE_URL}/flights?access_key=${this.apiKey}&flight_iata=${flightIata}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Aviationstack API error: ${response.statusText}`)
    }

    const data: AviationstackResponse = await response.json()

    return data.data?.[0] || null
  }

  async searchFlightByNumber(
    flightNumber: string,
    date?: string
  ): Promise<AviationstackFlight[]> {
    let url = `${BASE_URL}/flights?access_key=${this.apiKey}&flight_iata=${flightNumber}`

    if (date) {
      url += `&flight_date=${date}`
    }

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Aviationstack API error: ${response.statusText}`)
    }

    const data: AviationstackResponse = await response.json()

    return data.data || []
  }
}

export const aviationstackClient = new AviationstackClient(
  process.env.AVIATIONSTACK_API_KEY || ""
)
