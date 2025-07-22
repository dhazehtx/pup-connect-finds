import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProfileSchema, 
  insertDogListingSchema, 
  insertMessageSchema,
  insertConversationSchema,
  insertFavoriteSchema,
  insertReviewSchema,
  insertPostSchema,
  insertCommentSchema,
  insertNotificationSchema,
  insertTransactionSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Profile routes
  app.get("/api/profile/:id", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error getting profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/profiles", async (req, res) => {
    try {
      const validatedData = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(validatedData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/profile/:id", async (req, res) => {
    try {
      const validatedData = insertProfileSchema.partial().parse(req.body);
      const profile = await storage.updateProfile(req.params.id, validatedData);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dog listing routes
  app.get("/api/listings", async (req, res) => {
    try {
      const { breed, minPrice, maxPrice, location, status, userId } = req.query;
      const filters = {
        breed: breed as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        location: location as string,
        status: status as string,
        userId: userId as string,
      };
      const listings = await storage.getDogListings(filters);
      res.json(listings);
    } catch (error) {
      console.error("Error getting listings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.getDogListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      console.error("Error getting listing:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/listings", async (req, res) => {
    try {
      const validatedData = insertDogListingSchema.parse(req.body);
      const listing = await storage.createDogListing(validatedData);
      res.json(listing);
    } catch (error) {
      console.error("Error creating listing:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/listings/:id", async (req, res) => {
    try {
      const validatedData = insertDogListingSchema.partial().parse(req.body);
      const listing = await storage.updateDogListing(req.params.id, validatedData);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/listings/:id", async (req, res) => {
    try {
      const success = await storage.deleteDogListing(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Listing not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting listing:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Conversation routes
  app.get("/api/conversations/:userId", async (req, res) => {
    try {
      const conversations = await storage.getUserConversations(req.params.userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error getting conversations:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Message routes
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getConversationMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error getting messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Favorites routes
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const favorites = await storage.getUserFavorites(req.params.userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error getting favorites:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const validatedData = insertFavoriteSchema.parse(req.body);
      const favorite = await storage.addFavorite(validatedData);
      res.json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/favorites/:userId/:listingId", async (req, res) => {
    try {
      const success = await storage.removeFavorite(req.params.userId, req.params.listingId);
      if (!success) {
        return res.status(404).json({ error: "Favorite not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Review routes
  app.get("/api/listings/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getListingReviews(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error getting reviews:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(validatedData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Posts routes (community features)
  app.get("/api/posts", async (req, res) => {
    try {
      const { category } = req.query;
      const posts = await storage.getPosts(category as string);
      res.json(posts);
    } catch (error) {
      console.error("Error getting posts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Comments routes
  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getPostComments(req.params.id);
      res.json(comments);
    } catch (error) {
      console.error("Error getting comments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(validatedData);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Notifications routes
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.params.userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error getting notifications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(validatedData);
      res.json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // AI Image Analysis route (replaces Supabase Edge Function)
  app.post("/api/ai/image-analysis", async (req, res) => {
    try {
      const { imageUrl, listingId, analysisType = 'breed_detection' } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
      }

      // Note: This requires OPENAI_API_KEY environment variable
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }

      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: analysisType === 'breed_detection' 
                ? 'You are a professional dog breed identification expert. Analyze the image and provide breed identification with confidence scores. Return JSON format: {"breeds": [{"name": "breed_name", "confidence": 0.95, "characteristics": ["trait1", "trait2"]}], "mix_probability": 0.3, "age_estimate": "8-12 weeks", "size_category": "medium"}'
                : 'You are a veterinary expert analyzing puppy health from photos. Look for visible health indicators and return JSON: {"health_score": 0.85, "observations": ["clear eyes", "good posture"], "concerns": [], "recommendations": ["regular vet checkups"], "visible_issues": "none"}'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: analysisType === 'breed_detection' 
                    ? 'Please identify the dog breed(s) in this image with confidence scores and characteristics.'
                    : 'Please assess the visible health indicators of this puppy.'
                },
                {
                  type: 'image_url',
                  image_url: { url: imageUrl }
                }
              ]
            }
          ],
          max_tokens: 500
        }),
      });

      if (!openAIResponse.ok) {
        const error = await openAIResponse.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const openAIData = await openAIResponse.json();
      const analysisResult = openAIData.choices[0].message.content;

      let parsedResults;
      try {
        parsedResults = JSON.parse(analysisResult);
      } catch (e) {
        parsedResults = { raw_analysis: analysisResult };
      }

      const confidence = analysisType === 'breed_detection' 
        ? (parsedResults.breeds?.[0]?.confidence || 0.5)
        : (parsedResults.health_score || 0.5);

      res.json({
        success: true,
        analysis: parsedResults,
        confidence: confidence,
        listingId: listingId
      });
    } catch (error) {
      console.error('Error in AI image analysis:', error);
      res.status(500).json({ 
        error: error.message,
        success: false 
      });
    }
  });

  // Marketplace bulk operations (replaces advanced-search Edge Function)
  app.post("/api/marketplace/bulk-update", async (req, res) => {
    try {
      const { listing_ids, updates, user_id } = req.body;

      // Verify user owns all listings
      const userListings = await storage.getDogListings({ userId: user_id });
      const userListingIds = userListings.map(l => l.id);
      
      const hasPermission = listing_ids.every((id: string) => userListingIds.includes(id));
      if (!hasPermission) {
        return res.status(403).json({ error: 'Some listings not found or not owned by user' });
      }

      // Perform bulk update
      const updatedListings = [];
      for (const id of listing_ids) {
        const updated = await storage.updateDogListing(id, updates);
        if (updated) updatedListings.push(updated);
      }

      res.json({
        success: true,
        updated_listings: updatedListings,
        count: updatedListings.length
      });
    } catch (error) {
      console.error('Error in bulk update:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Payment transaction routes
  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      console.error("Error getting transaction:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
