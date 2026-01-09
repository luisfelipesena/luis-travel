import { createTRPCReact, httpBatchLink } from "@trpc/react-query"
import type { AppRouter } from "@luis-travel/api"
import superjson from "superjson"
import { API_URL } from "./config"
import { storage } from "./storage"

export const trpc = createTRPCReact<AppRouter>()

export function createTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${API_URL}/api/trpc`,
        transformer: superjson,
        async headers() {
          const token = await storage.getToken()
          return token ? { Authorization: `Bearer ${token}` } : {}
        },
      }),
    ],
  })
}
