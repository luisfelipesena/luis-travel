import type { Trip as TripBase, TripMember as TripMemberBase, User } from "@luis-travel/db/schema"
import type { TripMemberRole } from "../enums"
import type { RefineEnums, WithRelations } from "./helpers"

// Base Trip type (no enums to refine currently)
export type Trip = TripBase

// TripMember with proper role enum
export type TripMember = RefineEnums<
  TripMemberBase,
  {
    role: TripMemberRole
  }
>

// Relation types
export type TripWithOwner = WithRelations<
  Trip,
  {
    owner: Pick<User, "id" | "name" | "email" | "image">
  }
>

export type TripMemberWithUser = WithRelations<
  TripMember,
  {
    user: Pick<User, "id" | "name" | "email" | "image">
  }
>

export type TripWithMembers = WithRelations<
  Trip,
  {
    owner: Pick<User, "id" | "name" | "email" | "image">
    members: TripMemberWithUser[]
  }
>
