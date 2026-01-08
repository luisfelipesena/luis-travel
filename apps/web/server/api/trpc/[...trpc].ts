import { appRouter, createContext } from "@luis-travel/api"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { defineEventHandler } from "h3"
import { auth } from "../../auth"

export default defineEventHandler(async (event) => {
  // H3 v2: event.req is already a native Web Request
  const request = event.req as Request

  // Get session from Better Auth (supports both cookies and Bearer token)
  let user = null
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (session?.user) {
      user = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }
    }
  } catch {
    // Session invalid or expired - continue without user
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createContext(request, user),
  })
})
