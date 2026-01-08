import { router } from "./init"
import { tripRouter } from "./routers/trip"
import { activityRouter } from "./routers/activity"
import { flightRouter } from "./routers/flight"
import { invitationRouter } from "./routers/invitation"
import { aiRouter } from "./routers/ai"

export const appRouter = router({
  trip: tripRouter,
  activity: activityRouter,
  flight: flightRouter,
  invitation: invitationRouter,
  ai: aiRouter,
})

export type AppRouter = typeof appRouter
