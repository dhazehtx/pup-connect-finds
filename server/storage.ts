import { 
  users, 
  profiles,
  dogListings,
  conversations,
  conversationParticipants,
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
  productReviews,
  petServiceProviders,
  serviceBookings,
  breeds,
  follows,
  postLikes,
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
  type InsertSubscription,
  type ProductReview,
  type InsertProductReview,
  type PetServiceProvider,
  type InsertPetServiceProvider,
  type ServiceBooking,
  type InsertServiceBooking,
  type Breed,
  type InsertBreed
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, ilike, sql, isNotNull, inArray } from "drizzle-orm";

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
  searchProfiles(query: string, options?: { userType?: string; verifiedOnly?: boolean; limit?: number }): Promise<Profile[]>;
  
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
  getConversationDetail(id: string, userId: string): Promise<any>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  getUserConversationsWithDetails(userId: string): Promise<any[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  findOrCreateConversation(actorId: string, targetId: string, listingId?: string | null): Promise<Conversation & { created: boolean }>;
  
  // Message methods
  getConversationMessages(conversationId: string): Promise<Message[]>;
  getConversationMessagesPaginated(conversationId: string, limit: number, before?: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  createMessageWithProfile(message: InsertMessage): Promise<any>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<boolean>;
  getUnreadCount(userId: string): Promise<number>;
  searchMessages(userId: string, query: string): Promise<any[]>;
  deleteUserMessages(userId: string): Promise<boolean>;
  
  // Admin Log methods
  createAdminLog(log: InsertAdminLog): Promise<AdminLog>;
  getAdminLogs(limit?: number): Promise<AdminLog[]>;
  
  // Favorite methods
  getUserFavorites(userId: string): Promise<DogListing[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, listingId: string): Promise<boolean>;
  checkFavorite(userId: string, listingId: string): Promise<boolean>;
  getFavoriteCount(listingId: string): Promise<number>;
  getUserFavoriteIds(userId: string): Promise<string[]>;
  
  // Post likes methods
  getPostLikes(postId: string): Promise<{ count: number; likedByUser: boolean }>;
  checkPostLike(postId: string, userId: string): Promise<boolean>;
  addPostLike(postId: string, userId: string): Promise<void>;
  removePostLike(postId: string, userId: string): Promise<void>;
  getPostLikeCount(postId: string): Promise<number>;
  
  // Review methods
  getListingReviews(listingId: string): Promise<Review[]>;
  getUserReviews(userId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Post methods
  getPosts(category?: string): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  getHomeFeedPosts(userId: string): Promise<any[]>;
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
  getProducts(filters?: { isActive?: boolean; isSubscription?: boolean; featured?: boolean; tag?: string }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductById(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  decrementProductInventory(productId: string, quantity: number): Promise<boolean>;
  
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscription(id: string): Promise<Subscription | undefined>;
  getUserSubscriptions(userId: string): Promise<Subscription[]>;
  
  // Analytics methods
  getAdminAnalytics(): Promise<{
    totalOrders: number;
    totalRevenue: string;
    totalProducts: number;
    pendingOrders: number;
    topProducts: Array<{ name: string; sales_count: number }>;
    recentSales: Array<{ amount_total: string; created_at: string }>;
  }>;
  
  // Product review methods
  getProductReviews(productId: string): Promise<ProductReview[]>;
  createProductReview(review: InsertProductReview): Promise<ProductReview>;
  updateProductReview(id: string, review: Partial<InsertProductReview>): Promise<ProductReview | undefined>;
  updateProductRating(productId: string): Promise<void>;
  
  // Enhanced order methods
  getUserOrdersWithItems(userId: string): Promise<Array<Order & { items: Array<OrderItem & { product: Product | null }> }>>;
  getOrderWithItems(orderId: string): Promise<(Order & { items: Array<OrderItem & { product: Product | null }> }) | undefined>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined>;

  // Breed methods
  getBreeds(): Promise<Breed[]>;
  getBreed(id: number): Promise<Breed | undefined>;
  getBreedByName(name: string): Promise<Breed | undefined>;
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

  async searchProfiles(query: string, options?: { userType?: string; verifiedOnly?: boolean; limit?: number }): Promise<Profile[]> {
    const like = `%${query}%`;
    const conditions = [
      or(
        ilike(profiles.username, like),
        ilike(profiles.full_name, like),
        ilike(profiles.email, like),
        ilike(profiles.location, like)
      )
    ];
    if (options?.userType && options.userType !== 'all') {
      conditions.push(eq(profiles.user_type, options.userType));
    }
    if (options?.verifiedOnly) {
      conditions.push(eq(profiles.verified, true));
    }
    const result = await db.select().from(profiles)
      .where(and(...conditions))
      .limit(options?.limit || 20);
    return result;
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

    const baseQuery = db.select().from(dogListings);
    
    if (conditions.length > 0) {
      return await baseQuery
        .where(and(...conditions))
        .orderBy(desc(dogListings.created_at));
    }

    return await baseQuery.orderBy(desc(dogListings.created_at));
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

  async getConversationDetail(id: string, userId: string): Promise<any> {
    const conv = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
    if (!conv[0]) return undefined;
    const c = conv[0];

    const participants = await db.select({ user_id: conversationParticipants.user_id })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.conversation_id, c.id));
    const isParticipant = participants.some(p => p.user_id === userId);
    if (!isParticipant) return undefined;

    const otherUserId = participants.find(p => p.user_id !== userId)?.user_id || null;
    let otherProfile = null;
    if (otherUserId) {
      const p = await db.select({
        id: profiles.id,
        full_name: profiles.full_name,
        username: profiles.username,
        email: profiles.email,
        avatar_url: profiles.avatar_url,
      }).from(profiles).where(eq(profiles.id, otherUserId)).limit(1);
      otherProfile = p[0] || null;
    }
    let listing = null;
    if (c.listing_id) {
      const l = await db.select({
        id: dogListings.id,
        dog_name: dogListings.dog_name,
        breed: dogListings.breed,
        image_url: dogListings.image_url,
      }).from(dogListings).where(eq(dogListings.id, c.listing_id)).limit(1);
      listing = l[0] || null;
    }
    return {
      ...c,
      other_user: otherProfile ? {
        id: otherProfile.id,
        full_name: otherProfile.full_name || otherProfile.username || otherProfile.email?.split('@')[0] || 'Unknown User',
        avatar_url: otherProfile.avatar_url,
      } : { id: otherUserId, full_name: 'Unknown User', avatar_url: null },
      listing,
    };
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const userConvIds = await db
      .select({ conversation_id: conversationParticipants.conversation_id })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.user_id, userId));
    if (userConvIds.length === 0) return [];
    const convIds = userConvIds.map(r => r.conversation_id);
    return await db.select().from(conversations)
      .where(inArray(conversations.id, convIds))
      .orderBy(desc(conversations.last_message_at));
  }

  async getUserConversationsWithDetails(userId: string): Promise<any[]> {
    const convs = await this.getUserConversations(userId);
    const results = [];
    for (const c of convs) {
      const otherParticipants = await db.select({ user_id: conversationParticipants.user_id })
        .from(conversationParticipants)
        .where(and(
          eq(conversationParticipants.conversation_id, c.id),
          sql`${conversationParticipants.user_id} != ${userId}`
        ));
      const otherUserId = otherParticipants[0]?.user_id || null;
      let otherProfile = null;
      if (otherUserId) {
        const p = await db.select({
          id: profiles.id,
          full_name: profiles.full_name,
          username: profiles.username,
          email: profiles.email,
          avatar_url: profiles.avatar_url,
        }).from(profiles).where(eq(profiles.id, otherUserId)).limit(1);
        otherProfile = p[0] || null;
      }
      let listing = null;
      if (c.listing_id) {
        const l = await db.select({
          id: dogListings.id,
          dog_name: dogListings.dog_name,
          breed: dogListings.breed,
          image_url: dogListings.image_url,
          price: dogListings.price,
        }).from(dogListings).where(eq(dogListings.id, c.listing_id)).limit(1);
        listing = l[0] || null;
      }
      const lastMsgResult = await db.select({
        content: messages.content,
        sender_id: messages.sender_id,
        created_at: messages.created_at,
      }).from(messages)
        .where(eq(messages.conversation_id, c.id))
        .orderBy(desc(messages.created_at))
        .limit(1);
      const unreadResult = await db.select({
        count: sql<number>`count(*)::int`,
      }).from(messages)
        .where(and(
          eq(messages.conversation_id, c.id),
          sql`${messages.sender_id} != ${userId}`,
          eq(messages.read, false)
        ));
      results.push({
        ...c,
        other_user: otherProfile ? {
          id: otherProfile.id,
          full_name: otherProfile.full_name || otherProfile.username || otherProfile.email?.split('@')[0] || 'Unknown User',
          username: otherProfile.username,
          avatar_url: otherProfile.avatar_url,
        } : { id: otherUserId, full_name: 'Unknown User', avatar_url: null },
        listing,
        last_message: lastMsgResult[0] || null,
        unread_count: unreadResult[0]?.count || 0,
      });
    }
    return results;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const result = await db.insert(conversations).values([conversation]).returning();
    return result[0];
  }

  async findOrCreateConversation(actorId: string, targetId: string, listingId?: string | null): Promise<Conversation & { created: boolean }> {
    const cp = conversationParticipants;

    const sharedConvIds = await db
      .select({ conversation_id: cp.conversation_id })
      .from(cp)
      .where(
        sql`${cp.conversation_id} IN (
          SELECT conversation_id FROM conversation_participants WHERE user_id = ${targetId}
        ) AND ${cp.user_id} = ${actorId}`
      );

    if (sharedConvIds.length > 0) {
      const convIds = sharedConvIds.map(r => r.conversation_id);
      const listingCondition = listingId
        ? eq(conversations.listing_id, listingId)
        : sql`${conversations.listing_id} IS NULL`;
      const rows = await db.select().from(conversations)
        .where(and(inArray(conversations.id, convIds), listingCondition))
        .limit(1);
      if (rows[0]) return { ...rows[0], created: false };
    }

    const conv = await db.insert(conversations).values([{
      buyer_id: actorId,
      seller_id: targetId,
      listing_id: listingId || null,
    }]).returning();
    const newConv = conv[0];

    await db.insert(cp).values([
      { conversation_id: newConv.id, user_id: actorId },
      { conversation_id: newConv.id, user_id: targetId },
    ]);

    return { ...newConv, created: true };
  }

  // Message methods
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.conversation_id, conversationId))
      .orderBy(messages.created_at);
  }

  async getConversationMessagesPaginated(conversationId: string, limit: number = 50, before?: string): Promise<Message[]> {
    if (before) {
      return await db.select().from(messages)
        .where(and(
          eq(messages.conversation_id, conversationId),
          sql`${messages.created_at} < (SELECT created_at FROM messages WHERE id = ${before})`
        ))
        .orderBy(desc(messages.created_at))
        .limit(limit);
    }
    return await db.select().from(messages)
      .where(eq(messages.conversation_id, conversationId))
      .orderBy(desc(messages.created_at))
      .limit(limit);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values([message]).returning();
    await db.update(conversations)
      .set({ last_message_at: new Date(), updated_at: new Date() })
      .where(eq(conversations.id, message.conversation_id!));
    return result[0];
  }

  async createMessageWithProfile(message: InsertMessage): Promise<any> {
    const msg = await this.createMessage(message);
    let senderProfile = null;
    if (msg.sender_id) {
      const p = await db.select({
        id: profiles.id,
        full_name: profiles.full_name,
        username: profiles.username,
        email: profiles.email,
        avatar_url: profiles.avatar_url,
      }).from(profiles).where(eq(profiles.id, msg.sender_id)).limit(1);
      senderProfile = p[0] || null;
    }
    return { ...msg, sender_profile: senderProfile };
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<boolean> {
    const result = await db.update(messages)
      .set({ read: true })
      .where(and(
        eq(messages.conversation_id, conversationId),
        sql`${messages.sender_id} != ${userId}`,
        eq(messages.read, false)
      ));
    return (result.rowCount ?? 0) >= 0;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const userConvs = await db.select({ conversation_id: conversationParticipants.conversation_id })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.user_id, userId));
    if (userConvs.length === 0) return 0;
    const convIds = userConvs.map(c => c.conversation_id);
    const result = await db.select({
      count: sql<number>`count(*)::int`,
    }).from(messages)
      .where(and(
        inArray(messages.conversation_id, convIds),
        sql`${messages.sender_id} != ${userId}`,
        eq(messages.read, false)
      ));
    return result[0]?.count || 0;
  }

  async searchMessages(userId: string, query: string): Promise<any[]> {
    const userConvs = await db.select({ conversation_id: conversationParticipants.conversation_id })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.user_id, userId));
    if (userConvs.length === 0) return [];
    const convIds = userConvs.map(c => c.conversation_id);
    return await db.select().from(messages)
      .where(and(
        inArray(messages.conversation_id, convIds),
        sql`${messages.content} ILIKE ${'%' + query + '%'}`
      ))
      .orderBy(desc(messages.created_at))
      .limit(50);
  }

  async deleteUserMessages(userId: string): Promise<boolean> {
    const result = await db.delete(messages).where(eq(messages.sender_id, userId));
    return (result.rowCount ?? 0) >= 0;
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
      title: dogListings.title,
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

  async checkFavorite(userId: string, listingId: string): Promise<boolean> {
    const result = await db.select({ id: favorites.id })
      .from(favorites)
      .where(and(eq(favorites.user_id, userId), eq(favorites.listing_id, listingId)))
      .limit(1);
    return result.length > 0;
  }

  async getFavoriteCount(listingId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` })
      .from(favorites)
      .where(eq(favorites.listing_id, listingId));
    return result[0]?.count ?? 0;
  }

  async getUserFavoriteIds(userId: string): Promise<string[]> {
    const result = await db.select({ listing_id: favorites.listing_id })
      .from(favorites)
      .where(eq(favorites.user_id, userId));
    return result.map(r => r.listing_id);
  }

  // Post likes methods
  async getPostLikes(postId: string): Promise<{ count: number; likedByUser: boolean }> {
    const countResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(postLikes)
      .where(eq(postLikes.post_id, postId));
    return { count: countResult[0]?.count ?? 0, likedByUser: false };
  }

  async checkPostLike(postId: string, userId: string): Promise<boolean> {
    const result = await db.select({ id: postLikes.id })
      .from(postLikes)
      .where(and(eq(postLikes.post_id, postId), eq(postLikes.user_id, userId)))
      .limit(1);
    return result.length > 0;
  }

  async addPostLike(postId: string, userId: string): Promise<void> {
    await db.insert(postLikes).values({ post_id: postId, user_id: userId }).onConflictDoNothing();
  }

  async removePostLike(postId: string, userId: string): Promise<void> {
    await db.delete(postLikes)
      .where(and(eq(postLikes.post_id, postId), eq(postLikes.user_id, userId)));
  }

  async getPostLikeCount(postId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` })
      .from(postLikes)
      .where(eq(postLikes.post_id, postId));
    return result[0]?.count ?? 0;
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
    const baseQuery = db.select().from(posts);
    if (category) {
      return await baseQuery.where(eq(posts.category, category)).orderBy(desc(posts.created_at));
    }
    return await baseQuery.orderBy(desc(posts.created_at));
  }

  async getPost(id: string): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0];
  }

  async getHomeFeedPosts(userId: string): Promise<any[]> {
    const followedRows = await db
      .select({ followed_id: follows.followed_id })
      .from(follows)
      .where(eq(follows.follower_id, userId));

    const feedUserIds = followedRows.map(r => r.followed_id).filter(id => id !== userId);

    if (feedUserIds.length === 0) {
      return [];
    }

    const result = await db
      .select({
        id: posts.id,
        user_id: posts.user_id,
        title: posts.title,
        content: posts.content,
        image_url: posts.image_url,
        images: posts.images,
        video_url: posts.video_url,
        videos: posts.videos,
        post_type: posts.post_type,
        category: posts.category,
        hashtags: posts.hashtags,
        caption: posts.caption,
        likes_count: posts.likes_count,
        comments_count: posts.comments_count,
        shares_count: posts.shares_count,
        views_count: posts.views_count,
        duration: posts.duration,
        created_at: posts.created_at,
        updated_at: posts.updated_at,
        profiles: {
          username: profiles.username,
          full_name: profiles.full_name,
          avatar_url: profiles.avatar_url,
        },
      })
      .from(posts)
      .leftJoin(profiles, eq(posts.user_id, profiles.id))
      .where(inArray(posts.user_id, feedUserIds))
      .orderBy(desc(posts.created_at))
      .limit(50);

    return result;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values([post]).returning();
    return result[0];
  }

  async updatePost(id: string, post: Partial<InsertPost>): Promise<Post | undefined> {
    const result = await db.update(posts).set(post).where(eq(posts.id, id)).returning();
    return result[0];
  }

  async deletePost(id: string): Promise<boolean> {
    await db.delete(comments).where(eq(comments.post_id, id));
    const result = await db.delete(posts).where(eq(posts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getPostWithProfile(id: string): Promise<any | undefined> {
    const result = await db
      .select({
        id: posts.id,
        user_id: posts.user_id,
        title: posts.title,
        content: posts.content,
        image_url: posts.image_url,
        images: posts.images,
        video_url: posts.video_url,
        videos: posts.videos,
        post_type: posts.post_type,
        category: posts.category,
        hashtags: posts.hashtags,
        caption: posts.caption,
        likes_count: posts.likes_count,
        comments_count: posts.comments_count,
        shares_count: posts.shares_count,
        views_count: posts.views_count,
        duration: posts.duration,
        created_at: posts.created_at,
        updated_at: posts.updated_at,
        profiles: {
          username: profiles.username,
          full_name: profiles.full_name,
          avatar_url: profiles.avatar_url,
        },
      })
      .from(posts)
      .leftJoin(profiles, eq(posts.user_id, profiles.id))
      .where(eq(posts.id, id))
      .limit(1);
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

  async updateComment(id: string, content: string): Promise<Comment | undefined> {
    const result = await db.update(comments).set({ content, updated_at: new Date() }).where(eq(comments.id, id)).returning();
    return result[0];
  }

  async deleteComment(id: string): Promise<boolean> {
    await db.delete(commentReplies).where(eq(commentReplies.comment_id, id));
    const result = await db.delete(comments).where(eq(comments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getCommentCount(postId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(comments).where(eq(comments.post_id, postId));
    return Number(result[0]?.count || 0);
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
      .where(eq(notifications.to_user_id, userId))
      .orderBy(desc(notifications.created_at));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values([notification]).returning();
    return result[0];
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const result = await db.update(notifications).set({ is_read: true }).where(eq(notifications.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Transaction methods
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    // Generate a unique ID for the transaction (since it's text type for Stripe IDs)
    const transactionWithId = { 
      ...transaction, 
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` 
    };
    const result = await db.insert(transactions).values([transactionWithId]).returning();
    return result[0];
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
    return result[0];
  }

  async getUserTransactions(userId: string, type?: string): Promise<Transaction[]> {
    const conditions = [eq(transactions.user_id, userId)];
    
    if (type) {
      conditions.push(eq(transactions.type, type));
    }
    
    return await db.select().from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.created_at));
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
    await db.delete(messages).where(eq(messages.conversation_id, id));
    await db.delete(conversationParticipants).where(eq(conversationParticipants.conversation_id, id));
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
  async getProducts(filters?: { isActive?: boolean; isSubscription?: boolean; featured?: boolean; tag?: string }): Promise<Product[]> {
    console.log("Storage getProducts - Received filters:", filters);
    
    const conditions = [];
    
    // Only filter by is_active if explicitly provided
    if (filters?.isActive !== undefined) {
      console.log("Storage getProducts - Adding isActive filter:", filters.isActive);
      conditions.push(eq(products.is_active, filters.isActive));
    }
    
    if (filters?.isSubscription !== undefined) {
      console.log("Storage getProducts - Adding isSubscription filter:", filters.isSubscription);
      conditions.push(eq(products.is_subscription, filters.isSubscription));
    }
    if (filters?.featured !== undefined) {
      console.log("Storage getProducts - Adding featured filter:", filters.featured);
      conditions.push(eq(products.is_featured, filters.featured));
    }
    if (filters?.tag) {
      console.log("Storage getProducts - Adding tag filter:", filters.tag);
      conditions.push(sql`${products.tags} @> ARRAY[${filters.tag}]`);
    }
    
    console.log("Storage getProducts - Executing query with", conditions.length, "conditions");
    
    const baseQuery = db.select().from(products);
    if (conditions.length > 0) {
      const result = await baseQuery
        .where(and(...conditions))
        .orderBy(desc(products.created_at));
      console.log("Storage getProducts - Found", result.length, "products");
      return result;
    }
    
    const result = await baseQuery.orderBy(desc(products.created_at));
    console.log("Storage getProducts - Found", result.length, "products");
    return result;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return await this.getProduct(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    // Generate a unique ID for the product (since it's text type for Stripe product IDs)
    const productWithId = { 
      ...product, 
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` 
    };
    const result = await db.insert(products).values([productWithId]).returning();
    return result[0];
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return result[0];
  }

  async decrementProductInventory(productId: string, quantity: number): Promise<boolean> {
    try {
      const result = await db.update(products)
        .set({ 
          inventory_qty: sql`${products.inventory_qty} - ${quantity}`,
          updated_at: new Date()
        })
        .where(eq(products.id, productId))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error decrementing inventory:', error);
      return false;
    }
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

  // Analytics implementation
  async getAdminAnalytics(): Promise<{
    totalOrders: number;
    totalRevenue: string;
    totalProducts: number;
    pendingOrders: number;
    topProducts: Array<{ name: string; sales_count: number }>;
    recentSales: Array<{ amount_total: string; created_at: string }>;
  }> {
    try {
      // Get total orders count
      const totalOrdersResult = await db.select({ count: sql<number>`count(*)` }).from(orders);
      const totalOrders = totalOrdersResult[0]?.count || 0;

      // Get total revenue (sum of paid orders)
      const revenueResult = await db.select({ 
        revenue: sql<string>`coalesce(sum(${orders.amount_total}), 0)` 
      }).from(orders).where(eq(orders.status, 'paid'));
      const totalRevenue = revenueResult[0]?.revenue || '0';

      // Get total products count
      const productsResult = await db.select({ count: sql<number>`count(*)` }).from(products);
      const totalProducts = productsResult[0]?.count || 0;

      // Get pending orders count
      const pendingResult = await db.select({ count: sql<number>`count(*)` })
        .from(orders).where(eq(orders.status, 'pending'));
      const pendingOrders = pendingResult[0]?.count || 0;

      // Get top 5 products by sales count
      const topProducts = await db.select({
        name: products.name,
        sales_count: products.sales_count
      }).from(products)
        .where(isNotNull(products.sales_count))
        .orderBy(desc(products.sales_count))
        .limit(5);

      // Get recent 10 sales
      const recentSales = await db.select({
        amount_total: orders.amount_total,
        created_at: orders.created_at
      }).from(orders)
        .where(eq(orders.status, 'paid'))
        .orderBy(desc(orders.created_at))
        .limit(10);

      return {
        totalOrders,
        totalRevenue,
        totalProducts,
        pendingOrders,
        topProducts: topProducts.map(p => ({ 
          name: p.name, 
          sales_count: p.sales_count || 0 
        })),
        recentSales: recentSales.map(s => ({
          amount_total: s.amount_total.toString(),
          created_at: s.created_at?.toISOString() || ''
        }))
      };
    } catch (error) {
      console.error('Error fetching admin analytics:', error);
      return {
        totalOrders: 0,
        totalRevenue: '0',
        totalProducts: 0,
        pendingOrders: 0,
        topProducts: [],
        recentSales: []
      };
    }
  }

  // Product review methods implementation
  async getProductReviews(productId: string): Promise<ProductReview[]> {
    return await db.select()
      .from(productReviews)
      .where(and(
        eq(productReviews.product_id, productId),
        eq(productReviews.is_hidden, false)
      ))
      .orderBy(desc(productReviews.created_at));
  }

  async createProductReview(review: InsertProductReview): Promise<ProductReview> {
    const result = await db.insert(productReviews).values([review]).returning();
    return result[0];
  }

  async updateProductReview(id: string, review: Partial<InsertProductReview>): Promise<ProductReview | undefined> {
    const result = await db.update(productReviews)
      .set(review)
      .where(eq(productReviews.id, id))
      .returning();
    return result[0];
  }

  async updateProductRating(productId: string): Promise<void> {
    try {
      // Calculate average rating for the product
      const reviews = await db.select({ rating: productReviews.rating })
        .from(productReviews)
        .where(and(
          eq(productReviews.product_id, productId),
          eq(productReviews.is_hidden, false)
        ));

      if (reviews.length === 0) {
        // No reviews, reset rating
        await db.update(products)
          .set({ 
            rating: null, 
            reviews_count: 0,
            updated_at: new Date()
          })
          .where(eq(products.id, productId));
        return;
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = (totalRating / reviews.length).toFixed(2);

      await db.update(products)
        .set({ 
          rating: averageRating, 
          reviews_count: reviews.length,
          updated_at: new Date()
        })
        .where(eq(products.id, productId));
    } catch (error) {
      console.error('Error updating product rating:', error);
    }
  }

  // Enhanced order methods implementation
  async getUserOrdersWithItems(userId: string): Promise<Array<Order & { items: Array<OrderItem & { product: Product | null }> }>> {
    const userOrders = await db.select().from(orders)
      .where(eq(orders.user_id, userId))
      .orderBy(desc(orders.created_at));

    const ordersWithItems = [];
    for (const order of userOrders) {
      const items = await db.select({
        id: orderItems.id,
        order_id: orderItems.order_id,
        product_id: orderItems.product_id,
        qty: orderItems.qty,
        unit_price: orderItems.unit_price,
        created_at: orderItems.created_at,
        product: products
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.product_id, products.id))
      .where(eq(orderItems.order_id, order.id));

      ordersWithItems.push({ ...order, items });
    }

    return ordersWithItems;
  }

  async getOrderWithItems(orderId: string): Promise<(Order & { items: Array<OrderItem & { product: Product | null }> }) | undefined> {
    const order = await db.select().from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order[0]) return undefined;

    const items = await db.select({
      id: orderItems.id,
      order_id: orderItems.order_id,
      product_id: orderItems.product_id,
      qty: orderItems.qty,
      unit_price: orderItems.unit_price,
      created_at: orderItems.created_at,
      product: products
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.product_id, products.id))
    .where(eq(orderItems.order_id, orderId));

    return { ...order[0], items };
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set({ ...order, updated_at: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  async updateShippingInfo(orderId: string, shippingData: { tracking_number?: string; carrier?: string; is_shipped?: boolean }): Promise<boolean> {
    const updateData: any = { ...shippingData, updated_at: new Date() };
    
    // If marking as shipped, set shipped_at timestamp
    if (shippingData.is_shipped === true) {
      updateData.shipped_at = new Date();
    }

    const result = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId));
    
    return (result.rowCount ?? 0) > 0;
  }

  // ===== PET SERVICES METHODS =====

  async createServiceProvider(data: InsertPetServiceProvider): Promise<PetServiceProvider> {
    const [provider] = await db
      .insert(petServiceProviders)
      .values(data)
      .returning();
    return provider;
  }

  async getServiceProviders(filters?: { 
    isVerified?: boolean; 
    serviceType?: string; 
    location?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<PetServiceProvider[]> {
    const conditions = [];
    if (filters?.isVerified !== undefined) {
      conditions.push(eq(petServiceProviders.is_verified, filters.isVerified));
    }
    if (filters?.serviceType) {
      conditions.push(eq(petServiceProviders.service_type, filters.serviceType));
    }
    if (filters?.location) {
      conditions.push(sql`${petServiceProviders.location} ILIKE ${`%${filters.location}%`}`);
    }
    if (filters?.minPrice !== undefined) {
      conditions.push(sql`${petServiceProviders.price}::numeric >= ${filters.minPrice}`);
    }
    if (filters?.maxPrice !== undefined) {
      conditions.push(sql`${petServiceProviders.price}::numeric <= ${filters.maxPrice}`);
    }
    
    const baseQuery = db.select().from(petServiceProviders);
    
    if (conditions.length > 0) {
      return await baseQuery
        .where(and(...conditions))
        .orderBy(desc(petServiceProviders.created_at));
    }
    
    return await baseQuery.orderBy(desc(petServiceProviders.created_at));
  }

  async getServiceProviderById(id: string): Promise<PetServiceProvider | null> {
    const [provider] = await db
      .select()
      .from(petServiceProviders)
      .where(eq(petServiceProviders.id, id))
      .limit(1);
    return provider || null;
  }

  async updateServiceProviderStatus(id: string, status: string, isVerified: boolean): Promise<boolean> {
    const result = await db
      .update(petServiceProviders)
      .set({
        verification_status: status,
        is_verified: isVerified,
        updated_at: new Date(),
      })
      .where(eq(petServiceProviders.id, id));
    
    return (result.rowCount ?? 0) > 0;
  }

  async createServiceBooking(data: InsertServiceBooking): Promise<ServiceBooking> {
    const [booking] = await db
      .insert(serviceBookings)
      .values(data)
      .returning();
    return booking;
  }

  async getServiceBookingsByUser(userId: string): Promise<ServiceBooking[]> {
    return await db
      .select()
      .from(serviceBookings)
      .where(eq(serviceBookings.user_id, userId))
      .orderBy(desc(serviceBookings.created_at));
  }

  async getServiceBookingsByProvider(providerId: string): Promise<ServiceBooking[]> {
    return await db
      .select()
      .from(serviceBookings)
      .where(eq(serviceBookings.provider_id, providerId))
      .orderBy(desc(serviceBookings.created_at));
  }

  // Breed methods implementation
  async getBreeds(): Promise<Breed[]> {
    return await db
      .select()
      .from(breeds)
      .orderBy(breeds.name);
  }

  async getBreed(id: number): Promise<Breed | undefined> {
    const result = await db
      .select()
      .from(breeds)
      .where(eq(breeds.id, id))
      .limit(1);
    return result[0];
  }

  async getBreedByName(name: string): Promise<Breed | undefined> {
    const result = await db
      .select()
      .from(breeds)
      .where(eq(breeds.name, name))
      .limit(1);
    return result[0];
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
