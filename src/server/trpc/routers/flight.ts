import { z } from "zod"
import { router, protectedProcedure } from "../init"
import { flightService } from "../../services/flight.service"
import { TRPCError } from "@trpc/server"

export const flightRouter = router({
  listByTrip: protectedProcedure
    .input(z.object({ tripId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        return await flightService.getFlightsByTripId(input.tripId, ctx.user.id)
      } catch (error) {
        if (error instanceof Error && error.message === "Access denied") {
          throw new TRPCError({ code: "FORBIDDEN", message: error.message })
        }
        throw error
      }
    }),

  search: protectedProcedure
    .input(z.object({ flightNumber: z.string().min(2).max(10) }))
    .query(async ({ input }) => {
      const flight = await flightService.searchFlight(input.flightNumber)

      if (!flight) {
        return null
      }

      return {
        flightNumber: flight.flight.iata,
        airline: flight.airline.name,
        status: flight.flight_status,
        departure: {
          airport: flight.departure.airport,
          iata: flight.departure.iata,
          scheduled: flight.departure.scheduled,
          estimated: flight.departure.estimated,
        },
        arrival: {
          airport: flight.arrival.airport,
          iata: flight.arrival.iata,
          scheduled: flight.arrival.scheduled,
          estimated: flight.arrival.estimated,
        },
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        tripId: z.string().uuid(),
        flightNumber: z.string().min(2).max(50),
        airline: z.string().max(255).optional(),
        departureAirport: z.string().min(2).max(10),
        arrivalAirport: z.string().min(2).max(10),
        departureTime: z.coerce.date(),
        arrivalTime: z.coerce.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { tripId, ...data } = input

      try {
        return await flightService.createFlight(tripId, ctx.user.id, data)
      } catch (error) {
        if (error instanceof Error && error.message === "Access denied") {
          throw new TRPCError({ code: "FORBIDDEN", message: error.message })
        }
        throw error
      }
    }),

  createFromSearch: protectedProcedure
    .input(
      z.object({
        tripId: z.string().uuid(),
        flightNumber: z.string().min(2).max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await flightService.createFlightFromSearch(
          input.tripId,
          ctx.user.id,
          input.flightNumber
        )
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "Access denied") {
            throw new TRPCError({ code: "FORBIDDEN", message: error.message })
          }
          if (error.message === "Flight not found") {
            throw new TRPCError({ code: "NOT_FOUND", message: error.message })
          }
        }
        throw error
      }
    }),

  refresh: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await flightService.refreshFlightStatus(input.id, ctx.user.id)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "Flight not found") {
            throw new TRPCError({ code: "NOT_FOUND", message: error.message })
          }
          if (error.message === "Access denied") {
            throw new TRPCError({ code: "FORBIDDEN", message: error.message })
          }
        }
        throw error
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await flightService.deleteFlight(input.id, ctx.user.id)
        return { success: true }
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "Flight not found") {
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
