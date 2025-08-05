import { 
  users, 
  profiles,
  dogListings,
  conversations,
  messages,
  favorites,
  reviews,
  posts,
  comments,
  commentReplies,
  notifications,
  transactions,
  adminLogs,
  products,
  orders,
  orderItems,
  subscriptions,
  type User, 
  type InsertUser,
  type Profile,
  type InsertProfile,
  type DogListing,
  type InsertDogListing,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Favorite,
  type InsertFavorite,
  type Review,
  type InsertReview,
  type Post,
  type InsertPost,
  type Comment,
  type InsertComment,
  type CommentReply,
  type InsertCommentReply,
  type Notification,
  type InsertNotification,
  type Transaction,
  type InsertTransaction,
  type AdminLog,
  type InsertAdminLog,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Subscription,
  type InsertSubscription
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql, isNotNull } from "drizzle-orm";

export interface IStorage {
  // Legacy user methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Profile methods
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByUsername(username: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, profile: Partial<InsertProfile>): Promise<Profile | undefined>;
  
  // Dog listing methods
  getDogListing(id: string): Promise<DogListing | undefined>;
  getDogListings(filters?: {
    breed?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    status?: string;
    userId?: string;
  }): Promise<DogListing[]>;
  createDogListing(listing: InsertDogListing): Promise<DogListing>;
  updateDogListing(id: string, listing: Partial<InsertDogListing>): Promise<DogListing | undefined>;
  deleteDogListing(id: string): Promise<boolean>;
  
  // Conversation methods
  getConversation(id: string): Promise<Conversation | undefined>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  
  // Message methods
  getConversationMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<boolean>;
  
  // Admin Log methods
  createAdminLog(log: InsertAdminLog): Promise<AdminLog>;
  getAdminLogs(limit?: number): Promise<AdminLog[]>;
  
  // Favorite methods
  getUserFavorites(userId: string): Promise<DogListing[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, listingId: string): Promise<boolean>;
  
  // Review methods
  getListingReviews(listingId: string): Promise<Review[]>;
  getUserReviews(userId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Post methods
  getPosts(category?: string): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, post: Partial<InsertPost>): Promise<Post | undefined>;
  
  // Comment methods
  getPostComments(postId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Comment reply methods
  getCommentReplies(commentId: string): Promise<CommentReply[]>;
  createCommentReply(reply: InsertCommentReply): Promise<CommentReply>;
  
  // Comment reply methods
  getCommentReplies(commentId: string): Promise<CommentReply[]>;
  createCommentReply(reply: InsertCommentReply): Promise<CommentReply>;
  
  // Notification methods
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<boolean>;
  
  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  getUserTransactions(userId: string, type?: string): Promise<Transaction[]>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<boolean>;
  
  // Additional methods needed by routes
  getUserListings(userId: string): Promise<DogListing[]>;
  getMessages(conversationId: string): Promise<Message[]>;
  getUserPosts(userId: string): Promise<Post[]>;
  getUserComments(userId: string): Promise<Comment[]>;
  deleteConversation(id: string): Promise<boolean>;
  deleteListing(id: string): Promise<boolean>;
  deleteUserPosts(userId: string): Promise<boolean>;
  deleteUserComments(userId: string): Promise<boolean>;
  deleteProfile(id: string): Promise<boolean>;

  // Store/Ecommerce methods
  getProducts(filters?: { isActive?: boolean; isSubscription?: boolean }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductById(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscription(id: string): Promise<Subscription | undefined>;
  getUserSubscriptions(userId: string): Promise<Subscription[]>;
}

export class DatabaseStorage implements IStorage {
  // Legacy user methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Profile methods
  async getProfile(id: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    return result[0];
  }

  async getProfileByUsername(username: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.username, username)).limit(1);
    return result[0];
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const result = await db.insert(profiles).values([profile]).returning();
    return result[0];
  }

  async updateProfile(id: string, profile: Partial<InsertProfile>): Promise<Profile | undefined> {
    const result = await db.update(profiles).set(profile).where(eq(profiles.id, id)).returning();
    return result[0];
  }

  // Dog listing methods
  async getDogListing(id: string): Promise<DogListing | undefined> {
    const result = await db.select().from(dogListings).where(eq(dogListings.id, id)).limit(1);
    return result[0];
  }

  async getDogListings(filters?: {
    breed?: string;
    breeds?: string[];
    minPrice?: number;
    maxPrice?: number;
    minAge?: number;
    maxAge?: number;
    location?: string;
    gender?: string;
    status?: string;
    userId?: string;
    verifiedOnly?: boolean;
    healthTested?: boolean;
    vaccinated?: boolean;
  }): Promise<DogListing[]> {
    let query = db.select().from(dogListings);
    const conditions = [];

    if (filters?.breed) {
      conditions.push(like(dogListings.breed, `%${filters.breed}%`));
    }
    if (filters?.breeds && filters.breeds.length > 0) {
      const breedConditions = filters.breeds.map(breed => 
        like(dogListings.breed, `%${breed}%`)
      );
      conditions.push(or(...breedConditions));
    }
    if (filters?.minPrice !== undefined) {
      conditions.push(sql`${dogListings.price}::numeric >= ${filters.minPrice}`);
    }
    if (filters?.maxPrice !== undefined) {
      conditions.push(sql`${dogListings.price}::numeric <= ${filters.maxPrice}`);
    }
    if (filters?.minAge !== undefined) {
      conditions.push(sql`${dogListings.age}::integer >= ${filters.minAge}`);
    }
    if (filters?.maxAge !== undefined) {
      conditions.push(sql`${dogListings.age}::integer <= ${filters.maxAge}`);
    }
    if (filters?.location) {
      conditions.push(like(dogListings.location, `%${filters.location}%`));
    }
    if (filters?.gender && filters.gender !== 'all') {
      conditions.push(eq(dogListings.gender, filters.gender));
    }
    if (filters?.status) {
      conditions.push(eq(dogListings.status, filters.status));
    }
    if (filters?.userId) {
      conditions.push(eq(dogListings.user_id, filters.userId));
    }
    // Note: verified and health_tested columns don't exist in current schema
    // Skip these filters for now
    if (filters?.vaccinated) {
      conditions.push(eq(dogListings.vaccinated, true));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(dogListings.created_at));
  }

  async createDogListing(listing: InsertDogListing): Promise<DogListing> {
    const result = await db.insert(dogListings).values([listing]).returning();
    return result[0];
  }

  async updateDogListing(id: string, listing: Partial<InsertDogListing>): Promise<DogListing | undefined> {
    const result = await db.update(dogListings).set(listing).where(eq(dogListings.id, id)).returning();
    return result[0];
  }

  async deleteDogListing(id: string): Promise<boolean> {
    const result = await db.delete(dogListings).where(eq(dogListings.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Conversation methods
  async getConversation(id: string): Promise<Conversation | undefined> {
    const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
    return result[0];
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await db.select().from(conversations)
      .where(or(eq(conversations.buyer_id, userId), eq(conversations.seller_id, userId)))
      .orderBy(desc(conversations.last_message_at));
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const result = await db.insert(conversations).values([conversation]).returning();
    return result[0];
  }

  // Message methods
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.conversation_id, conversationId))
      .orderBy(messages.created_at);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values([message]).returning();
    return result[0];
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<boolean> {
    const result = await db.update(messages)
      .set({ read: true })
      .where(and(eq(messages.conversation_id, conversationId), eq(messages.sender_id, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Favorite methods
  async getUserFavorites(userId: string): Promise<DogListing[]> {
    const result = await db.select({
      id: dogListings.id,
      user_id: dogListings.user_id,
      dog_name: dogListings.dog_name,
      breed: dogListings.breed,
      age: dogListings.age,
      gender: dogListings.gender,
      color: dogListings.color,
      size: dogListings.size,
      price: dogListings.price,
      description: dogListings.description,
      location: dogListings.location,
      image_url: dogListings.image_url,
      images: dogListings.images,
      video_url: dogListings.video_url,
      videos: dogListings.videos,
      vaccinated: dogListings.vaccinated,
      neutered_spayed: dogListings.neutered_spayed,
      good_with_kids: dogListings.good_with_kids,
      good_with_dogs: dogListings.good_with_dogs,
      special_needs: dogListings.special_needs,
      delivery_available: dogListings.delivery_available,
      rehoming: dogListings.rehoming,
      status: dogListings.status,
      listing_status: dogListings.listing_status,
      created_at: dogListings.created_at,
      updated_at: dogListings.updated_at,
    })
    .from(favorites)
    .innerJoin(dogListings, eq(favorites.listing_id, dogListings.id))
    .where(eq(favorites.user_id, userId));
    return result;
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const result = await db.insert(favorites).values([favorite]).returning();
    return result[0];
  }

  async removeFavorite(userId: string, listingId: string): Promise<boolean> {
    const result = await db.delete(favorites)
      .where(and(eq(favorites.user_id, userId), eq(favorites.listing_id, listingId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Review methods
  async getListingReviews(listingId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.listing_id, listingId));
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.reviewee_id, userId));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values([review]).returning();
    return result[0];
  }

  // Post methods
  async getPosts(category?: string): Promise<Post[]> {
    let query = db.select().from(posts);
    if (category) {
      query = query.where(eq(posts.category, category));
    }
    return await query.orderBy(desc(posts.created_at));
  }

  async getPost(id: string): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0];
  }

  async createPost(post: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values([post]).returning();
    return result[0];
  }

  async updatePost(id: string, post: Partial<InsertPost>): Promise<Post | undefined> {
    const result = await db.update(posts).set(post).where(eq(posts.id, id)).returning();
    return result[0];
  }

  // Comment methods
  async getPostComments(postId: string): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.post_id, postId)).orderBy(comments.created_at);
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const result = await db.insert(comments).values([comment]).returning();
    return result[0];
  }

  // Comment reply methods
  async getCommentReplies(commentId: string): Promise<CommentReply[]> {
    return await db.select().from(commentReplies)
      .where(eq(commentReplies.comment_id, commentId))
      .orderBy(commentReplies.created_at);
  }

  async createCommentReply(reply: InsertCommentReply): Promise<CommentReply> {
    const result = await db.insert(commentReplies).values([reply]).returning();
    return result[0];
  }

  // Notification methods
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.user_id, userId))
      .orderBy(desc(notifications.created_at));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values([notification]).returning();
    return result[0];
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const result = await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Transaction methods
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values([transaction]).returning();
    return result[0];
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
    return result[0];
  }

  async getUserTransactions(userId: string, type?: string): Promise<Transaction[]> {
    let query = db.select().from(transactions).where(eq(transactions.user_id, userId));
    if (type) {
      query = query.where(and(eq(transactions.user_id, userId), eq(transactions.type, type)));
    }
    return await query.orderBy(desc(transactions.created_at));
  }

  async updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const result = await db.update(transactions).set(transaction).where(eq(transactions.id, id)).returning();
    return result[0];
  }

  // Admin Log methods
  async createAdminLog(log: InsertAdminLog): Promise<AdminLog> {
    const result = await db.insert(adminLogs).values([log]).returning();
    return result[0];
  }

  async getAdminLogs(limit: number = 100): Promise<AdminLog[]> {
    return await db.select().from(adminLogs)
      .orderBy(desc(adminLogs.created_at))
      .limit(limit);
  }

  // Additional methods needed by routes
  async getUserListings(userId: string): Promise<DogListing[]> {
    return await db.select().from(dogListings)
      .where(eq(dogListings.user_id, userId))
      .orderBy(desc(dogListings.created_at));
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return await this.getConversationMessages(conversationId);
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return await db.select().from(posts)
      .where(eq(posts.user_id, userId))
      .orderBy(desc(posts.created_at));
  }

  async getUserComments(userId: string): Promise<Comment[]> {
    return await db.select().from(comments)
      .where(eq(comments.user_id, userId))
      .orderBy(desc(comments.created_at));
  }

  async deleteConversation(id: string): Promise<boolean> {
    const result = await db.delete(conversations).where(eq(conversations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteListing(id: string): Promise<boolean> {
    return await this.deleteDogListing(id);
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const result = await db.delete(transactions).where(eq(transactions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteUserPosts(userId: string): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.user_id, userId));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteUserComments(userId: string): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.user_id, userId));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteProfile(id: string): Promise<boolean> {
    const result = await db.delete(profiles).where(eq(profiles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Store/Ecommerce methods
  async getProducts(filters?: { isActive?: boolean; isSubscription?: boolean }): Promise<Product[]> {
    let query = db.select().from(products);
    
    // Always filter for active products with Stripe backing
    const conditions = [
      eq(products.is_active, true),
      isNotNull(products.stripe_price_id)
    ];
    
    if (filters?.isSubscription !== undefined) {
      conditions.push(eq(products.is_subscription, filters.isSubscription));
    }
    
    query = query.where(and(...conditions));
    return await query.orderBy(products.name);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return await this.getProduct(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values([product]).returning();
    return result[0];
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values([order]).returning();
    return result[0];
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.user_id, userId))
      .orderBy(desc(orders.created_at));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItems).values([orderItem]).returning();
    return result[0];
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems)
      .where(eq(orderItems.order_id, orderId));
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const result = await db.insert(subscriptions).values([subscription]).returning();
    return result[0];
  }

  async getSubscription(id: string): Promise<Subscription | undefined> {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1);
    return result[0];
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return await db.select().from(subscriptions)
      .where(eq(subscriptions.user_id, userId))
      .orderBy(desc(subscriptions.created_at));
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
