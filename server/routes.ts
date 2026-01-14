import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getAdminSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is required for admin authentication");
  }
  return secret;
}

function generateToken(email: string): string {
  const payload = { email, exp: Date.now() + 24 * 60 * 60 * 1000 };
  const data = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", getAdminSecret()).update(data).digest("hex");
  return Buffer.from(data).toString("base64") + "." + signature;
}

function verifyToken(token: string): { email: string } | null {
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

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + getAdminSecret()).digest("hex");
}

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  (req as any).adminEmail = payload.email;
  next();
}

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

  app.post("/api/auth/apple", async (req, res) => {
    try {
      const { appleId, email, fullName } = req.body;
      if (!appleId) {
        return res.status(400).json({ error: "Apple ID is required" });
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

  app.post("/api/auth/google", async (req, res) => {
    try {
      const { googleId, email, name, photo } = req.body;
      if (!googleId) {
        return res.status(400).json({ error: "Google ID is required" });
      }

      let user = await storage.getUserByGoogleId(googleId);
      
      if (!user && email) {
        user = await storage.getUserByEmail(email);
        if (user) {
          await storage.updateUser(user.id, { googleId });
        }
      }

      if (!user) {
        const tempPhone = `google_${googleId.substring(0, 14)}`;
        user = await storage.createUser({ 
          phone: tempPhone, 
          name: name || null, 
          email: email || null,
          googleId,
          avatarUrl: photo || null,
          city: null 
        });
      }

      res.json({ user });
    } catch (error) {
      console.error("Google login error:", error);
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

  // Image upload endpoint
  app.post("/api/upload", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }

      // Extract base64 data
      const matches = image.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: "Invalid image format" });
      }

      const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
      const data = matches[2];
      const buffer = Buffer.from(data, "base64");

      // Generate unique filename
      const filename = `${crypto.randomUUID()}.${ext}`;
      const uploadDir = path.join(process.cwd(), "server", "uploads");
      
      // Ensure upload directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);

      // Return the URL for the uploaded file
      const url = `/uploads/${filename}`;
      res.json({ url });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
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
      // Güncellenen ilanlar tekrar onaya düşsün
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

  // Direct conversation - create match if not exists
  app.post("/api/conversations/start", async (req, res) => {
    try {
      const { fromUserId, toUserId, listingId } = req.body;
      
      // Check if match already exists between these users
      const existingMatches = await storage.getMatchesByUser(fromUserId);
      const existingMatch = existingMatches.find(
        (m: any) => (m.user1Id === toUserId || m.user2Id === toUserId)
      );
      
      if (existingMatch) {
        return res.json({ match: existingMatch, isNew: false });
      }
      
      // Create a new match for direct conversation
      const match = await storage.createMatch(fromUserId, toUserId, listingId, listingId);
      res.status(201).json({ match, isNew: true });
    } catch (error) {
      console.error("Start conversation error:", error);
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

  // Verification documents routes
  app.get("/api/verification/:userId", async (req, res) => {
    try {
      const documents = await storage.getVerificationDocumentsByUser(req.params.userId);
      res.json(documents);
    } catch (error) {
      console.error("Get verification documents error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/verification", async (req, res) => {
    try {
      const { userId, documentType, documentUrl } = req.body;
      if (!userId || !documentType || !documentUrl) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const document = await storage.createVerificationDocument({
        userId,
        documentType,
        documentUrl,
      });
      res.status(201).json(document);
    } catch (error) {
      console.error("Create verification document error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/verification/:id", async (req, res) => {
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

  // Price alerts routes
  app.get("/api/price-alerts/:userId", async (req, res) => {
    try {
      const alerts = await storage.getPriceAlertsByUser(req.params.userId);
      res.json(alerts);
    } catch (error) {
      console.error("Get price alerts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/price-alerts/:userId/:listingId/check", async (req, res) => {
    try {
      const { userId, listingId } = req.params;
      const alert = await storage.getPriceAlertForListing(userId, listingId);
      res.json({ hasAlert: !!alert, alert });
    } catch (error) {
      console.error("Check price alert error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/price-alerts", async (req, res) => {
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
        isActive: true,
      });

      res.status(201).json(alert);
    } catch (error) {
      console.error("Create price alert error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/price-alerts/:id", async (req, res) => {
    try {
      await storage.deletePriceAlert(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete price alert error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Stories API (public)
  app.get("/api/stories", async (req, res) => {
    try {
      const activeStories = await storage.getActiveStories();
      res.json(activeStories);
    } catch (error) {
      console.error("Get stories error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/stories/:id/view", async (req, res) => {
    try {
      await storage.incrementStoryViewCount(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Increment story view error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Web App - Integrated website for non-app users
  app.get("/web", (req, res) => {
    const webAppHtml = fs.readFileSync(
      path.join(process.cwd(), "server", "templates", "web-app.html"),
      "utf-8"
    );
    res.send(webAppHtml);
  });

  // Robots.txt - block admin paths from search engines
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send(`User-agent: *
Disallow: /panel-yonetim-x7k9m/
Disallow: /api/admin/
`);
  });

  // Hidden admin path - return 404 for obvious /admin route
  app.get("/admin", (req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Secret Admin Panel HTML - obscure URL
  app.get("/panel-yonetim-x7k9m", (req, res) => {
    res.set("X-Robots-Tag", "noindex, nofollow");
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    const adminHtml = fs.readFileSync(
      path.join(process.cwd(), "server", "templates", "admin-panel.html"),
      "utf-8"
    );
    res.send(adminHtml);
  });

  // Admin API Routes
  app.post("/api/admin/login", async (req, res) => {
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
            role: "admin",
          });
        } else {
          return res.status(401).json({ error: "Geçersiz e-posta veya şifre" });
        }
      } else {
        if (admin.password !== hashPassword(password)) {
          return res.status(401).json({ error: "Geçersiz e-posta veya şifre" });
        }
      }
      
      const token = generateToken(admin.email);
      res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/verify", adminAuth, (req, res) => {
    res.json({ valid: true, email: (req as any).adminEmail });
  });

  app.get("/api/admin/stats", adminAuth, async (req, res) => {
    try {
      const [allUsers, allListings, allMatches, allStories] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllListings(),
        storage.getAllMatches(),
        storage.getActiveStories(),
      ]);
      
      res.json({
        users: allUsers.length,
        listings: allListings.length,
        matches: allMatches.length,
        stories: allStories.length,
      });
    } catch (error) {
      console.error("Admin stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/users", adminAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const allUsers = await storage.getAllUsers();
      res.json(allUsers.slice(0, limit));
    } catch (error) {
      console.error("Admin users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/listings", adminAuth, async (req, res) => {
    try {
      const { status } = req.query;
      const allListings = await storage.getAllListings();
      if (status) {
        const filtered = allListings.filter(l => l.status === status);
        return res.json(filtered);
      }
      res.json(allListings);
    } catch (error) {
      console.error("Admin listings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/listings/pending", adminAuth, async (req, res) => {
    try {
      const allListings = await storage.getAllListings();
      const pendingListings = allListings.filter(l => l.status === "pending");
      res.json(pendingListings);
    } catch (error) {
      console.error("Admin pending listings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/listings/:id/approve", adminAuth, async (req, res) => {
    try {
      const listing = await storage.updateListing(req.params.id, { status: "active" });
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      console.error("Admin approve listing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/listings/:id/reject", adminAuth, async (req, res) => {
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

  app.patch("/api/admin/listings/:id/featured", adminAuth, async (req, res) => {
    try {
      const { isFeatured } = req.body;
      const listing = await storage.updateListing(req.params.id, { isFeatured });
      res.json(listing);
    } catch (error) {
      console.error("Admin toggle featured error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/stories", adminAuth, async (req, res) => {
    try {
      const allStories = await storage.getStories();
      res.json(allStories);
    } catch (error) {
      console.error("Admin stories error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/stories", adminAuth, async (req, res) => {
    try {
      const { brandName, title, imageUrl, linkUrl, expiresAt } = req.body;
      const story = await storage.createStory({
        brandName,
        title,
        imageUrl,
        linkUrl,
        expiresAt: new Date(expiresAt),
        isActive: true,
      });
      res.status(201).json(story);
    } catch (error) {
      console.error("Admin create story error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/stories/:id", adminAuth, async (req, res) => {
    try {
      const { brandName, title, imageUrl, linkUrl, expiresAt, isActive } = req.body;
      const updateData: any = {};
      if (brandName !== undefined) updateData.brandName = brandName;
      if (title !== undefined) updateData.title = title;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
      if (expiresAt !== undefined) updateData.expiresAt = new Date(expiresAt);
      if (isActive !== undefined) updateData.isActive = isActive;
      
      const story = await storage.updateStory(req.params.id, updateData);
      res.json(story);
    } catch (error) {
      console.error("Admin update story error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/stories/:id", adminAuth, async (req, res) => {
    try {
      await storage.deleteStory(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Admin delete story error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/messages/stats", adminAuth, async (req, res) => {
    try {
      const stats = await storage.getMessageStats();
      res.json(stats);
    } catch (error) {
      console.error("Admin message stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/messages/recent", adminAuth, async (req, res) => {
    try {
      const recentMessages = await storage.getRecentMessagesByMatch();
      res.json(recentMessages);
    } catch (error) {
      console.error("Admin recent messages error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Applications (Corporate & Premium) endpoints
  app.post("/api/applications", async (req, res) => {
    try {
      const application = await storage.createApplication(req.body);
      res.status(201).json(application);
    } catch (error) {
      console.error("Create application error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/applications/user/:userId", async (req, res) => {
    try {
      const applications = await storage.getApplicationsByUser(req.params.userId);
      res.json(applications);
    } catch (error) {
      console.error("Get user applications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/applications/pending/:type", adminAuth, async (req, res) => {
    try {
      const applications = await storage.getPendingApplications(req.params.type);
      res.json(applications);
    } catch (error) {
      console.error("Get pending applications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/applications/:id/approve", adminAuth, async (req, res) => {
    try {
      const application = await storage.approveApplication(req.params.id, (req as any).adminEmail);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Approve application error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/applications/:id/reject", adminAuth, async (req, res) => {
    try {
      const { reason } = req.body;
      const application = await storage.rejectApplication(req.params.id, reason, (req as any).adminEmail);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Reject application error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
