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
├── server/
│   ├── db/           # Schema + migrations + db client
│   ├── auth/         # Better Auth config
│   ├── external/     # Third-party API clients
│   ├── repositories/ # DB access only
│   ├── services/     # Business logic
│   ├── use-cases/    # Complex orchestration
│   └── trpc/         # API routers
├── components/
│   ├── ui/           # Shadcn components
│   ├── layout/       # App shell components
│   └── {feature}/    # Feature-specific components
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

## Auth Flow
- Better Auth handles `/api/auth/*` routes
- Session extracted in tRPC context
- Route guards via TanStack Router beforeLoad
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

## Testing
- Vitest for unit tests
- Test services and use cases
- Mock repositories in service tests
