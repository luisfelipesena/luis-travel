import { defineEventHandler } from "h3"

export default defineEventHandler(async () => {
  const envInfo = {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlLength: process.env.DATABASE_URL?.length ?? 0,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    nodeEnv: process.env.NODE_ENV,
    dbTest: null as any,
    authTest: null as any,
  }

  // Test db connection
  try {
    const { db } = await import("@luis-travel/db")
    envInfo.dbTest = { success: true, message: "db imported" }
  } catch (error) {
    envInfo.dbTest = {
      success: false,
      message: error instanceof Error ? error.message : "unknown error",
    }
  }

  // Test auth import
  try {
    const { auth } = await import("../auth")
    envInfo.authTest = { success: true, message: "auth imported" }
  } catch (error) {
    envInfo.authTest = {
      success: false,
      message: error instanceof Error ? error.message : "unknown error",
    }
  }

  return envInfo
})
