import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { invitationRepository } from "../../repositories/invitation.repository"
import { acceptInvitationUseCase } from "../../use-cases/accept-invitation"
import { inviteMemberUseCase } from "../../use-cases/invite-member"
import { protectedProcedure, router } from "../init"

export const invitationRouter = router({
  listByTrip: protectedProcedure
    .input(z.object({ tripId: z.string().uuid() }))
    .query(async ({ input }) => {
      return invitationRepository.findByTripId(input.tripId)
    }),

  myPendingInvitations: protectedProcedure.query(async ({ ctx }) => {
    return invitationRepository.findPendingByEmail(ctx.user.email)
  }),

  send: protectedProcedure
    .input(
      z.object({
        tripId: z.string().uuid(),
        email: z.string().email(),
        role: z.enum(["editor", "viewer"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await inviteMemberUseCase.execute({
          tripId: input.tripId,
          invitedEmail: input.email,
          role: input.role,
          invitedBy: ctx.user.id,
        })
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "Trip not found") {
            throw new TRPCError({ code: "NOT_FOUND", message: error.message })
          }
          if (
            error.message === "Only trip owner can invite members" ||
            error.message === "Cannot invite the trip owner"
          ) {
            throw new TRPCError({ code: "FORBIDDEN", message: error.message })
          }
          if (error.message === "User already has a pending invitation") {
            throw new TRPCError({ code: "CONFLICT", message: error.message })
          }
        }
        throw error
      }
    }),

  accept: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await acceptInvitationUseCase.execute(input.token, ctx.user.id)
      } catch (error) {
        if (error instanceof Error) {
          if (
            error.message === "Invalid or expired invitation" ||
            error.message === "Invitation has expired"
          ) {
            throw new TRPCError({ code: "NOT_FOUND", message: error.message })
          }
          if (error.message === "You already have access to this trip") {
            throw new TRPCError({ code: "CONFLICT", message: error.message })
          }
        }
        throw error
      }
    }),

  decline: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await invitationRepository.updateStatus(input.id, "declined")
      return { success: true }
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await invitationRepository.delete(input.id)
      return { success: true }
    }),
})
