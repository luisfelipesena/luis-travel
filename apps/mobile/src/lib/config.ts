// API Configuration
// In development, use your machine's IP or localhost with tunnel
// In production, use the actual API URL

const DEV_API_URL = "http://localhost:3000"

export const API_URL = __DEV__ ? DEV_API_URL : "https://luis-travel.vercel.app"

// Deep linking scheme (must match app.json)
export const APP_SCHEME = "luistravel"

// Auth URLs
export const AUTH_CALLBACK_URL = `${API_URL}/api/auth/mobile-callback`
export const GOOGLE_AUTH_URL = `${API_URL}/api/auth/signin/google`
export const GITHUB_AUTH_URL = `${API_URL}/api/auth/signin/github`
