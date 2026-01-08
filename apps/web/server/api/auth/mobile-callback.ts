import { defineEventHandler, getCookie, getQuery, sendRedirect } from "h3"
import { auth } from "../../auth"

/**
 * Mobile OAuth callback handler
 * Receives the auth callback and redirects to the mobile app with the session token
 *
 * Flow:
 * 1. Mobile app opens OAuth URL (e.g., /api/auth/signin/google?callbackURL=/api/auth/mobile-callback)
 * 2. User authenticates with provider (Google/GitHub)
 * 3. Better Auth completes OAuth and sets session cookie, redirects here
 * 4. This handler extracts the session token from cookie
 * 5. Redirects to luistravel://auth?token=xxx
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const error = query.error as string | undefined
  const scheme = "luistravel"

  if (error) {
    return sendRedirect(event, `${scheme}://auth?error=${encodeURIComponent(error)}`, 302)
  }

  try {
    // Get session from Better Auth via cookies
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session?.session?.token) {
      return sendRedirect(event, `${scheme}://auth?error=no_session`, 302)
    }

    // Return the session token to mobile app
    // The bearer plugin allows using this token in Authorization header
    const token = session.session.token

    return sendRedirect(event, `${scheme}://auth?token=${encodeURIComponent(token)}`, 302)
  } catch (err) {
    console.error("Mobile callback error:", err)
    return sendRedirect(event, `${scheme}://auth?error=auth_failed`, 302)
  }
})
