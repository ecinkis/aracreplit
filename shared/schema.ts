import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  name: text("name"),
  city: text("city"),
  avatarUrl: text("avatar_url"),
  trustScore: integer("trust_score").default(0),
  phoneVerified: boolean("phone_verified").default(false),
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
  dailyLikesUsed: integer("daily_likes_used").default(0),
  lastLikeResetAt: timestamp("last_like_reset_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  sentLikes: many(likes, { relationName: "sentLikes" }),
  receivedLikes: many(likes, { relationName: "receivedLikes" }),
  messages: many(messages),
  favorites: many(favorites),
}));

export const listings = pgTable("listings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  km: integer("km").notNull(),
  fuelType: text("fuel_type").notNull(),
  transmission: text("transmission").notNull(),
  city: text("city").notNull(),
  district: text("district"),
  photos: jsonb("photos").$type<string[]>().default([]),
  swapActive: boolean("swap_active").default(true),
  onlySwap: boolean("only_swap").default(false),
  acceptsCashDiff: boolean("accepts_cash_diff").default(true),
  preferredBrands: jsonb("preferred_brands").$type<string[]>().default([]),
  yearRangeMin: integer("year_range_min"),
  yearRangeMax: integer("year_range_max"),
  kmMax: integer("km_max"),
  status: text("status").default("pending"), // pending, active, rejected
  viewCount: integer("view_count").default(0),
  tramerRecord: integer("tramer_record").default(0),
  paintedParts: jsonb("painted_parts").$type<string[]>().default([]),
  replacedParts: jsonb("replaced_parts").$type<string[]>().default([]),
  accidentFree: boolean("accident_free").default(true),
  description: text("description"),
  isFeatured: boolean("is_featured").default(false),
  featuredExpiresAt: timestamp("featured_expires_at"),
  estimatedValue: integer("estimated_value"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const listingsRelations = relations(listings, ({ one, many }) => ({
  user: one(users, {
    fields: [listings.userId],
    references: [users.id],
  }),
  likes: many(likes),
  favorites: many(favorites),
}));

export const likes = pgTable("likes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  toUserId: varchar("to_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fromListingId: varchar("from_listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  toListingId: varchar("to_listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  liked: boolean("liked").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const likesRelations = relations(likes, ({ one }) => ({
  fromUser: one(users, {
    fields: [likes.fromUserId],
    references: [users.id],
    relationName: "sentLikes",
  }),
  toUser: one(users, {
    fields: [likes.toUserId],
    references: [users.id],
    relationName: "receivedLikes",
  }),
  fromListing: one(listings, {
    fields: [likes.fromListingId],
    references: [listings.id],
  }),
  toListing: one(listings, {
    fields: [likes.toListingId],
    references: [listings.id],
  }),
}));

export const matches = pgTable("matches", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  user2Id: varchar("user2_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  listing1Id: varchar("listing1_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  listing2Id: varchar("listing2_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  chatId: varchar("chat_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const matchesRelations = relations(matches, ({ one, many }) => ({
  user1: one(users, {
    fields: [matches.user1Id],
    references: [users.id],
  }),
  user2: one(users, {
    fields: [matches.user2Id],
    references: [users.id],
  }),
  listing1: one(listings, {
    fields: [matches.listing1Id],
    references: [listings.id],
  }),
  listing2: one(listings, {
    fields: [matches.listing2Id],
    references: [listings.id],
  }),
  messages: many(messages),
}));

export const messages = pgTable("messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content"),
  imageUrl: text("image_url"),
  messageType: text("message_type").default("text"),
  audioData: text("audio_data"),
  audioDuration: integer("audio_duration"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  match: one(matches, {
    fields: [messages.matchId],
    references: [matches.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const favorites = pgTable("favorites", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  listingId: varchar("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [favorites.listingId],
    references: [listings.id],
  }),
}));

export const notifications = pgTable("notifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedMatchId: varchar("related_match_id").references(() => matches.id, { onDelete: "cascade" }),
  relatedListingId: varchar("related_listing_id").references(() => listings.id, { onDelete: "cascade" }),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  match: one(matches, {
    fields: [notifications.relatedMatchId],
    references: [matches.id],
  }),
  listing: one(listings, {
    fields: [notifications.relatedListingId],
    references: [listings.id],
  }),
}));

export const reviews = pgTable("reviews", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reviewedUserId: varchar("reviewed_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  matchId: varchar("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: "givenReviews",
  }),
  reviewedUser: one(users, {
    fields: [reviews.reviewedUserId],
    references: [users.id],
    relationName: "receivedReviews",
  }),
  match: one(matches, {
    fields: [reviews.matchId],
    references: [matches.id],
  }),
}));

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const priceAlerts = pgTable("price_alerts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  listingId: varchar("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  targetPrice: integer("target_price").notNull(),
  originalPrice: integer("original_price").notNull(),
  isActive: boolean("is_active").default(true),
  triggered: boolean("triggered").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const priceAlertsRelations = relations(priceAlerts, ({ one }) => ({
  user: one(users, {
    fields: [priceAlerts.userId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [priceAlerts.listingId],
    references: [listings.id],
  }),
}));

export const insertPriceAlertSchema = createInsertSchema(priceAlerts).omit({
  id: true,
  createdAt: true,
  triggered: true,
});

export const stories = pgTable("stories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  brandName: text("brand_name").notNull(),
  isActive: boolean("is_active").default(true),
  viewCount: integer("view_count").default(0),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
  viewCount: true,
});

export const verificationDocuments = pgTable("verification_documents", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  documentType: text("document_type").notNull(), // 'tax_certificate', 'identity', 'company_registration'
  documentUrl: text("document_url").notNull(),
  status: text("status").default("pending"), // 'pending', 'approved', 'rejected'
  rejectionReason: text("rejection_reason"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const verificationDocumentsRelations = relations(verificationDocuments, ({ one }) => ({
  user: one(users, {
    fields: [verificationDocuments.userId],
    references: [users.id],
  }),
}));

export const insertVerificationDocumentSchema = createInsertSchema(verificationDocuments).omit({
  id: true,
  createdAt: true,
  status: true,
  reviewedAt: true,
  rejectionReason: true,
});

export const applications = pgTable("applications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'corporate' veya 'premium'
  status: text("status").default("pending"), // 'pending', 'approved', 'rejected'
  // Kurumsal başvuru için ek bilgiler
  companyName: text("company_name"),
  taxNumber: text("tax_number"),
  taxOffice: text("tax_office"),
  companyAddress: text("company_address"),
  authorizedPerson: text("authorized_person"),
  companyPhone: text("company_phone"),
  documents: jsonb("documents").$type<string[]>().default([]),
  // Premium başvuru için
  planType: text("plan_type"), // 'monthly'
  // Admin işlemleri
  rejectionReason: text("rejection_reason"),
  reviewedBy: varchar("reviewed_by").references(() => adminUsers.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applicationsRelations = relations(applications, ({ one }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
  reviewer: one(adminUsers, {
    fields: [applications.reviewedBy],
    references: [adminUsers.id],
  }),
}));

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  status: true,
  reviewedAt: true,
  reviewedBy: true,
  rejectionReason: true,
});

export const adminUsers = pgTable("admin_users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  role: text("role").default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  phone: true,
  name: true,
  city: true,
  email: true,
  appleId: true,
  googleId: true,
  avatarUrl: true,
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  matchId: true,
  senderId: true,
  content: true,
  imageUrl: true,
  messageType: true,
  audioData: true,
  audioDuration: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Like = typeof likes.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type PriceAlert = typeof priceAlerts.$inferSelect;
export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;
export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type VerificationDocument = typeof verificationDocuments.$inferSelect;
export type InsertVerificationDocument = z.infer<typeof insertVerificationDocumentSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
