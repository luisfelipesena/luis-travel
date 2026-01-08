import { z } from "zod"
import { router, protectedProcedure } from "../init"
import { activityService } from "../../services/activity.service"
import { TRPCError } from "@trpc/server"

export const activityRouter = router({
  listByTrip: protectedProcedure
    .input(z.object({ tripId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        return await activityService.getActivitiesByTripId(
          input.tripId,
          ctx.user.id
        )
      } catch (error) {
        if (error instanceof Error && error.message === "Access denied") {
          throw new TRPCError({ code: "FORBIDDEN", message: error.message })
        }
        throw error
      }
    }),

  byDateRange: protectedProcedure
    .input(
      z.object({
        tripId: z.string().uuid(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
      })
    )
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

  create: protectedProcedure
    .input(
      z.object({
        tripId: z.string().uuid(),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        startTime: z.coerce.date(),
        endTime: z.coerce.date(),
        location: z.string().max(255).optional(),
        imageUrl: z.string().url().optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        type: z.enum(["default", "ai_generated", "custom"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional().nullable(),
        startTime: z.coerce.date().optional(),
        endTime: z.coerce.date().optional(),
        location: z.string().max(255).optional().nullable(),
        imageUrl: z.string().url().optional().nullable(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
    .input(
      z.object({
        id: z.string().uuid(),
        startTime: z.coerce.date(),
        endTime: z.coerce.date(),
      })
    )
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

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
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
