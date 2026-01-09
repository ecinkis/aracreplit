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
  status: text("status").default("active"),
  viewCount: integer("view_count").default(0),
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
  content: text("content").notNull(),
  imageUrl: text("image_url"),
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

export const insertUserSchema = createInsertSchema(users).pick({
  phone: true,
  name: true,
  city: true,
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
