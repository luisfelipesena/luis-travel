import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { appRouter } from "../../../src/server/trpc/router"
import { createContext } from "../../../src/server/trpc/context"

export default defineEventHandler(async (event) => {
  const request = toWebRequest(event)

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createContext(request),
  })
})
