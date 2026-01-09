import { defineEventHandler, readMultipartFormData, createError } from "h3"
import { writeFile, mkdir } from "node:fs/promises"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import { existsSync } from "node:fs"

const UPLOAD_DIR = join(process.cwd(), "public", "uploads")
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export default defineEventHandler(async (event) => {
  // Only allow POST
  if (event.method !== "POST") {
    throw createError({ statusCode: 405, message: "Method not allowed" })
  }

  // Ensure upload directory exists
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }

  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, message: "No file provided" })
  }

  const file = formData.find((f) => f.name === "file")

  if (!file || !file.data) {
    throw createError({ statusCode: 400, message: "No file found in form data" })
  }

  // Validate file type
  const contentType = file.type || "application/octet-stream"
  if (!ALLOWED_TYPES.includes(contentType)) {
    throw createError({
      statusCode: 400,
      message: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`,
    })
  }

  // Validate file size
  if (file.data.length > MAX_FILE_SIZE) {
    throw createError({
      statusCode: 400,
      message: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    })
  }

  // Generate unique filename
  const ext = contentType.split("/")[1] || "jpg"
  const filename = `${randomUUID()}.${ext}`
  const filepath = join(UPLOAD_DIR, filename)

  // Write file
  await writeFile(filepath, file.data)

  // Return URL
  const url = `/uploads/${filename}`

  return { url, filename }
})
