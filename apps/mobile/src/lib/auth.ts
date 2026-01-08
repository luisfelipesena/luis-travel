import * as AuthSession from "expo-auth-session"
import * as SecureStore from "expo-secure-store"
import * as WebBrowser from "expo-web-browser"

WebBrowser.maybeCompleteAuthSession()

const AUTH_URL = process.env.EXPO_PUBLIC_API_URL || "https://luis-travel.vercel.app"

/**
 * Sign in with Google OAuth
 * Opens web browser to Better Auth OAuth flow, receives session token back
 */
export async function signInWithGoogle() {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: "luistravel" })
  const callbackURL = `${AUTH_URL}/api/auth/mobile-callback`

  const result = await WebBrowser.openAuthSessionAsync(
    `${AUTH_URL}/api/auth/signin/google?callbackURL=${encodeURIComponent(callbackURL)}`,
    redirectUri
  )

  return handleAuthResult(result)
}

/**
 * Sign in with GitHub OAuth
 */
export async function signInWithGitHub() {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: "luistravel" })
  const callbackURL = `${AUTH_URL}/api/auth/mobile-callback`

  const result = await WebBrowser.openAuthSessionAsync(
    `${AUTH_URL}/api/auth/signin/github?callbackURL=${encodeURIComponent(callbackURL)}`,
    redirectUri
  )

  return handleAuthResult(result)
}

/**
 * Handle auth session result
 */
async function handleAuthResult(result: WebBrowser.WebBrowserAuthSessionResult) {
  if (result.type === "success" && result.url) {
    const url = new URL(result.url)
    const token = url.searchParams.get("token")
    const error = url.searchParams.get("error")

    if (error) {
      console.error("Auth error:", error)
      return false
    }

    if (token) {
      await SecureStore.setItemAsync("auth_token", token)
      return true
    }
  }
  return false
}

/**
 * Sign out - clear stored token
 */
export async function signOut() {
  await SecureStore.deleteItemAsync("auth_token")
}

/**
 * Get stored auth token
 */
export async function getToken() {
  return SecureStore.getItemAsync("auth_token")
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const token = await getToken()
  return !!token
}
