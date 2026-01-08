import { defineEventHandler } from "h3"

export default defineEventHandler(() => {
  return {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlLength: process.env.DATABASE_URL?.length ?? 0,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    nodeEnv: process.env.NODE_ENV,
  }
})
