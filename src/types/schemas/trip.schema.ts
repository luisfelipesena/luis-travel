import { z } from "zod"
import { dateTimeSchema, descriptionSchema, idSchema, titleSchema, urlSchema } from "./base.schema"

// ============================================================================
// Trip Query Inputs
// ============================================================================

export const tripByIdInputSchema = z.object({ id: idSchema })

export type TripByIdInput = z.infer<typeof tripByIdInputSchema>

// ============================================================================
// Trip Mutation Inputs
// ============================================================================

export const createTripInputSchema = z
  .object({
    name: titleSchema,
    destination: titleSchema,
    startDate: dateTimeSchema,
    endDate: dateTimeSchema,
    description: descriptionSchema.optional(),
    coverImage: urlSchema.optional(),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: "Start date must be before end date",
    path: ["endDate"],
  })

export type CreateTripInput = z.infer<typeof createTripInputSchema>

export const updateTripInputSchema = z.object({
  id: idSchema,
  name: titleSchema.optional(),
  destination: titleSchema.optional(),
  startDate: dateTimeSchema.optional(),
  endDate: dateTimeSchema.optional(),
  description: descriptionSchema.optional(),
  coverImage: urlSchema.optional().nullable(),
})

export type UpdateTripInput = z.infer<typeof updateTripInputSchema>

export const deleteTripInputSchema = z.object({ id: idSchema })

export type DeleteTripInput = z.infer<typeof deleteTripInputSchema>
