import {
  type User,
  type InsertUser,
  type Listing,
  type InsertListing,
  type Like,
  type Match,
  type Message,
  type InsertMessage,
  type Favorite,
  type Notification,
  type InsertNotification,
  type Review,
  type InsertReview,
  type PriceAlert,
  type InsertPriceAlert,
  type Story,
  type InsertStory,
  type AdminUser,
  type InsertAdminUser,
  type VerificationDocument,
  type InsertVerificationDocument,
  users,
  listings,
  likes,
  matches,
  messages,
  favorites,
  notifications,
  reviews,
  priceAlerts,
  stories,
  adminUsers,
  verificationDocuments,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, sql, ne, notInArray } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  getListings(filters?: { city?: string; brand?: string; swapActive?: boolean }): Promise<Listing[]>;
  getFeaturedListings(): Promise<Listing[]>;
  getListing(id: string): Promise<Listing | undefined>;
  getListingsByUser(userId: string): Promise<Listing[]>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: string, data: Partial<Listing>): Promise<Listing | undefined>;
  deleteListing(id: string): Promise<void>;
  incrementViewCount(id: string): Promise<void>;

  getSwipeableListings(userId: string, userListingId: string): Promise<Listing[]>;
  createLike(fromUserId: string, toUserId: string, fromListingId: string, toListingId: string, liked: boolean): Promise<Like>;
  checkMutualLike(fromUserId: string, toUserId: string, fromListingId: string, toListingId: string): Promise<boolean>;

  createMatch(user1Id: string, user2Id: string, listing1Id: string, listing2Id: string): Promise<Match>;
  getMatchesByUser(userId: string): Promise<Match[]>;
  getMatch(id: string): Promise<Match | undefined>;

  getMessagesByMatch(matchId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(matchId: string, userId: string): Promise<void>;

  getFavoritesByUser(userId: string): Promise<Favorite[]>;
  addFavorite(userId: string, listingId: string): Promise<Favorite>;
  removeFavorite(userId: string, listingId: string): Promise<void>;
  isFavorite(userId: string, listingId: string): Promise<boolean>;

  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  getReviewsByUser(userId: string): Promise<Review[]>;
  getReviewsForUser(userId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  getReviewForMatch(matchId: string, reviewerId: string): Promise<Review | undefined>;
  getUserAverageRating(userId: string): Promise<{ average: number; count: number }>;

  getPriceAlertsByUser(userId: string): Promise<PriceAlert[]>;
  getPriceAlertForListing(userId: string, listingId: string): Promise<PriceAlert | undefined>;
  createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert>;
  deletePriceAlert(id: string): Promise<void>;
  updatePriceAlert(id: string, data: Partial<PriceAlert>): Promise<PriceAlert | undefined>;

  getStories(): Promise<Story[]>;
  getActiveStories(): Promise<Story[]>;
  getStory(id: string): Promise<Story | undefined>;
  createStory(story: InsertStory): Promise<Story>;
  updateStory(id: string, data: Partial<Story>): Promise<Story | undefined>;
  deleteStory(id: string): Promise<void>;
  incrementStoryViewCount(id: string): Promise<void>;

  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  createAdminUser(admin: InsertAdminUser): Promise<AdminUser>;

  getAllUsers(): Promise<User[]>;
  getAllListings(): Promise<Listing[]>;
  getAllMatches(): Promise<Match[]>;
  getMessageStats(): Promise<{ total: number; today: number }>;
  getRecentMessagesByMatch(): Promise<any[]>;

  getVerificationDocumentsByUser(userId: string): Promise<VerificationDocument[]>;
  createVerificationDocument(doc: InsertVerificationDocument): Promise<VerificationDocument>;
  updateVerificationDocument(id: string, data: Partial<VerificationDocument>): Promise<VerificationDocument | undefined>;
  getAllPendingVerifications(): Promise<VerificationDocument[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getListings(filters?: { city?: string; brand?: string; swapActive?: boolean }): Promise<Listing[]> {
    let query = db.select().from(listings).where(eq(listings.status, "active"));
    
    if (filters?.swapActive !== undefined) {
      query = db.select().from(listings).where(
        and(eq(listings.status, "active"), eq(listings.swapActive, filters.swapActive))
      );
    }
    
    const result = await query.orderBy(desc(listings.createdAt));
    
    let filtered = result;
    if (filters?.city) {
      filtered = filtered.filter(l => l.city === filters.city);
    }
    if (filters?.brand) {
      filtered = filtered.filter(l => l.brand === filters.brand);
    }
    
    return filtered;
  }

  async getFeaturedListings(): Promise<Listing[]> {
    const now = new Date();
    return db.select().from(listings).where(
      and(
        eq(listings.status, "active"),
        eq(listings.isFeatured, true)
      )
    ).orderBy(desc(listings.createdAt));
  }

  async getListing(id: string): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing || undefined;
  }

  async getListingsByUser(userId: string): Promise<Listing[]> {
    return db.select().from(listings).where(eq(listings.userId, userId)).orderBy(desc(listings.createdAt));
  }

  async createListing(listing: InsertListing): Promise<Listing> {
    const [created] = await db.insert(listings).values(listing).returning();
    return created;
  }

  async updateListing(id: string, data: Partial<Listing>): Promise<Listing | undefined> {
    const [updated] = await db.update(listings).set({ ...data, updatedAt: new Date() }).where(eq(listings.id, id)).returning();
    return updated || undefined;
  }

  async deleteListing(id: string): Promise<void> {
    await db.delete(listings).where(eq(listings.id, id));
  }

  async incrementViewCount(id: string): Promise<void> {
    await db.update(listings).set({ viewCount: sql`${listings.viewCount} + 1` }).where(eq(listings.id, id));
  }

  async getSwipeableListings(userId: string, userListingId: string): Promise<Listing[]> {
    const likedListingIds = await db
      .select({ toListingId: likes.toListingId })
      .from(likes)
      .where(eq(likes.fromListingId, userListingId));

    const excludeIds = likedListingIds.map(l => l.toListingId);
    excludeIds.push(userListingId);

    if (excludeIds.length > 0) {
      return db
        .select()
        .from(listings)
        .where(
          and(
            eq(listings.status, "active"),
            eq(listings.swapActive, true),
            ne(listings.userId, userId),
            notInArray(listings.id, excludeIds)
          )
        )
        .orderBy(desc(listings.createdAt))
        .limit(20);
    }

    return db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.status, "active"),
          eq(listings.swapActive, true),
          ne(listings.userId, userId)
        )
      )
      .orderBy(desc(listings.createdAt))
      .limit(20);
  }

  async createLike(fromUserId: string, toUserId: string, fromListingId: string, toListingId: string, liked: boolean): Promise<Like> {
    const [like] = await db.insert(likes).values({
      fromUserId,
      toUserId,
      fromListingId,
      toListingId,
      liked,
    }).returning();
    return like;
  }

  async checkMutualLike(fromUserId: string, toUserId: string, fromListingId: string, toListingId: string): Promise<boolean> {
    const [mutualLike] = await db
      .select()
      .from(likes)
      .where(
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

  async createMatch(user1Id: string, user2Id: string, listing1Id: string, listing2Id: string): Promise<Match> {
    const chatId = `chat_${Date.now()}`;
    const [match] = await db.insert(matches).values({
      user1Id,
      user2Id,
      listing1Id,
      listing2Id,
      chatId,
    }).returning();
    return match;
  }

  async getMatchesByUser(userId: string): Promise<Match[]> {
    return db
      .select()
      .from(matches)
      .where(or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)))
      .orderBy(desc(matches.createdAt));
  }

  async getMatch(id: string): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match || undefined;
  }

  async getMessagesByMatch(matchId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.matchId, matchId))
      .orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    return created;
  }

  async markMessagesAsRead(matchId: string, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ read: true })
      .where(and(eq(messages.matchId, matchId), ne(messages.senderId, userId)));
  }

  async getFavoritesByUser(userId: string): Promise<Favorite[]> {
    return db.select().from(favorites).where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt));
  }

  async addFavorite(userId: string, listingId: string): Promise<Favorite> {
    const [favorite] = await db.insert(favorites).values({ userId, listingId }).returning();
    return favorite;
  }

  async removeFavorite(userId: string, listingId: string): Promise<void> {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)));
  }

  async isFavorite(userId: string, listingId: string): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)));
    return !!favorite;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, notificationId));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return result[0]?.count || 0;
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.reviewerId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async getReviewsForUser(userId: string): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.reviewedUserId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    return created;
  }

  async getReviewForMatch(matchId: string, reviewerId: string): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.matchId, matchId), eq(reviews.reviewerId, reviewerId)));
    return review || undefined;
  }

  async getUserAverageRating(userId: string): Promise<{ average: number; count: number }> {
    const result = await db
      .select({
        average: sql<number>`COALESCE(AVG(rating), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(eq(reviews.reviewedUserId, userId));
    return {
      average: Number(result[0]?.average || 0),
      count: Number(result[0]?.count || 0),
    };
  }

  async getPriceAlertsByUser(userId: string): Promise<PriceAlert[]> {
    return db
      .select()
      .from(priceAlerts)
      .where(eq(priceAlerts.userId, userId))
      .orderBy(desc(priceAlerts.createdAt));
  }

  async getPriceAlertForListing(userId: string, listingId: string): Promise<PriceAlert | undefined> {
    const [alert] = await db
      .select()
      .from(priceAlerts)
      .where(and(eq(priceAlerts.userId, userId), eq(priceAlerts.listingId, listingId)));
    return alert || undefined;
  }

  async createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert> {
    const [created] = await db.insert(priceAlerts).values(alert).returning();
    return created;
  }

  async deletePriceAlert(id: string): Promise<void> {
    await db.delete(priceAlerts).where(eq(priceAlerts.id, id));
  }

  async updatePriceAlert(id: string, data: Partial<PriceAlert>): Promise<PriceAlert | undefined> {
    const [updated] = await db.update(priceAlerts).set(data).where(eq(priceAlerts.id, id)).returning();
    return updated || undefined;
  }

  async getStories(): Promise<Story[]> {
    return db.select().from(stories).orderBy(desc(stories.createdAt));
  }

  async getActiveStories(): Promise<Story[]> {
    const now = new Date();
    return db
      .select()
      .from(stories)
      .where(and(eq(stories.isActive, true), sql`${stories.expiresAt} > ${now}`))
      .orderBy(desc(stories.createdAt));
  }

  async getStory(id: string): Promise<Story | undefined> {
    const [story] = await db.select().from(stories).where(eq(stories.id, id));
    return story || undefined;
  }

  async createStory(story: InsertStory): Promise<Story> {
    const [created] = await db.insert(stories).values(story).returning();
    return created;
  }

  async updateStory(id: string, data: Partial<Story>): Promise<Story | undefined> {
    const [updated] = await db.update(stories).set(data).where(eq(stories.id, id)).returning();
    return updated || undefined;
  }

  async deleteStory(id: string): Promise<void> {
    await db.delete(stories).where(eq(stories.id, id));
  }

  async incrementStoryViewCount(id: string): Promise<void> {
    await db
      .update(stories)
      .set({ viewCount: sql`${stories.viewCount} + 1` })
      .where(eq(stories.id, id));
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return admin || undefined;
  }

  async createAdminUser(admin: InsertAdminUser): Promise<AdminUser> {
    const [created] = await db.insert(adminUsers).values(admin).returning();
    return created;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllListings(): Promise<Listing[]> {
    return db.select().from(listings).orderBy(desc(listings.createdAt));
  }

  async getAllMatches(): Promise<Match[]> {
    return db.select().from(matches).orderBy(desc(matches.createdAt));
  }

  async getMessageStats(): Promise<{ total: number; today: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const totalResult = await db.select({ count: sql<number>`COUNT(*)` }).from(messages);
    const todayResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(messages)
      .where(sql`${messages.createdAt} >= ${today}`);
    
    return {
      total: Number(totalResult[0]?.count || 0),
      today: Number(todayResult[0]?.count || 0),
    };
  }

  async getRecentMessagesByMatch(): Promise<any[]> {
    const result = await db
      .select({
        matchId: messages.matchId,
        messageCount: sql<number>`COUNT(*)`,
        lastMessage: sql<string>`MAX(${messages.content})`,
        lastMessageAt: sql<Date>`MAX(${messages.createdAt})`,
      })
      .from(messages)
      .groupBy(messages.matchId)
      .orderBy(desc(sql`MAX(${messages.createdAt})`))
      .limit(20);
    
    return result;
  }

  async getVerificationDocumentsByUser(userId: string): Promise<VerificationDocument[]> {
    return db
      .select()
      .from(verificationDocuments)
      .where(eq(verificationDocuments.userId, userId))
      .orderBy(desc(verificationDocuments.createdAt));
  }

  async createVerificationDocument(doc: InsertVerificationDocument): Promise<VerificationDocument> {
    const [created] = await db.insert(verificationDocuments).values(doc).returning();
    return created;
  }

  async updateVerificationDocument(id: string, data: Partial<VerificationDocument>): Promise<VerificationDocument | undefined> {
    const [updated] = await db
      .update(verificationDocuments)
      .set(data)
      .where(eq(verificationDocuments.id, id))
      .returning();
    return updated || undefined;
  }

  async getAllPendingVerifications(): Promise<VerificationDocument[]> {
    return db
      .select()
      .from(verificationDocuments)
      .where(eq(verificationDocuments.status, "pending"))
      .orderBy(desc(verificationDocuments.createdAt));
  }
}

export const storage = new DatabaseStorage();
