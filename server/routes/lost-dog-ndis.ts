import { Router, Request, Response } from 'express';
import { db } from '../db';
import { lostPetAlerts, microchips, importedPosts, dogEmbeddings, dogs } from '@shared/schema';
import { createNotification } from '../lib/createNotification';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

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

// POST /lostdog/match-chip — when a found dog has a microchip, look up owner and notify
router.post('/match-chip', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { found_dog_id, microchip_number } = req.body;
    if (!found_dog_id || !microchip_number?.trim()) {
      return res.status(400).json({ error: 'found_dog_id and microchip_number required' });
    }
    const chip = String(microchip_number).trim().replace(/\s/g, '');
    const [micro] = await db.select().from(microchips).where(eq(microchips.chip_number, chip)).limit(1);
    if (!micro) {
      return res.json({ match: false, message: 'No microchip registered' });
    }
    const [alert] = await db.select().from(lostPetAlerts).where(eq(lostPetAlerts.id, found_dog_id)).limit(1);
    if (!alert) return res.status(404).json({ error: 'Found dog listing not found' });
    const [dog] = await db.select().from(dogs).where(eq(dogs.id, micro.dog_id)).limit(1);
    const ownerId = dog?.owner_user_id;
    if (!ownerId) {
      return res.json({ match: false, message: 'Owner could not be determined' });
    }
    await createNotification({
      toUserId: ownerId,
      fromUserId: (req as any).user.id,
      type: 'microchip_match',
      title: 'Possible match for your microchipped dog',
      message: 'Possible match found for your microchipped dog.',
      relatedId: found_dog_id,
      targetUrl: `/lost-and-found?alert=${found_dog_id}`,
    });
    res.json({ match: true, owner_id: ownerId, message: 'Owner notified' });
  } catch (e: unknown) {
    const msg = (e as Error)?.message || '';
    if (msg.includes('relation') || msg.includes('microchips') || msg.includes('does not exist'))
      return res.json({ match: false, message: 'Microchip lookup not available' });
    res.status(500).json({ error: msg || 'Failed to match chip' });
  }
});

// POST /lostdog/share — return share URL and message for cross-posting
router.post('/share', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { dog_id, platform } = req.body;
    if (!dog_id) return res.status(400).json({ error: 'dog_id required' });
    const [alert] = await db.select().from(lostPetAlerts).where(eq(lostPetAlerts.id, dog_id)).limit(1);
    if (!alert) return res.status(404).json({ error: 'Listing not found' });
    const baseUrl = process.env.APP_URL || 'https://mypup.com';
    const shareUrl = `${baseUrl}/lost-and-found?alert=${dog_id}`;
    const message = `🚨 LOST DOG ALERT 🚨\n\nDog Name: ${alert.pet_name || 'Unknown'}\nBreed: ${alert.breed || 'Unknown'}\nLast Seen: ${alert.last_seen_address || alert.city || 'Unknown'}\nReward: ${alert.reward_offered ? 'Yes' : 'N/A'}\n\nView details and report sightings here:\n${shareUrl}`;
    res.json({ share_url: shareUrl, message, preview_image: alert.image_url || null });
  } catch (e: unknown) {
    res.status(500).json({ error: (e as Error)?.message || 'Failed to generate share' });
  }
});

// Scrape Open Graph / Twitter meta from HTML (first ~100k chars to avoid huge payloads)
function scrapeMetaFromHtml(html: string): { title?: string; image?: string; description?: string } {
  const slice = html.slice(0, 120000);
  const result: { title?: string; image?: string; description?: string } = {};
  const decode = (s: string) => s.trim().replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  for (const prop of ['title', 'image', 'description'] as const) {
    const re1 = new RegExp(`<meta[^>]+(?:property|name)=["'](?:og:|twitter:)${prop}["'][^>]+content=["']([^"']*)["']`, 'i');
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["'](?:og:|twitter:)${prop}["']`, 'i');
    const m1 = slice.match(re1);
    const m2 = slice.match(re2);
    const value = m1?.[1] || m2?.[1];
    if (value) result[prop] = decode(value);
  }
  if (!result.title) {
    const titleMatch = slice.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch) result.title = decode(titleMatch[1]);
  }
  return result;
}

// POST /lostdog/import — fetch URL, scrape metadata, return suggested fields for creating a lost dog listing
router.post('/import', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const { url } = req.body;
    if (!url?.trim()) return res.status(400).json({ error: 'url required' });
    const u = String(url).trim();
    if (!/^https?:\/\//i.test(u)) return res.status(400).json({ error: 'URL must be http or https' });
    let source_platform = 'other';
    if (u.includes('nextdoor.com')) source_platform = 'nextdoor';
    else if (u.includes('facebook.com') || u.includes('fb.com') || u.includes('fb.me')) source_platform = 'facebook';
    else if (u.includes('ring.com')) source_platform = 'ring';
    const suggested_fields: Record<string, string> = {
      dog_name: '',
      breed: '',
      photo_url: '',
      location_text: '',
      description: '',
    };
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const resFetch = await fetch(u, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MyPupLostDog/1.0; +https://mypup.com)',
          Accept: 'text/html,application/xhtml+xml',
        },
        redirect: 'follow',
      });
      clearTimeout(timeout);
      if (!resFetch.ok) throw new Error(`HTTP ${resFetch.status}`);
      const contentType = (resFetch.headers.get('content-type') || '').toLowerCase();
      if (!contentType.includes('text/html')) throw new Error('URL did not return HTML');
      const html = await resFetch.text();
      const meta = scrapeMetaFromHtml(html);
      if (meta.title) suggested_fields.dog_name = meta.title.slice(0, 200);
      if (meta.image) suggested_fields.photo_url = meta.image;
      if (meta.description) {
        suggested_fields.description = meta.description.slice(0, 2000);
        const desc = meta.description;
        const locationMatch = desc.match(/(?:last\s+seen|location|found|lost|near|area|in\s+)[::\s]*([^.!\n]{10,80})/i) ||
          desc.match(/(?:address|at)\s*[:]\s*([^\n]{5,100})/i);
        if (locationMatch) suggested_fields.location_text = locationMatch[1].trim().slice(0, 200);
        const breedMatch = desc.match(/(?:breed|type)\s*[::\s]*([a-zA-Z\s]{2,40})/i) || desc.match(/\b(golden retriever|labrador|pit bull|german shepherd|chihuahua|beagle|poodle|bulldog|husky|mixed|terrier)\b/i);
        if (breedMatch) suggested_fields.breed = breedMatch[1].trim().slice(0, 80);
      }
    } catch (fetchErr: unknown) {
      const msg = (fetchErr as Error)?.message || '';
      if (msg.includes('abort')) return res.status(408).json({ error: 'Request timed out' });
      if (msg.includes('fetch')) return res.status(502).json({ error: 'Could not fetch URL' });
      return res.status(400).json({ error: msg || 'Could not load link. Try pasting details manually.' });
    }
    res.json({ source_platform, suggested_fields, original_url: u });
  } catch (e: unknown) {
    res.status(500).json({ error: (e as Error)?.message || 'Failed to import' });
  }
});

// POST /lostdog/import/publish — create lost dog listing from import + record in imported_posts
router.post('/import/publish', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const { original_url, source_platform, ...alertFields } = req.body;
    if (!original_url?.trim()) return res.status(400).json({ error: 'original_url required' });
    const latNum = alertFields.latitude != null ? parseFloat(alertFields.latitude) : null;
    const lngNum = alertFields.longitude != null ? parseFloat(alertFields.longitude) : null;
    const [alert] = await db
      .insert(lostPetAlerts)
      .values({
        user_id: userId,
        alert_type: 'lost',
        pet_name: alertFields.pet_name || null,
        species: alertFields.species || 'dog',
        breed: alertFields.breed || null,
        description: alertFields.description || null,
        image_url: alertFields.image_url || null,
        last_seen_address: alertFields.last_seen_address || null,
        city: alertFields.city || null,
        last_seen_at: alertFields.last_seen_at ? new Date(alertFields.last_seen_at) : null,
        latitude: typeof latNum === 'number' && !Number.isNaN(latNum) ? latNum : null,
        longitude: typeof lngNum === 'number' && !Number.isNaN(lngNum) ? lngNum : null,
        contact_info: alertFields.contact_info || null,
        reward_offered: !!alertFields.reward_offered,
        dog_size: alertFields.dog_size || null,
        color: alertFields.color || null,
        gender: alertFields.gender || null,
        collar_description: alertFields.collar_description || null,
        microchip_status: alertFields.microchip_status || null,
        temperament: alertFields.temperament || null,
        status: 'active',
      })
      .returning();
    if (!alert) return res.status(500).json({ error: 'Failed to create listing' });
    await db.insert(importedPosts).values({
      content_url: String(original_url).trim(),
      external_id: null,
      source_platform: source_platform || 'other',
      lost_dog_id: alert.id,
      raw_payload: { imported_by_user_id: userId },
    });
    res.status(201).json({ alert, imported: true });
  } catch (e: unknown) {
    res.status(500).json({ error: (e as Error)?.message || 'Failed to publish import' });
  }
});

// Dog face recognition placeholder: store embedding for a lost dog (client sends vector from vision API)
router.post('/embedding', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { dog_id, embedding_vector } = req.body;
    if (!dog_id || !Array.isArray(embedding_vector)) return res.status(400).json({ error: 'dog_id and embedding_vector required' });
    await db.insert(dogEmbeddings).values({ dog_id, embedding_vector });
    res.status(201).json({ stored: true });
  } catch (e: unknown) {
    res.status(500).json({ error: (e as Error)?.message || 'Failed to store embedding' });
  }
});

// Compare found dog to lost dogs by embedding similarity (placeholder: returns empty until real vision API)
router.get('/embedding/compare', async (req: Request, res: Response) => {
  try {
    const foundId = req.query.found_id as string;
    if (!foundId) return res.status(400).json({ error: 'found_id required' });
    res.json({ matches: [], message: 'AI matching available when embeddings are enabled' });
  } catch (e: unknown) {
    res.status(500).json({ error: (e as Error)?.message || 'Failed to compare' });
  }
});

// GET /lostdog/flyer/:id — flyer data for lost dog (client can render PNG/PDF or print)
router.get('/flyer/:id', async (req: Request, res: Response) => {
  try {
    const [alert] = await db.select().from(lostPetAlerts).where(eq(lostPetAlerts.id, req.params.id)).limit(1);
    if (!alert) return res.status(404).json({ error: 'Listing not found' });
    const baseUrl = process.env.APP_URL || 'https://mypup.com';
    const listingUrl = `${baseUrl}/lost-and-found?alert=${alert.id}`;
    res.json({
      id: alert.id,
      pet_name: alert.pet_name,
      breed: alert.breed,
      color: alert.color,
      dog_size: alert.dog_size,
      last_seen_address: alert.last_seen_address,
      city: alert.city,
      last_seen_at: alert.last_seen_at,
      reward_offered: alert.reward_offered,
      contact_info: alert.contact_info,
      image_url: alert.image_url,
      description: alert.description,
      listing_url: listingUrl,
      qr_data: listingUrl,
    });
  } catch (e: unknown) {
    const msg = (e as Error)?.message || '';
    if (msg.includes('relation') || msg.includes('does not exist')) return res.status(404).json({ error: 'Listing not found' });
    res.status(500).json({ error: msg || 'Failed to load flyer' });
  }
});

export default router;

// Separate routers for radar and recovery (mounted at /api/radar and /api/recovery)
export const radarRouter = Router();
radarRouter.get('/city', async (req: Request, res: Response) => {
  try {
    const lat = req.query.lat != null ? parseFloat(req.query.lat as string) : null;
    const lng = req.query.lng != null ? parseFloat(req.query.lng as string) : null;
    const radius_miles = Math.min(50, Math.max(1, parseFloat((req.query.radius_miles as string) || '5') || 5));
    let rows = await db
      .select()
      .from(lostPetAlerts)
      .where(and(eq(lostPetAlerts.status, 'active'), eq(lostPetAlerts.alert_type, 'lost')))
      .orderBy(desc(lostPetAlerts.created_at))
      .limit(100);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    rows = rows.filter((r: any) => r.created_at && new Date(r.created_at) >= startOfToday);
    if (lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
      const km = radius_miles * 1.60934;
      rows = rows.filter((r: any) => {
        if (r.latitude == null || r.longitude == null) return false;
        return haversineKm(lat, lng, r.latitude, r.longitude) <= km;
      });
      rows.sort((a: any, b: any) => {
        const da = haversineKm(lat, lng, a.latitude, a.longitude);
        const db_ = haversineKm(lat, lng, b.latitude, b.longitude);
        return da - db_;
      });
    }
    res.json({ count: rows.length, alerts: rows.slice(0, 20), radius_miles });
  } catch (e: unknown) {
    const msg = (e as Error)?.message || '';
    const radius_miles = Math.min(50, Math.max(1, parseFloat((req.query.radius_miles as string) || '5') || 5));
    if (msg.includes('relation') || msg.includes('does not exist')) return res.json({ count: 0, alerts: [], radius_miles });
    res.status(500).json({ error: msg || 'Failed to load radar' });
  }
});

export const recoveryRouter = Router();

// GET /recovery/recent — recent reunited alerts for success stories (real data)
recoveryRouter.get('/recent', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(20, Math.max(1, parseInt(String(req.query.limit), 10) || 6));
    const rows = await db
      .select({
        id: lostPetAlerts.id,
        pet_name: lostPetAlerts.pet_name,
        breed: lostPetAlerts.breed,
        city: lostPetAlerts.city,
        image_url: lostPetAlerts.image_url,
        reunited_at: lostPetAlerts.reunited_at,
      })
      .from(lostPetAlerts)
      .where(eq(lostPetAlerts.status, 'reunited'))
      .orderBy(desc(lostPetAlerts.reunited_at))
      .limit(limit);
    res.json({ reunions: rows });
  } catch (e: unknown) {
    const msg = (e as Error)?.message || '';
    if (msg.includes('relation') || msg.includes('reunited_at') || msg.includes('does not exist'))
      return res.json({ reunions: [] });
    res.status(500).json({ error: msg || 'Failed to load recent reunions' });
  }
});

recoveryRouter.get('/scoreboard', async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || 'month';
    let since: Date;
    const now = new Date();
    if (period === 'week') {
      since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      since = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      since = new Date(0);
    }
    const rows = await db
      .select({
        city: lostPetAlerts.city,
        count: sql<number>`count(*)::int`,
      })
      .from(lostPetAlerts)
      .where(and(eq(lostPetAlerts.status, 'reunited'), gte(lostPetAlerts.reunited_at, since)))
      .groupBy(lostPetAlerts.city)
      .orderBy(sql`count(*) desc`)
      .limit(20);
    res.json({ scoreboard: rows, period });
  } catch (_e: unknown) {
    res.json({ scoreboard: [], period: (req.query.period as string) || 'month' });
  }
});
