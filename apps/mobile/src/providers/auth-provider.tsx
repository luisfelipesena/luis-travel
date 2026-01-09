import * as Linking from "expo-linking"
import * as WebBrowser from "expo-web-browser"
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react"
import {
  API_URL,
  APP_SCHEME,
  AUTH_CALLBACK_URL,
  GITHUB_AUTH_URL,
  GOOGLE_AUTH_URL,
} from "../lib/config"
import { storage } from "../lib/storage"

// Ensure WebBrowser redirects work properly
WebBrowser.maybeCompleteAuthSession()

type User = {
  id: string
  email: string
  name: string | null
  image: string | null
}

type AvailableProviders = {
  google: boolean
  github: boolean
}

type AuthContextType = {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  availableProviders: AvailableProviders
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>
  signUpWithEmail: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [availableProviders, setAvailableProviders] = useState<AvailableProviders>({
    google: false,
    github: false,
  })

  const fetchAvailableProviders = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/providers`)
      if (response.ok) {
        const data = await response.json()
        setAvailableProviders({
          google: data.google ?? false,
          github: data.github ?? false,
        })
      }
    } catch (error) {
      console.error("Failed to fetch providers:", error)
    }
  }, [])

  const handleAuthCallback = useCallback(async (authToken: string) => {
    try {
      setIsLoading(true)

      const response = await fetch(`${API_URL}/api/auth/get-session`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to get session")
      }

      const data = await response.json()

      if (data.user) {
        await storage.setToken(authToken)
        await storage.setUser(data.user)
        setToken(authToken)
        setUser(data.user)
      }
    } catch (error) {
      console.error("Auth callback failed:", error)
      await storage.clear()
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle deep link auth callback
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event
      if (url.includes("auth")) {
        const parsed = Linking.parse(url)
        const authToken = parsed.queryParams?.token as string | undefined

        if (authToken) {
          await handleAuthCallback(authToken)
        }
      }
    }

    // Listen for incoming links
    const subscription = Linking.addEventListener("url", handleDeepLink)

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url })
      }
    })

    return () => subscription.remove()
  }, [handleAuthCallback])

  const loadStoredAuth = useCallback(async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        storage.getToken(),
        storage.getUser<User>(),
      ])

      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(storedUser)
      }
    } catch (error) {
      console.error("Failed to load stored auth:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load stored auth state and fetch providers on mount
  useEffect(() => {
    loadStoredAuth()
    fetchAvailableProviders()
  }, [loadStoredAuth, fetchAvailableProviders])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || "Credenciais inválidas" }
      }

      if (data.token && data.user) {
        await storage.setToken(data.token)
        await storage.setUser(data.user)
        setToken(data.token)
        setUser(data.user)
        return { success: true }
      }

      return { success: false, error: "Resposta inválida do servidor" }
    } catch (error) {
      console.error("Email sign in failed:", error)
      return { success: false, error: "Erro de conexão" }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signUpWithEmail = useCallback(async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || "Falha no cadastro" }
      }

      if (data.token && data.user) {
        await storage.setToken(data.token)
        await storage.setUser(data.user)
        setToken(data.token)
        setUser(data.user)
        return { success: true }
      }

      return { success: false, error: "Resposta inválida do servidor" }
    } catch (error) {
      console.error("Email sign up failed:", error)
      return { success: false, error: "Erro de conexão" }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    try {
      const callbackUrl = encodeURIComponent(AUTH_CALLBACK_URL)
      const authUrl = `${GOOGLE_AUTH_URL}?callbackURL=${callbackUrl}`

      await WebBrowser.openAuthSessionAsync(authUrl, `${APP_SCHEME}://auth`)
    } catch (error) {
      console.error("Google sign in failed:", error)
    }
  }, [])

  const signInWithGithub = useCallback(async () => {
    try {
      const callbackUrl = encodeURIComponent(AUTH_CALLBACK_URL)
      const authUrl = `${GITHUB_AUTH_URL}?callbackURL=${callbackUrl}`

      await WebBrowser.openAuthSessionAsync(authUrl, `${APP_SCHEME}://auth`)
    } catch (error) {
      console.error("GitHub sign in failed:", error)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      // Call server to invalidate session
      if (token) {
        await fetch(`${API_URL}/api/auth/sign-out`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {}) // Ignore errors
      }
    } finally {
      await storage.clear()
      setToken(null)
      setUser(null)
    }
  }, [token])

  const refreshUser = useCallback(async () => {
    if (!token) return

    try {
      const response = await fetch(`${API_URL}/api/auth/get-session`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          await storage.setUser(data.user)
          setUser(data.user)
        }
      } else {
        // Token invalid, clear auth
        await signOut()
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
    }
  }, [token, signOut])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        availableProviders,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithGithub,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
