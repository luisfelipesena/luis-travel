import { defineEventHandler, getQuery, sendRedirect } from "h3"

/**
 * Mobile OAuth callback handler
 * Receives the auth callback and redirects to the mobile app with the token
 *
 * Flow:
 * 1. Mobile app opens OAuth URL with mobile=true param
 * 2. User authenticates with provider (Google/GitHub)
 * 3. Better Auth redirects to /api/auth/mobile-callback with session
 * 4. This handler redirects to luistravel://auth?token=xxx
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = query.token as string | undefined
  const error = query.error as string | undefined

  const scheme = "luistravel"

  if (error) {
    return sendRedirect(event, `${scheme}://auth?error=${encodeURIComponent(error)}`, 302)
  }

  if (!token) {
    return sendRedirect(event, `${scheme}://auth?error=no_token`, 302)
  }

  // Redirect to mobile app with the token
  return sendRedirect(event, `${scheme}://auth?token=${encodeURIComponent(token)}`, 302)
})
