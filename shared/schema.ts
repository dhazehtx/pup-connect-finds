import { pgTable, text, serial, integer, boolean, timestamp, uuid, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Core user profiles table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  username: text("username"),
  full_name: text("full_name"),
  bio: text("bio"),
  avatar_url: text("avatar_url"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip_code: text("zip_code"),
  verified: boolean("verified").default(false),
  verification_document: text("verification_document"),
  breeder_license: text("breeder_license"),
  fraud_score: integer("fraud_score").default(0),
  profile_status: text("profile_status").default("active"), // active, under_review, suspended
  last_login_ip: text("last_login_ip"),
  suspicious_activity_count: integer("suspicious_activity_count").default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Dog listings table
export const dogListings = pgTable("dog_listings", {
  id: uuid("id").primaryKey(),
  user_id: uuid("user_id").references(() => profiles.id),
  dog_name: text("dog_name").notNull(),
  breed: text("breed").notNull(),
  age: integer("age").notNull(),
  gender: text("gender"),
  color: text("color"),
  size: text("size"),
  price: decimal("price").notNull(),
  description: text("description"),
  location: text("location"),
  image_url: text("image_url"),
  images: text("images").array(),
  video_url: text("video_url"),
  videos: text("videos").array(),
  vaccinated: boolean("vaccinated"),
  neutered_spayed: boolean("neutered_spayed"),
  good_with_kids: boolean("good_with_kids"),
  good_with_dogs: boolean("good_with_dogs"),
  special_needs: boolean("special_needs"),
  delivery_available: boolean("delivery_available"),
  rehoming: boolean("rehoming").default(false),
  status: text("status").default("active"),
  listing_status: text("listing_status").default("active"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Conversations table
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey(),
  buyer_id: uuid("buyer_id").references(() => profiles.id),
  seller_id: uuid("seller_id").references(() => profiles.id),
  listing_id: uuid("listing_id").references(() => dogListings.id),
  last_message_at: timestamp("last_message_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Messages table - Simplified to match database structure
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey(),
  conversation_id: uuid("conversation_id").references(() => conversations.id),
  sender_id: uuid("sender_id").references(() => profiles.id),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

// Favorites/Wishlist table
export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey(),
  user_id: uuid("user_id").references(() => profiles.id),
  listing_id: uuid("listing_id").references(() => dogListings.id),
  created_at: timestamp("created_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey(),
  reviewer_id: uuid("reviewer_id").references(() => profiles.id),
  reviewee_id: uuid("reviewee_id").references(() => profiles.id),
  listing_id: uuid("listing_id").references(() => dogListings.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  created_at: timestamp("created_at").defaultNow(),
});

// Posts table for community features
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey(),
  user_id: uuid("user_id").references(() => profiles.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  image_url: text("image_url"),
  video_url: text("video_url"),
  category: text("category"),
  likes_count: integer("likes_count").default(0),
  comments_count: integer("comments_count").default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Comments table
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey(),
  post_id: uuid("post_id").references(() => posts.id),
  user_id: uuid("user_id").references(() => profiles.id),
  parent_comment_id: uuid("parent_comment_id"),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Comment replies table
export const commentReplies = pgTable("comment_replies", {
  id: uuid("id").primaryKey().defaultRandom(),
  comment_id: uuid("comment_id").references(() => comments.id, { onDelete: "cascade" }).notNull(),
  user_id: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Notifications table - Updated to match database structure
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey(),
  to_user_id: uuid("to_user_id").references(() => profiles.id),
  from_user_id: uuid("from_user_id").references(() => profiles.id),
  type: text("type").notNull(), // 'like', 'comment', 'comment_reply', 'follow', etc.
  message: text("message").notNull(),
  post_id: uuid("post_id").references(() => posts.id),
  comment_id: uuid("comment_id").references(() => comments.id),
  is_read: boolean("is_read").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

// Payment transactions table
export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(), // Changed to text for Stripe IDs
  user_id: uuid("user_id").references(() => profiles.id),
  buyer_id: uuid("buyer_id").references(() => profiles.id),
  seller_id: uuid("seller_id").references(() => profiles.id),
  listing_id: uuid("listing_id").references(() => dogListings.id),
  type: text("type").notNull(), // payment, subscription, subscription_cancel
  amount: decimal("amount").notNull(),
  currency: text("currency").default("usd"),
  status: text("status").default("pending"),
  payment_method: text("payment_method"),
  product_type: text("product_type"), // pup_box, rehoming_feature, premium_subscription
  stripe_session_id: text("stripe_session_id"),
  stripe_payment_intent_id: text("stripe_payment_intent_id"),
  stripe_subscription_id: text("stripe_subscription_id"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Create insert schemas
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, created_at: true, updated_at: true });
export const insertDogListingSchema = createInsertSchema(dogListings).omit({ id: true, created_at: true, updated_at: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, created_at: true, updated_at: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, created_at: true });
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, created_at: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, created_at: true });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, created_at: true, updated_at: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, created_at: true, updated_at: true });
export const insertCommentReplySchema = createInsertSchema(commentReplies).omit({ id: true, created_at: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, created_at: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, created_at: true, updated_at: true });

// Fraud detection events table
export const fraudDetectionEvents = pgTable("fraud_detection_events", {
  id: uuid("id").primaryKey(),
  user_id: uuid("user_id").references(() => profiles.id),
  event_type: text("event_type").notNull(), // login_anomaly, duplicate_listing, banned_keywords, payment_fraud
  risk_score: integer("risk_score").notNull(),
  detection_method: text("detection_method").default("automated"),
  details: jsonb("details"), // Store additional context as JSON
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  auto_action_taken: text("auto_action_taken"), // none, flagged, under_review, suspended
  created_at: timestamp("created_at").defaultNow(),
});

export const insertFraudDetectionEventSchema = createInsertSchema(fraudDetectionEvents).omit({ id: true, created_at: true });

// Refund requests table
export const refundRequests = pgTable("refund_requests", {
  id: uuid("id").primaryKey(),
  user_id: uuid("user_id").references(() => profiles.id).notNull(),
  transaction_id: text("transaction_id").references(() => transactions.id).notNull(),
  charge_id: text("charge_id").notNull(), // Stripe charge/payment intent ID
  reason: text("reason").notNull(), // canceled_order, scam_listing, dispute_resolved, other
  detailed_reason: text("detailed_reason"), // User's detailed explanation
  status: text("status").default("pending").notNull(), // pending, approved, declined, refunded, failed
  refund_amount: decimal("refund_amount").notNull(),
  currency: text("currency").default("usd"),
  stripe_refund_id: text("stripe_refund_id"), // Stripe refund ID after processing
  admin_notes: text("admin_notes"), // Internal admin notes
  approved_by: uuid("approved_by").references(() => profiles.id), // Admin who approved/declined
  processed_at: timestamp("processed_at"), // When refund was actually processed
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertRefundRequestSchema = createInsertSchema(refundRequests).omit({ id: true, created_at: true, updated_at: true });

// Infer types
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type DogListing = typeof dogListings.$inferSelect;
export type InsertDogListing = z.infer<typeof insertDogListingSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type CommentReply = typeof commentReplies.$inferSelect;
export type InsertCommentReply = z.infer<typeof insertCommentReplySchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type FraudDetectionEvent = typeof fraudDetectionEvents.$inferSelect;
export type InsertFraudDetectionEvent = z.infer<typeof insertFraudDetectionEventSchema>;
export type RefundRequest = typeof refundRequests.$inferSelect;
export type InsertRefundRequest = z.infer<typeof insertRefundRequestSchema>;

// Legacy user table for backward compatibility (can be removed later)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
