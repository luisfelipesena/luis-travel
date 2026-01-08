import { z } from "zod"
import { activityTypeSchema, participantStatusSchema } from "../enums"
import {
  dateTimeSchema,
  descriptionSchema,
  hexColorSchema,
  idSchema,
  locationSchema,
  titleSchema,
  tripIdSchema,
  urlSchema,
} from "./base.schema"

// ============================================================================
// Activity Query Inputs
// ============================================================================

export const listActivitiesByTripInputSchema = tripIdSchema

export const activitiesByDateRangeInputSchema = z.object({
  tripId: idSchema,
  startDate: dateTimeSchema,
  endDate: dateTimeSchema,
})

export type ActivitiesByDateRangeInput = z.infer<typeof activitiesByDateRangeInputSchema>

// ============================================================================
// Activity Mutation Inputs
// ============================================================================

export const createActivityInputSchema = z.object({
  tripId: idSchema,
  title: titleSchema,
  description: descriptionSchema.optional(),
  startTime: dateTimeSchema,
  endTime: dateTimeSchema,
  location: locationSchema.optional(),
  locationLat: z.string().optional(),
  locationLng: z.string().optional(),
  imageUrl: urlSchema.optional(),
  color: hexColorSchema.optional(),
  type: activityTypeSchema.optional(),
  participantIds: z.array(idSchema).optional(),
})

export type CreateActivityInput = z.infer<typeof createActivityInputSchema>

export const updateActivityInputSchema = z.object({
  id: idSchema,
  title: titleSchema.optional(),
  description: descriptionSchema.optional().nullable(),
  startTime: dateTimeSchema.optional(),
  endTime: dateTimeSchema.optional(),
  location: locationSchema.optional().nullable(),
  locationLat: z.string().optional().nullable(),
  locationLng: z.string().optional().nullable(),
  imageUrl: urlSchema.optional().nullable(),
  color: hexColorSchema.optional(),
  type: activityTypeSchema.optional(),
  participantIds: z.array(idSchema).optional(),
})

export type UpdateActivityInput = z.infer<typeof updateActivityInputSchema>

export const updateActivityTimesInputSchema = z.object({
  id: idSchema,
  startTime: dateTimeSchema,
  endTime: dateTimeSchema,
})

export type UpdateActivityTimesInput = z.infer<typeof updateActivityTimesInputSchema>

export const deleteActivityInputSchema = z.object({ id: idSchema })

export type DeleteActivityInput = z.infer<typeof deleteActivityInputSchema>

// ============================================================================
// Participant Inputs
// ============================================================================

export const setActivityParticipantsInputSchema = z.object({
  activityId: idSchema,
  participantIds: z.array(idSchema),
})

export type SetActivityParticipantsInput = z.infer<typeof setActivityParticipantsInputSchema>

export const updateParticipantStatusInputSchema = z.object({
  activityId: idSchema,
  status: participantStatusSchema,
})

export type UpdateParticipantStatusInput = z.infer<typeof updateParticipantStatusInputSchema>

export const getActivityWithParticipantsInputSchema = z.object({
  activityId: idSchema,
})

export type GetActivityWithParticipantsInput = z.infer<
  typeof getActivityWithParticipantsInputSchema
>

export const listActivitiesWithParticipantsInputSchema = tripIdSchema

export type ListActivitiesWithParticipantsInput = z.infer<
  typeof listActivitiesWithParticipantsInputSchema
>
