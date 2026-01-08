import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { createContext } from "../../../src/server/trpc/context"
import { appRouter } from "../../../src/server/trpc/router"

export default async function handler(request: Request): Promise<Response> {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createContext(request),
  })
}
