import { GluestackUIProvider } from "@gluestack-ui/themed"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Stack } from "expo-router"
import { useState } from "react"
import { getTRPCClient, trpc } from "../src/lib/trpc"
import "../src/styles/global.css"

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() => getTRPCClient())

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GluestackUIProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </GluestackUIProvider>
      </QueryClientProvider>
    </trpc.Provider>
  )
}
