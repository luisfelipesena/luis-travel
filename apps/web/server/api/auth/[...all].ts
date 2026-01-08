import { defineEventHandler, toRequest } from "h3"

export default defineEventHandler(async (event) => {
  try {
    const { auth } = await import("../../auth")
    return auth.handler(toRequest(event))
  } catch (error) {
    console.error("[Auth Error]", error)
    return new Response(
      JSON.stringify({
        error: true,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
