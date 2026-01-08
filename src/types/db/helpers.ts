/**
 * Type refinement utilities for Drizzle ORM
 *
 * Drizzle's $inferSelect degrades pgEnum types to `string`.
 * These helpers allow us to override those with proper enum literals.
 */

/**
 * Override Drizzle inferred types with proper enum literals
 *
 * @example
 * type Activity = RefineEnums<ActivityBase, {
 *   type: ActivityType
 *   status: ParticipantStatus
 * }>
 */
export type RefineEnums<T, Refinements> = Omit<T, keyof Refinements> & Refinements

/**
 * Add relation types to base model
 *
 * @example
 * type InvitationWithRelations = WithRelations<Invitation, {
 *   trip: Pick<Trip, "id" | "name">
 *   inviter: Pick<User, "id" | "name" | "email">
 * }>
 */
export type WithRelations<TModel, TRelations extends Record<string, unknown>> = TModel & TRelations
