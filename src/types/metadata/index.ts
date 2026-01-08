// Activity metadata (discriminated union)
export {
  type ActivityMetadata,
  type AIGeneratedMetadata,
  activityMetadataSchema,
  createAIMetadata,
  createImportedMetadata,
  createManualMetadata,
  type ImportedMetadata,
  isAIGeneratedMetadata,
  isImportedMetadata,
  isManualMetadata,
  type ManualMetadata,
} from "./activity-metadata"

// Flight external data
export {
  createFlightExternalData,
  type FlightExternalData,
  flightExternalDataSchema,
  isFlightExternalData,
  parseFlightExternalData,
} from "./flight-data"

// Trip destination metadata
export {
  createTripDestination,
  formatDestinations,
  getPrimaryDestinationName,
  isTripDestination,
  isTripDestinationsArray,
  type TripDestination,
  type TripDestinationsArray,
  tripDestinationSchema,
  tripDestinationsArraySchema,
} from "./trip-destination"
