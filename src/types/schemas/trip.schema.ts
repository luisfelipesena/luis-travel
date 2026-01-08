import { z } from "zod"
import { tripMemberRoleSchema } from "../enums"
import { tripDestinationsArraySchema } from "../metadata"
import {
  dateTimeSchema,
  descriptionSchema,
  emailSchema,
  idSchema,
  titleSchema,
  urlSchema,
} from "./base.schema"

// ============================================================================
// Trip Output Schemas (for tRPC .output())
// ============================================================================

/** User reference in relations */
const userRefSchema = z.object({
  id: idSchema,
  name: z.string(),
  email: emailSchema,
  image: z.string().nullable(),
})

/** Base trip fields */
const tripBaseSchema = z.object({
  id: idSchema,
  name: titleSchema,
  description: z.string().nullable(),
  destination: titleSchema,
  destinations: tripDestinationsArraySchema.nullable(),
  startDate: dateTimeSchema,
  endDate: dateTimeSchema,
  coverImage: z.string().nullable(),
  ownerId: idSchema,
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
})

/** Trip output (for list) */
export const tripSchema = tripBaseSchema

export type TripOutput = z.infer<typeof tripSchema>

/** Trip member with user */
const tripMemberWithUserSchema = z.object({
  id: idSchema,
  tripId: idSchema,
  userId: idSchema,
  role: tripMemberRoleSchema,
  joinedAt: dateTimeSchema,
  user: userRefSchema,
})

/** Trip with owner and members (for byId) */
export const tripWithMembersSchema = tripBaseSchema.extend({
  owner: userRefSchema,
  members: z.array(tripMemberWithUserSchema),
})

export type TripWithMembersOutput = z.infer<typeof tripWithMembersSchema>

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
    destinations: tripDestinationsArraySchema.optional(),
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
  destinations: tripDestinationsArraySchema.optional().nullable(),
  startDate: dateTimeSchema.optional(),
  endDate: dateTimeSchema.optional(),
  description: descriptionSchema.optional(),
  coverImage: urlSchema.optional().nullable(),
})

export type UpdateTripInput = z.infer<typeof updateTripInputSchema>

export const deleteTripInputSchema = z.object({ id: idSchema })

export type DeleteTripInput = z.infer<typeof deleteTripInputSchema>
