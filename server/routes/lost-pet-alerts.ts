import { Router, Request, Response } from 'express';
import { db } from '../db';
import {
  lostPetAlerts,
  lostPetAlertSubscriptions,
  lostPetAlertReports,
  dogEmbeddings,
  dogListings,
  listingEmbeddings,
} from '@shared/schema';
import { eq, desc, and, gte, inArray, sql, or, isNull, ne } from 'drizzle-orm';
type SortOption = 'recent' | 'nearest' | 'viewed' | 'reward';
import { authMiddleware } from '../middleware/auth';
import { lostPetAiMatchRateLimit, lostPetPatchRateLimit } from '../middleware/rateLimiting';
import { createNotification } from '../lib/createNotification';
import { getImageEmbedding, getImageEmbeddingFromUrl, cosineSimilarity } from '../lib/imageEmbedding';
import { getAiMatchMinListingScore, getAiMatchMinAlertScore } from '../lib/aiMatchConfig';
import { notifyEmbeddingMatchesForNewAlert } from '../lib/embeddingMatchNotify';
import { primaryListingImageUrl } from '../lib/listingEmbeddingJob';
import { recordAiMatchEvent } from '../lib/aiMatchQualityMonitor';

const router = Router();

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function alertDistanceMiles(
  userLat: number | null,
  userLng: number | null,
  r: { latitude?: unknown; longitude?: unknown },
): number | null {
  if (
    userLat == null ||
    userLng == null ||
    Number.isNaN(userLat) ||
    Number.isNaN(userLng) ||
    r.latitude == null ||
    r.longitude == null
  )
    return null;
  const lat = Number(r.latitude);
  const lng = Number(r.longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return haversineKm(userLat, userLng, lat, lng) / 1.60934;
}

function listingDistanceMiles(
  userLat: number | null,
  userLng: number | null,
  r: { latitude?: string | null; longitude?: string | null },
): number | null {
  if (userLat == null || userLng == null || Number.isNaN(userLat) || Number.isNaN(userLng)) return null;
  if (r.latitude == null || r.longitude == null) return null;
  const lat = parseFloat(String(r.latitude));
  const lng = parseFloat(String(r.longitude));
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return haversineKm(userLat, userLng, lat, lng) / 1.60934;
}

async function notifyMatchingSubscriptions(alert: any): Promise<void> {
  try {
    if (alert.alert_type !== 'found' && alert.alert_type !== 'lost') return;
    const subs = await db.select().from(lostPetAlertSubscriptions).where(eq(lostPetAlertSubscriptions.alert_type, alert.alert_type));
    const alertLat = alert.latitude != null ? Number(alert.latitude) : null;
    const alertLng = alert.longitude != null ? Number(alert.longitude) : null;
    const breedLower = (alert.breed || '').toLowerCase().trim();

    for (const sub of subs) {
      if (sub.user_id === alert.user_id) continue;
      if (sub.breed != null && sub.breed.trim() !== '' && breedLower !== (sub.breed || '').toLowerCase().trim()) continue;
      if (alertLat == null || alertLng == null) continue;
      const subLat = Number(sub.latitude);
      const subLng = Number(sub.longitude);
      const km = (sub.radius_miles || 10) * 1.60934;
      if (haversineKm(subLat, subLng, alertLat, alertLng) > km) continue;

      const title = 'Possible match found near you';
      const message = alert.breed
        ? `A ${alert.breed} was reported ${alert.alert_type} nearby.`
        : `A dog was reported ${alert.alert_type} nearby.`;
      await createNotification({
        toUserId: sub.user_id,
        fromUserId: alert.user_id,
        type: 'lost_pet_alert_match',
        title,
        message,
        relatedId: alert.id,
        // Deep-link to the specific alert when possible.
        targetUrl: `/lost-and-found?alert=${encodeURIComponent(alert.id)}`,
      });
    }
  } catch (e) {
    console.error('[lost-pet-alerts] notifyMatchingSubscriptions', e);
  }
}

router.get('/', async (req: Request, res: Response) => {
  try {
    // Whitelist publicly-listable statuses. Previously any ?status= value was
    // passed straight through, letting an anonymous caller enumerate deleted or
    // arbitrary-status alerts (whose rows still carry contact_info + coordinates).
    const PUBLIC_LISTABLE_STATUSES = ['active', 'reunited'];
    const rawStatus = (req.query.status as string) || 'active';
    const status = PUBLIC_LISTABLE_STATUSES.includes(rawStatus) ? rawStatus : 'active';
    const alertType = req.query.alert_type as string | undefined; // 'all' | 'lost' | 'found'
    const breed = req.query.breed as string | undefined;
    const dogSize = req.query.dog_size as string | undefined;
    const color = req.query.color as string | undefined;
    const gender = req.query.gender as string | undefined;
    const rewardOnly = req.query.reward_offered === 'true';
    const dateFilter = req.query.date as string | undefined; // '24h' | '3d' | 'week' | 'all'
    const lat = req.query.lat != null ? parseFloat(req.query.lat as string) : null;
    const lng = req.query.lng != null ? parseFloat(req.query.lng as string) : null;
    const radiusMiles = req.query.radius_miles != null ? Math.min(100, Math.max(1, parseFloat(req.query.radius_miles as string) || 10)) : null;
    const sort = (req.query.sort as SortOption) || 'recent';
    const validSort: SortOption[] = ['recent', 'nearest', 'viewed', 'reward'];
    const sortBy = validSort.includes(sort) ? sort : 'recent';

    let conditions = [eq(lostPetAlerts.status, status)] as ReturnType<typeof eq>[];
    if (alertType === 'lost' || alertType === 'found') {
      conditions.push(eq(lostPetAlerts.alert_type, alertType));
    }
    if (breed?.trim()) conditions.push(eq(lostPetAlerts.breed, breed.trim()));
    if (dogSize?.trim()) conditions.push(eq(lostPetAlerts.dog_size, dogSize.trim()));
    if (color?.trim()) conditions.push(eq(lostPetAlerts.color, color.trim()));
    if (gender?.trim()) conditions.push(eq(lostPetAlerts.gender, gender.trim()));
    if (rewardOnly) conditions.push(eq(lostPetAlerts.reward_offered, true));
    const wantVetOnly = req.query.is_vet_listing === 'true';
    if (wantVetOnly) conditions.push(eq(lostPetAlerts.is_vet_listing, true));

    if (dateFilter && dateFilter !== 'all') {
      const now = new Date();
      let since: Date;
      if (dateFilter === '24h') since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      else if (dateFilter === '3d') since = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      else if (dateFilter === 'week') since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      else since = now;
      conditions.push(gte(lostPetAlerts.created_at, since));
    }

    const orderBy =
      sortBy === 'viewed'
        ? [desc(lostPetAlerts.view_count), desc(lostPetAlerts.created_at)]
        : sortBy === 'reward'
          ? [desc(lostPetAlerts.reward_offered), desc(lostPetAlerts.created_at)]
          : [desc(lostPetAlerts.created_at)];

    let rows: any[];
    try {
      rows = await db
        .select()
        .from(lostPetAlerts)
        .where(and(...conditions))
        .orderBy(...orderBy)
        .limit(100);
    } catch (orderErr: unknown) {
      const orderMsg = (orderErr as Error)?.message || '';
      if (orderMsg.includes('view_count') || orderMsg.includes('is_vet_listing') || orderMsg.includes('column') || orderMsg.includes('does not exist')) {
        const safeConditions = [eq(lostPetAlerts.status, status)];
        if (alertType === 'lost' || alertType === 'found') safeConditions.push(eq(lostPetAlerts.alert_type, alertType));
        rows = await db
          .select()
          .from(lostPetAlerts)
          .where(and(...safeConditions))
          .orderBy(desc(lostPetAlerts.created_at))
          .limit(100);
      } else {
        throw orderErr;
      }
    }

    if (sortBy === 'nearest' && lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng) && radiusMiles != null) {
      const km = radiusMiles * 1.60934;
      rows = rows.filter((r: any) => {
        if (r.latitude == null || r.longitude == null) return true;
        return haversineKm(lat, lng, r.latitude, r.longitude) <= km;
      });
      rows.sort((a: any, b: any) => {
        const da = (a.latitude != null && a.longitude != null) ? haversineKm(lat, lng, a.latitude, a.longitude) : Infinity;
        const db_ = (b.latitude != null && b.longitude != null) ? haversineKm(lat, lng, b.latitude, b.longitude) : Infinity;
        return da - db_;
      });
    } else if (lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng) && radiusMiles != null) {
      const km = radiusMiles * 1.60934;
      rows = rows.filter((r: any) => {
        if (r.latitude == null || r.longitude == null) return true;
        return haversineKm(lat, lng, r.latitude, r.longitude) <= km;
      });
    }
    res.json({ alerts: rows });
  } catch (e: unknown) {
    const err = e as Error;
    const msg = err?.message || '';
    if (msg.includes('relation') && (msg.includes('lost_pet_alerts') || msg.includes('does not exist'))) {
      return res.json({ alerts: [] });
    }
    res.status(500).json({ error: msg || 'Failed to load alerts' });
  }
});

router.get('/my', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const rows = await db
      .select()
      .from(lostPetAlerts)
      .where(eq(lostPetAlerts.user_id, userId))
      .orderBy(desc(lostPetAlerts.created_at));
    res.json({ alerts: rows });
  } catch (e: unknown) {
    const err = e as Error;
    const msg = err?.message || '';
    if (msg.includes('relation') && (msg.includes('lost_pet_alerts') || msg.includes('does not exist'))) {
      return res.json({ alerts: [] });
    }
    res.status(500).json({ error: msg || 'Failed to load my alerts' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const {
      pet_name,
      species,
      breed,
      description,
      image_url,
      last_seen_address,
      city,
      last_seen_at,
      latitude,
      longitude,
      contact_info,
      alert_type,
      reward_offered,
      dog_size,
      color,
      gender,
      collar_description,
      microchip_status,
      temperament,
      dog_id,
      is_vet_listing,
      vet_verification_id,
      intake_date,
      microchip_scan_result,
      health_status,
    } = req.body;
    const latNum = latitude != null ? parseFloat(latitude) : null;
    const lngNum = longitude != null ? parseFloat(longitude) : null;
    const [row] = await db
      .insert(lostPetAlerts)
      .values({
        user_id: userId,
        alert_type: alert_type === 'found' ? 'found' : 'lost',
        pet_name: pet_name || null,
        species: species || 'dog',
        breed: breed || null,
        description: description || null,
        image_url: image_url || null,
        last_seen_address: last_seen_address || null,
        city: city || null,
        last_seen_at: last_seen_at ? new Date(last_seen_at) : null,
        latitude: typeof latNum === 'number' && !Number.isNaN(latNum) ? latNum : null,
        longitude: typeof lngNum === 'number' && !Number.isNaN(lngNum) ? lngNum : null,
        contact_info: contact_info || null,
        reward_offered: !!reward_offered,
        dog_size: dog_size || null,
        color: color || null,
        gender: gender || null,
        collar_description: collar_description || null,
        microchip_status: microchip_status || null,
        temperament: temperament || null,
        status: 'active',
        dog_id: dog_id || null,
        is_vet_listing: !!is_vet_listing,
        vet_verification_id: vet_verification_id || null,
        intake_date: intake_date ? new Date(intake_date) : null,
        microchip_scan_result: microchip_scan_result || null,
        health_status: health_status || null,
      })
      .returning();
    if (row) void notifyMatchingSubscriptions(row);
    if (row) void notifyEmbeddingMatchesForNewAlert(row);
    res.status(201).json(row);
  } catch (e: unknown) {
    const err = e as Error;
    res.status(500).json({ error: err?.message || 'Failed to create alert' });
  }
});

// AI Matching: lost/found alerts + active marketplace listings (Explore) — CLIP when HF_TOKEN set
router.post('/ai-match', lostPetAiMatchRateLimit, async (req: Request, res: Response) => {
  const roundMiles = (m: number | null) => (m != null ? Math.round(m * 10) / 10 : null);
  const startedAt = Date.now();

  try {
    const { image, lat, lng } = req.body;
    if (!image) return res.status(400).json({ error: 'Image required' });

    const userLat = lat != null ? parseFloat(lat) : null;
    const userLng = lng != null ? parseFloat(lng) : null;
    const viewerId = typeof req.user?.id === 'string' && req.user.id ? req.user.id : undefined;
    const minListingScore = getAiMatchMinListingScore();
    const minAlertScore = getAiMatchMinAlertScore();
    const model = process.env.HF_IMAGE_EMBEDDING_MODEL?.trim() || 'google/vit-base-patch16-224';
    const sendWithMonitoring = (
      payload: { matches: any[]; matchRanking: 'visual' | 'proximity' | 'empty' },
      hadQueryEmbedding: boolean,
    ) => {
      const rawTopMatchScore = payload.matches.length > 0 ? payload.matches[0]?.matchScore : null;
      const topMatchScore = typeof rawTopMatchScore === 'number' ? rawTopMatchScore : null;
      void recordAiMatchEvent({
        matchRanking: payload.matchRanking,
        hadQueryEmbedding,
        resultCount: payload.matches.length,
        topMatchScore,
        listingThreshold: minListingScore,
        durationMs: Date.now() - startedAt,
        model,
      });
      return res.json(payload);
    };

    let matchCandidates: any[] = [];
    try {
      const alertWhere = [
        eq(lostPetAlerts.status, 'active'),
        inArray(lostPetAlerts.alert_type, ['lost', 'found']),
        ...(viewerId ? [or(isNull(lostPetAlerts.user_id), ne(lostPetAlerts.user_id, viewerId))] : []),
      ];
      matchCandidates = await db
        .select()
        .from(lostPetAlerts)
        .where(and(...alertWhere))
        .orderBy(desc(lostPetAlerts.created_at))
        .limit(60);
    } catch {
      matchCandidates = [];
    }

    let listingCandidates: any[] = [];
    try {
      const listingWhere = [
        sql`${dogListings.deleted_at} IS NULL`,
        eq(dogListings.status, 'active'),
        or(eq(dogListings.listing_status, 'active'), isNull(dogListings.listing_status)),
        ...(viewerId ? [or(isNull(dogListings.user_id), ne(dogListings.user_id, viewerId))] : []),
      ];
      const rows = await db
        .select()
        .from(dogListings)
        .where(and(...listingWhere))
        .orderBy(desc(dogListings.created_at))
        .limit(55);
      listingCandidates = rows.filter((l) => !!primaryListingImageUrl(l)).slice(0, 50);
    } catch {
      listingCandidates = [];
    }

    if (matchCandidates.length === 0 && listingCandidates.length === 0) {
      return sendWithMonitoring({ matches: [], matchRanking: 'empty' as const }, false);
    }

    let queryEmbedding: number[] | null = null;
    try {
      queryEmbedding = await getImageEmbedding(image);
    } catch {
      queryEmbedding = null;
    }

    if (queryEmbedding && queryEmbedding.length > 0) {
      const alertIds = matchCandidates.map((r: any) => r.id);
      let existingEmbeddings: { dog_id: string; embedding_vector: unknown }[] = [];
      try {
        existingEmbeddings = await db
          .select({ dog_id: dogEmbeddings.dog_id, embedding_vector: dogEmbeddings.embedding_vector })
          .from(dogEmbeddings)
          .where(inArray(dogEmbeddings.dog_id, alertIds));
      } catch {
        existingEmbeddings = [];
      }
      const byAlertId = new Map<string, number[]>();
      for (const row of existingEmbeddings) {
        const vec = Array.isArray(row.embedding_vector) ? (row.embedding_vector as number[]) : null;
        if (vec && vec.length > 0) byAlertId.set(row.dog_id, vec);
      }

      const MAX_NEW_ALERT = 8;
      let newAlertEmb = 0;
      for (const alert of matchCandidates) {
        if (newAlertEmb >= MAX_NEW_ALERT) break;
        if (byAlertId.has(alert.id)) continue;
        const imageUrl = (alert as any).image_url;
        if (!imageUrl?.trim()) continue;
        let vec: number[] | null = null;
        try {
          vec = await getImageEmbeddingFromUrl(imageUrl);
        } catch {
          vec = null;
        }
        if (vec && vec.length > 0) {
          newAlertEmb += 1;
          try {
            await db.insert(dogEmbeddings).values({ dog_id: alert.id, embedding_vector: vec });
            byAlertId.set(alert.id, vec);
          } catch {
            // duplicate key or missing table
          }
        }
      }

      const listingIds = listingCandidates.map((r: any) => r.id);
      let existingListingEmb: { listing_id: string; embedding_vector: unknown }[] = [];
      try {
        existingListingEmb = await db
          .select({
            listing_id: listingEmbeddings.listing_id,
            embedding_vector: listingEmbeddings.embedding_vector,
          })
          .from(listingEmbeddings)
          .where(inArray(listingEmbeddings.listing_id, listingIds));
      } catch {
        existingListingEmb = [];
      }
      const byListingId = new Map<string, number[]>();
      for (const row of existingListingEmb) {
        const vec = Array.isArray(row.embedding_vector) ? (row.embedding_vector as number[]) : null;
        if (vec && vec.length > 0) byListingId.set(row.listing_id, vec);
      }

      const MAX_NEW_LISTING = 8;
      let newListingEmb = 0;
      for (const listing of listingCandidates) {
        if (newListingEmb >= MAX_NEW_LISTING) break;
        if (byListingId.has(listing.id)) continue;
        const imageUrl = primaryListingImageUrl(listing);
        if (!imageUrl) continue;
        let vec: number[] | null = null;
        try {
          vec = await getImageEmbeddingFromUrl(imageUrl);
        } catch {
          vec = null;
        }
        if (vec && vec.length > 0) {
          newListingEmb += 1;
          try {
            await db
              .insert(listingEmbeddings)
              .values({ listing_id: listing.id, embedding_vector: vec })
              .onConflictDoUpdate({
                target: listingEmbeddings.listing_id,
                set: { embedding_vector: vec, updated_at: new Date() },
              });
            byListingId.set(listing.id, vec);
          } catch {
            // missing table
          }
        }
      }

      type Scored = {
        kind: 'alert' | 'listing';
        alert: any | null;
        listing: any | null;
        matchScore: number;
        distanceMiles: number | null;
      };

      const scored: Scored[] = [];

      for (const r of matchCandidates) {
        if (!byAlertId.has(r.id)) continue;
        const vec = byAlertId.get(r.id)!;
        let score = 0;
        try {
          score = cosineSimilarity(queryEmbedding, vec);
        } catch {
          score = 0;
        }
        const matchScore = Math.round(score * 100) / 100;
        // Gate alerts by a similarity floor, mirroring the listing branch below.
        // Without this, every active alert with an embedding surfaced as a
        // "possible match" — including near-zero similarity (unrelated dogs).
        if (matchScore < minAlertScore) continue;
        scored.push({
          kind: 'alert',
          alert: r,
          listing: null,
          matchScore,
          distanceMiles: alertDistanceMiles(userLat, userLng, r),
        });
      }

      for (const r of listingCandidates) {
        if (!byListingId.has(r.id)) continue;
        const vec = byListingId.get(r.id)!;
        let score = 0;
        try {
          score = cosineSimilarity(queryEmbedding, vec);
        } catch {
          score = 0;
        }
        const matchScore = Math.round(score * 100) / 100;
        if (matchScore < minListingScore) continue;
        scored.push({
          kind: 'listing',
          alert: null,
          listing: r,
          matchScore,
          distanceMiles: listingDistanceMiles(userLat, userLng, r),
        });
      }

      if (scored.length > 0) {
        scored.sort((a, b) => b.matchScore - a.matchScore);
        if (userLat != null && userLng != null && !Number.isNaN(userLat) && !Number.isNaN(userLng)) {
          scored.sort((a, b) => {
            const scoreDiff = b.matchScore - a.matchScore;
            if (Math.abs(scoreDiff) >= 0.15) return scoreDiff;
            return (a.distanceMiles ?? Infinity) - (b.distanceMiles ?? Infinity);
          });
        }
        const matches = scored.slice(0, 20).map((m) => ({
          kind: m.kind,
          alert: m.alert,
          listing: m.listing,
          matchScore: m.matchScore,
          distanceMiles: roundMiles(m.distanceMiles),
        }));
        return sendWithMonitoring({ matches, matchRanking: 'visual' as const }, true);
      }
    }

    type Fallback = { kind: 'alert' | 'listing'; row: any; distanceMiles: number | null };
    const fallbackRows: Fallback[] = [
      ...matchCandidates.map((r: any) => ({
        kind: 'alert' as const,
        row: r,
        distanceMiles: alertDistanceMiles(userLat, userLng, r),
      })),
      ...listingCandidates.map((r: any) => ({
        kind: 'listing' as const,
        row: r,
        distanceMiles: listingDistanceMiles(userLat, userLng, r),
      })),
    ];
    if (userLat != null && userLng != null && !Number.isNaN(userLat) && !Number.isNaN(userLng)) {
      fallbackRows.sort((a, b) => (a.distanceMiles ?? Infinity) - (b.distanceMiles ?? Infinity));
    }
    const matches = fallbackRows.slice(0, 20).map(({ kind, row, distanceMiles }, i) => ({
      kind,
      alert: kind === 'alert' ? row : null,
      listing: kind === 'listing' ? row : null,
      matchScore: Math.round((0.5 + 0.45 * (1 - i / 20)) * 100) / 100,
      distanceMiles: roundMiles(distanceMiles),
    }));
    return sendWithMonitoring(
      { matches, matchRanking: 'proximity' as const },
      !!(queryEmbedding && queryEmbedding.length > 0),
    );
  } catch (e: unknown) {
    const err = e as Error;
    const msg = err?.message || '';
    // Expected pre-launch state: the feature's tables are not deployed. Degrade
    // to a benign empty result (the UI is hidden behind a feature flag anyway).
    if (
      msg.includes('relation') &&
      (msg.includes('lost_pet_alerts') ||
        msg.includes('dog_embeddings') ||
        msg.includes('listing_embeddings') ||
        msg.includes('dog_listings'))
    )
      return res.json({ matches: [], matchRanking: 'empty' as const });
    // Unexpected failure: signal an error rather than masquerading as
    // "no matches". A broken comparison must not read as "your dog has no
    // matches" — the client shows its error state on a non-2xx response.
    console.error('[ai-match]', msg);
    return res
      .status(502)
      .json({ error: 'match_failed', matchRanking: 'error' as const, matches: [] });
  }
});

// Auto Alert subscriptions: alert me if [breed] is found/lost within X miles
router.get('/subscriptions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const rows = await db
      .select()
      .from(lostPetAlertSubscriptions)
      .where(eq(lostPetAlertSubscriptions.user_id, userId))
      .orderBy(desc(lostPetAlertSubscriptions.created_at));
    res.json({ subscriptions: rows });
  } catch (e: unknown) {
    const err = e as Error;
    const msg = err?.message || '';
    if (msg.includes('relation') && msg.includes('lost_pet_alert_subscriptions')) return res.json({ subscriptions: [] });
    res.status(500).json({ error: msg || 'Failed to load subscriptions' });
  }
});

router.post('/subscriptions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const { alert_type, breed, radius_miles, latitude, longitude, email_digest_enabled } = req.body;
    const lat = latitude != null ? parseFloat(latitude) : null;
    const lng = longitude != null ? parseFloat(longitude) : null;
    if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng))
      return res.status(400).json({ error: 'latitude and longitude required' });
    if (alert_type !== 'lost' && alert_type !== 'found')
      return res.status(400).json({ error: 'alert_type must be lost or found' });
    const radius = Math.min(50, Math.max(1, parseInt(radius_miles, 10) || 10));
    const digest = !!email_digest_enabled;
    const [row] = await db
      .insert(lostPetAlertSubscriptions)
      .values({
        user_id: userId,
        alert_type,
        breed: breed?.trim() || null,
        radius_miles: radius,
        latitude: lat,
        longitude: lng,
        email_digest_enabled: digest,
      })
      .returning();
    res.status(201).json(row);
  } catch (e: unknown) {
    const err = e as Error;
    const msg = err?.message || '';
    if (msg.includes('relation') && msg.includes('lost_pet_alert_subscriptions'))
      return res.status(503).json({ error: 'Subscriptions not available yet' });
    res.status(500).json({ error: msg || 'Failed to create subscription' });
  }
});

router.patch('/subscriptions/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const { email_digest_enabled } = req.body;
    const [sub] = await db
      .select()
      .from(lostPetAlertSubscriptions)
      .where(eq(lostPetAlertSubscriptions.id, req.params.id))
      .limit(1);
    if (!sub || sub.user_id !== userId) return res.status(404).json({ error: 'Subscription not found' });
    const [updated] = await db
      .update(lostPetAlertSubscriptions)
      .set({
        email_digest_enabled: typeof email_digest_enabled === 'boolean' ? email_digest_enabled : sub.email_digest_enabled,
      })
      .where(eq(lostPetAlertSubscriptions.id, req.params.id))
      .returning();
    res.json(updated);
  } catch (e: unknown) {
    const err = e as Error;
    res.status(500).json({ error: err?.message || 'Failed to update subscription' });
  }
});

router.delete('/subscriptions/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const [sub] = await db
      .select()
      .from(lostPetAlertSubscriptions)
      .where(eq(lostPetAlertSubscriptions.id, req.params.id))
      .limit(1);
    if (!sub || sub.user_id !== userId) return res.status(404).json({ error: 'Subscription not found' });
    await db.delete(lostPetAlertSubscriptions).where(eq(lostPetAlertSubscriptions.id, req.params.id));
    res.status(204).send();
  } catch (e: unknown) {
    const err = e as Error;
    res.status(500).json({ error: err?.message || 'Failed to delete subscription' });
  }
});

/** Public read for active listings (OG meta, deep links, ?alert=) */
router.get('/:id/public', async (req: Request, res: Response) => {
  try {
    const [row] = await db
      .select()
      .from(lostPetAlerts)
      .where(and(eq(lostPetAlerts.id, req.params.id), eq(lostPetAlerts.status, 'active')))
      .limit(1);
    if (!row) return res.status(404).json({ error: 'Alert not found' });
    res.json({ alert: row });
  } catch (e: unknown) {
    const err = e as Error;
    const msg = err?.message || '';
    if (msg.includes('relation') && msg.includes('lost_pet_alerts')) return res.status(404).json({ error: 'Alert not found' });
    res.status(500).json({ error: msg || 'Failed to load alert' });
  }
});

// Community reporting: get reports for an alert (e.g. "Someone reported seeing this dog near X")
router.get('/:id/reports', async (req: Request, res: Response) => {
  try {
    const alertId = req.params.id;
    const rows = await db
      .select()
      .from(lostPetAlertReports)
      .where(eq(lostPetAlertReports.alert_id, alertId))
      .orderBy(desc(lostPetAlertReports.created_at));
    res.json({ reports: rows });
  } catch (e: unknown) {
    const err = e as Error;
    const msg = err?.message || '';
    if (msg.includes('relation') && msg.includes('lost_pet_alert_reports')) return res.json({ reports: [] });
    res.status(500).json({ error: msg || 'Failed to load reports' });
  }
});

router.post('/:id/reports', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const alertId = req.params.id;
    const { report_type, location_text, message, latitude, longitude, source_platform, screenshot_url, seen_at } = req.body;
    if (!report_type || !['saw_dog', 'possible_match', 'sighted_location'].includes(report_type))
      return res.status(400).json({ error: 'report_type must be saw_dog, possible_match, or sighted_location' });
    const [alert] = await db.select().from(lostPetAlerts).where(eq(lostPetAlerts.id, alertId)).limit(1);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    const lat = latitude != null ? parseFloat(latitude) : null;
    const lng = longitude != null ? parseFloat(longitude) : null;
    const hasCoords = typeof lat === 'number' && !Number.isNaN(lat) && typeof lng === 'number' && !Number.isNaN(lng);
    const platform = ['mypup', 'ring', 'nextdoor', 'facebook', 'other'].includes(source_platform) ? source_platform : 'mypup';
    const [row] = await db
      .insert(lostPetAlertReports)
      .values({
        alert_id: alertId,
        user_id: userId,
        report_type,
        source_platform: platform,
        screenshot_url: screenshot_url?.trim() || null,
        location_text: location_text?.trim() || null,
        latitude: hasCoords ? lat : null,
        longitude: hasCoords ? lng : null,
        message: message?.trim() || null,
        seen_at: seen_at ? new Date(seen_at) : null,
      })
      .returning();

    const ownerId = alert.user_id as string | undefined;
    if (ownerId && ownerId !== userId) {
      const reportLabels: Record<string, string> = {
        saw_dog: 'Someone reported seeing this dog',
        possible_match: 'Possible match reported on your listing',
        sighted_location: 'New location tip on your listing',
      };
      await createNotification({
        toUserId: ownerId,
        fromUserId: userId,
        type: 'lost_pet_community_report',
        title: reportLabels[report_type] || 'Update on your Lost & Found listing',
        message:
          message?.trim() ||
          location_text?.trim() ||
          'Open your listing to view the community report.',
        relatedId: alertId,
        targetUrl: `/lost-and-found?alert=${encodeURIComponent(alertId)}`,
      });
    }

    res.status(201).json(row);
  } catch (e: unknown) {
    const err = e as Error;
    const msg = err?.message || '';
    if (msg.includes('relation') && msg.includes('lost_pet_alert_reports'))
      return res.status(503).json({ error: 'Community reports not available yet' });
    res.status(500).json({ error: msg || 'Failed to submit report' });
  }
});

router.post('/:id/view', async (req: Request, res: Response) => {
  try {
    const alertId = req.params.id;
    const [row] = await db.select().from(lostPetAlerts).where(eq(lostPetAlerts.id, alertId)).limit(1);
    if (!row) return res.status(404).json({ error: 'Alert not found' });
    const newCount = ((row as any).view_count ?? 0) + 1;
    await db.update(lostPetAlerts).set({ view_count: newCount, updated_at: new Date() }).where(eq(lostPetAlerts.id, alertId));
    res.status(204).send();
  } catch (e: unknown) {
    const err = e as Error;
    const msg = err?.message || '';
    if (msg.includes('view_count') || msg.includes('column') || msg.includes('does not exist')) {
      res.status(204).send();
      return;
    }
    res.status(500).json({ error: msg || 'Failed to record view' });
  }
});

const PATCHABLE_ALERT_FIELDS = new Set([
  'pet_name',
  'species',
  'breed',
  'description',
  'image_url',
  'last_seen_address',
  'city',
  'last_seen_at',
  'latitude',
  'longitude',
  'contact_info',
  'reward_offered',
  'dog_size',
  'color',
  'gender',
  'collar_description',
  'microchip_status',
  'microchip_scan_result',
  'temperament',
  'dog_id',
  'is_vet_listing',
  'vet_verification_id',
  'intake_date',
  'health_status',
  'alert_type',
]);

router.patch('/:id', authMiddleware, lostPetPatchRateLimit, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const [existing] = await db
      .select()
      .from(lostPetAlerts)
      .where(eq(lostPetAlerts.id, req.params.id))
      .limit(1);
    if (!existing || existing.user_id !== userId)
      return res.status(404).json({ error: 'Alert not found' });
    const { status, ...rest } = req.body;
    const updates: Record<string, unknown> = { updated_at: new Date() };
    if (status) {
      updates.status = status;
      if (status === 'reunited') (updates as any).reunited_at = new Date();
    }
    for (const key of Object.keys(rest)) {
      if (!PATCHABLE_ALERT_FIELDS.has(key)) continue;
      let v = rest[key];
      if (key === 'last_seen_at' && v != null && v !== '') {
        const d = new Date(v);
        updates[key] = Number.isNaN(d.getTime()) ? null : d;
      } else if (key === 'intake_date' && v != null && v !== '') {
        const d = new Date(v);
        updates[key] = Number.isNaN(d.getTime()) ? null : d;
      } else if (key === 'latitude' || key === 'longitude') {
        const n = v != null ? parseFloat(String(v)) : null;
        updates[key] = typeof n === 'number' && !Number.isNaN(n) ? n : null;
      } else if (key === 'reward_offered' || key === 'is_vet_listing') {
        updates[key] = !!v;
      } else {
        updates[key] = v;
      }
    }
    const [updated] = await db
      .update(lostPetAlerts)
      .set(updates as any)
      .where(eq(lostPetAlerts.id, req.params.id))
      .returning();
    res.json(updated);
  } catch (e: unknown) {
    const err = e as Error;
    res.status(500).json({ error: err?.message || 'Failed to update alert' });
  }
});

export default router;
