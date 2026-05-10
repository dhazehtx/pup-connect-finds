// @ts-nocheck
import express from 'express';
import { queryOptimizations } from '../utils/queryOptimization';
import { performanceMiddleware, timeQuery, trackCache } from '../middleware/performanceMiddleware';
import { db } from '../db';
import { dogListings, profiles, messages, conversations } from '@shared/schema';
import { eq, desc, and, sql, like, gte, lte } from 'drizzle-orm';

const router = express.Router();

// Apply performance middleware to all routes
router.use(performanceMiddleware);

// Optimized listings endpoint with pagination and caching
router.get('/listings', async (req, res) => {
  try {
    const {
      cursor,
      limit = '20',
      search,
      breed,
      minPrice,
      maxPrice,
      location
    } = req.query;

    const pageLimit = Math.min(parseInt(limit as string), 50); // Max 50 items per page

    // Build cache key
    const cacheKey = `listings_${search || ''}_${breed || ''}_${minPrice || ''}_${maxPrice || ''}_${location || ''}_${cursor || ''}`;
    
    // Try cache first
    const cached = await getCachedData(cacheKey);
    if (cached) {
      trackCache(true, req);
      return res.json(cached);
    }

    trackCache(false, req);

    const result = await timeQuery('fetch_listings', async () => {
      let query = db
        .select({
          id: dogListings.id,
          title: dogListings.dog_name,
          breed: dogListings.breed,
          price: dogListings.price,
          location: dogListings.location,
          image_url: dogListings.image_url,
          seller_name: profiles.full_name,
          age: dogListings.age,
          gender: dogListings.gender,
          created_at: dogListings.created_at
        })
        .from(dogListings)
        .leftJoin(profiles, eq(dogListings.user_id, profiles.id))
        .where(eq(dogListings.status, 'active'));

      // Apply filters
      const conditions = [];
      
      if (search) {
        conditions.push(
          sql`(${dogListings.dog_name} LIKE ${'%' + search + '%'} OR ${dogListings.breed} LIKE ${'%' + search + '%'})`
        );
      }
      
      if (breed) {
        conditions.push(like(dogListings.breed, `%${breed}%`));
      }
      
      if (minPrice) {
        conditions.push(sql`${dogListings.price}::numeric >= ${parseInt(minPrice as string)}`);
      }
      
      if (maxPrice) {
        conditions.push(sql`${dogListings.price}::numeric <= ${parseInt(maxPrice as string)}`);
      }
      
      if (location) {
        conditions.push(like(dogListings.location, `%${location}%`));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // Apply cursor pagination
      if (cursor) {
        query = query.where(sql`${dogListings.created_at} < ${new Date(cursor as string)}`);
      }

      const results = await query
        .orderBy(desc(dogListings.created_at))
        .limit(pageLimit + 1); // +1 to check if there are more results

      const hasMore = results.length > pageLimit;
      const data = hasMore ? results.slice(0, -1) : results;
      const nextCursor = hasMore ? data[data.length - 1].created_at?.toISOString() : null;

      return {
        data,
        nextCursor,
        hasMore
      };
    }, req);

    // Cache the result
    await setCachedData(cacheKey, result, 300); // 5 minutes cache

    res.json(result);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Optimized user conversations endpoint
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { cursor, limit = '20' } = req.query;

    const pageLimit = Math.min(parseInt(limit as string), 50);
    const cacheKey = `conversations_${userId}_${cursor || ''}`;

    const cached = await getCachedData(cacheKey);
    if (cached) {
      trackCache(true, req);
      return res.json(cached);
    }

    trackCache(false, req);

    const result = await timeQuery('fetch_conversations', async () => {
      let query = db
        .select({
          id: conversations.id,
          buyer_id: conversations.buyer_id,
          seller_id: conversations.seller_id,
          listing_id: conversations.listing_id,
          last_message_at: conversations.last_message_at,
          updated_at: conversations.updated_at
        })
        .from(conversations)
        .where(sql`${userId}::uuid = ${conversations.buyer_id} OR ${userId}::uuid = ${conversations.seller_id}`);

      if (cursor) {
        query = query.where(sql`${conversations.updated_at} < ${new Date(cursor as string)}`);
      }

      const results = await query
        .orderBy(desc(conversations.updated_at))
        .limit(pageLimit + 1);

      const hasMore = results.length > pageLimit;
      const data = hasMore ? results.slice(0, -1) : results;
      const nextCursor = hasMore ? data[data.length - 1].updated_at?.toISOString() : null;

      return {
        data,
        nextCursor,
        hasMore
      };
    }, req);

    await setCachedData(cacheKey, result, 60); // 1 minute cache
    res.json(result);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Database optimization endpoint
router.post('/optimize-db', async (req, res) => {
  try {
    const indexes = queryOptimizations.getRecommendedIndexes();
    
    const results = await Promise.all(
      indexes.map(async (indexSQL) => {
        try {
          await db.execute(sql.raw(indexSQL));
          return { sql: indexSQL, success: true };
        } catch (error) {
          return { sql: indexSQL, success: false, error: error.message };
        }
      })
    );

    res.json({
      message: 'Database optimization completed',
      results
    });
  } catch (error) {
    console.error('Error optimizing database:', error);
    res.status(500).json({ error: 'Failed to optimize database' });
  }
});

// Performance metrics endpoint
router.get('/metrics', (req, res) => {
  const metrics = {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString()
  };

  res.json(metrics);
});

// Simple in-memory cache for this example
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

async function getCachedData(key: string): Promise<any | null> {
  const item = cache.get(key);
  if (!item) return null;

  if (Date.now() - item.timestamp > item.ttl) {
    cache.delete(key);
    return null;
  }

  return item.data;
}

async function setCachedData(key: string, data: any, ttlSeconds: number): Promise<void> {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlSeconds * 1000
  });
}

export default router;