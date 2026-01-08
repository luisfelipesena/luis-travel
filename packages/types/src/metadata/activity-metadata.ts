import { z } from "zod"
import { aiActivityCategorySchema } from "../enums"

// ============================================================================
// Activity Metadata - Discriminated Union
// ============================================================================

/** Metadata for AI-generated activities */
const aiGeneratedMetadataSchema = z.object({
  source: z.literal("ai"),
  aiCategory: aiActivityCategorySchema,
  generatedAt: z.string().datetime().optional(),
  promptId: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
})

export type AIGeneratedMetadata = z.infer<typeof aiGeneratedMetadataSchema>

/** Metadata for imported activities (Google Calendar, iCal, etc) */
const importedMetadataSchema = z.object({
  source: z.literal("imported"),
  originalSource: z.string(), // "google_calendar", "ical", "outlook"
  externalId: z.string().optional(),
  importedAt: z.string().datetime().optional(),
})

export type ImportedMetadata = z.infer<typeof importedMetadataSchema>

/** Metadata for manually created activities */
const manualMetadataSchema = z.object({
  source: z.literal("manual"),
})

export type ManualMetadata = z.infer<typeof manualMetadataSchema>

/** Discriminated union for all activity metadata types */
export const activityMetadataSchema = z.discriminatedUnion("source", [
  aiGeneratedMetadataSchema,
  importedMetadataSchema,
  manualMetadataSchema,
])

export type ActivityMetadata = z.infer<typeof activityMetadataSchema>

// ============================================================================
// Type Guards
// ============================================================================

export function isAIGeneratedMetadata(m: ActivityMetadata): m is AIGeneratedMetadata {
  return m.source === "ai"
}

export function isImportedMetadata(m: ActivityMetadata): m is ImportedMetadata {
  return m.source === "imported"
}

export function isManualMetadata(m: ActivityMetadata): m is ManualMetadata {
  return m.source === "manual"
}

// ============================================================================
// Factory Functions
// ============================================================================

import type { AIActivityCategory } from "../enums"

export function createAIMetadata(
  aiCategory: AIActivityCategory,
  options?: { promptId?: string; confidence?: number }
): AIGeneratedMetadata {
  return {
    source: "ai",
    aiCategory,
    generatedAt: new Date().toISOString(),
    ...options,
  }
}

export function createManualMetadata(): ManualMetadata {
  return { source: "manual" }
}

export function createImportedMetadata(
  originalSource: string,
  externalId?: string
): ImportedMetadata {
  return {
    source: "imported",
    originalSource,
    externalId,
    importedAt: new Date().toISOString(),
  }
}
