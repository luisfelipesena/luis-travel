import type { Flight as FlightBase, User } from "@/server/db/schema"
import type { WithRelations } from "./helpers"

// Flight has no enums to refine
export type Flight = FlightBase

// With creator relation
export type FlightWithCreator = WithRelations<
  Flight,
  {
    creator: Pick<User, "id" | "name" | "email">
  }
>
