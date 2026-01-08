import { nanoid } from "nanoid"
import pino from "pino"

const isDev = process.env.NODE_ENV !== "production"

export const logger = pino({
  level: isDev ? "debug" : "info",
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  base: {
    service: "luis-travel",
  },
})

export function createRequestLogger(prefix?: string) {
  const traceId = nanoid(12)
  return logger.child({
    traceId,
    ...(prefix && { prefix }),
  })
}

export type Logger = typeof logger
