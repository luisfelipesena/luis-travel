import * as AuthSession from "expo-auth-session"
import * as WebBrowser from "expo-web-browser"
import * as SecureStore from "expo-secure-store"

WebBrowser.maybeCompleteAuthSession()

const AUTH_URL = process.env.EXPO_PUBLIC_API_URL || "https://luis-travel.vercel.app"

export async function signInWithGoogle() {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: "luistravel" })

  const result = await WebBrowser.openAuthSessionAsync(
    `${AUTH_URL}/api/auth/signin/google?mobile=true&redirect=${encodeURIComponent(redirectUri)}`,
    redirectUri
  )

  if (result.type === "success" && result.url) {
    const url = new URL(result.url)
    const token = url.searchParams.get("token")
    if (token) {
      await SecureStore.setItemAsync("auth_token", token)
      return true
    }
  }
  return false
}

export async function signInWithGitHub() {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: "luistravel" })

  const result = await WebBrowser.openAuthSessionAsync(
    `${AUTH_URL}/api/auth/signin/github?mobile=true&redirect=${encodeURIComponent(redirectUri)}`,
    redirectUri
  )

  if (result.type === "success" && result.url) {
    const url = new URL(result.url)
    const token = url.searchParams.get("token")
    if (token) {
      await SecureStore.setItemAsync("auth_token", token)
      return true
    }
  }
  return false
}

export async function signOut() {
  await SecureStore.deleteItemAsync("auth_token")
}

export async function getToken() {
  return SecureStore.getItemAsync("auth_token")
}

export async function isAuthenticated() {
  const token = await getToken()
  return !!token
}
