var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express from "express";

// server/routes.ts
import { createServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminUsers: () => adminUsers,
  appSettings: () => appSettings,
  applications: () => applications,
  applicationsRelations: () => applicationsRelations,
  favorites: () => favorites,
  favoritesRelations: () => favoritesRelations,
  insertAdminUserSchema: () => insertAdminUserSchema,
  insertApplicationSchema: () => insertApplicationSchema,
  insertListingSchema: () => insertListingSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertPriceAlertSchema: () => insertPriceAlertSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertStorySchema: () => insertStorySchema,
  insertUserSchema: () => insertUserSchema,
  insertVerificationDocumentSchema: () => insertVerificationDocumentSchema,
  likes: () => likes,
  likesRelations: () => likesRelations,
  listings: () => listings,
  listingsRelations: () => listingsRelations,
  matches: () => matches,
  matchesRelations: () => matchesRelations,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  priceAlerts: () => priceAlerts,
  priceAlertsRelations: () => priceAlertsRelations,
  pushNotificationLogs: () => pushNotificationLogs,
  pushTokens: () => pushTokens,
  pushTokensRelations: () => pushTokensRelations,
  reviews: () => reviews,
  reviewsRelations: () => reviewsRelations,
  stories: () => stories,
  storiesRelations: () => storiesRelations,
  users: () => users,
  usersRelations: () => usersRelations,
  verificationDocuments: () => verificationDocuments,
  verificationDocumentsRelations: () => verificationDocumentsRelations
});
import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  name: text("name"),
  city: text("city"),
  avatarUrl: text("avatar_url"),
  trustScore: integer("trust_score").default(0),
  phoneVerified: boolean("phone_verified").default(false),
  emailVerified: boolean("email_verified").default(false),
  userType: text("user_type").default("bireysel"),
  email: text("email"),
  tcKimlikNo: text("tc_kimlik_no"),
  birthDate: text("birth_date"),
  companyName: text("company_name"),
  taxNumber: text("tax_number"),
  taxOffice: text("tax_office"),
  companyAddress: text("company_address"),
  authorizedPerson: text("authorized_person"),
  identityVerified: boolean("identity_verified").default(false),
  companyVerified: boolean("company_verified").default(false),
  appleId: text("apple_id"),
  googleId: text("google_id"),
  isPremium: boolean("is_premium").default(false),
  premiumExpiresAt: timestamp("premium_expires_at"),
  unlimitedListings: boolean("unlimited_listings").default(false),
  storyCredits: integer("story_credits").default(0),
  dailyLikesUsed: integer("daily_likes_used").default(0),
  lastLikeResetAt: timestamp("last_like_reset_at"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  sentLikes: many(likes, { relationName: "sentLikes" }),
  receivedLikes: many(likes, { relationName: "receivedLikes" }),
  messages: many(messages),
  favorites: many(favorites)
}));
var listings = pgTable("listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  km: integer("km").notNull(),
  fuelType: text("fuel_type").notNull(),
  transmission: text("transmission").notNull(),
  city: text("city").notNull(),
  district: text("district"),
  photos: jsonb("photos").$type().default([]),
  swapActive: boolean("swap_active").default(true),
  onlySwap: boolean("only_swap").default(false),
  acceptsCashDiff: boolean("accepts_cash_diff").default(true),
  preferredBrands: jsonb("preferred_brands").$type().default([]),
  yearRangeMin: integer("year_range_min"),
  yearRangeMax: integer("year_range_max"),
  kmMax: integer("km_max"),
  status: text("status").default("pending"),
  // pending, active, rejected
  viewCount: integer("view_count").default(0),
  tramerRecord: integer("tramer_record").default(0),
  paintedParts: jsonb("painted_parts").$type().default([]),
  replacedParts: jsonb("replaced_parts").$type().default([]),
  accidentFree: boolean("accident_free").default(true),
  description: text("description"),
  isFeatured: boolean("is_featured").default(false),
  featuredExpiresAt: timestamp("featured_expires_at"),
  estimatedValue: integer("estimated_value"),
  listingType: text("listing_type").default("quick"),
  listingCode: varchar("listing_code", { length: 10 }).unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var listingsRelations = relations(listings, ({ one, many }) => ({
  user: one(users, {
    fields: [listings.userId],
    references: [users.id]
  }),
  likes: many(likes),
  favorites: many(favorites)
}));
var likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  toUserId: varchar("to_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fromListingId: varchar("from_listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  toListingId: varchar("to_listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  liked: boolean("liked").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var likesRelations = relations(likes, ({ one }) => ({
  fromUser: one(users, {
    fields: [likes.fromUserId],
    references: [users.id],
    relationName: "sentLikes"
  }),
  toUser: one(users, {
    fields: [likes.toUserId],
    references: [users.id],
    relationName: "receivedLikes"
  }),
  fromListing: one(listings, {
    fields: [likes.fromListingId],
    references: [listings.id]
  }),
  toListing: one(listings, {
    fields: [likes.toListingId],
    references: [listings.id]
  })
}));
var matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  user2Id: varchar("user2_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  listing1Id: varchar("listing1_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  listing2Id: varchar("listing2_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  chatId: varchar("chat_id"),
  createdAt: timestamp("created_at").defaultNow()
});
var matchesRelations = relations(matches, ({ one, many }) => ({
  user1: one(users, {
    fields: [matches.user1Id],
    references: [users.id]
  }),
  user2: one(users, {
    fields: [matches.user2Id],
    references: [users.id]
  }),
  listing1: one(listings, {
    fields: [matches.listing1Id],
    references: [listings.id]
  }),
  listing2: one(listings, {
    fields: [matches.listing2Id],
    references: [listings.id]
  }),
  messages: many(messages)
}));
var messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content"),
  imageUrl: text("image_url"),
  messageType: text("message_type").default("text"),
  audioData: text("audio_data"),
  audioDuration: integer("audio_duration"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var messagesRelations = relations(messages, ({ one }) => ({
  match: one(matches, {
    fields: [messages.matchId],
    references: [matches.id]
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id]
  })
}));
var favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  listingId: varchar("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow()
});
var favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id]
  }),
  listing: one(listings, {
    fields: [favorites.listingId],
    references: [listings.id]
  })
}));
var notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedMatchId: varchar("related_match_id").references(() => matches.id, { onDelete: "cascade" }),
  relatedListingId: varchar("related_listing_id").references(() => listings.id, { onDelete: "cascade" }),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  }),
  match: one(matches, {
    fields: [notifications.relatedMatchId],
    references: [matches.id]
  }),
  listing: one(listings, {
    fields: [notifications.relatedListingId],
    references: [listings.id]
  })
}));
var reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reviewedUserId: varchar("reviewed_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  matchId: varchar("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow()
});
var reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: "givenReviews"
  }),
  reviewedUser: one(users, {
    fields: [reviews.reviewedUserId],
    references: [users.id],
    relationName: "receivedReviews"
  }),
  match: one(matches, {
    fields: [reviews.matchId],
    references: [matches.id]
  })
}));
var insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
});
var priceAlerts = pgTable("price_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  listingId: varchar("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  targetPrice: integer("target_price").notNull(),
  originalPrice: integer("original_price").notNull(),
  isActive: boolean("is_active").default(true),
  triggered: boolean("triggered").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var priceAlertsRelations = relations(priceAlerts, ({ one }) => ({
  user: one(users, {
    fields: [priceAlerts.userId],
    references: [users.id]
  }),
  listing: one(listings, {
    fields: [priceAlerts.listingId],
    references: [listings.id]
  })
}));
var insertPriceAlertSchema = createInsertSchema(priceAlerts).omit({
  id: true,
  createdAt: true,
  triggered: true
});
var stories = pgTable("stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  listingId: varchar("listing_id").references(() => listings.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  brandName: text("brand_name").notNull(),
  isActive: boolean("is_active").default(true),
  viewCount: integer("view_count").default(0),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var storiesRelations = relations(stories, ({ one }) => ({
  user: one(users, {
    fields: [stories.userId],
    references: [users.id]
  }),
  listing: one(listings, {
    fields: [stories.listingId],
    references: [listings.id]
  })
}));
var insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
  viewCount: true
});
var verificationDocuments = pgTable("verification_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  documentType: text("document_type").notNull(),
  // 'tax_certificate', 'identity', 'company_registration'
  documentUrl: text("document_url").notNull(),
  status: text("status").default("pending"),
  // 'pending', 'approved', 'rejected'
  rejectionReason: text("rejection_reason"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var verificationDocumentsRelations = relations(verificationDocuments, ({ one }) => ({
  user: one(users, {
    fields: [verificationDocuments.userId],
    references: [users.id]
  })
}));
var insertVerificationDocumentSchema = createInsertSchema(verificationDocuments).omit({
  id: true,
  createdAt: true,
  status: true,
  reviewedAt: true,
  rejectionReason: true
});
var applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  // 'corporate' veya 'premium'
  status: text("status").default("pending"),
  // 'pending', 'approved', 'rejected'
  // Kurumsal başvuru için ek bilgiler
  companyName: text("company_name"),
  taxNumber: text("tax_number"),
  taxOffice: text("tax_office"),
  companyAddress: text("company_address"),
  authorizedPerson: text("authorized_person"),
  companyPhone: text("company_phone"),
  documents: jsonb("documents").$type().default([]),
  // Premium başvuru için
  planType: text("plan_type"),
  // 'monthly'
  // Admin işlemleri
  rejectionReason: text("rejection_reason"),
  reviewedBy: varchar("reviewed_by").references(() => adminUsers.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var applicationsRelations = relations(applications, ({ one }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id]
  }),
  reviewer: one(adminUsers, {
    fields: [applications.reviewedBy],
    references: [adminUsers.id]
  })
}));
var insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  status: true,
  reviewedAt: true,
  reviewedBy: true,
  rejectionReason: true
});
var adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  role: text("role").default("admin"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true
});
var insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});
var insertUserSchema = createInsertSchema(users).pick({
  phone: true,
  name: true,
  city: true,
  email: true,
  appleId: true,
  googleId: true,
  avatarUrl: true
});
var insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true
});
var insertMessageSchema = createInsertSchema(messages).pick({
  matchId: true,
  senderId: true,
  content: true,
  imageUrl: true,
  messageType: true,
  audioData: true,
  audioDuration: true
});
var appSettings = pgTable("app_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var pushTokens = pgTable("push_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  platform: text("platform").default("unknown"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var pushTokensRelations = relations(pushTokens, ({ one }) => ({
  user: one(users, {
    fields: [pushTokens.userId],
    references: [users.id]
  })
}));
var pushNotificationLogs = pgTable("push_notification_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  message: text("message").notNull(),
  targetType: text("target_type").notNull().default("all"),
  targetFilter: text("target_filter"),
  sentCount: integer("sent_count").default(0),
  failedCount: integer("failed_count").default(0),
  sentBy: varchar("sent_by"),
  createdAt: timestamp("created_at").defaultNow()
});

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
var { Pool } = pg;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, and, or, desc, sql as sql2, ne, notInArray } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByPhone(phone) {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || void 0;
  }
  async getUserByAppleId(appleId) {
    const [user] = await db.select().from(users).where(eq(users.appleId, appleId));
    return user || void 0;
  }
  async getUserByGoogleId(googleId) {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, data) {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  async getListings(filters) {
    let query = db.select().from(listings).where(eq(listings.status, "active"));
    if (filters?.swapActive !== void 0) {
      query = db.select().from(listings).where(
        and(eq(listings.status, "active"), eq(listings.swapActive, filters.swapActive))
      );
    }
    const result = await query.orderBy(desc(listings.updatedAt));
    let filtered = result;
    if (filters?.city) {
      filtered = filtered.filter((l) => l.city === filters.city);
    }
    if (filters?.brand) {
      filtered = filtered.filter((l) => l.brand === filters.brand);
    }
    return filtered;
  }
  async getFeaturedListings() {
    const now = /* @__PURE__ */ new Date();
    return db.select().from(listings).where(
      and(
        eq(listings.status, "active"),
        eq(listings.isFeatured, true)
      )
    ).orderBy(desc(listings.createdAt));
  }
  async getListing(id) {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing || void 0;
  }
  async getListingsByUser(userId) {
    return db.select().from(listings).where(eq(listings.userId, userId)).orderBy(desc(listings.createdAt));
  }
  async createListing(listing) {
    const [created] = await db.insert(listings).values(listing).returning();
    return created;
  }
  async updateListing(id, data) {
    const [updated] = await db.update(listings).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(listings.id, id)).returning();
    return updated || void 0;
  }
  async deleteListing(id) {
    await db.delete(listings).where(eq(listings.id, id));
  }
  async incrementViewCount(id) {
    await db.update(listings).set({ viewCount: sql2`${listings.viewCount} + 1` }).where(eq(listings.id, id));
  }
  async getSwipeableListings(userId, userListingId) {
    const likedListingIds = await db.select({ toListingId: likes.toListingId }).from(likes).where(eq(likes.fromListingId, userListingId));
    const excludeIds = likedListingIds.map((l) => l.toListingId);
    excludeIds.push(userListingId);
    if (excludeIds.length > 0) {
      return db.select().from(listings).where(
        and(
          eq(listings.status, "active"),
          eq(listings.swapActive, true),
          ne(listings.userId, userId),
          notInArray(listings.id, excludeIds)
        )
      ).orderBy(desc(listings.createdAt)).limit(20);
    }
    return db.select().from(listings).where(
      and(
        eq(listings.status, "active"),
        eq(listings.swapActive, true),
        ne(listings.userId, userId)
      )
    ).orderBy(desc(listings.createdAt)).limit(20);
  }
  async getDailySwipeCount(userId) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const result = await db.select({ count: sql2`count(*)::int` }).from(likes).where(
      and(
        eq(likes.fromUserId, userId),
        sql2`${likes.createdAt} >= ${today}`
      )
    );
    return result[0]?.count ?? 0;
  }
  async createLike(fromUserId, toUserId, fromListingId, toListingId, liked) {
    const [like] = await db.insert(likes).values({
      fromUserId,
      toUserId,
      fromListingId,
      toListingId,
      liked
    }).returning();
    return like;
  }
  async checkMutualLike(fromUserId, toUserId, fromListingId, toListingId) {
    const [mutualLike] = await db.select().from(likes).where(
      and(
        eq(likes.fromUserId, toUserId),
        eq(likes.toUserId, fromUserId),
        eq(likes.fromListingId, toListingId),
        eq(likes.toListingId, fromListingId),
        eq(likes.liked, true)
      )
    );
    return !!mutualLike;
  }
  async createMatch(user1Id, user2Id, listing1Id, listing2Id) {
    const chatId = `chat_${Date.now()}`;
    const [match] = await db.insert(matches).values({
      user1Id,
      user2Id,
      listing1Id,
      listing2Id,
      chatId
    }).returning();
    return match;
  }
  async getMatchesByUser(userId) {
    return db.select().from(matches).where(or(eq(matches.user1Id, userId), eq(matches.user2Id, userId))).orderBy(desc(matches.createdAt));
  }
  async getMatch(id) {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match || void 0;
  }
  async getMessagesByMatch(matchId) {
    return db.select().from(messages).where(eq(messages.matchId, matchId)).orderBy(messages.createdAt);
  }
  async createMessage(message) {
    const [created] = await db.insert(messages).values(message).returning();
    return created;
  }
  async markMessagesAsRead(matchId, userId) {
    await db.update(messages).set({ read: true }).where(and(eq(messages.matchId, matchId), ne(messages.senderId, userId)));
  }
  async getFavoritesByUser(userId) {
    return db.select().from(favorites).where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt));
  }
  async getFavoritesWithListings(userId) {
    const userFavorites = await db.select().from(favorites).where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt));
    const results = await Promise.all(
      userFavorites.map(async (fav) => {
        const [listing] = await db.select().from(listings).where(eq(listings.id, fav.listingId));
        return { ...fav, listing: listing || null };
      })
    );
    return results;
  }
  async addFavorite(userId, listingId) {
    const [favorite] = await db.insert(favorites).values({ userId, listingId }).returning();
    return favorite;
  }
  async removeFavorite(userId, listingId) {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)));
  }
  async isFavorite(userId, listingId) {
    const [favorite] = await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)));
    return !!favorite;
  }
  async getNotificationsByUser(userId) {
    return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }
  async createNotification(notification) {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }
  async markNotificationAsRead(notificationId) {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, notificationId));
  }
  async markAllNotificationsAsRead(userId) {
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
  }
  async getUnreadNotificationCount(userId) {
    const result = await db.select({ count: sql2`count(*)` }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return result[0]?.count || 0;
  }
  async getReviewsByUser(userId) {
    return db.select().from(reviews).where(eq(reviews.reviewerId, userId)).orderBy(desc(reviews.createdAt));
  }
  async getReviewsForUser(userId) {
    return db.select().from(reviews).where(eq(reviews.reviewedUserId, userId)).orderBy(desc(reviews.createdAt));
  }
  async createReview(review) {
    const [created] = await db.insert(reviews).values(review).returning();
    return created;
  }
  async getReviewForMatch(matchId, reviewerId) {
    const [review] = await db.select().from(reviews).where(and(eq(reviews.matchId, matchId), eq(reviews.reviewerId, reviewerId)));
    return review || void 0;
  }
  async getUserAverageRating(userId) {
    const result = await db.select({
      average: sql2`COALESCE(AVG(rating), 0)`,
      count: sql2`COUNT(*)`
    }).from(reviews).where(eq(reviews.reviewedUserId, userId));
    return {
      average: Number(result[0]?.average || 0),
      count: Number(result[0]?.count || 0)
    };
  }
  async getPriceAlertsByUser(userId) {
    return db.select().from(priceAlerts).where(eq(priceAlerts.userId, userId)).orderBy(desc(priceAlerts.createdAt));
  }
  async getPriceAlertForListing(userId, listingId) {
    const [alert] = await db.select().from(priceAlerts).where(and(eq(priceAlerts.userId, userId), eq(priceAlerts.listingId, listingId)));
    return alert || void 0;
  }
  async createPriceAlert(alert) {
    const [created] = await db.insert(priceAlerts).values(alert).returning();
    return created;
  }
  async deletePriceAlert(id) {
    await db.delete(priceAlerts).where(eq(priceAlerts.id, id));
  }
  async updatePriceAlert(id, data) {
    const [updated] = await db.update(priceAlerts).set(data).where(eq(priceAlerts.id, id)).returning();
    return updated || void 0;
  }
  async getStories() {
    return db.select().from(stories).orderBy(desc(stories.createdAt));
  }
  async getActiveStories() {
    const now = /* @__PURE__ */ new Date();
    return db.select().from(stories).where(and(eq(stories.isActive, true), sql2`${stories.expiresAt} > ${now}`)).orderBy(desc(stories.createdAt));
  }
  async getStory(id) {
    const [story] = await db.select().from(stories).where(eq(stories.id, id));
    return story || void 0;
  }
  async getStoryByListingId(listingId) {
    const [story] = await db.select().from(stories).where(eq(stories.listingId, listingId));
    return story || void 0;
  }
  async createStory(story) {
    const [created] = await db.insert(stories).values(story).returning();
    return created;
  }
  async updateStory(id, data) {
    const [updated] = await db.update(stories).set(data).where(eq(stories.id, id)).returning();
    return updated || void 0;
  }
  async deleteStory(id) {
    await db.delete(stories).where(eq(stories.id, id));
  }
  async incrementStoryViewCount(id) {
    await db.update(stories).set({ viewCount: sql2`${stories.viewCount} + 1` }).where(eq(stories.id, id));
  }
  async deleteExpiredStories() {
    const now = /* @__PURE__ */ new Date();
    const result = await db.delete(stories).where(sql2`${stories.expiresAt} <= ${now}`).returning();
    return result.length;
  }
  async getAdminUserByEmail(email) {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return admin || void 0;
  }
  async createAdminUser(admin) {
    const [created] = await db.insert(adminUsers).values(admin).returning();
    return created;
  }
  async getAllUsers() {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }
  async getAllListings() {
    return db.select().from(listings).orderBy(desc(listings.createdAt));
  }
  async getAllMatches() {
    return db.select().from(matches).orderBy(desc(matches.createdAt));
  }
  async getMessageStats() {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const totalResult = await db.select({ count: sql2`COUNT(*)` }).from(messages);
    const todayResult = await db.select({ count: sql2`COUNT(*)` }).from(messages).where(sql2`${messages.createdAt} >= ${today}`);
    return {
      total: Number(totalResult[0]?.count || 0),
      today: Number(todayResult[0]?.count || 0)
    };
  }
  async getRecentMessagesByMatch() {
    const result = await db.select({
      matchId: messages.matchId,
      messageCount: sql2`COUNT(*)`,
      lastMessage: sql2`MAX(${messages.content})`,
      lastMessageAt: sql2`MAX(${messages.createdAt})`
    }).from(messages).groupBy(messages.matchId).orderBy(desc(sql2`MAX(${messages.createdAt})`)).limit(20);
    return result;
  }
  async getVerificationDocumentsByUser(userId) {
    return db.select().from(verificationDocuments).where(eq(verificationDocuments.userId, userId)).orderBy(desc(verificationDocuments.createdAt));
  }
  async createVerificationDocument(doc) {
    const [created] = await db.insert(verificationDocuments).values(doc).returning();
    return created;
  }
  async updateVerificationDocument(id, data) {
    const [updated] = await db.update(verificationDocuments).set(data).where(eq(verificationDocuments.id, id)).returning();
    return updated || void 0;
  }
  async getAllPendingVerifications() {
    return db.select().from(verificationDocuments).where(eq(verificationDocuments.status, "pending")).orderBy(desc(verificationDocuments.createdAt));
  }
  // Applications
  async createApplication(application) {
    const [created] = await db.insert(applications).values(application).returning();
    return created;
  }
  async getApplicationsByUser(userId) {
    return db.select().from(applications).where(eq(applications.userId, userId)).orderBy(desc(applications.createdAt));
  }
  async getPendingApplications(type) {
    return db.select().from(applications).where(and(eq(applications.type, type), eq(applications.status, "pending"))).orderBy(desc(applications.createdAt));
  }
  async approveApplication(id, adminEmail) {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    if (!application) return void 0;
    const admin = await this.getAdminUserByEmail(adminEmail);
    const [updated] = await db.update(applications).set({
      status: "approved",
      reviewedBy: admin?.id,
      reviewedAt: /* @__PURE__ */ new Date()
    }).where(eq(applications.id, id)).returning();
    if (updated) {
      if (application.type === "premium") {
        const expiresAt = /* @__PURE__ */ new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await this.updateUser(application.userId, {
          isPremium: true,
          premiumExpiresAt: expiresAt
        });
      }
      if (application.type === "corporate") {
        await this.updateUser(application.userId, {
          userType: "kurumsal",
          companyName: application.companyName,
          taxNumber: application.taxNumber,
          taxOffice: application.taxOffice,
          companyAddress: application.companyAddress,
          authorizedPerson: application.authorizedPerson,
          companyVerified: true
        });
      }
    }
    return updated || void 0;
  }
  async rejectApplication(id, reason, adminEmail) {
    const admin = await this.getAdminUserByEmail(adminEmail);
    const [updated] = await db.update(applications).set({
      status: "rejected",
      rejectionReason: reason,
      reviewedBy: admin?.id,
      reviewedAt: /* @__PURE__ */ new Date()
    }).where(eq(applications.id, id)).returning();
    return updated || void 0;
  }
  async deleteDemoData() {
    const demoUserIds = await db.select({ id: users.id }).from(users).where(sql2`${users.id} LIKE 'demo-%'`);
    const demoListingIds = await db.select({ id: listings.id }).from(listings).where(sql2`${listings.id} LIKE 'demo-%'`);
    const userIds = demoUserIds.map((u) => u.id);
    const listingIds = demoListingIds.map((l) => l.id);
    let deletedMessages = 0;
    let deletedMatches = 0;
    let deletedLikes = 0;
    let deletedFavorites = 0;
    if (userIds.length > 0) {
      const msgResult = await db.delete(messages).where(
        sql2`${messages.matchId} IN (SELECT id FROM matches WHERE user1_id = ANY(${userIds}) OR user2_id = ANY(${userIds}))`
      );
      const matchResult = await db.delete(matches).where(
        or(
          sql2`${matches.user1Id} = ANY(${userIds})`,
          sql2`${matches.user2Id} = ANY(${userIds})`
        )
      );
      const favResult = await db.delete(favorites).where(
        or(
          sql2`${favorites.userId} = ANY(${userIds})`,
          sql2`${favorites.listingId} LIKE 'demo-%'`
        )
      );
      deletedFavorites = favResult.rowCount || 0;
    }
    if (listingIds.length > 0) {
      const likeResult = await db.delete(likes).where(
        or(
          sql2`${likes.fromListingId} = ANY(${listingIds})`,
          sql2`${likes.toListingId} = ANY(${listingIds})`
        )
      );
      deletedLikes = likeResult.rowCount || 0;
    }
    let deletedListings = 0;
    if (listingIds.length > 0) {
      const result = await db.delete(listings).where(sql2`${listings.id} LIKE 'demo-%'`);
      deletedListings = result.rowCount || 0;
    }
    let deletedUsers = 0;
    if (userIds.length > 0) {
      const result = await db.delete(users).where(sql2`${users.id} LIKE 'demo-%'`);
      deletedUsers = result.rowCount || 0;
    }
    return { deletedUsers, deletedListings, deletedLikes, deletedFavorites, deletedMatches, deletedMessages };
  }
  async getAppSettings() {
    const rows = await db.select().from(appSettings);
    const result = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  }
  async saveAppSettings(settings) {
    for (const [key, value] of Object.entries(settings)) {
      await db.insert(appSettings).values({ key, value, updatedAt: /* @__PURE__ */ new Date() }).onConflictDoUpdate({
        target: appSettings.key,
        set: { value, updatedAt: /* @__PURE__ */ new Date() }
      });
    }
  }
  async savePushToken(userId, token, platform) {
    const existing = await db.select().from(pushTokens).where(eq(pushTokens.token, token));
    if (existing.length > 0) {
      const [updated] = await db.update(pushTokens).set({ userId, platform, updatedAt: /* @__PURE__ */ new Date() }).where(eq(pushTokens.token, token)).returning();
      return updated;
    }
    const [created] = await db.insert(pushTokens).values({ userId, token, platform }).returning();
    return created;
  }
  async removePushToken(token) {
    await db.delete(pushTokens).where(eq(pushTokens.token, token));
  }
  async getAllPushTokens() {
    return await db.select().from(pushTokens);
  }
  async getPushTokensByUserIds(userIds) {
    if (userIds.length === 0) return [];
    return await db.select().from(pushTokens).where(sql2`${pushTokens.userId} = ANY(${userIds})`);
  }
  async createPushNotificationLog(log2) {
    const [created] = await db.insert(pushNotificationLogs).values(log2).returning();
    return created;
  }
  async getPushNotificationLogs() {
    return await db.select().from(pushNotificationLogs).orderBy(desc(pushNotificationLogs.createdAt));
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// server/twilio.ts
import twilio from "twilio";
var connectionSettings;
async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? "repl " + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? "depl " + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }
  connectionSettings = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=twilio",
    {
      headers: {
        "Accept": "application/json",
        "X_REPLIT_TOKEN": xReplitToken
      }
    }
  ).then((res) => res.json()).then((data) => data.items?.[0]);
  if (!connectionSettings || !connectionSettings.settings.account_sid || !connectionSettings.settings.api_key || !connectionSettings.settings.api_key_secret) {
    throw new Error("Twilio not connected");
  }
  return {
    accountSid: connectionSettings.settings.account_sid,
    apiKey: connectionSettings.settings.api_key,
    apiKeySecret: connectionSettings.settings.api_key_secret,
    phoneNumber: connectionSettings.settings.phone_number
  };
}
async function getTwilioClient() {
  const { accountSid, apiKey, apiKeySecret } = await getCredentials();
  return twilio(apiKey, apiKeySecret, { accountSid });
}
async function sendVerificationCode(phone) {
  try {
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!serviceSid) {
      throw new Error("TWILIO_VERIFY_SERVICE_SID is not configured");
    }
    const client = await getTwilioClient();
    await client.verify.v2.services(serviceSid).verifications.create({
      to: phone,
      channel: "sms",
      locale: "tr"
    });
    console.log(`Verification code sent to ${phone}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to send verification code:", error);
    return { success: false, error: error.message || "SMS gonderilemedi" };
  }
}
async function verifyCode(phone, code) {
  try {
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!serviceSid) {
      throw new Error("TWILIO_VERIFY_SERVICE_SID is not configured");
    }
    const client = await getTwilioClient();
    const verificationCheck = await client.verify.v2.services(serviceSid).verificationChecks.create({
      to: phone,
      code
    });
    if (verificationCheck.status === "approved") {
      return { valid: true };
    }
    return { valid: false, error: "Dogrulama kodu hatali." };
  } catch (error) {
    console.error("Verification check error:", error);
    if (error.code === 20404) {
      return { valid: false, error: "Dogrulama kodu bulunamadi veya suresi doldu. Lutfen yeni kod isteyin." };
    }
    return { valid: false, error: error.message || "Dogrulama hatasi" };
  }
}

// server/routes.ts
import { eq as eq2, sql as sql3 } from "drizzle-orm";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
function getAdminSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is required for admin authentication");
  }
  return secret;
}
async function sendPushToUsers(userIds, title, body, data = {}) {
  try {
    const tokens = await storage.getPushTokensByUserIds(userIds);
    const validTokens = tokens.map((t) => t.token).filter((t) => t && (t.startsWith("ExponentPushToken") || t.startsWith("ExpoPushToken")));
    if (validTokens.length === 0) return;
    const messages2 = validTokens.map((token) => ({ to: token, sound: "default", title, body, data }));
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(messages2)
    });
  } catch (err) {
    console.error("Push notification error:", err);
  }
}
function generateToken(email) {
  const payload = { email, exp: Date.now() + 24 * 60 * 60 * 1e3 };
  const data = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", getAdminSecret()).update(data).digest("hex");
  return Buffer.from(data).toString("base64") + "." + signature;
}
function verifyToken(token) {
  try {
    const [dataB64, signature] = token.split(".");
    const data = Buffer.from(dataB64, "base64").toString();
    const expectedSig = crypto.createHmac("sha256", getAdminSecret()).update(data).digest("hex");
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(data);
    if (payload.exp < Date.now()) return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}
function hashPassword(password) {
  return crypto.createHash("sha256").update(password + getAdminSecret()).digest("hex");
}
function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  req.adminEmail = payload.email;
  next();
}
function generateListingCode() {
  const num = Math.floor(1e3 + Math.random() * 9e3);
  return `TKS-${num}`;
}
async function registerRoutes(app2) {
  app2.post("/api/auth/send-code", async (req, res) => {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
      }
      const result = await sendVerificationCode(phone);
      if (!result.success) {
        return res.status(500).json({ error: result.error || "SMS gonderilemedi" });
      }
      res.json({ success: true, message: "Dogrulama kodu gonderildi" });
    } catch (error) {
      console.error("Send code error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/auth/verify-code", async (req, res) => {
    try {
      const { phone, code } = req.body;
      if (!phone || !code) {
        return res.status(400).json({ error: "Phone and code are required" });
      }
      const result = await verifyCode(phone, code);
      if (!result.valid) {
        return res.status(400).json({ error: result.error });
      }
      let isNewUser = false;
      let user = await storage.getUserByPhone(phone);
      if (!user) {
        user = await storage.createUser({ phone, name: null, city: null });
        isNewUser = true;
      } else if (!user.name) {
        isNewUser = true;
      }
      await storage.updateUser(user.id, { phoneVerified: true });
      res.json({ user: { ...user, phoneVerified: true }, isNewUser });
    } catch (error) {
      console.error("Verify code error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { type, identifier } = req.body;
      if (!type || !identifier) {
        return res.status(400).json({ error: "Type and identifier are required" });
      }
      if (type === "email") {
        const user = await storage.getUserByEmail(identifier);
        if (!user) {
          return res.status(404).json({ error: "Bu e-posta adresiyle kay\u0131tl\u0131 kullan\u0131c\u0131 bulunamad\u0131" });
        }
        const phone = user.phone;
        if (!phone || phone.startsWith("apple_") || phone.startsWith("google_")) {
          return res.status(400).json({ error: "Bu hesap sosyal medya ile olu\u015Fturulmu\u015F. L\xFCtfen Apple veya Google ile giri\u015F yap\u0131n." });
        }
        const result = await sendVerificationCode(phone);
        if (!result.success) {
          return res.status(500).json({ error: result.error || "Do\u011Frulama kodu g\xF6nderilemedi" });
        }
        const maskedPhone = phone.replace(/(\+90)(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 *** ** $5");
        res.json({ success: true, phone: maskedPhone, realPhone: phone, message: "Do\u011Frulama kodu kay\u0131tl\u0131 telefon numaran\u0131za g\xF6nderildi" });
      } else if (type === "phone") {
        const cleanedPhone = identifier.replace(/\s/g, "");
        const user = await storage.getUserByPhone(cleanedPhone);
        if (!user) {
          return res.status(404).json({ error: "Bu telefon numaras\u0131yla kay\u0131tl\u0131 kullan\u0131c\u0131 bulunamad\u0131" });
        }
        const result = await sendVerificationCode(cleanedPhone);
        if (!result.success) {
          return res.status(500).json({ error: result.error || "Do\u011Frulama kodu g\xF6nderilemedi" });
        }
        res.json({ success: true, message: "Do\u011Frulama kodu telefon numaran\u0131za g\xF6nderildi" });
      } else {
        return res.status(400).json({ error: "Invalid type" });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/auth/reset-verify", async (req, res) => {
    try {
      const { phone, code } = req.body;
      if (!phone || !code) {
        return res.status(400).json({ error: "Phone and code are required" });
      }
      const result = await verifyCode(phone, code);
      if (!result.valid) {
        return res.status(400).json({ error: result.error || "Ge\xE7ersiz do\u011Frulama kodu" });
      }
      const user = await storage.getUserByPhone(phone);
      if (!user) {
        return res.status(404).json({ error: "Kullan\u0131c\u0131 bulunamad\u0131" });
      }
      await storage.updateUser(user.id, { phoneVerified: true });
      res.json({ user: { ...user, phoneVerified: true } });
    } catch (error) {
      console.error("Reset verify error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
      }
      let user = await storage.getUserByPhone(phone);
      if (!user) {
        user = await storage.createUser({ phone, name: null, city: null });
      }
      await storage.updateUser(user.id, { phoneVerified: true });
      res.json({ user: { ...user, phoneVerified: true } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/auth/register-email", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Ad, e-posta ve \u015Fifre zorunludur" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "\u015Eifre en az 6 karakter olmal\u0131d\u0131r" });
      }
      let user = await storage.getUserByEmail(email);
      if (user) {
        return res.status(409).json({ error: "Bu e-posta adresi zaten kay\u0131tl\u0131" });
      }
      const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
      const tempPhone = `email_${crypto.randomBytes(8).toString("hex")}`;
      user = await storage.createUser({ name, email, phone: tempPhone, city: null });
      await storage.updateUser(user.id, { emailVerified: true, passwordHash: hashedPassword });
      res.json({ user, isNewUser: true });
    } catch (error) {
      console.error("Register email error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/auth/login-email", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "E-posta ve \u015Fifre zorunludur" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "E-posta veya \u015Fifre hatal\u0131" });
      }
      const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
      if (user.passwordHash !== hashedPassword) {
        return res.status(401).json({ error: "E-posta veya \u015Fifre hatal\u0131" });
      }
      res.json({ user });
    } catch (error) {
      console.error("Login email error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/auth/apple", async (req, res) => {
    try {
      const { appleId, email, fullName, identityToken } = req.body;
      if (!appleId) {
        return res.status(400).json({ error: "Apple ID is required" });
      }
      if (identityToken) {
        try {
          const parts = identityToken.split(".");
          if (parts.length !== 3) {
            return res.status(401).json({ error: "Invalid Apple identity token format" });
          }
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
          if (payload.iss !== "https://appleid.apple.com") {
            return res.status(401).json({ error: "Invalid Apple token issuer" });
          }
          if (payload.exp && payload.exp * 1e3 < Date.now()) {
            return res.status(401).json({ error: "Apple token expired" });
          }
          if (payload.sub !== appleId) {
            return res.status(401).json({ error: "Apple ID mismatch" });
          }
        } catch (tokenErr) {
          console.error("Apple token verification error:", tokenErr);
          return res.status(401).json({ error: "Apple token verification failed" });
        }
      }
      let user = await storage.getUserByAppleId(appleId);
      if (!user && email) {
        user = await storage.getUserByEmail(email);
        if (user) {
          await storage.updateUser(user.id, { appleId });
        }
      }
      if (!user) {
        const tempPhone = `apple_${appleId.substring(0, 15)}`;
        user = await storage.createUser({
          phone: tempPhone,
          name: fullName || null,
          email: email || null,
          appleId,
          city: null
        });
      }
      res.json({ user });
    } catch (error) {
      console.error("Apple login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/auth/google", async (req, res) => {
    try {
      const { accessToken, googleId, email, name, photo } = req.body;
      let verifiedGoogleId = googleId;
      let verifiedEmail = email;
      let verifiedName = name;
      let verifiedPhoto = photo;
      if (accessToken) {
        try {
          const googleResponse = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (!googleResponse.ok) {
            return res.status(401).json({ error: "Invalid Google access token" });
          }
          const googleUser = await googleResponse.json();
          verifiedGoogleId = googleUser.sub;
          verifiedEmail = googleUser.email || email;
          verifiedName = googleUser.name || name;
          verifiedPhoto = googleUser.picture || photo;
        } catch (googleErr) {
          console.error("Google token verification error:", googleErr);
          return res.status(401).json({ error: "Google token verification failed" });
        }
      }
      if (!verifiedGoogleId) {
        return res.status(400).json({ error: "Google ID is required" });
      }
      let user = await storage.getUserByGoogleId(verifiedGoogleId);
      if (!user && verifiedEmail) {
        user = await storage.getUserByEmail(verifiedEmail);
        if (user) {
          await storage.updateUser(user.id, { googleId: verifiedGoogleId });
        }
      }
      if (!user) {
        const tempPhone = `google_${verifiedGoogleId.substring(0, 14)}`;
        user = await storage.createUser({
          phone: tempPhone,
          name: verifiedName || null,
          email: verifiedEmail || null,
          googleId: verifiedGoogleId,
          avatarUrl: verifiedPhoto || null,
          city: null
        });
      }
      res.json({ user });
    } catch (error) {
      console.error("Google login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/users/:id", async (req, res) => {
    try {
      const updateData = { ...req.body };
      if (updateData.avatarUrl && updateData.avatarUrl.startsWith("data:image/")) {
        const matches2 = updateData.avatarUrl.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
        if (matches2) {
          const ext = matches2[1] === "jpeg" ? "jpg" : matches2[1];
          const data = matches2[2];
          const buffer = Buffer.from(data, "base64");
          const filename = `avatar_${req.params.id}_${Date.now()}.${ext}`;
          const uploadDir = path.join(process.cwd(), "server", "uploads");
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          const filePath = path.join(uploadDir, filename);
          fs.writeFileSync(filePath, buffer);
          updateData.avatarUrl = `/uploads/${filename}`;
        }
      }
      const user = await storage.updateUser(req.params.id, updateData);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/users/:id/premium", async (req, res) => {
    try {
      const { days } = req.body;
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setDate(expiresAt.getDate() + (days || 30));
      const user = await storage.updateUser(req.params.id, {
        isPremium: true,
        premiumExpiresAt: expiresAt
      });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Premium subscription error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/listings/active", async (req, res) => {
    try {
      const allListings = await storage.getAllListings();
      const activeListings = allListings.filter((l) => l.status === "active");
      res.json(activeListings);
    } catch (error) {
      console.error("Get active listings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/listings/featured", async (req, res) => {
    try {
      const featuredListings = await storage.getFeaturedListings();
      res.json(featuredListings);
    } catch (error) {
      console.error("Get featured listings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/listings/:id/feature", async (req, res) => {
    try {
      const { days } = req.body;
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setDate(expiresAt.getDate() + (days || 7));
      const listing = await storage.updateListing(req.params.id, {
        isFeatured: true,
        featuredExpiresAt: expiresAt
      });
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      console.error("Feature listing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/listings/shuffled", async (req, res) => {
    try {
      const allListings = await storage.getListings();
      for (let i = allListings.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allListings[i], allListings[j]] = [allListings[j], allListings[i]];
      }
      res.json(allListings);
    } catch (error) {
      console.error("Get shuffled listings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/listings", async (req, res) => {
    try {
      const { city, brand, swapActive } = req.query;
      const filters = {};
      if (city) filters.city = city;
      if (brand) filters.brand = brand;
      if (swapActive !== void 0) filters.swapActive = swapActive === "true";
      const listings2 = await storage.getListings(filters);
      res.json(listings2);
    } catch (error) {
      console.error("Get listings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/listings/by-code/:code", async (req, res) => {
    try {
      const code = req.params.code.toUpperCase().trim();
      const [listing] = await db.select().from(listings).where(eq2(listings.listingCode, code)).limit(1);
      if (!listing) {
        return res.status(404).json({ error: "Ilan bulunamadi" });
      }
      res.json(listing);
    } catch (error) {
      console.error("Search by code error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.getListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      await storage.incrementViewCount(req.params.id);
      res.json(listing);
    } catch (error) {
      console.error("Get listing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/users/:userId/listings", async (req, res) => {
    try {
      const listings2 = await storage.getListingsByUser(req.params.userId);
      res.json(listings2);
    } catch (error) {
      console.error("Get user listings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/upload", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }
      const matches2 = image.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
      if (!matches2) {
        return res.status(400).json({ error: "Invalid image format" });
      }
      const ext = matches2[1] === "jpeg" ? "jpg" : matches2[1];
      const data = matches2[2];
      const buffer = Buffer.from(data, "base64");
      const filename = `${crypto.randomUUID()}.${ext}`;
      const uploadDir = path.join(process.cwd(), "server", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
      const url = `/uploads/${filename}`;
      res.json({ url });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });
  app2.get("/api/users/:id/listing-quota", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "Kullan\u0131c\u0131 bulunamad\u0131" });
      }
      const userListings = await storage.getListingsByUser(req.params.id);
      const activeListingCount = userListings.filter((l) => l.status !== "rejected").length;
      let maxListings = 1;
      let quotaLabel = "Standart \xDCye";
      if (user.unlimitedListings) {
        maxListings = 999999;
        quotaLabel = "S\u0131n\u0131rs\u0131z \u0130lan Hakk\u0131";
      } else if (user.userType === "bireysel") {
        if (user.isPremium && user.premiumExpiresAt && new Date(user.premiumExpiresAt) > /* @__PURE__ */ new Date()) {
          maxListings = 5;
          quotaLabel = "Premium \xDCye (Ayl\u0131k 199\u20BA)";
        } else if (user.phoneVerified && user.emailVerified) {
          maxListings = 2;
          quotaLabel = "Do\u011Frulanm\u0131\u015F \xDCye";
        } else {
          maxListings = 1;
          quotaLabel = "Standart \xDCye";
        }
      } else if (user.userType === "kurumsal") {
        maxListings = 999;
        quotaLabel = "Kurumsal \xDCye";
      }
      res.json({
        maxListings,
        currentListings: activeListingCount,
        remainingListings: Math.max(0, maxListings - activeListingCount),
        quotaLabel,
        phoneVerified: user.phoneVerified || false,
        emailVerified: user.emailVerified || false,
        isPremium: user.isPremium || false,
        premiumExpiresAt: user.premiumExpiresAt
      });
    } catch (error) {
      console.error("Listing quota error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/listings", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "Kullan\u0131c\u0131 bilgisi gerekli" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Kullan\u0131c\u0131 bulunamad\u0131" });
      }
      const userListings = await storage.getListingsByUser(userId);
      const activeListingCount = userListings.filter((l) => l.status !== "rejected").length;
      let maxListings = 1;
      const hasUnlimited = user.unlimitedListings || false;
      if (hasUnlimited) {
        maxListings = 999999;
      } else if (user.userType === "bireysel") {
        if (user.isPremium && user.premiumExpiresAt && new Date(user.premiumExpiresAt) > /* @__PURE__ */ new Date()) {
          maxListings = 5;
        } else if (user.phoneVerified && user.emailVerified) {
          maxListings = 2;
        }
      } else if (user.userType === "kurumsal") {
        maxListings = 999;
      }
      if (activeListingCount >= maxListings) {
        let message = "\u0130lan limitinize ula\u015Ft\u0131n\u0131z.";
        if (!user.isPremium && user.userType === "bireysel") {
          if (!user.phoneVerified || !user.emailVerified) {
            message = "\u0130lan limitinize ula\u015Ft\u0131n\u0131z. Telefon ve e-posta do\u011Frulamas\u0131 yaparak 2 ilan hakk\u0131 kazanabilirsiniz.";
          } else {
            message = "\u0130lan limitinize ula\u015Ft\u0131n\u0131z. Premium \xFCyelikle ayl\u0131k 5 ilan hakk\u0131 kazanabilirsiniz (199\u20BA/ay).";
          }
        }
        return res.status(403).json({ error: message });
      }
      let listingCode = generateListingCode();
      let codeExists = true;
      let attempts = 0;
      while (codeExists && attempts < 10) {
        const existing = await db.select().from(listings).where(eq2(listings.listingCode, listingCode)).limit(1);
        if (existing.length === 0) {
          codeExists = false;
        } else {
          listingCode = generateListingCode();
          attempts++;
        }
      }
      req.body.listingCode = listingCode;
      const listing = await storage.createListing(req.body);
      res.status(201).json(listing);
    } catch (error) {
      console.error("Create listing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/listings/:id", async (req, res) => {
    try {
      const updateData = { ...req.body, status: "pending" };
      const listing = await storage.updateListing(req.params.id, updateData);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      console.error("Update listing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/listings/:id", async (req, res) => {
    try {
      await storage.deleteListing(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete listing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/swipe/:userId/:listingId", async (req, res) => {
    try {
      const { userId, listingId } = req.params;
      const listings2 = await storage.getSwipeableListings(userId, listingId);
      res.json(listings2);
    } catch (error) {
      console.error("Get swipeable listings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  const DAILY_SWIPE_LIMIT = 20;
  app2.get("/api/users/:userId/swipe-quota", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Kullan\u0131c\u0131 bulunamad\u0131" });
      }
      const isPremiumActive = user.isPremium && user.premiumExpiresAt && new Date(user.premiumExpiresAt) > /* @__PURE__ */ new Date();
      const dailySwipes = await storage.getDailySwipeCount(userId);
      res.json({
        isPremium: !!isPremiumActive,
        dailyLimit: isPremiumActive ? -1 : DAILY_SWIPE_LIMIT,
        usedToday: dailySwipes,
        remainingToday: isPremiumActive ? -1 : Math.max(0, DAILY_SWIPE_LIMIT - dailySwipes)
      });
    } catch (error) {
      console.error("Get swipe quota error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/swipe", async (req, res) => {
    try {
      const { fromUserId, toUserId, fromListingId, toListingId, liked } = req.body;
      const user = await storage.getUser(fromUserId);
      if (user) {
        const isPremiumActive2 = user.isPremium && user.premiumExpiresAt && new Date(user.premiumExpiresAt) > /* @__PURE__ */ new Date();
        if (!isPremiumActive2) {
          const dailySwipes = await storage.getDailySwipeCount(fromUserId);
          if (dailySwipes >= DAILY_SWIPE_LIMIT) {
            return res.status(429).json({
              error: "G\xFCnl\xFCk kayd\u0131rma limitinize ula\u015Ft\u0131n\u0131z",
              message: `G\xFCnl\xFCk ${DAILY_SWIPE_LIMIT} kayd\u0131rma hakk\u0131n\u0131z doldu. Premium \xFCyelikle s\u0131n\u0131rs\u0131z kayd\u0131rma yapabilirsiniz.`,
              remainingToday: 0
            });
          }
        }
      }
      const like = await storage.createLike(fromUserId, toUserId, fromListingId, toListingId, liked);
      let match = null;
      if (liked) {
        const isMutual = await storage.checkMutualLike(fromUserId, toUserId, fromListingId, toListingId);
        if (isMutual) {
          match = await storage.createMatch(fromUserId, toUserId, fromListingId, toListingId);
          if (match) {
            sendPushToUsers(
              [fromUserId, toUserId],
              "E\u015Fle\u015Fme!",
              "Birbirinizi be\u011Fendiniz! \u015Eimdi mesajla\u015Fabilirsiniz.",
              { type: "match", matchId: match.id }
            );
          }
        }
      }
      const remainingSwipes = user ? await storage.getDailySwipeCount(fromUserId) : 0;
      const isPremiumActive = user?.isPremium && user?.premiumExpiresAt && new Date(user.premiumExpiresAt) > /* @__PURE__ */ new Date();
      res.json({
        like,
        match,
        isMatch: !!match,
        remainingToday: isPremiumActive ? -1 : Math.max(0, DAILY_SWIPE_LIMIT - remainingSwipes)
      });
    } catch (error) {
      console.error("Swipe error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/matches/:userId", async (req, res) => {
    try {
      const matches2 = await storage.getMatchesByUser(req.params.userId);
      const matchesWithMessageCount = await Promise.all(
        matches2.map(async (match) => {
          const messages2 = await storage.getMessagesByMatch(match.id);
          return {
            ...match,
            messageCount: messages2.length,
            lastMessage: messages2.length > 0 ? messages2[messages2.length - 1] : null
          };
        })
      );
      res.json(matchesWithMessageCount);
    } catch (error) {
      console.error("Get matches error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/match/:id", async (req, res) => {
    try {
      const match = await storage.getMatch(req.params.id);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      res.json(match);
    } catch (error) {
      console.error("Get match error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/conversations/start", async (req, res) => {
    try {
      const { fromUserId, toUserId, listingId } = req.body;
      const existingMatches = await storage.getMatchesByUser(fromUserId);
      const existingMatch = existingMatches.find(
        (m) => m.user1Id === toUserId || m.user2Id === toUserId
      );
      if (existingMatch) {
        return res.json({ match: existingMatch, isNew: false });
      }
      const match = await storage.createMatch(fromUserId, toUserId, listingId, listingId);
      res.status(201).json({ match, isNew: true });
    } catch (error) {
      console.error("Start conversation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/messages/:matchId", async (req, res) => {
    try {
      const messages2 = await storage.getMessagesByMatch(req.params.matchId);
      res.json(messages2);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/messages", async (req, res) => {
    try {
      const message = await storage.createMessage(req.body);
      res.status(201).json(message);
      const match = await storage.getMatch(message.matchId);
      if (match && message.senderId) {
        const recipientId = match.user1Id === message.senderId ? match.user2Id : match.user1Id;
        const msgBody = message.messageType === "audio" ? "Sesli mesaj g\xF6nderdi" : message.content || "Yeni mesaj";
        sendPushToUsers([recipientId], "Yeni Mesaj", msgBody, { type: "message", matchId: match.id });
      }
    } catch (error) {
      console.error("Create message error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/messages/:matchId/read", async (req, res) => {
    try {
      const { userId } = req.body;
      await storage.markMessagesAsRead(req.params.matchId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Mark messages read error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/verification/:userId", async (req, res) => {
    try {
      const documents = await storage.getVerificationDocumentsByUser(req.params.userId);
      res.json(documents);
    } catch (error) {
      console.error("Get verification documents error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/verification", async (req, res) => {
    try {
      const { userId, documentType, documentUrl } = req.body;
      if (!userId || !documentType || !documentUrl) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const document = await storage.createVerificationDocument({
        userId,
        documentType,
        documentUrl
      });
      res.status(201).json(document);
    } catch (error) {
      console.error("Create verification document error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/verification/:id", async (req, res) => {
    try {
      const document = await storage.updateVerificationDocument(req.params.id, req.body);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Update verification document error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/favorites/:userId", async (req, res) => {
    try {
      const favoritesWithListings = await storage.getFavoritesWithListings(req.params.userId);
      res.json(favoritesWithListings);
    } catch (error) {
      console.error("Get favorites error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/favorites", async (req, res) => {
    try {
      const { userId, listingId } = req.body;
      const alreadyFavorite = await storage.isFavorite(userId, listingId);
      if (alreadyFavorite) {
        return res.status(200).json({ message: "Already in favorites" });
      }
      const favorite = await storage.addFavorite(userId, listingId);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Add favorite error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/favorites/:userId/:listingId", async (req, res) => {
    try {
      const { userId, listingId } = req.params;
      await storage.removeFavorite(userId, listingId);
      res.status(204).send();
    } catch (error) {
      console.error("Remove favorite error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/favorites/:userId/:listingId/check", async (req, res) => {
    try {
      const { userId, listingId } = req.params;
      const isFavorite = await storage.isFavorite(userId, listingId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Check favorite error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/notifications/:userId", async (req, res) => {
    try {
      const notifications2 = await storage.getNotificationsByUser(req.params.userId);
      res.json(notifications2);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/notifications/:userId/count", async (req, res) => {
    try {
      const count = await storage.getUnreadNotificationCount(req.params.userId);
      res.json({ count });
    } catch (error) {
      console.error("Get notification count error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/notifications", async (req, res) => {
    try {
      const notification = await storage.createNotification(req.body);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Create notification error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/notifications/:notificationId/read", async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.notificationId);
      res.status(204).send();
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/notifications/:userId/read-all", async (req, res) => {
    try {
      await storage.markAllNotificationsAsRead(req.params.userId);
      res.status(204).send();
    } catch (error) {
      console.error("Mark all notifications read error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/reviews/user/:userId", async (req, res) => {
    try {
      const reviews2 = await storage.getReviewsForUser(req.params.userId);
      res.json(reviews2);
    } catch (error) {
      console.error("Get reviews error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/reviews/user/:userId/rating", async (req, res) => {
    try {
      const rating = await storage.getUserAverageRating(req.params.userId);
      res.json(rating);
    } catch (error) {
      console.error("Get user rating error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/reviews/match/:matchId/check/:reviewerId", async (req, res) => {
    try {
      const { matchId, reviewerId } = req.params;
      const review = await storage.getReviewForMatch(matchId, reviewerId);
      res.json({ hasReviewed: !!review, review });
    } catch (error) {
      console.error("Check review error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/reviews", async (req, res) => {
    try {
      const { reviewerId, reviewedUserId, matchId, rating, comment } = req.body;
      if (!reviewerId || !reviewedUserId || !matchId || rating === void 0) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }
      const existingReview = await storage.getReviewForMatch(matchId, reviewerId);
      if (existingReview) {
        return res.status(400).json({ error: "You have already reviewed this swap" });
      }
      const review = await storage.createReview({
        reviewerId,
        reviewedUserId,
        matchId,
        rating,
        comment: comment || null
      });
      res.status(201).json(review);
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/price-alerts/:userId", async (req, res) => {
    try {
      const alerts = await storage.getPriceAlertsByUser(req.params.userId);
      res.json(alerts);
    } catch (error) {
      console.error("Get price alerts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/price-alerts/:userId/:listingId/check", async (req, res) => {
    try {
      const { userId, listingId } = req.params;
      const alert = await storage.getPriceAlertForListing(userId, listingId);
      res.json({ hasAlert: !!alert, alert });
    } catch (error) {
      console.error("Check price alert error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/price-alerts", async (req, res) => {
    try {
      const { userId, listingId, targetPrice, originalPrice } = req.body;
      if (!userId || !listingId || !targetPrice || !originalPrice) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const existingAlert = await storage.getPriceAlertForListing(userId, listingId);
      if (existingAlert) {
        return res.status(400).json({ error: "Alert already exists for this listing" });
      }
      const alert = await storage.createPriceAlert({
        userId,
        listingId,
        targetPrice,
        originalPrice,
        isActive: true
      });
      res.status(201).json(alert);
    } catch (error) {
      console.error("Create price alert error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/price-alerts/:id", async (req, res) => {
    try {
      await storage.deletePriceAlert(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete price alert error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/stories", async (req, res) => {
    try {
      const activeStories = await storage.getActiveStories();
      res.json(activeStories);
    } catch (error) {
      console.error("Get stories error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/stories/:id/view", async (req, res) => {
    try {
      await storage.incrementStoryViewCount(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Increment story view error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/user/stories", async (req, res) => {
    try {
      const { userId, listingId, title, imageUrl } = req.body;
      if (!userId || !listingId || !title || !imageUrl) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (user.userType !== "bireysel") {
        return res.status(403).json({ error: "Bu \xF6zellik sadece bireysel \xFCyeler i\xE7indir" });
      }
      if (!user.isPremium) {
        return res.status(403).json({ error: "Bu \xF6zellik premium \xFCyelere \xF6zeldir" });
      }
      if (!user.storyCredits || user.storyCredits < 1) {
        return res.status(403).json({ error: "Hikaye olu\u015Fturma hakk\u0131n\u0131z kalmad\u0131" });
      }
      const listing = await storage.getListing(listingId);
      if (!listing || listing.userId !== userId) {
        return res.status(403).json({ error: "Bu ilan size ait de\u011Fil" });
      }
      const existingStory = await storage.getStoryByListingId(listingId);
      if (existingStory) {
        return res.status(400).json({ error: "Bu ilan i\xE7in zaten bir hikaye olu\u015Fturulmu\u015F" });
      }
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      const story = await storage.createStory({
        userId,
        listingId,
        title,
        imageUrl,
        brandName: user.name || "Kullan\u0131c\u0131",
        linkUrl: `/listing/${listingId}`,
        isActive: true,
        expiresAt
      });
      await storage.updateUser(userId, {
        storyCredits: (user.storyCredits || 1) - 1
      });
      res.status(201).json(story);
    } catch (error) {
      console.error("Create user story error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/user/:userId/story-credits", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        credits: user.storyCredits || 0,
        canCreateStory: user.isPremium && user.userType === "bireysel" && (user.storyCredits || 0) > 0
      });
    } catch (error) {
      console.error("Get story credits error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send(`User-agent: *
Disallow: /panel-yonetim-x7k9m/
Disallow: /api/admin/
`);
  });
  app2.get("/admin", (req, res) => {
    res.status(404).json({ error: "Not found" });
  });
  app2.get("/panel-yonetim-x7k9m", (req, res) => {
    res.set("X-Robots-Tag", "noindex, nofollow");
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    const adminHtml = fs.readFileSync(
      path.join(process.cwd(), "server", "templates", "admin-panel.html"),
      "utf-8"
    );
    res.send(adminHtml);
  });
  app2.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      let admin = await storage.getAdminUserByEmail(email);
      if (!admin) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
          admin = await storage.createAdminUser({
            email: adminEmail,
            password: hashPassword(adminPassword),
            name: "Admin",
            role: "admin"
          });
        } else {
          return res.status(401).json({ error: "Ge\xE7ersiz e-posta veya \u015Fifre" });
        }
      } else {
        if (admin.password !== hashPassword(password)) {
          return res.status(401).json({ error: "Ge\xE7ersiz e-posta veya \u015Fifre" });
        }
      }
      const token = generateToken(admin.email);
      res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/verify", adminAuth, (req, res) => {
    res.json({ valid: true, email: req.adminEmail });
  });
  app2.get("/api/admin/stats", adminAuth, async (req, res) => {
    try {
      const [allUsers, allListings, allMatches, allStories] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllListings(),
        storage.getAllMatches(),
        storage.getActiveStories()
      ]);
      const now = /* @__PURE__ */ new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1e3);
      const pendingListings = allListings.filter((l) => l.status === "pending");
      const activeListings = allListings.filter((l) => l.status === "active");
      const todayUsers = allUsers.filter((u) => u.createdAt && new Date(u.createdAt) >= todayStart);
      const todayListings = allListings.filter((l) => l.createdAt && new Date(l.createdAt) >= todayStart);
      const weekUsers = allUsers.filter((u) => u.createdAt && new Date(u.createdAt) >= weekAgo);
      const weekListings = allListings.filter((l) => l.createdAt && new Date(l.createdAt) >= weekAgo);
      const corporateUsers = allUsers.filter((u) => u.userType === "corporate");
      const premiumUsers = allUsers.filter((u) => u.userType === "premium");
      res.json({
        users: allUsers.length,
        listings: allListings.length,
        matches: allMatches.length,
        stories: allStories.length,
        pendingListings: pendingListings.length,
        activeListings: activeListings.length,
        todayUsers: todayUsers.length,
        todayListings: todayListings.length,
        weekUsers: weekUsers.length,
        weekListings: weekListings.length,
        corporateUsers: corporateUsers.length,
        premiumUsers: premiumUsers.length
      });
    } catch (error) {
      console.error("Admin stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/analytics", adminAuth, async (req, res) => {
    try {
      const [allUsers, allListings, allMatches] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllListings(),
        storage.getAllMatches()
      ]);
      const now = /* @__PURE__ */ new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dailyData = [];
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1e3);
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1e3);
        const dayUsers = allUsers.filter((u) => {
          const created = u.createdAt ? new Date(u.createdAt) : null;
          return created && created >= dayStart && created < dayEnd;
        }).length;
        const dayListings = allListings.filter((l) => {
          const created = l.createdAt ? new Date(l.createdAt) : null;
          return created && created >= dayStart && created < dayEnd;
        }).length;
        dailyData.push({
          day: ["Paz", "Pzt", "Sal", "Car", "Per", "Cum", "Cmt"][dayStart.getDay()],
          users: dayUsers,
          listings: dayListings
        });
      }
      const brandCounts = {};
      allListings.forEach((l) => {
        if (l.brand) {
          brandCounts[l.brand] = (brandCounts[l.brand] || 0) + 1;
        }
      });
      const topBrands = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([brand, count]) => ({ brand, count }));
      const cityCounts = {};
      allListings.forEach((l) => {
        if (l.city) {
          cityCounts[l.city] = (cityCounts[l.city] || 0) + 1;
        }
      });
      const topCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([city, count]) => ({ city, count }));
      const matchRate = allListings.length > 0 ? (allMatches.length / allListings.length * 100).toFixed(1) : "0";
      const monthAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1e3);
      const twoMonthsAgo = new Date(todayStart.getTime() - 60 * 24 * 60 * 60 * 1e3);
      const thisMonthUsers = allUsers.filter((u) => u.createdAt && new Date(u.createdAt) >= monthAgo).length;
      const lastMonthUsers = allUsers.filter((u) => {
        const created = u.createdAt ? new Date(u.createdAt) : null;
        return created && created >= twoMonthsAgo && created < monthAgo;
      }).length;
      const thisMonthListings = allListings.filter((l) => l.createdAt && new Date(l.createdAt) >= monthAgo).length;
      const lastMonthListings = allListings.filter((l) => {
        const created = l.createdAt ? new Date(l.createdAt) : null;
        return created && created >= twoMonthsAgo && created < monthAgo;
      }).length;
      const userGrowth = lastMonthUsers > 0 ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1) : thisMonthUsers > 0 ? "100" : "0";
      const listingGrowth = lastMonthListings > 0 ? ((thisMonthListings - lastMonthListings) / lastMonthListings * 100).toFixed(1) : thisMonthListings > 0 ? "100" : "0";
      res.json({
        dailyData,
        topBrands,
        topCities,
        matchRate,
        thisMonthUsers,
        thisMonthListings,
        userGrowth,
        listingGrowth,
        totalUsers: allUsers.length,
        totalListings: allListings.length,
        totalMatches: allMatches.length
      });
    } catch (error) {
      console.error("Admin analytics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/users", adminAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const allUsers = await storage.getAllUsers();
      const allListings = await storage.getAllListings();
      const usersWithCounts = allUsers.map((user) => {
        const listingCount = allListings.filter((l) => l.userId === user.id).length;
        return { ...user, listingCount };
      });
      res.json(usersWithCounts.slice(0, limit));
    } catch (error) {
      console.error("Admin users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/users", adminAuth, async (req, res) => {
    try {
      const { name, phone, city, userType } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ error: "Ad ve telefon zorunludur" });
      }
      const newUser = await storage.createUser({
        phone,
        name,
        city: city || null
      });
      if (userType && userType !== "individual") {
        await storage.updateUser(newUser.id, { userType });
      }
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Admin create user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/admin/users/:id/verify", adminAuth, async (req, res) => {
    try {
      const { isVerified } = req.body;
      const updatedUser = await storage.updateUser(req.params.id, { phoneVerified: isVerified });
      res.json(updatedUser);
    } catch (error) {
      console.error("Admin verify user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/admin/users/:id", adminAuth, async (req, res) => {
    try {
      res.status(204).send();
    } catch (error) {
      console.error("Admin delete user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/listings", adminAuth, async (req, res) => {
    try {
      const allListings = await storage.getAllListings();
      const allUsers = await storage.getAllUsers();
      const userMap = new Map(allUsers.map((u) => [u.id, u.name || u.phone]));
      const listingsWithOwner = allListings.map((l) => ({
        ...l,
        ownerName: userMap.get(l.userId) || "Bilinmiyor"
      }));
      const pending = listingsWithOwner.filter((l) => l.status === "pending" || !l.status);
      const active = listingsWithOwner.filter((l) => l.status === "active");
      const expired = listingsWithOwner.filter((l) => l.status === "expired" || l.status === "inactive" || l.status === "rejected");
      res.json({ pending, active, expired });
    } catch (error) {
      console.error("Admin listings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/admin/listings/:id/deactivate", adminAuth, async (req, res) => {
    try {
      const listing = await storage.updateListing(req.params.id, { status: "inactive" });
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      console.error("Admin deactivate listing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/admin/listings/:id/reactivate", adminAuth, async (req, res) => {
    try {
      const listing = await storage.updateListing(req.params.id, { status: "active" });
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      console.error("Admin reactivate listing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/listings/pending", adminAuth, async (req, res) => {
    try {
      const allListings = await storage.getAllListings();
      const pendingListings = allListings.filter((l) => l.status === "pending");
      res.json(pendingListings);
    } catch (error) {
      console.error("Admin pending listings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/admin/listings/:id/approve", adminAuth, async (req, res) => {
    try {
      const listing = await storage.updateListing(req.params.id, { status: "active" });
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      const user = await storage.getUser(listing.userId);
      if (user && user.userType === "bireysel" && user.isPremium) {
        await storage.updateUser(user.id, {
          storyCredits: (user.storyCredits || 0) + 1
        });
      }
      res.json(listing);
    } catch (error) {
      console.error("Admin approve listing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/admin/listings/:id/reject", adminAuth, async (req, res) => {
    try {
      const { reason } = req.body;
      const listing = await storage.updateListing(req.params.id, { status: "rejected" });
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      console.error("Admin reject listing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/admin/listings/:id/featured", adminAuth, async (req, res) => {
    try {
      const { isFeatured } = req.body;
      const listing = await storage.updateListing(req.params.id, { isFeatured });
      res.json(listing);
    } catch (error) {
      console.error("Admin toggle featured error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/matches", adminAuth, async (req, res) => {
    try {
      const allMatches = await storage.getAllMatches();
      const allUsers = await storage.getAllUsers();
      const allListings = await storage.getAllListings();
      const userMap = new Map(allUsers.map((u) => [u.id, u.name || u.phone]));
      const listingMap = new Map(allListings.map((l) => [l.id, l]));
      const matchesWithDetails = allMatches.map((m) => ({
        ...m,
        status: "active",
        user1Name: userMap.get(m.user1Id) || "Bilinmiyor",
        user2Name: userMap.get(m.user2Id) || "Bilinmiyor",
        listing1: listingMap.get(m.listing1Id) || null,
        listing2: listingMap.get(m.listing2Id) || null
      }));
      const active = matchesWithDetails.filter((m) => m.status === "active");
      const completed = matchesWithDetails.filter((m) => m.status === "completed");
      res.json({ all: matchesWithDetails, active, completed });
    } catch (error) {
      console.error("Admin matches error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/stories", adminAuth, async (req, res) => {
    try {
      const allStories = await storage.getStories();
      res.json(allStories);
    } catch (error) {
      console.error("Admin stories error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/upload", adminAuth, async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }
      const matches2 = image.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
      if (!matches2) {
        return res.status(400).json({ error: "Invalid image format" });
      }
      const ext = matches2[1] === "jpeg" ? "jpg" : matches2[1];
      const data = matches2[2];
      const buffer = Buffer.from(data, "base64");
      const filename = `story_${crypto.randomUUID()}.${ext}`;
      const uploadDir = path.join(process.cwd(), "server", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
      const url = `/uploads/${filename}`;
      res.json({ url });
    } catch (error) {
      console.error("Admin upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });
  app2.post("/api/admin/stories", adminAuth, async (req, res) => {
    try {
      const { brandName, title, imageUrl, linkUrl, expiresAt } = req.body;
      const story = await storage.createStory({
        brandName,
        title,
        imageUrl,
        linkUrl,
        expiresAt: new Date(expiresAt),
        isActive: true
      });
      res.status(201).json(story);
    } catch (error) {
      console.error("Admin create story error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.patch("/api/admin/stories/:id", adminAuth, async (req, res) => {
    try {
      const { brandName, title, imageUrl, linkUrl, expiresAt, isActive } = req.body;
      const updateData = {};
      if (brandName !== void 0) updateData.brandName = brandName;
      if (title !== void 0) updateData.title = title;
      if (imageUrl !== void 0) updateData.imageUrl = imageUrl;
      if (linkUrl !== void 0) updateData.linkUrl = linkUrl;
      if (expiresAt !== void 0) updateData.expiresAt = new Date(expiresAt);
      if (isActive !== void 0) updateData.isActive = isActive;
      const story = await storage.updateStory(req.params.id, updateData);
      res.json(story);
    } catch (error) {
      console.error("Admin update story error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/admin/stories/:id", adminAuth, async (req, res) => {
    try {
      await storage.deleteStory(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Admin delete story error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/admin/demo-data", adminAuth, async (req, res) => {
    try {
      const result = await storage.deleteDemoData();
      res.json(result);
    } catch (error) {
      console.error("Admin delete demo data error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/messages/stats", adminAuth, async (req, res) => {
    try {
      const stats = await storage.getMessageStats();
      res.json(stats);
    } catch (error) {
      console.error("Admin message stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/messages/recent", adminAuth, async (req, res) => {
    try {
      const recentMessages = await storage.getRecentMessagesByMatch();
      res.json(recentMessages);
    } catch (error) {
      console.error("Admin recent messages error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/applications", async (req, res) => {
    try {
      const application = await storage.createApplication(req.body);
      res.status(201).json(application);
    } catch (error) {
      console.error("Create application error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/applications/user/:userId", async (req, res) => {
    try {
      const applications2 = await storage.getApplicationsByUser(req.params.userId);
      res.json(applications2);
    } catch (error) {
      console.error("Get user applications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/applications/pending/:type", adminAuth, async (req, res) => {
    try {
      const applications2 = await storage.getPendingApplications(req.params.type);
      res.json(applications2);
    } catch (error) {
      console.error("Get pending applications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/applications/pending/:type", adminAuth, async (req, res) => {
    try {
      const applications2 = await storage.getPendingApplications(req.params.type);
      res.json(applications2);
    } catch (error) {
      console.error("Get pending applications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/applications/:id/approve", adminAuth, async (req, res) => {
    try {
      const application = await storage.approveApplication(req.params.id, req.adminEmail);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Approve application error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/applications/:id/approve", adminAuth, async (req, res) => {
    try {
      const application = await storage.approveApplication(req.params.id, req.adminEmail);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Approve application error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/applications/:id/reject", adminAuth, async (req, res) => {
    try {
      const { reason } = req.body;
      const application = await storage.rejectApplication(req.params.id, reason, req.adminEmail);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Reject application error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/applications/:id/reject", adminAuth, async (req, res) => {
    try {
      const { reason } = req.body;
      const application = await storage.rejectApplication(req.params.id, reason, req.adminEmail);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Reject application error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/settings", adminAuth, async (req, res) => {
    try {
      const settings = await storage.getAppSettings();
      res.json(settings);
    } catch (error) {
      console.error("Get settings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/admin/settings", adminAuth, async (req, res) => {
    try {
      const settings = req.body;
      await storage.saveAppSettings(settings);
      res.json({ success: true });
    } catch (error) {
      console.error("Save settings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/push-token", async (req, res) => {
    try {
      const { userId, token, platform } = req.body;
      if (!userId || !token) {
        return res.status(400).json({ error: "userId and token are required" });
      }
      const saved = await storage.savePushToken(userId, token, platform || "unknown");
      res.json(saved);
    } catch (error) {
      console.error("Save push token error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/push-token", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: "token is required" });
      }
      await storage.removePushToken(token);
      res.status(204).send();
    } catch (error) {
      console.error("Remove push token error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/admin/push-notification", adminAuth, async (req, res) => {
    try {
      const { title, message, targetType, targetFilter } = req.body;
      if (!title || !message) {
        return res.status(400).json({ error: "title and message are required" });
      }
      let tokens = [];
      if (targetType === "all") {
        tokens = await storage.getAllPushTokens();
      } else if (targetType === "premium") {
        const allUsers = await storage.getAllUsers();
        const premiumUserIds = allUsers.filter((u) => u.isPremium).map((u) => u.id);
        tokens = await storage.getPushTokensByUserIds(premiumUserIds);
      } else if (targetType === "individual") {
        const allUsers = await storage.getAllUsers();
        const individualUserIds = allUsers.filter((u) => u.userType === "bireysel").map((u) => u.id);
        tokens = await storage.getPushTokensByUserIds(individualUserIds);
      } else if (targetType === "corporate") {
        const allUsers = await storage.getAllUsers();
        const corporateUserIds = allUsers.filter((u) => u.userType === "kurumsal").map((u) => u.id);
        tokens = await storage.getPushTokensByUserIds(corporateUserIds);
      }
      const pushTokenStrings = tokens.map((t) => t.token).filter((t) => t.startsWith("ExponentPushToken") || t.startsWith("ExpoPushToken"));
      let sentCount = 0;
      let failedCount = 0;
      if (pushTokenStrings.length > 0) {
        const chunks = [];
        for (let i = 0; i < pushTokenStrings.length; i += 100) {
          chunks.push(pushTokenStrings.slice(i, i + 100));
        }
        for (const chunk of chunks) {
          const messages2 = chunk.map((token) => ({
            to: token,
            sound: "default",
            title,
            body: message,
            data: { type: "admin_broadcast" }
          }));
          try {
            const response = await fetch("https://exp.host/--/api/v2/push/send", {
              method: "POST",
              headers: {
                "Accept": "application/json",
                "Accept-Encoding": "gzip, deflate",
                "Content-Type": "application/json"
              },
              body: JSON.stringify(messages2)
            });
            const result = await response.json();
            if (result.data) {
              for (const ticket of result.data) {
                if (ticket.status === "ok") {
                  sentCount++;
                } else {
                  failedCount++;
                }
              }
            }
          } catch (err) {
            console.error("Expo push send error:", err);
            failedCount += chunk.length;
          }
        }
      }
      const adminEmail = req.adminEmail || "unknown";
      const log2 = await storage.createPushNotificationLog({
        title,
        message,
        targetType: targetType || "all",
        targetFilter,
        sentCount,
        failedCount,
        sentBy: adminEmail
      });
      res.json({
        success: true,
        sentCount,
        failedCount,
        totalTokens: pushTokenStrings.length,
        log: log2
      });
    } catch (error) {
      console.error("Send push notification error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/push-notification/logs", adminAuth, async (req, res) => {
    try {
      const logs = await storage.getPushNotificationLogs();
      res.json(logs);
    } catch (error) {
      console.error("Get push notification logs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/admin/push-notification/stats", adminAuth, async (req, res) => {
    try {
      const tokens = await storage.getAllPushTokens();
      const allUsers = await storage.getAllUsers();
      const premiumCount = allUsers.filter((u) => u.isPremium).length;
      const individualCount = allUsers.filter((u) => u.userType === "bireysel").length;
      const corporateCount = allUsers.filter((u) => u.userType === "kurumsal").length;
      res.json({
        totalTokens: tokens.length,
        totalUsers: allUsers.length,
        premiumUsers: premiumCount,
        individualUsers: individualCount,
        corporateUsers: corporateCount
      });
    } catch (error) {
      console.error("Get push stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/video-call", (req, res) => {
    const videoCallPath = path.join(__dirname, "templates", "video-call.html");
    res.sendFile(videoCallPath);
  });
  const httpServer = createServer(app2);
  const videoRooms = /* @__PURE__ */ new Map();
  const wss = new WebSocketServer({ server: httpServer, path: "/ws/video-call" });
  wss.on("connection", (ws) => {
    let currentRoom = null;
    let currentUserId = null;
    let currentUserName = null;
    ws.on("message", (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        switch (data.type) {
          case "join": {
            const { roomId, userId, userName } = data;
            currentRoom = roomId;
            currentUserId = userId;
            currentUserName = userName;
            if (!videoRooms.has(roomId)) {
              videoRooms.set(roomId, /* @__PURE__ */ new Set());
            }
            const room = videoRooms.get(roomId);
            if (room.size >= 2) {
              ws.send(JSON.stringify({ type: "room-full" }));
              return;
            }
            room.add({ ws, userId, userName });
            room.forEach((peer) => {
              if (peer.ws !== ws && peer.ws.readyState === WebSocket.OPEN) {
                peer.ws.send(JSON.stringify({ type: "user-joined", userId, userName }));
              }
            });
            break;
          }
          case "offer":
          case "answer":
          case "ice-candidate": {
            const room = videoRooms.get(data.roomId);
            if (room) {
              room.forEach((peer) => {
                if (peer.ws !== ws && peer.ws.readyState === WebSocket.OPEN) {
                  peer.ws.send(JSON.stringify(data));
                }
              });
            }
            break;
          }
          case "leave": {
            if (currentRoom && videoRooms.has(currentRoom)) {
              const room = videoRooms.get(currentRoom);
              room.forEach((peer) => {
                if (peer.ws === ws) {
                  room.delete(peer);
                } else if (peer.ws.readyState === WebSocket.OPEN) {
                  peer.ws.send(JSON.stringify({ type: "user-left", userId: currentUserId }));
                }
              });
              if (room.size === 0) videoRooms.delete(currentRoom);
            }
            break;
          }
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    });
    ws.on("close", () => {
      if (currentRoom && videoRooms.has(currentRoom)) {
        const room = videoRooms.get(currentRoom);
        room.forEach((peer) => {
          if (peer.ws === ws) {
            room.delete(peer);
          } else if (peer.ws.readyState === WebSocket.OPEN) {
            peer.ws.send(JSON.stringify({ type: "user-left", userId: currentUserId }));
          }
        });
        if (room.size === 0) videoRooms.delete(currentRoom);
      }
    });
  });
  const cleanupExpiredStories = async () => {
    try {
      const deleted = await storage.deleteExpiredStories();
      if (deleted > 0) {
        console.log(`Cleaned up ${deleted} expired stories`);
      }
    } catch (error) {
      console.error("Error cleaning up expired stories:", error);
    }
  };
  cleanupExpiredStories();
  setInterval(cleanupExpiredStories, 60 * 60 * 1e3);
  (async () => {
    try {
      const uncoded = await db.select().from(listings).where(sql3`listing_code IS NULL`);
      for (const listing of uncoded) {
        let code = generateListingCode();
        let exists = true;
        let attempts = 0;
        while (exists && attempts < 10) {
          const dup = await db.select().from(listings).where(eq2(listings.listingCode, code)).limit(1);
          if (dup.length === 0) exists = false;
          else {
            code = generateListingCode();
            attempts++;
          }
        }
        await db.update(listings).set({ listingCode: code }).where(eq2(listings.id, listing.id));
      }
      if (uncoded.length > 0) console.log(`Assigned listing codes to ${uncoded.length} existing listings`);
    } catch (e) {
      console.error("Listing code backfill error:", e);
    }
  })();
  return httpServer;
}

// server/seed.ts
import { sql as sql4 } from "drizzle-orm";
var demoUsers = [
  { id: "demo-user-001", phone: "+905301110001", name: "Ahmet Y\u0131lmaz", city: "\u0130stanbul", trustScore: 92, userType: "bireysel" },
  { id: "demo-user-002", phone: "+905301110002", name: "Mehmet Kaya", city: "Ankara", trustScore: 88, userType: "bireysel" },
  { id: "demo-user-003", phone: "+905301110003", name: "Emre Demir", city: "\u0130zmir", trustScore: 95, userType: "bireysel" },
  { id: "demo-user-004", phone: "+905301110004", name: "Burak \xC7elik", city: "Bursa", trustScore: 80, userType: "bireysel" },
  { id: "demo-user-005", phone: "+905301110005", name: "Can \xD6zt\xFCrk", city: "Antalya", trustScore: 85, userType: "bireysel" },
  { id: "demo-user-006", phone: "+905301110006", name: "Serkan Ayd\u0131n", city: "\u0130stanbul", trustScore: 90, userType: "kurumsal" },
  { id: "demo-user-007", phone: "+905301110007", name: "O\u011Fuz \u015Eahin", city: "Konya", trustScore: 78, userType: "bireysel" },
  { id: "demo-user-008", phone: "+905301110008", name: "Tolga Arslan", city: "Adana", trustScore: 82, userType: "bireysel" }
];
var DEMO_NOTE = "\n\n--- Bu ilan demo amaclidir. Gercek bir ilan degildir. ---";
var brandPhotos = {
  "BMW": [
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=800&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&h=600&fit=crop&auto=format"
  ],
  "Mercedes-Benz": [
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop&auto=format"
  ],
  "Audi": [
    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop&auto=format"
  ],
  "Volkswagen": [
    "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?w=800&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&h=600&fit=crop&auto=format"
  ],
  "Toyota": [
    "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop&auto=format"
  ],
  "Honda": [
    "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=600&fit=crop&auto=format"
  ],
  "Volvo": [
    "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop&auto=format"
  ],
  "Ford": [
    "https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop&auto=format"
  ],
  "Hyundai": [
    "https://images.unsplash.com/photo-1629897048514-3dd7414fe72a?w=800&h=600&fit=crop&auto=format"
  ],
  "Mazda": [
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop&auto=format"
  ],
  "Renault": [
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=600&fit=crop&auto=format"
  ],
  "Peugeot": [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&auto=format"
  ],
  "Fiat": [
    "https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=800&h=600&fit=crop&auto=format"
  ],
  "Kia": [
    "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&h=600&fit=crop&auto=format"
  ],
  "Skoda": [
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop&auto=format"
  ],
  "Nissan": [
    "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800&h=600&fit=crop&auto=format"
  ],
  "Seat": [
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop&auto=format"
  ],
  "Citroen": [
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&h=600&fit=crop&auto=format"
  ],
  "Opel": [
    "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&h=600&fit=crop&auto=format"
  ],
  "Subaru": [
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop&auto=format"
  ],
  "Dacia": [
    "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=600&fit=crop&auto=format"
  ],
  "Cupra": [
    "https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&h=600&fit=crop&auto=format"
  ],
  "Jeep": [
    "https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=800&h=600&fit=crop&auto=format"
  ]
};
function getBrandPhoto(brand, index) {
  const photos = brandPhotos[brand] || brandPhotos["BMW"];
  return photos[index % photos.length];
}
var demoListings = [
  { id: "demo-listing-001", userId: "demo-user-001", brand: "BMW", model: "320i M Sport", year: 2021, km: 42e3, fuelType: "Benzin", transmission: "Otomatik", city: "\u0130stanbul", district: "Kad\u0131k\xF6y", estimatedValue: 215e4, description: "Temiz kullan\u0131lm\u0131\u015F, kazas\u0131z, boyas\u0131z ara\xE7. M Sport paket, Harman Kardon ses sistemi, panoramik cam tavan mevcut. T\xFCm bak\u0131mlar\u0131 yetkili serviste yap\u0131lm\u0131\u015Ft\u0131r. K\u0131\u015F ve yaz lastik tak\u0131m\u0131 mevcuttur." + DEMO_NOTE, photos: [getBrandPhoto("BMW", 0)], preferredBrands: ["Mercedes", "Audi"], swapActive: true, isFeatured: true, status: "active", viewCount: 234, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-002", userId: "demo-user-002", brand: "Mercedes-Benz", model: "C200 AMG", year: 2020, km: 58e3, fuelType: "Benzin", transmission: "Otomatik", city: "Ankara", district: "\xC7ankaya", estimatedValue: 235e4, description: "AMG paket, gece paketi, Burmester ses sistemi. T\xFCm bak\u0131mlar\u0131 yetkili serviste yap\u0131lm\u0131\u015Ft\u0131r. Ara\xE7 garaj arac\u0131d\u0131r, sigara i\xE7ilmemi\u015Ftir." + DEMO_NOTE, photos: [getBrandPhoto("Mercedes-Benz", 0)], preferredBrands: ["BMW", "Audi", "Volvo"], swapActive: true, isFeatured: true, status: "active", viewCount: 312, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-003", userId: "demo-user-003", brand: "Audi", model: "A4 45 TFSI Quattro", year: 2022, km: 18e3, fuelType: "Benzin", transmission: "Otomatik", city: "\u0130zmir", district: "Kar\u015F\u0131yaka", estimatedValue: 28e5, description: "Quattro 4x4, Virtual Cockpit, Matrix LED farlar. Garantisi devam etmektedir. Ara\xE7 kusursuz durumda olup ilk sahibinden sat\u0131l\u0131kt\u0131r." + DEMO_NOTE, photos: [getBrandPhoto("Audi", 0)], preferredBrands: ["BMW", "Mercedes"], swapActive: true, isFeatured: true, status: "active", viewCount: 198, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-004", userId: "demo-user-004", brand: "Volkswagen", model: "Golf 8 R-Line", year: 2021, km: 35e3, fuelType: "Benzin", transmission: "Otomatik", city: "Bursa", district: "Nil\xFCfer", estimatedValue: 165e4, description: "R-Line paket, dijital kokpit, LED farlar, 18 in\xE7 jantlar. Ara\xE7 hatas\u0131z olup t\xFCm bak\u0131mlar\u0131 d\xFCzenli yap\u0131lm\u0131\u015Ft\u0131r." + DEMO_NOTE, photos: [getBrandPhoto("Volkswagen", 0)], preferredBrands: ["BMW", "Audi", "Ford"], swapActive: true, isFeatured: true, status: "active", viewCount: 267, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-005", userId: "demo-user-005", brand: "Toyota", model: "Corolla 1.8 Hybrid", year: 2023, km: 12e3, fuelType: "Hibrit", transmission: "Otomatik", city: "Antalya", district: "Muratpa\u015Fa", estimatedValue: 148e4, description: "S\u0131f\u0131r ayar\u0131nda hibrit ara\xE7. 4.2L/100km yak\u0131t t\xFCketimi. Toyota Safety Sense g\xFCvenlik paketi, adaptif cruise control mevcut." + DEMO_NOTE, photos: [getBrandPhoto("Toyota", 0)], preferredBrands: ["Honda", "Mazda", "Hyundai"], swapActive: true, isFeatured: false, status: "active", viewCount: 156, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-006", userId: "demo-user-006", brand: "Volvo", model: "XC60 T5 Inscription", year: 2020, km: 65e3, fuelType: "Benzin", transmission: "Otomatik", city: "\u0130stanbul", district: "Sar\u0131yer", estimatedValue: 29e5, description: "Inscription paket, Pilot Assist, Bowers & Wilkins ses sistemi, 360 derece kamera. \u0130skandinav g\xFCvenli\u011Fi ve l\xFCks\xFC bir arada." + DEMO_NOTE, photos: [getBrandPhoto("Volvo", 0)], preferredBrands: ["BMW", "Mercedes", "Audi"], swapActive: true, isFeatured: true, status: "active", viewCount: 189, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-007", userId: "demo-user-001", brand: "Honda", model: "Civic 1.5 VTEC RS", year: 2022, km: 2e4, fuelType: "Benzin", transmission: "Otomatik", city: "\u0130stanbul", district: "Be\u015Fikta\u015F", estimatedValue: 175e4, description: "RS paket, 1.5 VTEC Turbo 182 HP, Honda Sensing g\xFCvenlik paketi, sportif ve g\xFCvenilir. \u0130lk sahibinden." + DEMO_NOTE, photos: [getBrandPhoto("Honda", 0)], preferredBrands: ["Toyota", "Mazda"], swapActive: true, isFeatured: false, status: "active", viewCount: 178, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-008", userId: "demo-user-007", brand: "Ford", model: "Kuga 1.5 EcoBoost ST-Line", year: 2021, km: 4e4, fuelType: "Benzin", transmission: "Otomatik", city: "Konya", district: "Sel\xE7uklu", estimatedValue: 155e4, description: "ST-Line paket, panoramik cam tavan, elektrikli bagaj kapa\u011F\u0131, B&O ses sistemi. Geni\u015F i\xE7 hacim ve sportif tasar\u0131m." + DEMO_NOTE, photos: [getBrandPhoto("Ford", 0)], preferredBrands: ["Volkswagen", "Peugeot", "Hyundai"], swapActive: true, isFeatured: false, status: "active", viewCount: 134, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-009", userId: "demo-user-002", brand: "Hyundai", model: "Tucson 1.6 CRDI Elite", year: 2022, km: 25e3, fuelType: "Dizel", transmission: "Otomatik", city: "Ankara", district: "Yenimahalle", estimatedValue: 168e4, description: "Elite paket, ak\u0131ll\u0131 park asistan\u0131, \u015Ferit takip sistemi, kablosuz \u015Farj. Ekonomik dizel motor ile uzun yol konforu." + DEMO_NOTE, photos: [getBrandPhoto("Hyundai", 0)], preferredBrands: ["Kia", "Toyota", "Nissan"], swapActive: true, isFeatured: false, status: "active", viewCount: 201, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-010", userId: "demo-user-003", brand: "Mazda", model: "CX-5 2.0 SKY-G Power", year: 2021, km: 3e4, fuelType: "Benzin", transmission: "Otomatik", city: "\u0130zmir", district: "Bornova", estimatedValue: 172e4, description: "Power paket, BOSE ses sistemi, deri d\xF6\u015Feme, G-Vectoring Control. S\xFCr\xFC\u015F keyfi arayanlar i\xE7in ideal SUV." + DEMO_NOTE, photos: [getBrandPhoto("Mazda", 0)], preferredBrands: ["Toyota", "Honda", "Subaru"], swapActive: true, isFeatured: true, status: "active", viewCount: 145, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-011", userId: "demo-user-008", brand: "Renault", model: "Megane 1.3 TCe Icon", year: 2021, km: 45e3, fuelType: "Benzin", transmission: "Otomatik", city: "Adana", district: "Seyhan", estimatedValue: 98e4, description: "Icon donan\u0131m, 9.3 in\xE7 multimedya ekran\u0131, geri g\xF6r\xFC\u015F kameras\u0131, otomatik klima. Ekonomik ve konforlu sedan." + DEMO_NOTE, photos: [getBrandPhoto("Renault", 0)], preferredBrands: ["Peugeot", "Citroen", "Fiat"], swapActive: true, isFeatured: false, status: "active", viewCount: 112, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-012", userId: "demo-user-005", brand: "Peugeot", model: "3008 1.5 BlueHDi GT", year: 2020, km: 55e3, fuelType: "Dizel", transmission: "Otomatik", city: "Antalya", district: "Kepez", estimatedValue: 145e4, description: "GT paket, i-Cockpit dijital g\xF6sterge paneli, gece g\xF6r\xFC\u015F sistemi, Focal ses sistemi. Premium SUV deneyimi." + DEMO_NOTE, photos: [getBrandPhoto("Peugeot", 0)], preferredBrands: ["Renault", "Citroen", "Volkswagen"], swapActive: true, isFeatured: false, status: "active", viewCount: 167, accidentFree: false, tramerRecord: 12500 },
  { id: "demo-listing-013", userId: "demo-user-006", brand: "BMW", model: "X3 xDrive20i M Sport", year: 2022, km: 22e3, fuelType: "Benzin", transmission: "Otomatik", city: "\u0130stanbul", district: "Ata\u015Fehir", estimatedValue: 32e5, description: "M Sport paket, xDrive 4x4, head-up display, harman kardon, panoramik tavan. Premium SUV segment lideri." + DEMO_NOTE, photos: [getBrandPhoto("BMW", 1)], preferredBrands: ["Mercedes", "Audi", "Volvo"], swapActive: true, isFeatured: true, status: "active", viewCount: 289, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-014", userId: "demo-user-004", brand: "Kia", model: "Sportage 1.6 T-GDI GT-Line", year: 2023, km: 8e3, fuelType: "Benzin", transmission: "Otomatik", city: "Bursa", district: "Osmangazi", estimatedValue: 185e4, description: "GT-Line paket, panoramik \xE7ift ekran, Harman Kardon, ventilasyonlu koltuklar. Y\u0131l\u0131n otomobili \xF6d\xFCll\xFC SUV." + DEMO_NOTE, photos: [getBrandPhoto("Kia", 0)], preferredBrands: ["Hyundai", "Toyota", "Honda"], swapActive: true, isFeatured: true, status: "active", viewCount: 321, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-015", userId: "demo-user-007", brand: "Skoda", model: "Octavia 1.5 TSI Style", year: 2022, km: 28e3, fuelType: "Benzin", transmission: "Otomatik", city: "Konya", district: "Meram", estimatedValue: 132e4, description: "Style paket, canton ses sistemi, 10 in\xE7 infotainment, adaptive cruise control. S\u0131n\u0131f\u0131n\u0131n en geni\u015F i\xE7 hacmi." + DEMO_NOTE, photos: [getBrandPhoto("Skoda", 0)], preferredBrands: ["Volkswagen", "Seat", "Toyota"], swapActive: true, isFeatured: false, status: "active", viewCount: 98, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-016", userId: "demo-user-001", brand: "Mercedes-Benz", model: "GLA 200 AMG", year: 2021, km: 35e3, fuelType: "Benzin", transmission: "Otomatik", city: "\u0130stanbul", district: "Bak\u0131rk\xF6y", estimatedValue: 245e4, description: "AMG Line paket, MBUX multimedya, ambiyans ayd\u0131nlatma, 360 derece kamera. Kompakt premium SUV." + DEMO_NOTE, photos: [getBrandPhoto("Mercedes-Benz", 1)], preferredBrands: ["BMW", "Audi"], swapActive: true, isFeatured: true, status: "active", viewCount: 245, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-017", userId: "demo-user-008", brand: "Fiat", model: "Egea 1.4 Urban Plus", year: 2022, km: 32e3, fuelType: "Benzin", transmission: "Manuel", city: "Adana", district: "\xC7ukurova", estimatedValue: 72e4, description: "Urban Plus donan\u0131m, 7 in\xE7 multimedya, geri g\xF6r\xFC\u015F kameras\u0131, cruise control. Ekonomik ve pratik sedan." + DEMO_NOTE, photos: [getBrandPhoto("Fiat", 0)], preferredBrands: ["Renault", "Peugeot", "Citroen"], swapActive: true, isFeatured: false, status: "active", viewCount: 87, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-018", userId: "demo-user-002", brand: "Audi", model: "Q3 35 TFSI S-Line", year: 2021, km: 4e4, fuelType: "Benzin", transmission: "Otomatik", city: "Ankara", district: "Etimesgut", estimatedValue: 22e5, description: "S-Line paket, virtual cockpit plus, MMI navigasyon, LED matrix farlar. Sportif kompakt SUV." + DEMO_NOTE, photos: [getBrandPhoto("Audi", 1)], preferredBrands: ["BMW", "Mercedes", "Volvo"], swapActive: true, isFeatured: false, status: "active", viewCount: 176, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-019", userId: "demo-user-003", brand: "Nissan", model: "Qashqai 1.3 DIG-T Tekna", year: 2022, km: 2e4, fuelType: "Benzin", transmission: "Otomatik", city: "\u0130zmir", district: "Bayrakl\u0131", estimatedValue: 152e4, description: "Tekna paket, ProPilot otonom s\xFCr\xFC\u015F, 360 kamera, massajl\u0131 koltuk. Crossover segmentinin \xF6nc\xFCs\xFC." + DEMO_NOTE, photos: [getBrandPhoto("Nissan", 0)], preferredBrands: ["Toyota", "Honda", "Hyundai"], swapActive: true, isFeatured: false, status: "active", viewCount: 143, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-020", userId: "demo-user-005", brand: "Seat", model: "Leon 1.5 TSI FR", year: 2021, km: 38e3, fuelType: "Benzin", transmission: "Otomatik", city: "Antalya", district: "Konyaalt\u0131", estimatedValue: 118e4, description: "FR paket, dijital kokpit, beats ses sistemi, full LED farlar. \u0130spanyol sportifli\u011Fi ve Alman m\xFChendisli\u011Fi." + DEMO_NOTE, photos: [getBrandPhoto("Seat", 0)], preferredBrands: ["Volkswagen", "Skoda", "Ford"], swapActive: true, isFeatured: false, status: "active", viewCount: 121, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-021", userId: "demo-user-006", brand: "BMW", model: "520i M Sport", year: 2020, km: 68e3, fuelType: "Benzin", transmission: "Otomatik", city: "\u0130stanbul", district: "\xDCsk\xFCdar", estimatedValue: 275e4, description: "M Sport paket, Comfort Access, Driving Assistant Plus, gesture control. Executive sedan segmentinin y\u0131ld\u0131z\u0131." + DEMO_NOTE, photos: [getBrandPhoto("BMW", 2)], preferredBrands: ["Mercedes", "Audi"], swapActive: true, isFeatured: true, status: "active", viewCount: 356, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-022", userId: "demo-user-004", brand: "Citroen", model: "C5 Aircross 1.5 BlueHDi Shine", year: 2021, km: 42e3, fuelType: "Dizel", transmission: "Otomatik", city: "Bursa", district: "Y\u0131ld\u0131r\u0131m", estimatedValue: 128e4, description: "Shine paket, Advanced Comfort koltuklar, grip control, 12.3 in\xE7 dijital g\xF6sterge. Frans\u0131z konforu SUV'da." + DEMO_NOTE, photos: [getBrandPhoto("Citroen", 0)], preferredBrands: ["Peugeot", "Renault", "Opel"], swapActive: true, isFeatured: false, status: "active", viewCount: 109, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-023", userId: "demo-user-007", brand: "Toyota", model: "C-HR 1.8 Hybrid Passion", year: 2022, km: 15e3, fuelType: "Hibrit", transmission: "Otomatik", city: "Konya", district: "Karatay", estimatedValue: 158e4, description: "Passion paket, JBL ses sistemi, head-up display, kablosuz \u015Farj. \xC7arp\u0131c\u0131 tasar\u0131m ve hibrit verimlilik." + DEMO_NOTE, photos: [getBrandPhoto("Toyota", 1)], preferredBrands: ["Honda", "Mazda", "Hyundai"], swapActive: true, isFeatured: false, status: "active", viewCount: 187, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-024", userId: "demo-user-008", brand: "Opel", model: "Astra 1.2 Turbo GS Line", year: 2023, km: 1e4, fuelType: "Benzin", transmission: "Otomatik", city: "Adana", district: "Sar\u0131\xE7am", estimatedValue: 115e4, description: "GS Line paket, Intelli-Lux matrix LED, pure panel dijital kokpit. Yeni nesil tasar\u0131m ve teknoloji." + DEMO_NOTE, photos: [getBrandPhoto("Opel", 0)], preferredBrands: ["Peugeot", "Ford", "Volkswagen"], swapActive: true, isFeatured: false, status: "active", viewCount: 95, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-025", userId: "demo-user-001", brand: "Mercedes-Benz", model: "E200 Exclusive", year: 2019, km: 78e3, fuelType: "Benzin", transmission: "Otomatik", city: "\u0130stanbul", district: "\u015Ei\u015Fli", estimatedValue: 26e5, description: "Exclusive paket, widescreen cockpit, Burmester 3D surround, multibeam LED. L\xFCks ve prestijin ad\u0131." + DEMO_NOTE, photos: [getBrandPhoto("Mercedes-Benz", 2)], preferredBrands: ["BMW", "Audi"], swapActive: true, isFeatured: true, status: "active", viewCount: 298, accidentFree: false, tramerRecord: 18e3 },
  { id: "demo-listing-026", userId: "demo-user-003", brand: "Volkswagen", model: "Tiguan 1.5 TSI Elegance", year: 2022, km: 25e3, fuelType: "Benzin", transmission: "Otomatik", city: "\u0130zmir", district: "\xC7i\u011Fli", estimatedValue: 178e4, description: "Elegance paket, IQ.DRIVE asistan sistemleri, panoramik tavan, elektrikli bagaj. Ailenin g\xFCvenilir SUV'u." + DEMO_NOTE, photos: [getBrandPhoto("Volkswagen", 1)], preferredBrands: ["Skoda", "Seat", "Ford"], swapActive: true, isFeatured: false, status: "active", viewCount: 213, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-027", userId: "demo-user-002", brand: "Subaru", model: "XV 2.0i Premium", year: 2020, km: 5e4, fuelType: "Benzin", transmission: "Otomatik", city: "Ankara", district: "Ke\xE7i\xF6ren", estimatedValue: 135e4, description: "Symmetrical AWD, EyeSight g\xFCvenlik, X-Mode arazi modu, Starlink multimedya. Macera i\xE7in tasarland\u0131." + DEMO_NOTE, photos: [getBrandPhoto("Subaru", 0)], preferredBrands: ["Toyota", "Honda", "Mazda"], swapActive: true, isFeatured: false, status: "active", viewCount: 88, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-028", userId: "demo-user-005", brand: "Dacia", model: "Duster 1.3 TCe Journey", year: 2023, km: 5e3, fuelType: "Benzin", transmission: "Otomatik", city: "Antalya", district: "Lara", estimatedValue: 92e4, description: "Journey paket, 8 in\xE7 multimedya, kablosuz Apple CarPlay, otomatik klima. Uygun fiyatl\u0131 SUV alternatifi." + DEMO_NOTE, photos: [getBrandPhoto("Dacia", 0)], preferredBrands: ["Renault", "Fiat", "Citroen"], swapActive: true, isFeatured: false, status: "active", viewCount: 76, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-029", userId: "demo-user-006", brand: "Audi", model: "A6 40 TFSI Design", year: 2021, km: 45e3, fuelType: "Benzin", transmission: "Otomatik", city: "\u0130stanbul", district: "Kartal", estimatedValue: 295e4, description: "Design paket, \xE7ift MMI dokunmatik ekran, virtual cockpit plus, Matrix LED farlar. \u0130\u015F d\xFCnyas\u0131n\u0131n tercihi." + DEMO_NOTE, photos: [getBrandPhoto("Audi", 2)], preferredBrands: ["BMW", "Mercedes", "Volvo"], swapActive: true, isFeatured: true, status: "active", viewCount: 267, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-030", userId: "demo-user-004", brand: "Cupra", model: "Formentor 1.5 TSI VZ", year: 2022, km: 22e3, fuelType: "Benzin", transmission: "Otomatik", city: "Bursa", district: "Mudanya", estimatedValue: 162e4, description: "VZ paket, Brembo frenler, adaptif s\xFCspansiyon, Beats ses sistemi. Performans odakl\u0131 crossover." + DEMO_NOTE, photos: [getBrandPhoto("Cupra", 0)], preferredBrands: ["Volkswagen", "Seat", "BMW"], swapActive: true, isFeatured: false, status: "active", viewCount: 198, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-031", userId: "demo-user-007", brand: "Honda", model: "HR-V 1.5 e:HEV Advance", year: 2023, km: 8e3, fuelType: "Hibrit", transmission: "Otomatik", city: "Konya", district: "Sel\xE7uklu", estimatedValue: 148e4, description: "Advance paket, e:HEV hibrit sistem, Honda CONNECT, wireless Apple CarPlay. Kompakt SUV'da hibrit teknolojisi." + DEMO_NOTE, photos: [getBrandPhoto("Honda", 1)], preferredBrands: ["Toyota", "Mazda", "Hyundai"], swapActive: true, isFeatured: false, status: "active", viewCount: 132, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-032", userId: "demo-user-008", brand: "BMW", model: "118i M Sport", year: 2021, km: 3e4, fuelType: "Benzin", transmission: "Otomatik", city: "Adana", district: "Y\xFCre\u011Fir", estimatedValue: 165e4, description: "M Sport paket, live cockpit, BMW intelligent personal assistant, park asistan\u0131. Kompakt premium." + DEMO_NOTE, photos: [getBrandPhoto("BMW", 3)], preferredBrands: ["Mercedes", "Audi"], swapActive: true, isFeatured: false, status: "active", viewCount: 165, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-033", userId: "demo-user-001", brand: "Volvo", model: "S60 T5 R-Design", year: 2020, km: 52e3, fuelType: "Benzin", transmission: "Otomatik", city: "\u0130stanbul", district: "Maltepe", estimatedValue: 21e5, description: "R-Design paket, Pilot Assist, Harman Kardon, 360 kamera. \u0130skandinav tasar\u0131m\u0131 sportif sedan." + DEMO_NOTE, photos: [getBrandPhoto("Volvo", 1)], preferredBrands: ["BMW", "Mercedes", "Audi"], swapActive: true, isFeatured: false, status: "active", viewCount: 142, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-034", userId: "demo-user-002", brand: "Ford", model: "Focus 1.5 EcoBoost ST-Line X", year: 2021, km: 36e3, fuelType: "Benzin", transmission: "Otomatik", city: "Ankara", district: "G\xF6lba\u015F\u0131", estimatedValue: 115e4, description: "ST-Line X paket, 8 in\xE7 SYNC 3, B&O ses sistemi, adaptif cruise. S\xFCr\xFC\u015F keyfi arayanlar i\xE7in hatchback." + DEMO_NOTE, photos: [getBrandPhoto("Ford", 1)], preferredBrands: ["Volkswagen", "Seat", "Peugeot"], swapActive: true, isFeatured: false, status: "active", viewCount: 108, accidentFree: true, tramerRecord: 0 },
  { id: "demo-listing-035", userId: "demo-user-003", brand: "Jeep", model: "Compass 1.3 T4 Limited", year: 2022, km: 18e3, fuelType: "Benzin", transmission: "Otomatik", city: "\u0130zmir", district: "Konak", estimatedValue: 168e4, description: "Limited paket, Uconnect 10.1 in\xE7, Alpine ses sistemi, full LED. Amerikan ruhu \u0130talyan tasar\u0131m\u0131yla bulu\u015Fuyor." + DEMO_NOTE, photos: [getBrandPhoto("Jeep", 0)], preferredBrands: ["Toyota", "Ford", "Hyundai"], swapActive: true, isFeatured: false, status: "active", viewCount: 156, accidentFree: true, tramerRecord: 0 }
];
async function seedDemoData() {
  try {
    const existingListings = await db.select({ count: sql4`count(*)` }).from(listings);
    const count = Number(existingListings[0]?.count || 0);
    if (count >= 30) {
      console.log(`Database already has ${count} listings, skipping seed.`);
      return;
    }
    console.log("Seeding demo data...");
    for (const user of demoUsers) {
      const existing = await db.select().from(users).where(sql4`id = ${user.id}`);
      if (existing.length === 0) {
        await db.insert(users).values({
          ...user,
          phoneVerified: true,
          identityVerified: true
        });
      }
    }
    console.log(`${demoUsers.length} demo users created.`);
    for (const listing of demoListings) {
      const existing = await db.select().from(listings).where(sql4`id = ${listing.id}`);
      if (existing.length === 0) {
        await db.insert(listings).values(listing);
      }
    }
    console.log(`Seeded ${demoListings.length} demo listings.`);
  } catch (error) {
    console.error("Error seeding demo data:", error);
  }
}

// server/index.ts
import * as fs2 from "fs";
import * as path2 from "path";
var app = express();
var log = console.log;
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origins = /* @__PURE__ */ new Set();
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }
    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }
    const origin = req.header("origin");
    const isLocalhost = origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:");
    if (origin && (origins.has(origin) || isLocalhost)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}
function setupBodyParsing(app2) {
  app2.use(
    express.json({
      limit: "50mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express.urlencoded({ extended: false, limit: "50mb" }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path3 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path3.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function serveExpoManifest(platform, res) {
  const manifestPath = path2.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs2.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs2.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function configureExpoAndLanding(app2) {
  log("Serving static Expo files with dynamic manifest routing");
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    if (req.path === "/") {
      if (req.method === "HEAD") {
        return res.status(200).end();
      }
      const accept = req.header("accept") || "";
      const isHtmlRequest = accept.includes("text/html");
      if (isHtmlRequest && req.method === "GET") {
        return res.redirect(301, "https://aractakasi.com");
      }
      return res.status(200).json({ status: "ok" });
    }
    next();
  });
  app2.use("/assets", express.static(path2.resolve(process.cwd(), "assets")));
  app2.use("/uploads", express.static(path2.resolve(process.cwd(), "server", "uploads")));
  app2.use("/vehicles", express.static(path2.resolve(process.cwd(), "server", "public", "vehicles")));
  app2.use(express.static(path2.resolve(process.cwd(), "static-build")));
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, _next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
}
(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);
  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
  configureExpoAndLanding(app);
  let server;
  try {
    server = await registerRoutes(app);
  } catch (err) {
    console.error("Failed to register routes:", err);
    process.exit(1);
  }
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port, host: "0.0.0.0", reusePort: true }, async () => {
    log(`express server serving on port ${port}`);
    try {
      await seedDemoData();
    } catch (err) {
      console.error("Seed error (non-fatal):", err);
    }
  });
})();
