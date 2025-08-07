import { pgTable, text, serial, integer, boolean, timestamp, uuid, decimal, jsonb, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Core user profiles table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  username: text("username"),
  full_name: text("full_name"),
  email: text("email"),
  bio: text("bio"),
  avatar_url: text("avatar_url"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip_code: text("zip_code"),
  location: text("location"),
  verified: boolean("verified").default(false),
  verification_document: text("verification_document"),
  breeder_license: text("breeder_license"),
  fraud_score: integer("fraud_score").default(0),
  profile_status: text("profile_status").default("active"), // active, under_review, suspended
  is_admin: boolean("is_admin").default(false),
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
  title: text("title"),
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
  participant_id: uuid("participant_id"),
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
  title: text("title"),
  content: text("content").notNull(),
  image_url: text("image_url"), // Legacy single image support
  images: text("images").array(), // Multiple images support
  video_url: text("video_url"), // Single video for reels
  videos: text("videos").array(), // Multiple videos support
  post_type: text("post_type").default("text"), // text, image, video, reel
  category: text("category"),
  hashtags: text("hashtags").array(), // Array of hashtags
  caption: text("caption"), // Video caption for reels
  likes_count: integer("likes_count").default(0),
  comments_count: integer("comments_count").default(0),
  shares_count: integer("shares_count").default(0),
  views_count: integer("views_count").default(0),
  duration: integer("duration"), // Video duration in seconds
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
  mentions: text("mentions").array(), // Array of mentioned usernames
  likes_count: integer("likes_count").default(0),
  replies_count: integer("replies_count").default(0),
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

// Post likes table
export const postLikes = pgTable("post_likes", {
  id: uuid("id").primaryKey(),
  post_id: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  user_id: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Post shares table
export const postShares = pgTable("post_shares", {
  id: uuid("id").primaryKey(),
  post_id: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  user_id: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
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

// Commission tracking table
export const commissions = pgTable("commissions", {
  id: uuid("id").primaryKey(),
  transaction_id: text("transaction_id").references(() => transactions.id).notNull(),
  seller_id: uuid("seller_id").references(() => profiles.id).notNull(),
  buyer_id: uuid("buyer_id").references(() => profiles.id).notNull(),
  total_amount: decimal("total_amount").notNull(), // Total transaction amount
  commission_percent: decimal("commission_percent").notNull(), // Commission rate applied
  platform_fee: decimal("platform_fee").notNull(), // Amount kept by platform
  seller_payout: decimal("seller_payout").notNull(), // Amount paid to seller
  listing_type: text("listing_type").notNull(), // puppy, service, rehoming, premium
  listing_id: text("listing_id"), // Reference to specific listing if applicable
  status: text("status").default("pending").notNull(), // pending, completed, refunded, disputed
  stripe_transfer_id: text("stripe_transfer_id"), // Stripe transfer ID when payout is made
  payout_date: timestamp("payout_date"), // When seller was actually paid
  currency: text("currency").default("usd"),
  notes: text("notes"), // Admin notes or special conditions
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Commission settings table for configurable rates
export const commissionSettings = pgTable("commission_settings", {
  id: uuid("id").primaryKey(),
  listing_type: text("listing_type").notNull().unique(), // puppy, service, rehoming, premium
  commission_percent: decimal("commission_percent").notNull(),
  flat_fee: decimal("flat_fee"), // Optional flat fee instead of percentage
  min_fee: decimal("min_fee"), // Minimum commission amount
  max_fee: decimal("max_fee"), // Maximum commission amount (cap)
  description: text("description"), // Human-readable description
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertCommissionSchema = createInsertSchema(commissions).omit({ id: true, created_at: true, updated_at: true });
export const insertCommissionSettingsSchema = createInsertSchema(commissionSettings).omit({ id: true, created_at: true, updated_at: true });

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
export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type CommissionSettings = typeof commissionSettings.$inferSelect;
export type InsertCommissionSettings = z.infer<typeof insertCommissionSettingsSchema>;

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

// System logs table for comprehensive monitoring
export const systemLogs = pgTable("system_logs", {
  id: uuid("id").primaryKey(),
  log_id: text("log_id").notNull().unique(), // Unique identifier for each log entry
  level: text("level").notNull(), // debug, info, warn, error, critical
  category: text("category").notNull(), // api, frontend, auth, payment, database, etc.
  message: text("message").notNull(),
  details: jsonb("details"), // Additional structured data
  user_id: uuid("user_id").references(() => profiles.id), // Optional user context
  session_id: text("session_id"), // Session identifier
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  endpoint: text("endpoint"), // API endpoint or page route
  method: text("method"), // HTTP method for API calls
  status_code: integer("status_code"), // HTTP status code
  response_time: integer("response_time"), // Response time in milliseconds
  error_stack: text("error_stack"), // Full error stack trace for errors
  resolved: boolean("resolved").default(false), // For error tracking
  resolved_by: uuid("resolved_by").references(() => profiles.id),
  resolved_at: timestamp("resolved_at"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertSystemLogSchema = createInsertSchema(systemLogs).omit({ id: true, created_at: true });
export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;

// User reports table for reporting inappropriate behavior
export const userReports = pgTable("user_reports", {
  id: uuid("id").primaryKey(),
  reporter_id: uuid("reporter_id").references(() => profiles.id).notNull(),
  reported_user_id: uuid("reported_user_id").references(() => profiles.id).notNull(),
  reason: text("reason").notNull(), // inappropriate_content, harassment, spam, fraud, fake_profile, other
  message: text("message").notNull(),
  severity: text("severity").default("medium"), // low, medium, high, critical
  status: text("status").default("pending"), // pending, investigating, resolved, dismissed
  admin_notes: text("admin_notes"),
  action_taken: text("action_taken"), // none, warning_issued, temporary_ban, permanent_ban, profile_restricted
  resolved_by: uuid("resolved_by").references(() => profiles.id),
  resolved_at: timestamp("resolved_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Listing reports table for reporting inappropriate listings
export const listingReports = pgTable("listing_reports", {
  id: uuid("id").primaryKey(),
  reporter_id: uuid("reporter_id").references(() => profiles.id).notNull(),
  listing_id: uuid("listing_id").references(() => dogListings.id).notNull(),
  listing_owner_id: uuid("listing_owner_id").references(() => profiles.id).notNull(),
  reason: text("reason").notNull(), // misleading_info, overpriced, sick_animal, puppy_mill, scam, inappropriate_content, other
  message: text("message").notNull(),
  severity: text("severity").default("medium"), // low, medium, high, critical
  status: text("status").default("pending"), // pending, investigating, resolved, dismissed
  admin_notes: text("admin_notes"),
  action_taken: text("action_taken"), // none, listing_removed, warning_issued, user_banned, listing_flagged
  resolved_by: uuid("resolved_by").references(() => profiles.id),
  resolved_at: timestamp("resolved_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Report rate limiting tracking
export const reportRateLimit = pgTable("report_rate_limit", {
  id: uuid("id").primaryKey(),
  user_id: uuid("user_id").references(() => profiles.id).notNull(),
  report_count: integer("report_count").default(0),
  last_report_date: timestamp("last_report_date").defaultNow(),
  reset_date: timestamp("reset_date").defaultNow(),
});

export const insertUserReportSchema = createInsertSchema(userReports).omit({ id: true, created_at: true, updated_at: true });
export const insertListingReportSchema = createInsertSchema(listingReports).omit({ id: true, created_at: true, updated_at: true });
export const insertReportRateLimitSchema = createInsertSchema(reportRateLimit).omit({ id: true, last_report_date: true, reset_date: true });

// Admin logs table for audit trail
export const adminLogs = pgTable("admin_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  admin_id: uuid("admin_id").references(() => profiles.id),
  action: text("action").notNull(),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertAdminLogSchema = createInsertSchema(adminLogs).omit({ id: true, created_at: true });

export type UserReport = typeof userReports.$inferSelect;
export type InsertUserReport = z.infer<typeof insertUserReportSchema>;
export type ListingReport = typeof listingReports.$inferSelect;
export type InsertListingReport = z.infer<typeof insertListingReportSchema>;
export type ReportRateLimit = typeof reportRateLimit.$inferSelect;
export type InsertReportRateLimit = z.infer<typeof insertReportRateLimitSchema>;
export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;

// Additional post-related schemas for new features
export const insertPostLikeSchema = createInsertSchema(postLikes).omit({ id: true, created_at: true });
export const insertPostShareSchema = createInsertSchema(postShares).omit({ id: true, created_at: true });

// Comment likes table
export const commentLikes = pgTable("comment_likes", {
  id: uuid("id").primaryKey(),
  comment_id: uuid("comment_id").references(() => comments.id, { onDelete: "cascade" }).notNull(),
  user_id: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Mentions table for tracking @mentions in comments
export const mentions = pgTable("mentions", {
  id: uuid("id").primaryKey(),
  comment_id: uuid("comment_id").references(() => comments.id, { onDelete: "cascade" }).notNull(),
  mentioned_user_id: uuid("mentioned_user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  mentioning_user_id: uuid("mentioning_user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Post tags table for topic tagging and hashtag tracking
export const postTags = pgTable("post_tags", {
  id: uuid("id").primaryKey(),
  post_id: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  tag_text: text("tag_text").notNull(),
  tag_type: text("tag_type").notNull().default("hashtag"), // hashtag, topic, category
  created_at: timestamp("created_at").defaultNow(),
});

// Popular tags for autocomplete and trending
export const popularTags = pgTable("popular_tags", {
  id: uuid("id").primaryKey(),
  tag_text: text("tag_text").notNull(),
  usage_count: integer("usage_count").default(1),
  category: text("category"), // puppy, training, health, breed, etc.
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Saved posts table for user bookmarks
export const savedPosts = pgTable("saved_posts", {
  id: uuid("id").primaryKey(),
  user_id: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  post_id: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserPost: unique("unique_user_post").on(table.user_id, table.post_id),
}));

// Bookmarks table for listings and posts
export const bookmarks = pgTable("bookmarks", {
  id: uuid("id").primaryKey(),
  user_id: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  content_id: uuid("content_id").notNull(), // Can reference posts or dog_listings
  content_type: text("content_type").notNull(), // 'post' or 'listing'
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserContent: unique("unique_user_content").on(table.user_id, table.content_id, table.content_type),
}));

// Reports table for content moderation
export const reports = pgTable("reports", {
  id: uuid("id").primaryKey(),
  reporter_id: uuid("reporter_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  target_id: uuid("target_id").notNull(), // Can reference users, posts, comments, listings
  target_type: text("target_type").notNull(), // 'user', 'post', 'comment', 'listing'
  reason: text("reason").notNull(),
  description: text("description"),
  status: text("status").default("pending"), // pending, reviewed, resolved, dismissed
  reviewed_by: uuid("reviewed_by").references(() => profiles.id),
  reviewed_at: timestamp("reviewed_at"),
  created_at: timestamp("created_at").defaultNow(),
});

// Follows table for user relationships
export const follows = pgTable("follows", {
  id: uuid("id").primaryKey(),
  follower_id: uuid("follower_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  followed_id: uuid("followed_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueFollow: unique("unique_follow").on(table.follower_id, table.followed_id),
}));

// Enhanced notifications table for comprehensive engagement tracking (replaces existing notifications)
export const enhancedNotifications = pgTable("enhanced_notifications", {
  id: uuid("id").primaryKey(),
  user_id: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  actor_id: uuid("actor_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(), // 'like', 'comment', 'reply', 'follow', 'mention', 'post_share'
  target_id: uuid("target_id"), // ID of post, comment, etc.
  target_type: text("target_type"), // 'post', 'comment', 'listing'
  content: text("content"), // Optional message/preview
  read: boolean("read").default(false),
  grouped_count: integer("grouped_count").default(1), // For grouping similar notifications
  created_at: timestamp("created_at").defaultNow(),
});

// User preferences for notifications and explore
export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey(),
  user_id: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull().unique(),
  explore_filters: jsonb("explore_filters"), // Saved search/filter preferences
  notification_settings: jsonb("notification_settings"), // Notification preferences
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Community groups for breed-specific and interest-based forums
export const communityGroups = pgTable("community_groups", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  breed_tag: text("breed_tag"), // e.g., 'golden-retriever', 'labrador', 'mixed-breed'
  region: text("region"), // Optional regional focus
  privacy: text("privacy").notNull().default("public"), // 'public', 'private', 'restricted'
  cover_image: text("cover_image"),
  group_icon: text("group_icon"), // Breed emoji or custom icon
  creator_id: uuid("creator_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  member_count: integer("member_count").default(1),
  post_count: integer("post_count").default(0),
  is_verified: boolean("is_verified").default(false), // Official breed clubs
  is_active: boolean("is_active").default(true),
  rules: text("rules"), // Group rules and guidelines
  tags: text("tags").array(), // Additional tags for discovery
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Group memberships for tracking who belongs to which groups
export const groupMemberships = pgTable("group_memberships", {
  id: uuid("id").primaryKey(),
  group_id: uuid("group_id").references(() => communityGroups.id, { onDelete: "cascade" }).notNull(),
  user_id: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  role: text("role").notNull().default("member"), // 'admin', 'moderator', 'member'
  status: text("status").notNull().default("active"), // 'active', 'pending', 'banned'
  joined_at: timestamp("joined_at").defaultNow(),
  last_activity: timestamp("last_activity").defaultNow(),
}, (table) => ({
  uniqueMembership: unique("unique_group_membership").on(table.group_id, table.user_id),
}));

// Group-specific posts that don't appear on global feed unless cross-posted
export const groupPosts = pgTable("group_posts", {
  id: uuid("id").primaryKey(),
  group_id: uuid("group_id").references(() => communityGroups.id, { onDelete: "cascade" }).notNull(),
  author_id: uuid("author_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  title: text("title"),
  content: text("content").notNull(),
  images: text("images").array(), // Array of image URLs
  post_type: text("post_type").notNull().default("discussion"), // 'discussion', 'photo', 'question', 'announcement'
  is_pinned: boolean("is_pinned").default(false),
  is_cross_posted: boolean("is_cross_posted").default(false), // If true, appears on global feed
  likes_count: integer("likes_count").default(0),
  comments_count: integer("comments_count").default(0),
  views_count: integer("views_count").default(0),
  tags: text("tags").array(), // Post-specific tags
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Comments on group posts
export const groupPostComments = pgTable("group_post_comments", {
  id: uuid("id").primaryKey(),
  post_id: uuid("post_id").references(() => groupPosts.id, { onDelete: "cascade" }).notNull(),
  author_id: uuid("author_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  parent_comment_id: uuid("parent_comment_id"), // Will reference this table but we can't do circular reference during definition
  likes_count: integer("likes_count").default(0),
  is_pinned: boolean("is_pinned").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Likes on group posts
export const groupPostLikes = pgTable("group_post_likes", {
  id: uuid("id").primaryKey(),
  post_id: uuid("post_id").references(() => groupPosts.id, { onDelete: "cascade" }).notNull(),
  user_id: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueLike: unique("unique_group_post_like").on(table.post_id, table.user_id),
}));

// Likes on group post comments
export const groupCommentLikes = pgTable("group_comment_likes", {
  id: uuid("id").primaryKey(),
  comment_id: uuid("comment_id").references(() => groupPostComments.id, { onDelete: "cascade" }).notNull(),
  user_id: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueLike: unique("unique_group_comment_like").on(table.comment_id, table.user_id),
}));

export const insertCommentLikeSchema = createInsertSchema(commentLikes).omit({ id: true, created_at: true });
export const insertMentionSchema = createInsertSchema(mentions).omit({ id: true, created_at: true });
export const insertPostTagSchema = createInsertSchema(postTags).omit({ id: true, created_at: true });
export const insertPopularTagSchema = createInsertSchema(popularTags).omit({ id: true, created_at: true, updated_at: true });
export const insertSavedPostSchema = createInsertSchema(savedPosts).omit({ id: true, created_at: true });
export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({ id: true, created_at: true });
export const insertReportSchema = createInsertSchema(reports).omit({ id: true, created_at: true });
export const insertFollowSchema = createInsertSchema(follows).omit({ id: true, created_at: true });
export const insertEnhancedNotificationSchema = createInsertSchema(enhancedNotifications).omit({ id: true, created_at: true });
export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({ id: true, created_at: true, updated_at: true });
export const insertCommunityGroupSchema = createInsertSchema(communityGroups).omit({ id: true, created_at: true, updated_at: true });
export const insertGroupMembershipSchema = createInsertSchema(groupMemberships).omit({ id: true, joined_at: true, last_activity: true });
export const insertGroupPostSchema = createInsertSchema(groupPosts).omit({ id: true, created_at: true, updated_at: true });
export const insertGroupPostCommentSchema = createInsertSchema(groupPostComments).omit({ id: true, created_at: true, updated_at: true });
export const insertGroupPostLikeSchema = createInsertSchema(groupPostLikes).omit({ id: true, created_at: true });
export const insertGroupCommentLikeSchema = createInsertSchema(groupCommentLikes).omit({ id: true, created_at: true });

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type PostShare = typeof postShares.$inferSelect;
export type InsertPostShare = z.infer<typeof insertPostShareSchema>;
export type CommentLike = typeof commentLikes.$inferSelect;
export type InsertCommentLike = z.infer<typeof insertCommentLikeSchema>;
export type Mention = typeof mentions.$inferSelect;
export type InsertMention = z.infer<typeof insertMentionSchema>;
export type PostTag = typeof postTags.$inferSelect;
export type InsertPostTag = z.infer<typeof insertPostTagSchema>;
export type PopularTag = typeof popularTags.$inferSelect;
export type InsertPopularTag = z.infer<typeof insertPopularTagSchema>;
export type SavedPost = typeof savedPosts.$inferSelect;
export type InsertSavedPost = z.infer<typeof insertSavedPostSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type EnhancedNotification = typeof enhancedNotifications.$inferSelect;
export type InsertEnhancedNotification = z.infer<typeof insertEnhancedNotificationSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type CommunityGroup = typeof communityGroups.$inferSelect;
export type InsertCommunityGroup = z.infer<typeof insertCommunityGroupSchema>;
export type GroupMembership = typeof groupMemberships.$inferSelect;
export type InsertGroupMembership = z.infer<typeof insertGroupMembershipSchema>;
export type GroupPost = typeof groupPosts.$inferSelect;
export type InsertGroupPost = z.infer<typeof insertGroupPostSchema>;
export type GroupPostComment = typeof groupPostComments.$inferSelect;
export type InsertGroupPostComment = z.infer<typeof insertGroupPostCommentSchema>;
export type GroupPostLike = typeof groupPostLikes.$inferSelect;
export type InsertGroupPostLike = z.infer<typeof insertGroupPostLikeSchema>;
export type GroupCommentLike = typeof groupCommentLikes.$inferSelect;
export type InsertGroupCommentLike = z.infer<typeof insertGroupCommentLikeSchema>;

// Support Tickets Schema
export const supportTickets = pgTable('support_tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => profiles.id),
  category: text('category').notNull(),
  subject: text('subject'),
  description: text('description').notNull(),
  attachment_url: text('attachment_url'),
  status: text('status').notNull().default('open'), // 'open', 'in_progress', 'resolved', 'closed'
  priority: text('priority').notNull().default('medium'), // 'low', 'medium', 'high', 'urgent'
  assigned_admin_id: uuid('assigned_admin_id').references(() => profiles.id),
  admin_notes: text('admin_notes'),
  resolution: text('resolution'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  resolved_at: timestamp('resolved_at'),
});

export const supportTicketReplies = pgTable('support_ticket_replies', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticket_id: uuid('ticket_id').notNull().references(() => supportTickets.id, { onDelete: 'cascade' }),
  author_id: uuid('author_id').notNull().references(() => profiles.id),
  message: text('message').notNull(),
  is_admin_reply: boolean('is_admin_reply').notNull().default(false),
  attachment_url: text('attachment_url'),
  created_at: timestamp('created_at').defaultNow(),
});

// Bug Reports Schema
export const bugReports = pgTable('bug_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => profiles.id),
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  screenshot_url: text('screenshot_url'),
  steps_to_reproduce: text('steps_to_reproduce'),
  expected_behavior: text('expected_behavior'),
  actual_behavior: text('actual_behavior'),
  browser_info: text('browser_info'),
  device_info: text('device_info'),
  status: text('status').notNull().default('open'), // 'open', 'in_progress', 'resolved', 'closed'
  priority: text('priority').notNull().default('medium'), // 'low', 'medium', 'high', 'critical'
  assigned_admin_id: uuid('assigned_admin_id').references(() => profiles.id),
  admin_notes: text('admin_notes'),
  resolution: text('resolution'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  resolved_at: timestamp('resolved_at'),
});

// Support ticket schema exports
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ 
  id: true, 
  created_at: true, 
  updated_at: true,
  resolved_at: true 
});

export const insertSupportTicketReplySchema = createInsertSchema(supportTicketReplies).omit({ 
  id: true, 
  created_at: true 
});

// Bug report schema exports
export const insertBugReportSchema = createInsertSchema(bugReports).omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicketReply = typeof supportTicketReplies.$inferSelect;
export type InsertSupportTicketReply = z.infer<typeof insertSupportTicketReplySchema>;
export type BugReport = typeof bugReports.$inferSelect;
export type InsertBugReport = z.infer<typeof insertBugReportSchema>;

// ===== STORE & ECOMMERCE SCHEMAS =====

// Products table for marketplace items
export const products = pgTable("products", {
  id: text("id").primaryKey(), // Using Stripe product ID as primary key
  name: text("name").notNull(),
  description: text("description"),
  stripe_product_id: text("stripe_product_id"),
  stripe_price_id: text("stripe_price_id"),
  image_url: text("image_url"),
  inventory_qty: integer("inventory_qty").default(0),
  is_subscription: boolean("is_subscription").default(false),
  is_active: boolean("is_active").default(true),
  is_featured: boolean("is_featured").default(false), // Featured products
  tags: text("tags").array(), // Product tags for filtering
  unit_price: text("unit_price").notNull(), // Stored as string to avoid precision issues
  currency: text("currency").default("usd"),
  is_discounted: boolean("is_discounted").default(false), // For sale filtering
  original_price: text("original_price"), // Original price before discount
  sales_count: integer("sales_count").default(0), // For best-selling sorting
  rating: decimal("rating", { precision: 3, scale: 2 }), // Average rating (4.50)
  reviews_count: integer("reviews_count").default(0), // Number of reviews
  category: text("category"), // Product category for filtering
  metadata: jsonb("metadata"), // Store additional Stripe metadata
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Orders table for purchase tracking
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => profiles.id),
  stripe_session_id: text("stripe_session_id"),
  amount_total: decimal("amount_total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending"), // pending, paid, shipped, cancelled
  is_subscription: boolean("is_subscription").default(false),
  // Shipping & tracking fields
  shipping_address: text("shipping_address"),
  tracking_number: text("tracking_number"),
  carrier: text("carrier"), // UPS, FedEx, USPS, etc.
  is_shipped: boolean("is_shipped").default(false),
  shipped_at: timestamp("shipped_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Order items for detailed purchase tracking
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  order_id: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }),
  product_id: text("product_id").references(() => products.id),
  qty: integer("qty").notNull(),
  unit_price: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Subscriptions table for Pup Box tracking
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => profiles.id),
  stripe_subscription_id: text("stripe_subscription_id").unique(),
  status: text("status").default("active"), // active, cancelled, past_due
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Product reviews table for ratings and feedback
export const productReviews = pgTable("product_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  product_id: text("product_id").references(() => products.id, { onDelete: "cascade" }),
  user_id: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"), // Review text (optional)
  is_verified_purchase: boolean("is_verified_purchase").default(false),
  is_hidden: boolean("is_hidden").default(false), // Admin moderation
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Store schema exports
export const insertProductSchema = createInsertSchema(products).omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ 
  id: true, 
  created_at: true 
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

export const insertProductReviewSchema = createInsertSchema(productReviews).omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

// Store type exports
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = z.infer<typeof insertProductReviewSchema>;
