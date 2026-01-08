import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { defineEventHandler } from "h3"
import { createContext } from "../../../src/server/trpc/context"
import { appRouter } from "../../../src/server/trpc/router"

export default defineEventHandler(async (event) => {
  // H3 v2: event.req is already a native Web Request
  const request = event.req as Request

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createContext(request),
  })
})
