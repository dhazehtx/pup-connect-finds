import { sql } from 'drizzle-orm';

// Query optimization utilities for better database performance
export const queryOptimizations = {
  // Pagination helper with cursor-based pagination for better performance
  createCursorPagination: (
    baseQuery: any,
    cursor?: string,
    limit: number = 20,
    orderField: string = 'created_at'
  ) => {
    let query = baseQuery.limit(limit + 1); // +1 to check if there are more results

    if (cursor) {
      query = query.where(sql`${orderField} < ${cursor}`);
    }

    return query.orderBy(sql`${orderField} DESC`);
  },

  // Create database indexes for common queries
  getRecommendedIndexes: () => {
    return [
      // Listings table indexes
      'CREATE INDEX IF NOT EXISTS idx_listings_breed ON listings(breed);',
      'CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);',
      'CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);',
      'CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);',
      'CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);',
      
      // Messages table indexes
      'CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);',
      'CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);',
      'CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);',
      
      // Conversations table indexes
      'CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN(participants);',
      'CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);',
      
      // Users table indexes
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);',
      'CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);',
      
      // Notifications table indexes
      'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);',
      'CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);',
      
      // Reviews table indexes
      'CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);',
      'CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);',
      'CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);',
      
      // Composite indexes for common query patterns
      'CREATE INDEX IF NOT EXISTS idx_listings_breed_price ON listings(breed, price);',
      'CREATE INDEX IF NOT EXISTS idx_listings_location_breed ON listings(location, breed);',
      'CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);'
    ];
  },

  // Query performance monitoring
  logSlowQueries: (query: string, duration: number, threshold: number = 1000) => {
    if (duration > threshold) {
      console.warn(`Slow query detected (${duration}ms):`, query);
    }
  },

  // Batch operations for better performance
  createBatchProcessor: <T>(
    batchSize: number = 100,
    processor: (batch: T[]) => Promise<any>
  ) => {
    const queue: T[] = [];
    let processing = false;

    const processBatch = async () => {
      if (processing || queue.length === 0) return;
      
      processing = true;
      const batch = queue.splice(0, batchSize);
      
      try {
        await processor(batch);
      } catch (error) {
        console.error('Batch processing error:', error);
      } finally {
        processing = false;
        
        // Process next batch if queue has items
        if (queue.length > 0) {
          setTimeout(processBatch, 10);
        }
      }
    };

    return {
      add: (item: T) => {
        queue.push(item);
        processBatch();
      },
      flush: () => processBatch()
    };
  }
};