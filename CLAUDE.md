# Luis Travel - Project Conventions

## Package Manager
- **ALWAYS use `bun`** for all package operations
- `bun run <script>` not npm/yarn
- `bun add <pkg>` for dependencies
- `bunx` for one-off executions

## Drizzle Migrations
- **NEVER use `drizzle-kit push`**
- **ALWAYS**: `bun run db:generate` then `bun run db:migrate`
- Schema changes require new migration files

## Architecture (DDD)
```
src/
├── auth.ts           # Neon Auth client
├── types/            # TypeScript enums and types
├── server/
│   ├── db/           # Schema + migrations + db client
│   ├── lib/          # Server utilities (logger)
│   ├── external/     # Third-party API clients
│   ├── repositories/ # DB access only
│   ├── services/     # Business logic
│   ├── use-cases/    # Complex orchestration
│   └── trpc/         # API routers
├── components/
│   ├── ui/           # Shadcn components
│   ├── atoms/        # Basic building blocks
│   ├── molecules/    # Atom combinations
│   ├── organisms/    # Complex components
│   └── templates/    # Page layouts
├── routes/           # TanStack Router pages
└── lib/              # Shared utilities
```

## Layer Responsibilities
- **Repositories**: DB access ONLY, no business logic
- **Services**: Business logic, calls repositories
- **Use Cases**: Complex flows spanning multiple services
- **Routers**: tRPC endpoints, thin layer calling services

## File Naming
- kebab-case for all files: `trip-card.tsx`, `trip.service.ts`
- Suffix by type:
  - `.repository.ts` - Database access
  - `.service.ts` - Business logic
  - `.router.ts` - tRPC router
  - `.use-case.ts` - Complex orchestration

## Component Rules
- Max 200 lines per component file
- Extract reusable logic to hooks (`use-*.ts`)
- Shadcn components in `components/ui/`
- Feature components in `components/{feature}/`

## tRPC Patterns
- Queries for reads
- Mutations for writes
- Always Zod validation on inputs
- `protectedProcedure` for auth-required routes
- Use `queryOptions()` for route loaders

## Database
- UUID primary keys everywhere
- Relations defined in schema
- Repository pattern for all DB access
- JSONB for flexible metadata fields

## Auth Flow (Neon Auth)
- Neon Auth handles authentication via `@neondatabase/neon-js`
- NeonAuthUIProvider wraps app in `__root.tsx`
- SignedIn/RedirectToSignIn components for protected routes
- Session parsed from cookies in tRPC context
- User data from `ctx.user` in procedures

## Calendar Implementation
- All views: day, week, month
- 15-min slot granularity
- Drag to move, resize to change duration
- Optimistic updates for smooth UX
- Color-coded by activity type

## AI Integration
- OpenAI generates activity suggestions
- Store with `type: "ai_generated"` and metadata
- User can accept/edit/reject suggestions

## Flight Tracking
- Aviationstack API for live data
- Cache responses in DB (`externalData` JSONB)
- Refresh on trip view load

## Git Commits
- English only
- Concise summaries
- Ask before push

## Code Style
- TypeScript strict mode
- Prefer explicit types over inference for function params
- No `any` types
- Handle errors explicitly

## TypeScript Typing (CRITICAL)
- **NEVER use hardcoded strings** for enums/constants
- Use const objects as enums pattern from `@/types`:
  ```typescript
  import { TripMemberRole, InvitationStatus, ActivityType } from "@/types"

  // Good:
  role === TripMemberRole.VIEWER
  status === InvitationStatus.PENDING

  // Bad:
  role === "viewer"
  status === "pending"
  ```
- All type definitions live in `src/types/index.ts`
- Export both const object and type (same name)

## Linting (Biome)
- `bun run lint` - Check issues
- `bun run lint:fix` - Auto-fix issues
- `bun run format` - Format code
- Config in `biome.json`

## URL State (nuqs)
- Use nuqs for search params state management
- Enables shareable URLs with filters/pagination
- Parsers defined in `src/lib/search-params.ts`
- Use `useQueryState` for single param
- Use `useQueryStates` for multiple params
- **NOTE**: TanStack Start support is experimental

```typescript
// Example usage
import { useQueryState, parseAsInteger } from "nuqs"

function Component() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))
  return <button onClick={() => setPage(p => p + 1)}>Next</button>
}
```

## ATOMIC Design Pattern
```
src/components/
├── atoms/        # Basic building blocks (Button, Input, Label)
├── molecules/    # Combinations of atoms (SearchInput, FormField)
├── organisms/    # Complex components (Header, Sidebar, TripCard)
├── templates/    # Page layouts (DashboardLayout, AuthLayout)
└── ui/           # Shadcn primitives (keep separate)
```

- **Atoms**: Single-purpose, no business logic
- **Molecules**: Compose atoms, minimal logic
- **Organisms**: Feature-complete, may fetch data
- **Templates**: Layout structure, slot-based

## Testing
- Vitest for unit tests
- Test services and use cases
- Mock repositories in service tests

## Subagents

Project has two custom subagents for quality assurance:

### backend-architect
- **When**: Writing server code (repositories, services, use-cases, routers)
- **Focus**: DDD layer separation, design patterns, tRPC best practices
- **Invoke**: Automatically or `Use backend-architect to review this`

### frontend-architect
- **When**: Writing components, pages, or UI code
- **Focus**: ATOMIC design, Nielsen heuristics, accessibility
- **Invoke**: Automatically or `Use frontend-architect to review this`

Location: `.claude/agents/`
