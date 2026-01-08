import { TRPCError } from "@trpc/server"
import { z } from "zod"
import {
  createTripInputSchema,
  deleteTripInputSchema,
  tripByIdInputSchema,
  tripSchema,
  tripWithMembersSchema,
  updateTripInputSchema,
} from "@luis-travel/types"
import { tripService } from "@luis-travel/db/services"
import { protectedProcedure, router } from "../init"

export const tripRouter = router({
  list: protectedProcedure.output(z.array(tripSchema)).query(async ({ ctx }) => {
    return tripService.getUserTrips(ctx.user.id)
  }),

  byId: protectedProcedure
    .input(tripByIdInputSchema)
    .output(tripWithMembersSchema)
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

  create: protectedProcedure.input(createTripInputSchema).mutation(async ({ ctx, input }) => {
    return tripService.createTrip(ctx.user.id, input)
  }),

  update: protectedProcedure.input(updateTripInputSchema).mutation(async ({ ctx, input }) => {
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

  delete: protectedProcedure.input(deleteTripInputSchema).mutation(async ({ ctx, input }) => {
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
