import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  deviceFingerprint: varchar("deviceFingerprint", { length: 256 }).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }).notNull(),
  userAgent: text("userAgent"),
  geolocation: varchar("geolocation", { length: 256 }), // "lat,lng,country"
  isActive: int("isActive").default(1).notNull(), // 0 or 1 for boolean
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

export const riskEvents = mysqlTable("riskEvents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionId: int("sessionId"),
  actionType: varchar("actionType", { length: 64 }).notNull(), // e.g., "transfer_funds", "view_documents"
  riskScore: int("riskScore").notNull(), // 0-100
  riskLevel: mysqlEnum("riskLevel", ["LOW", "MEDIUM", "HIGH", "CRITICAL"]).notNull(),
  riskFactors: text("riskFactors"), // JSON string of factors
  deviceFingerprintChange: int("deviceFingerprintChange").default(0).notNull(),
  ipChange: int("ipChange").default(0).notNull(),
  geolocationShift: int("geolocationShift").default(0).notNull(),
  actionSensitivity: varchar("actionSensitivity", { length: 32 }).default("normal").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RiskEvent = typeof riskEvents.$inferSelect;
export type InsertRiskEvent = typeof riskEvents.$inferInsert;

export const pushChallenges = mysqlTable("pushChallenges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  riskEventId: int("riskEventId"),
  challengeId: varchar("challengeId", { length: 64 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "expired"]).default("pending").notNull(),
  actionDescription: text("actionDescription"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  respondedAt: timestamp("respondedAt"),
});

export type PushChallenge = typeof pushChallenges.$inferSelect;
export type InsertPushChallenge = typeof pushChallenges.$inferInsert;