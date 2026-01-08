import { createRequestLogger } from "@luis-travel/db/lib"

export interface User {
  id: string
  name: string
  email: string
  image?: string | null
}

export interface Context {
  user: User | null
  log: ReturnType<typeof createRequestLogger>
}

/**
 * Creates tRPC context with authenticated user
 *
 * @param req - The incoming request (used for logging)
 * @param user - Pre-validated user from Better Auth session (optional)
 */
export async function createContext(_req: Request, user?: User | null): Promise<Context> {
  const log = createRequestLogger("tRPC")

  if (user) {
    log.debug({ userId: user.id }, "User authenticated via Better Auth")
  }

  return { user: user ?? null, log }
}
