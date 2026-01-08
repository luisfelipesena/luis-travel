import type { Invitation as InvitationBase, Trip, User } from "@/server/db/schema"
import type { InvitationStatus, TripMemberRole } from "@/types/enums"
import type { RefineEnums, WithRelations } from "./helpers"

// Refined Invitation with proper enum types
export type Invitation = RefineEnums<
  InvitationBase,
  {
    status: InvitationStatus
    role: TripMemberRole
  }
>

// With trip relation
export type InvitationWithTrip = WithRelations<
  Invitation,
  {
    trip: Pick<Trip, "id" | "name" | "destination" | "startDate" | "endDate">
  }
>

// With inviter relation
export type InvitationWithInviter = WithRelations<
  Invitation,
  {
    inviter: Pick<User, "id" | "name" | "email">
  }
>

// With all relations (used by findPendingByEmail, findByToken, findById)
export type InvitationWithRelations = WithRelations<
  Invitation,
  {
    trip: Pick<Trip, "id" | "name" | "destination" | "startDate" | "endDate">
    inviter: Pick<User, "id" | "name" | "email">
  }
>
