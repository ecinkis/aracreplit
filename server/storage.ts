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
  users,
  listings,
  likes,
  matches,
  messages,
  favorites,
  notifications,
  reviews,
  priceAlerts,
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
}

export const storage = new DatabaseStorage();
