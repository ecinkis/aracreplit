import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/auth/login", async (req, res) => {
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

  app.get("/api/users/:id", async (req, res) => {
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

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Premium subscription
  app.post("/api/users/:id/premium", async (req, res) => {
    try {
      const { days } = req.body;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (days || 30));
      
      const user = await storage.updateUser(req.params.id, {
        isPremium: true,
        premiumExpiresAt: expiresAt,
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

  // Listings routes
  app.get("/api/listings/featured", async (req, res) => {
    try {
      const featuredListings = await storage.getFeaturedListings();
      res.json(featuredListings);
    } catch (error) {
      console.error("Get featured listings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/listings/:id/feature", async (req, res) => {
    try {
      const { days } = req.body;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (days || 7));
      
      const listing = await storage.updateListing(req.params.id, {
        isFeatured: true,
        featuredExpiresAt: expiresAt,
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

  app.get("/api/listings", async (req, res) => {
    try {
      const { city, brand, swapActive } = req.query;
      const filters: { city?: string; brand?: string; swapActive?: boolean } = {};
      
      if (city) filters.city = city as string;
      if (brand) filters.brand = brand as string;
      if (swapActive !== undefined) filters.swapActive = swapActive === "true";

      const listings = await storage.getListings(filters);
      res.json(listings);
    } catch (error) {
      console.error("Get listings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
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

  app.get("/api/users/:userId/listings", async (req, res) => {
    try {
      const listings = await storage.getListingsByUser(req.params.userId);
      res.json(listings);
    } catch (error) {
      console.error("Get user listings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/listings", async (req, res) => {
    try {
      const listing = await storage.createListing(req.body);
      res.status(201).json(listing);
    } catch (error) {
      console.error("Create listing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.updateListing(req.params.id, req.body);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      console.error("Update listing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/listings/:id", async (req, res) => {
    try {
      await storage.deleteListing(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete listing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Swipe/Match routes
  app.get("/api/swipe/:userId/:listingId", async (req, res) => {
    try {
      const { userId, listingId } = req.params;
      const listings = await storage.getSwipeableListings(userId, listingId);
      res.json(listings);
    } catch (error) {
      console.error("Get swipeable listings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/swipe", async (req, res) => {
    try {
      const { fromUserId, toUserId, fromListingId, toListingId, liked } = req.body;
      
      const like = await storage.createLike(fromUserId, toUserId, fromListingId, toListingId, liked);
      
      let match = null;
      if (liked) {
        const isMutual = await storage.checkMutualLike(fromUserId, toUserId, fromListingId, toListingId);
        if (isMutual) {
          match = await storage.createMatch(fromUserId, toUserId, fromListingId, toListingId);
        }
      }
      
      res.json({ like, match, isMatch: !!match });
    } catch (error) {
      console.error("Swipe error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Matches routes
  app.get("/api/matches/:userId", async (req, res) => {
    try {
      const matches = await storage.getMatchesByUser(req.params.userId);
      res.json(matches);
    } catch (error) {
      console.error("Get matches error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/match/:id", async (req, res) => {
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

  // Messages routes
  app.get("/api/messages/:matchId", async (req, res) => {
    try {
      const messages = await storage.getMessagesByMatch(req.params.matchId);
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const message = await storage.createMessage(req.body);
      res.status(201).json(message);
    } catch (error) {
      console.error("Create message error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/messages/:matchId/read", async (req, res) => {
    try {
      const { userId } = req.body;
      await storage.markMessagesAsRead(req.params.matchId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Mark messages read error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Favorites routes
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const favorites = await storage.getFavoritesByUser(req.params.userId);
      res.json(favorites);
    } catch (error) {
      console.error("Get favorites error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const { userId, listingId } = req.body;
      const favorite = await storage.addFavorite(userId, listingId);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Add favorite error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/favorites/:userId/:listingId", async (req, res) => {
    try {
      const { userId, listingId } = req.params;
      await storage.removeFavorite(userId, listingId);
      res.status(204).send();
    } catch (error) {
      console.error("Remove favorite error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/favorites/:userId/:listingId/check", async (req, res) => {
    try {
      const { userId, listingId } = req.params;
      const isFavorite = await storage.isFavorite(userId, listingId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Check favorite error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Notifications routes
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.params.userId);
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/notifications/:userId/count", async (req, res) => {
    try {
      const count = await storage.getUnreadNotificationCount(req.params.userId);
      res.json({ count });
    } catch (error) {
      console.error("Get notification count error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notification = await storage.createNotification(req.body);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Create notification error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/notifications/:notificationId/read", async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.notificationId);
      res.status(204).send();
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/notifications/:userId/read-all", async (req, res) => {
    try {
      await storage.markAllNotificationsAsRead(req.params.userId);
      res.status(204).send();
    } catch (error) {
      console.error("Mark all notifications read error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Reviews routes
  app.get("/api/reviews/user/:userId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsForUser(req.params.userId);
      res.json(reviews);
    } catch (error) {
      console.error("Get reviews error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/reviews/user/:userId/rating", async (req, res) => {
    try {
      const rating = await storage.getUserAverageRating(req.params.userId);
      res.json(rating);
    } catch (error) {
      console.error("Get user rating error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/reviews/match/:matchId/check/:reviewerId", async (req, res) => {
    try {
      const { matchId, reviewerId } = req.params;
      const review = await storage.getReviewForMatch(matchId, reviewerId);
      res.json({ hasReviewed: !!review, review });
    } catch (error) {
      console.error("Check review error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const { reviewerId, reviewedUserId, matchId, rating, comment } = req.body;
      
      if (!reviewerId || !reviewedUserId || !matchId || rating === undefined) {
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
        comment: comment || null,
      });

      res.status(201).json(review);
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
