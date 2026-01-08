import { z } from "zod"
import { router, protectedProcedure } from "../init"
import { tripService } from "../../services/trip.service"
import { TRPCError } from "@trpc/server"

export const tripRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return tripService.getUserTrips(ctx.user.id)
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        return await tripService.getTripById(input.id, ctx.user.id)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "Trip not found") {
            throw new TRPCError({ code: "NOT_FOUND", message: error.message })
          }
          if (error.message === "Access denied") {
            throw new TRPCError({ code: "FORBIDDEN", message: error.message })
          }
        }
        throw error
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        destination: z.string().min(1).max(255),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        description: z.string().optional(),
        coverImage: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.startDate >= input.endDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Start date must be before end date",
        })
      }

      return tripService.createTrip(ctx.user.id, input)
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255).optional(),
        destination: z.string().min(1).max(255).optional(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        description: z.string().optional(),
        coverImage: z.string().url().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      try {
        return await tripService.updateTrip(id, ctx.user.id, data)
      } catch (error) {
        if (error instanceof Error && error.message === "Access denied") {
          throw new TRPCError({ code: "FORBIDDEN", message: error.message })
        }
        throw error
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await tripService.deleteTrip(input.id, ctx.user.id)
        return { success: true }
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "Trip not found") {
            throw new TRPCError({ code: "NOT_FOUND", message: error.message })
          }
          if (error.message === "Only trip owner can delete") {
            throw new TRPCError({ code: "FORBIDDEN", message: error.message })
          }
        }
        throw error
      }
    }),
})
