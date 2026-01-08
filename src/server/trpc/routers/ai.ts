import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { generateItineraryUseCase } from "../../use-cases/generate-itinerary"
import { protectedProcedure, router } from "../init"

export const aiRouter = router({
  generateActivities: protectedProcedure
    .input(
      z.object({
        tripId: z.string().uuid(),
        preferences: z.string().optional(),
        autoAdd: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await generateItineraryUseCase.execute({
          tripId: input.tripId,
          userId: ctx.user.id,
          preferences: input.preferences,
          autoAdd: input.autoAdd,
        })
      } catch (error) {
        if (error instanceof Error && error.message === "Access denied") {
          throw new TRPCError({ code: "FORBIDDEN", message: error.message })
        }
        throw error
      }
    }),
})
