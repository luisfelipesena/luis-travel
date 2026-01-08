import type {
  Activity as ActivityBase,
  ActivityParticipant as ActivityParticipantBase,
  User,
} from "@luis-travel/db/schema"
import type { ActivityType, ParticipantStatus } from "../enums"
import type { RefineEnums, WithRelations } from "./helpers"

// Refined Activity with proper type enum
export type Activity = RefineEnums<
  ActivityBase,
  {
    type: ActivityType
  }
>

// Refined ActivityParticipant with proper status enum
export type ActivityParticipant = RefineEnums<
  ActivityParticipantBase,
  {
    status: ParticipantStatus
  }
>

// With creator relation
export type ActivityWithCreator = WithRelations<
  Activity,
  {
    creator: Pick<User, "id" | "name" | "email">
  }
>

// Participant with user relation
export type ActivityParticipantWithUser = WithRelations<
  ActivityParticipant,
  {
    user: Pick<User, "id" | "name" | "email" | "image">
  }
>

// With creator and participants
export type ActivityWithParticipants = WithRelations<
  Activity,
  {
    creator: Pick<User, "id" | "name" | "email">
    participants: ActivityParticipantWithUser[]
  }
>
