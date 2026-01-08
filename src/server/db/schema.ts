import { relations } from "drizzle-orm"
import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import {
  type ActivityMetadata,
  ActivityTypeValues,
  type FlightExternalData,
  InvitationStatusValues,
  TripMemberRoleValues,
} from "@/types"

// ============================================================================
// Better Auth Tables
// ============================================================================

export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: uuid("id").primaryKey().defaultRandom(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const account = pgTable("account", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ============================================================================
// Trip Domain
// ============================================================================

export const tripRoleEnum = pgEnum("trip_role", TripMemberRoleValues)

export const trip = pgTable("trip", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  destination: varchar("destination", { length: 255 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  coverImage: text("cover_image"),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const tripMember = pgTable("trip_member", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trip.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: tripRoleEnum("role").notNull().default("viewer"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
})

// ============================================================================
// Invitation Domain
// ============================================================================

export const invitationStatusEnum = pgEnum("invitation_status", InvitationStatusValues)

export const invitation = pgTable("invitation", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trip.id, { onDelete: "cascade" }),
  invitedEmail: varchar("invited_email", { length: 255 }).notNull(),
  role: tripRoleEnum("role").notNull().default("viewer"),
  status: invitationStatusEnum("status").notNull().default("pending"),
  token: text("token").notNull().unique(),
  invitedBy: uuid("invited_by")
    .notNull()
    .references(() => user.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ============================================================================
// Activity Domain
// ============================================================================

export const activityTypeEnum = pgEnum("activity_type", ActivityTypeValues)

export const activity = pgTable("activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trip.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: activityTypeEnum("type").notNull().default("custom"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: varchar("location", { length: 255 }),
  imageUrl: text("image_url"),
  color: varchar("color", { length: 7 }).default("#3b82f6"),
  metadata: jsonb("metadata").$type<ActivityMetadata>(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ============================================================================
// Flight Domain
// ============================================================================

export const flight = pgTable("flight", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trip.id, { onDelete: "cascade" }),
  flightNumber: varchar("flight_number", { length: 50 }).notNull(),
  airline: varchar("airline", { length: 255 }),
  departureAirport: varchar("departure_airport", { length: 10 }).notNull(),
  arrivalAirport: varchar("arrival_airport", { length: 10 }).notNull(),
  departureTime: timestamp("departure_time").notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),
  status: varchar("status", { length: 50 }),
  externalData: jsonb("external_data").$type<FlightExternalData>(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ============================================================================
// Relations
// ============================================================================

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  ownedTrips: many(trip),
  tripMemberships: many(tripMember),
  activities: many(activity),
  flights: many(flight),
  sentInvitations: many(invitation),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}))

export const tripRelations = relations(trip, ({ one, many }) => ({
  owner: one(user, { fields: [trip.ownerId], references: [user.id] }),
  members: many(tripMember),
  activities: many(activity),
  flights: many(flight),
  invitations: many(invitation),
}))

export const tripMemberRelations = relations(tripMember, ({ one }) => ({
  trip: one(trip, { fields: [tripMember.tripId], references: [trip.id] }),
  user: one(user, { fields: [tripMember.userId], references: [user.id] }),
}))

export const invitationRelations = relations(invitation, ({ one }) => ({
  trip: one(trip, { fields: [invitation.tripId], references: [trip.id] }),
  inviter: one(user, { fields: [invitation.invitedBy], references: [user.id] }),
}))

export const activityRelations = relations(activity, ({ one }) => ({
  trip: one(trip, { fields: [activity.tripId], references: [trip.id] }),
  creator: one(user, { fields: [activity.createdBy], references: [user.id] }),
}))

export const flightRelations = relations(flight, ({ one }) => ({
  trip: one(trip, { fields: [flight.tripId], references: [trip.id] }),
  creator: one(user, { fields: [flight.createdBy], references: [user.id] }),
}))

// ============================================================================
// Type Exports
// ============================================================================

export type User = typeof user.$inferSelect
export type NewUser = typeof user.$inferInsert

export type Trip = typeof trip.$inferSelect
export type NewTrip = typeof trip.$inferInsert

export type TripMember = typeof tripMember.$inferSelect
export type NewTripMember = typeof tripMember.$inferInsert

export type Invitation = typeof invitation.$inferSelect
export type NewInvitation = typeof invitation.$inferInsert

export type Activity = typeof activity.$inferSelect
export type NewActivity = typeof activity.$inferInsert

export type Flight = typeof flight.$inferSelect
export type NewFlight = typeof flight.$inferInsert
