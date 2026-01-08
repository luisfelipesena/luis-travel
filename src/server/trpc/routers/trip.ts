import { TRPCError } from "@trpc/server"
import {
  createTripInputSchema,
  deleteTripInputSchema,
  tripByIdInputSchema,
  updateTripInputSchema,
} from "@/types"
import { tripService } from "../../services/trip.service"
import { protectedProcedure, router } from "../init"

export const tripRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return tripService.getUserTrips(ctx.user.id)
  }),

  byId: protectedProcedure.input(tripByIdInputSchema).query(async ({ ctx, input }) => {
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
