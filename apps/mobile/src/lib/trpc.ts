import type { AppRouter } from "@luis-travel/api"
import { httpBatchLink } from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import * as SecureStore from "expo-secure-store"
import superjson from "superjson"

export const trpc = createTRPCReact<AppRouter>()

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://luis-travel.vercel.app"

export function getTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${API_URL}/api/trpc`,
        transformer: superjson,
        async headers() {
          const token = await SecureStore.getItemAsync("auth_token")
          return token ? { Authorization: `Bearer ${token}` } : {}
        },
      }),
    ],
  })
}
