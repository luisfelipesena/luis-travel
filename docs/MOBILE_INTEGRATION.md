# Mobile App Integration Guide

Este documento descreve como integrar uma aplicação mobile (React Native, Flutter, Swift, Kotlin) com o backend tRPC do Luis Travel.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    luis-travel (monorepo)                   │
├─────────────────────────────────────────────────────────────┤
│  packages/                                                  │
│  ├── web/          → TanStack Start (atual)                 │
│  ├── mobile/       → React Native / Expo                    │
│  └── api-types/    → AppRouter types exportados             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    /api/trpc/* endpoints
```

## Opção 1: React Native (100% Tipado)

### Setup Monorepo (Recomendado)

A melhor abordagem é converter para monorepo com [Turborepo](https://turbo.build/):

```bash
# Estrutura
apps/
  web/         # TanStack Start atual
  mobile/      # Expo/React Native
packages/
  trpc/        # Router + types compartilhados
  types/       # Zod schemas
```

### Instalação no Mobile

```bash
cd apps/mobile
bun add @trpc/client @trpc/react-query @tanstack/react-query superjson
```

### Client Setup

```typescript
// apps/mobile/src/lib/trpc.ts
import { createTRPCClient, httpBatchLink } from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import superjson from "superjson"
import type { AppRouter } from "@luis-travel/trpc" // Do pacote compartilhado

// Para hooks React
export const trpc = createTRPCReact<AppRouter>()

// Cliente vanilla (para uso fora de componentes)
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "https://luis-travel.vercel.app/api/trpc",
      transformer: superjson,
      headers: async () => {
        const token = await getAuthToken() // SecureStore, AsyncStorage, etc
        return token ? { Authorization: `Bearer ${token}` } : {}
      },
    }),
  ],
})
```

### Provider Setup

```tsx
// apps/mobile/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { trpc, trpcClient } from "./lib/trpc"

export default function App() {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Navigation />
      </QueryClientProvider>
    </trpc.Provider>
  )
}
```

### Uso com Tipagem Completa

```tsx
// apps/mobile/src/screens/SearchCity.tsx
import { trpc } from "../lib/trpc"

export function SearchCity() {
  const [query, setQuery] = useState("")

  // Tipagem inferida automaticamente do backend
  const { data: cities, isLoading } = trpc.geo.searchCities.useQuery(
    { query, limit: 8 },
    { enabled: query.length >= 2 }
  )

  return (
    <FlatList
      data={cities}
      renderItem={({ item }) => (
        // item tem tipo CitySearchResult inferido
        <Text>{item.name}, {item.country}</Text>
      )}
    />
  )
}
```

## Opção 2: Flutter/Swift/Kotlin (via OpenAPI)

Para apps não-TypeScript, gere um SDK tipado via OpenAPI.

### Passo 1: Adicionar trpc-openapi ao Backend

```bash
bun add trpc-openapi
```

```typescript
// server/api/openapi/spec.ts
import { generateOpenApiDocument } from "trpc-openapi"
import { appRouter } from "@/server/trpc/router"

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "Luis Travel API",
  version: "1.0.0",
  baseUrl: "https://luis-travel.vercel.app/api",
})
```

### Passo 2: Gerar SDK para Mobile

```bash
# Flutter (Dart)
npx @openapitools/openapi-generator-cli generate \
  -i ./openapi.json \
  -g dart-dio \
  -o ./packages/mobile-sdk-dart

# Swift
npx @openapitools/openapi-generator-cli generate \
  -i ./openapi.json \
  -g swift5 \
  -o ./packages/mobile-sdk-swift

# Kotlin
npx @openapitools/openapi-generator-cli generate \
  -i ./openapi.json \
  -g kotlin \
  -o ./packages/mobile-sdk-kotlin
```

### Uso no Flutter

```dart
// Gerado automaticamente
import 'package:luis_travel_api/api.dart';

final api = LuisTravelApi();
final cities = await api.geoApi.searchCities(query: "Roma", limit: 8);
```

## Opção 3: HTTP Direto (Sem SDK)

Para prototipagem rápida, use HTTP direto:

### Endpoints

| Operação | Método | URL |
|----------|--------|-----|
| Query | GET | `/api/trpc/{procedure}?input={json}` |
| Mutation | POST | `/api/trpc/{procedure}` |
| Batch | GET/POST | `/api/trpc/{p1},{p2}?batch=1&input={...}` |

### Exemplo cURL

```bash
# Buscar cidades
curl "https://luis-travel.vercel.app/api/trpc/geo.searchCities?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22query%22%3A%22Roma%22%2C%22limit%22%3A8%7D%7D%7D"

# Criar viagem (autenticado)
curl -X POST "https://luis-travel.vercel.app/api/trpc/trip.create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"0":{"json":{"name":"Viagem Roma","destination":"Roma, Itália"}}}'
```

## Autenticação Mobile

### Fluxo OAuth

```
1. Mobile abre WebView → /api/auth/google (ou github)
2. Usuário autentica
3. Callback redireciona com token
4. Mobile captura token e armazena em SecureStore
5. Requests subsequentes incluem Authorization header
```

### Código React Native

```typescript
import * as SecureStore from "expo-secure-store"
import * as WebBrowser from "expo-web-browser"

async function signInWithGoogle() {
  const result = await WebBrowser.openAuthSessionAsync(
    "https://luis-travel.vercel.app/api/auth/google?mobile=true",
    "luistravel://auth/callback"
  )

  if (result.type === "success") {
    const token = extractTokenFromUrl(result.url)
    await SecureStore.setItemAsync("auth_token", token)
  }
}
```

## Considerações de Produção

### CORS

Se necessário, adicionar ao `vite.config.ts`:

```typescript
nitro({
  srcDir: "server",
  scanDirs: ["server"],
  routeRules: {
    "/api/**": {
      cors: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
    },
  },
})
```

### Rate Limiting

Implementar rate limiting para proteger a API de abuso mobile.

### Versionamento

Considerar versionamento de API para não quebrar apps mobile em produção:
- `/api/v1/trpc/*`
- `/api/v2/trpc/*`

## Recursos

- [tRPC Docs](https://trpc.io/docs)
- [trpc-openapi](https://github.com/trpc/trpc-openapi)
- [openapi-trpc](https://github.com/dtinth/openapi-trpc)
- [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator)
- [Turborepo Monorepo Guide](https://turbo.build/repo/docs)
- [React Native tRPC Example](https://github.com/johnkueh/react-native-trpc-monorepo-example)
