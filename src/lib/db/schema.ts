import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  integer,
  decimal,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";

// ============================================
// Better-Auth required tables
// ============================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ============================================
// NextCollab App Tables
// ============================================

// Creator profile (linked to user)
export const creatorProfile = pgTable("creator_profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  instagramId: text("instagram_id"),
  instagramUsername: text("instagram_username").unique(),
  followers: integer("followers"),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }),
  niche: text("niche"),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  instagramConnected: boolean("instagram_connected").default(false),
  connectedAt: timestamp("connected_at"),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Brand database (populated via Xpoz)
export const brand = pgTable("brand", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  instagramUsername: text("instagram_username").unique(),
  niche: text("niche"),
  activityScore: integer("activity_score").default(0),
  typicalFollowerMin: integer("typical_follower_min"),
  typicalFollowerMax: integer("typical_follower_max"),
  partnershipCount: integer("partnership_count").default(0),
  lastPartnershipAt: timestamp("last_partnership_at"),
  contentPreference: text("content_preference"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Detected partnerships (scraped from Instagram)
export const partnership = pgTable("partnership", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandId: uuid("brand_id")
    .notNull()
    .references(() => brand.id, { onDelete: "cascade" }),
  creatorInstagramId: text("creator_instagram_id"),
  creatorUsername: text("creator_username"),
  postUrl: text("post_url"),
  postType: text("post_type"),
  engagement: integer("engagement"),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
});

// User favorites
export const favorite = pgTable(
  "favorite",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brand.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique("favorite_user_brand_unique").on(table.userId, table.brandId)]
);

// AI matches
export const match = pgTable(
  "match",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brand.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    reasons: jsonb("reasons"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    seenAt: timestamp("seen_at"),
  },
  (table) => [unique("match_user_brand_unique").on(table.userId, table.brandId)]
);

// Saved searches
export const savedSearch = pgTable("saved_search", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  filters: jsonb("filters").notNull(),
  alertEnabled: boolean("alert_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Partnership tracker (CRM-lite) - Phase 2
export const outreach = pgTable("outreach", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  brandId: uuid("brand_id")
    .notNull()
    .references(() => brand.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pitched"),
  notes: text("notes"),
  pitchedAt: timestamp("pitched_at"),
  confirmedAt: timestamp("confirmed_at"),
  paidAt: timestamp("paid_at"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
