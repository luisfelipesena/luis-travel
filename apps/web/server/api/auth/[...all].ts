import { defineEventHandler, toRequest, getRequestURL } from "h3"

export default defineEventHandler(async (event) => {
  const request = toRequest(event)
  const requestUrl = getRequestURL(event)

  try {
    const { auth } = await import("../../auth")
    const response = await auth.handler(request)
    return response
  } catch (error) {
    console.error("[Auth Error]", error)
    return new Response(
      JSON.stringify({
        error: true,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        requestUrl: requestUrl.toString(),
        requestMethod: request.method,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
