import { z } from "zod"

// ============================================================================
// Enum Utilities - Single Source of Truth Pattern
// ============================================================================

/**
 * Extract values from const object as tuple for Zod enum
 * @example
 * const Status = { ACTIVE: "active", INACTIVE: "inactive" } as const
 * enumValues(Status) // ["active", "inactive"] as tuple
 */
export function enumValues<T extends Record<string, string>>(
  obj: T
): [T[keyof T], ...T[keyof T][]] {
  return Object.values(obj) as [T[keyof T], ...T[keyof T][]]
}

/**
 * Create Zod enum from const object
 * @example
 * const statusSchema = enumToZod(Status)
 */
export function enumToZod<T extends Record<string, string>>(obj: T) {
  return z.enum(enumValues(obj))
}

// ============================================================================
// Common Schema Primitives
// ============================================================================

/** UUID string validation */
export const uuidSchema = z.string().uuid()

/** Non-empty string */
export const nonEmptyStringSchema = z.string().min(1)

/** Email validation */
export const emailSchema = z.string().email()

/** Hex color validation (#RRGGBB) */
export const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")

/** URL validation */
export const urlSchema = z.string().url()

/** Date that accepts string or Date */
export const coerceDateSchema = z.coerce.date()

// ============================================================================
// Generic Type Helpers
// ============================================================================

/** Extract value union from const object */
export type EnumValues<T extends Record<string, string>> = T[keyof T]

/** Make all properties optional except K */
export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>

/** Omit common DB-managed fields for create operations */
export type CreateInput<T> = Omit<T, "id" | "createdAt" | "updatedAt">

/** Omit immutable fields for update operations */
export type UpdateInput<T> = Partial<Omit<T, "id" | "createdAt" | "createdBy">>

/** Ensure exhaustive switch/if checks */
export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`)
}
