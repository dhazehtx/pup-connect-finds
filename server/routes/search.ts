import { Router, type Request, type Response } from 'express';
import { and, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '../db';
import { dogListings, petServiceProviders, profiles } from '@shared/schema';
import { storage } from '../storage';
import { getThumbUrlsForParents, attachThumbUrls } from '../lib/mediaHelpers';

const router = Router();

export type UnifiedSearchResult =
  | {
      type: 'profile';
      id: string;
      username: string;
      full_name: string;
      avatar_url: string;
      verified?: boolean;
    }
  | {
      type: 'listing';
      id: string;
      name: string;
      breed: string;
      price: number;
      image: string;
      location?: string;
    }
  | {
      type: 'service';
      id: string;
      user_id: string;
      name: string;
      service_type: string;
      location?: string;
      avatar_url?: string;
    };

/** GET /api/search?q=...&limit=12 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || req.query.search || '').trim();
    const limit = Math.min(parseInt(String(req.query.limit || '12'), 10) || 12, 24);

    if (!q || q.length < 2) {
      return res.json({ results: [] as UnifiedSearchResult[] });
    }

    const like = `%${q.replace(/[%_\\]/g, '')}%`;
    const perBucket = Math.ceil(limit / 3);

    const [profileRows, listingRows, serviceRows] = await Promise.all([
      storage.searchProfiles(q, { limit: perBucket }),
      db
        .select()
        .from(dogListings)
        .where(
          and(
            sql`${dogListings.deleted_at} IS NULL`,
            eq(dogListings.status, 'active'),
            or(
              ilike(dogListings.dog_name, like),
              ilike(dogListings.breed, like),
              ilike(dogListings.description, like),
              ilike(dogListings.location, like),
            ),
          ),
        )
        .limit(perBucket),
      db
        .select({
          id: petServiceProviders.id,
          user_id: petServiceProviders.user_id,
          service_type: petServiceProviders.service_type,
          location: petServiceProviders.location,
          username: profiles.username,
          full_name: profiles.full_name,
          avatar_url: profiles.avatar_url,
        })
        .from(petServiceProviders)
        .leftJoin(profiles, eq(petServiceProviders.user_id, profiles.id))
        .where(
          and(
            eq(petServiceProviders.is_active, true),
            or(
              ilike(petServiceProviders.service_type, like),
              ilike(petServiceProviders.location, like),
              ilike(petServiceProviders.bio, like),
              ilike(profiles.username, like),
              ilike(profiles.full_name, like),
            ),
          ),
        )
        .limit(perBucket),
    ]);

    // Resolve listing thumbnails through the same media pipeline the Explore feed
    // uses, so a listing whose photo lives in media_assets (empty legacy image_url)
    // isn't rendered blank in the search dropdown.
    const listingIds = listingRows.map((l) => l.id).filter(Boolean);
    const listingThumbs = await getThumbUrlsForParents('listing', listingIds);
    const augmentedListings = attachThumbUrls(listingRows as any[], listingThumbs);

    const results: UnifiedSearchResult[] = [];

    for (const p of profileRows) {
      results.push({
        type: 'profile',
        id: p.id,
        username: p.username || '',
        full_name: p.full_name || '',
        avatar_url: p.avatar_url || '',
        verified: p.verified ?? false,
      });
    }

    for (const l of augmentedListings) {
      results.push({
        type: 'listing',
        id: l.id,
        name: l.dog_name || 'Listing',
        breed: l.breed || '',
        price: Number(l.price) || 0,
        image: l.thumbUrls?.[0] || l.image_url || '',
        location: l.location || undefined,
      });
    }

    for (const s of serviceRows) {
      results.push({
        type: 'service',
        id: s.id,
        user_id: s.user_id,
        name: s.full_name || s.username || 'Service provider',
        service_type: s.service_type || 'service',
        location: s.location || undefined,
        avatar_url: s.avatar_url || undefined,
      });
    }

    res.json({ results: results.slice(0, limit) });
  } catch (error) {
    console.error('[search] unified search failed:', error);
    res.status(500).json({ error: 'SEARCH_FAILED', results: [] });
  }
});

export default router;
