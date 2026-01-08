import { createRequestLogger } from "../lib/logger"

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

export async function createContext(req: Request): Promise<Context> {
  const log = createRequestLogger("tRPC")

  // Extract session from Authorization header or cookie
  // neon-auth sends session info in the Authorization header as Bearer token
  const authHeader = req.headers.get("authorization")
  const sessionToken = authHeader?.replace("Bearer ", "")

  // For now, we'll parse the user from the session cookie
  // In production, you'd verify the JWT token with neon-auth
  const cookieHeader = req.headers.get("cookie")
  const userCookie = cookieHeader
    ?.split(";")
    .find((c) => c.trim().startsWith("neon_auth_user="))
    ?.split("=")[1]

  let user: User | null = null

  if (userCookie) {
    try {
      const decoded = decodeURIComponent(userCookie)
      const userData = JSON.parse(decoded)
      user = {
        id: userData.id,
        name: userData.name || userData.email?.split("@")[0] || "User",
        email: userData.email,
        image: userData.image || null,
      }
      log.debug({ userId: user.id }, "User authenticated from cookie")
    } catch {
      log.warn("Failed to parse user cookie")
    }
  } else if (sessionToken) {
    // TODO: Verify JWT token with neon-auth
    log.debug("Session token present but JWT verification not implemented")
  }

  return { user, log }
}
