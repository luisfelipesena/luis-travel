import { router } from "./init"
import { activityRouter } from "./routers/activity"
import { aiRouter } from "./routers/ai"
import { flightRouter } from "./routers/flight"
import { invitationRouter } from "./routers/invitation"
import { tripRouter } from "./routers/trip"

export const appRouter = router({
  trip: tripRouter,
  activity: activityRouter,
  flight: flightRouter,
  invitation: invitationRouter,
  ai: aiRouter,
})

export type AppRouter = typeof appRouter
