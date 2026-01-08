import { TRPCError } from "@trpc/server"
import {
  activitiesByDateRangeInputSchema,
  createActivityInputSchema,
  deleteActivityInputSchema,
  getActivityWithParticipantsInputSchema,
  listActivitiesByTripInputSchema,
  listActivitiesWithParticipantsInputSchema,
  setActivityParticipantsInputSchema,
  updateActivityInputSchema,
  updateActivityTimesInputSchema,
  updateParticipantStatusInputSchema,
} from "@luis-travel/types"
import { activityService } from "@luis-travel/db/services"
import { protectedProcedure, router } from "../init"

export const activityRouter = router({
  listByTrip: protectedProcedure
    .input(listActivitiesByTripInputSchema)
    .query(async ({ ctx, input }) => {
      try {
        return await activityService.getActivitiesByTripId(input.tripId, ctx.user.id)
      } catch (error) {
        if (error instanceof Error && error.message === "Access denied") {
          throw new TRPCError({ code: "FORBIDDEN", message: error.message })
        }
        throw error
      }
    }),

  byDateRange: protectedProcedure
    .input(activitiesByDateRangeInputSchema)
    .query(async ({ ctx, input }) => {
      try {
        return await activityService.getActivitiesByDateRange(
          input.tripId,
          ctx.user.id,
          input.startDate,
          input.endDate
        )
      } catch (error) {
        if (error instanceof Error && error.message === "Access denied") {
          throw new TRPCError({ code: "FORBIDDEN", message: error.message })
        }
        throw error
      }
    }),

  create: protectedProcedure.input(createActivityInputSchema).mutation(async ({ ctx, input }) => {
    const { tripId, ...data } = input

    try {
      return await activityService.createActivity(tripId, ctx.user.id, data)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Access denied") {
          throw new TRPCError({ code: "FORBIDDEN", message: error.message })
        }
        if (error.message === "Start time must be before end time") {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message })
        }
      }
      throw error
    }
  }),

  update: protectedProcedure.input(updateActivityInputSchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input

    try {
      return await activityService.updateActivity(id, ctx.user.id, data)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Activity not found") {
          throw new TRPCError({ code: "NOT_FOUND", message: error.message })
        }
        if (error.message === "Access denied") {
          throw new TRPCError({ code: "FORBIDDEN", message: error.message })
        }
      }
      throw error
    }
  }),

  updateTimes: protectedProcedure
    .input(updateActivityTimesInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await activityService.updateActivityTimes(
          input.id,
          ctx.user.id,
          input.startTime,
          input.endTime
        )
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "Activity not found") {
            throw new TRPCError({ code: "NOT_FOUND", message: error.message })
          }
          if (error.message === "Access denied") {
            throw new TRPCError({ code: "FORBIDDEN", message: error.message })
          }
          if (error.message === "Start time must be before end time") {
            throw new TRPCError({ code: "BAD_REQUEST", message: error.message })
          }
        }
        throw error
      }
    }),

  delete: protectedProcedure.input(deleteActivityInputSchema).mutation(async ({ ctx, input }) => {
    try {
      await activityService.deleteActivity(input.id, ctx.user.id)
      return { success: true }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Activity not found") {
          throw new TRPCError({ code: "NOT_FOUND", message: error.message })
        }
        if (error.message === "Access denied") {
          throw new TRPCError({ code: "FORBIDDEN", message: error.message })
        }
      }
      throw error
    }
  }),

  // Participant endpoints
  getWithParticipants: protectedProcedure
    .input(getActivityWithParticipantsInputSchema)
    .query(async ({ ctx, input }) => {
      try {
        return await activityService.getActivityWithParticipants(input.activityId, ctx.user.id)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "Activity not found") {
            throw new TRPCError({ code: "NOT_FOUND", message: error.message })
          }
          if (error.message === "Access denied") {
            throw new TRPCError({ code: "FORBIDDEN", message: error.message })
          }
        }
        throw error
      }
    }),

  listWithParticipants: protectedProcedure
    .input(listActivitiesWithParticipantsInputSchema)
    .query(async ({ ctx, input }) => {
      try {
        return await activityService.getActivitiesWithParticipants(input.tripId, ctx.user.id)
      } catch (error) {
        if (error instanceof Error && error.message === "Access denied") {
          throw new TRPCError({ code: "FORBIDDEN", message: error.message })
        }
        throw error
      }
    }),

  setParticipants: protectedProcedure
    .input(setActivityParticipantsInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await activityService.setActivityParticipants(
          input.activityId,
          ctx.user.id,
          input.participantIds
        )
        return { success: true }
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "Activity not found") {
            throw new TRPCError({ code: "NOT_FOUND", message: error.message })
          }
          if (error.message === "Access denied") {
            throw new TRPCError({ code: "FORBIDDEN", message: error.message })
          }
          if (error.message === "Invalid participant - not a trip member") {
            throw new TRPCError({ code: "BAD_REQUEST", message: error.message })
          }
        }
        throw error
      }
    }),

  updateMyParticipantStatus: protectedProcedure
    .input(updateParticipantStatusInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await activityService.updateParticipantStatus(input.activityId, ctx.user.id, input.status)
        return { success: true }
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "Activity not found") {
            throw new TRPCError({ code: "NOT_FOUND", message: error.message })
          }
          if (error.message === "Access denied") {
            throw new TRPCError({ code: "FORBIDDEN", message: error.message })
          }
        }
        throw error
      }
    }),
})
