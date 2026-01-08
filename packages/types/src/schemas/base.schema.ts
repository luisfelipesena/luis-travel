import { z } from "zod"
import { coerceDateSchema, emailSchema, hexColorSchema, urlSchema, uuidSchema } from "../utils"

// ============================================================================
// ID Schemas
// ============================================================================

export const idSchema = uuidSchema

export const tripIdSchema = z.object({ tripId: uuidSchema })
export const activityIdSchema = z.object({ id: uuidSchema })

// ============================================================================
// Common Field Schemas
// ============================================================================

export const titleSchema = z.string().min(1).max(255)
export const descriptionSchema = z.string()
export const locationSchema = z.string().max(255)

export const dateTimeSchema = coerceDateSchema

// Re-export for convenience (avoid duplicate declarations)
export { hexColorSchema, urlSchema, emailSchema }

// ============================================================================
// Date Range Schema with validation
// ============================================================================

export const dateRangeSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: "Start date must be before end date",
    path: ["endDate"],
  })

export const timeRangeSchema = z
  .object({
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "Start time must be before end time",
    path: ["endTime"],
  })

// ============================================================================
// Response Schemas
// ============================================================================

export const successResponseSchema = z.object({ success: z.literal(true) })
export type SuccessResponse = z.infer<typeof successResponseSchema>
