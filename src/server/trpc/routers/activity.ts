import { TRPCError } from "@trpc/server"
import {
  activitiesByDateRangeInputSchema,
  createActivityInputSchema,
  deleteActivityInputSchema,
  listActivitiesByTripInputSchema,
  updateActivityInputSchema,
  updateActivityTimesInputSchema,
} from "@/types"
import { activityService } from "../../services/activity.service"
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
})
