import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { defineEventHandler } from "h3"
import { appRouter, createContext } from "@luis-travel/api"

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
