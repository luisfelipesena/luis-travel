import type { AppRouter } from "@luis-travel/api"
import { httpBatchLink } from "@trpc/client"
import { type CreateTRPCReact, createTRPCReact } from "@trpc/react-query"
import superjson from "superjson"

export const trpc: CreateTRPCReact<AppRouter, unknown> = createTRPCReact<AppRouter>()

export function getTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: "/api/trpc",
        transformer: superjson,
      }),
    ],
  })
}
