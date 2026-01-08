# Luis Travel

Travel planning app with trip management, flight tracking, calendar scheduling, AI activity suggestions, and trip collaboration.

## Tech Stack

- **Runtime**: Bun
- **Framework**: TanStack Start + Router + Query
- **API**: tRPC
- **Auth**: Neon Auth
- **DB**: Drizzle + PostgreSQL (Neon)
- **UI**: Shadcn + Tailwind CSS
- **Env**: t3-env

## Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Neon PostgreSQL Database](https://neon.tech/) with Neon Auth enabled

## Getting Started

### 1. Clone and Install

```bash
bun install
```

### 2. Configure Environment

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `VITE_NEON_AUTH_URL` | Neon Auth endpoint URL |
| `OPENAI_API_KEY` | OpenAI API key for AI suggestions |
| `AVIATIONSTACK_API_KEY` | Aviationstack API key for flight tracking |

### 3. Setup Database

Generate and run migrations:

```bash
bun run db:generate
bun run db:migrate
```

### 4. Run Development Server

```bash
bun run dev
```

The app will be available at http://localhost:3000

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build |
| `bun run typecheck` | Run TypeScript type checking |
| `bun run lint` | Run Biome linter |
| `bun run lint:fix` | Auto-fix lint issues |
| `bun run format` | Format code with Biome |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Apply database migrations |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run test` | Run tests with Vitest |

## Project Structure

```
src/
├── auth.ts              # Neon Auth client
├── env.ts               # Environment validation
├── types/               # TypeScript enums and types
├── lib/                 # Shared utilities
├── server/
│   ├── db/              # Schema, migrations, db client
│   ├── external/        # Third-party API clients
│   ├── repositories/    # Database access layer
│   ├── services/        # Business logic
│   ├── use-cases/       # Complex orchestration
│   └── trpc/            # tRPC routers
├── components/
│   ├── ui/              # Shadcn components
│   ├── atoms/           # Basic building blocks
│   ├── molecules/       # Atom combinations
│   ├── organisms/       # Complex components
│   └── templates/       # Page layouts
└── routes/              # TanStack Router pages
```

## Features

- **Trip Management**: Create, edit, and delete trips with destinations and dates
- **Calendar View**: Day/week/month views with drag-and-drop scheduling
- **Flight Tracking**: Search and track flights via Aviationstack API
- **AI Suggestions**: Generate activity recommendations with OpenAI
- **Collaboration**: Invite members to view or edit trips

## Architecture Notes

- **DDD Pattern**: Repositories handle DB access, Services handle business logic
- **TypeScript First**: Strict typing with const enums, no hardcoded strings
- **ATOMIC Design**: Components organized by complexity (atoms → organisms)
- **tRPC**: Type-safe API with Zod validation

## Database Setup (Neon)

1. Create a Neon project at https://neon.tech
2. Enable Neon Auth in your project settings
3. Copy the connection string to `DATABASE_URL`
4. Copy the Neon Auth URL to `VITE_NEON_AUTH_URL`
