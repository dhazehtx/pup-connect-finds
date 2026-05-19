import { debugApiLog } from '../lib/debugApi';
import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { authMiddleware } from '../middleware/auth';
import { ensureProfile, ensureProfileDetailed } from '../lib/ensureProfile';
import { debugApiEnabled } from '../lib/debugApi';
import { getBlockedUserIds } from '../lib/isBlocked';
import { getPublicVisibilityFlags, mergePrivacySettingsJson, parsePrivacySettingsObject } from '../lib/profilePrivacy';
import { postgresErrorMeta } from '../lib/pgErrorMeta';
import { sendRouteError, buildRouteCtx } from '../lib/routeErrorDetail';
import { userFollows } from '../lib/follows';
import { z } from 'zod';
import { normalizeUsername, validateUsername } from '@shared/username';

const router = Router();

/** Deterministic placeholder for messaging response speed (until real metrics exist). */
const TYPICAL_RESPONSE_LABELS = [
  'Usually within a few hours',
  'Typically same day',
  'Often within 24 hours',
] as const;

function typicalResponseTimeLabel(userId: string): string {
  let h = 0;
  for (let i = 0; i < userId.length; i++) {
    h = (h * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return TYPICAL_RESPONSE_LABELS[h % TYPICAL_RESPONSE_LABELS.length];
}

function lastActiveIsoFromProfile(p: { last_login_at?: Date | string | null; updated_at?: Date | string | null }): string | null {
  const raw = p.last_login_at || p.updated_at;
  if (raw == null) return null;
  const d = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/** Verified badge date: true verification date would need `verified_at`; until then use account created_at for display only. */
function verifiedSinceIso(p: { verified?: boolean | null; created_at?: Date | string | null }): string | null {
  if (!p.verified || !p.created_at) return null;
  const d = p.created_at instanceof Date ? p.created_at : new Date(p.created_at);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function trustSignalsForProfile(p: {
  id: string;
  last_login_at?: Date | string | null;
  updated_at?: Date | string | null;
  verified?: boolean | null;
  created_at?: Date | string | null;
}) {
  return {
    last_active_at: lastActiveIsoFromProfile(p),
    typical_response_time: typicalResponseTimeLabel(p.id),
    verified_since: verifiedSinceIso(p),
  };
}

const updateProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_.]+$/)
    .optional()
    .transform((v) => (v === undefined ? undefined : normalizeUsername(v))),
  full_name: z.string().trim().min(1).max(120).optional(),
  bio: z.string().trim().max(1000).optional(),
  avatar_url: z.string().trim().url().max(2048).nullable().optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  address: z.string().trim().max(255).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  state: z.string().trim().max(120).nullable().optional(),
  zip_code: z.string().trim().max(30).nullable().optional(),
  location: z.string().trim().max(255).nullable().optional(),
  website_url: z.string().trim().url().max(2048).nullable().optional(),
  privacy_settings: z.string().trim().max(4000).nullable().optional(),
  social_providers: z.string().trim().max(4000).nullable().optional(),
}).strict();

/** Fields safe for any viewer (incl. logged-out). Location/website require explicit privacy opt-in. */
function shapePublicProfile(p: any) {
  if (!p) return null;
  const priv = parsePrivacySettingsObject(p.privacy_settings);
  const vis = getPublicVisibilityFlags(priv);
  const loc = vis.showLocation && p.location ? p.location : null;
  const web = vis.showWebsite && p.website_url ? p.website_url : null;
  const accountVisibility = (priv.account_visibility as string) || 'public';
  return {
    id: p.id,
    username: p.username || null,
    full_name: p.full_name || null,
    fullName: p.full_name || null,
    bio: p.bio || null,
    avatar_url: p.avatar_url || null,
    avatarUrl: p.avatar_url || null,
    location: loc,
    user_type: p.user_type || 'buyer',
    userType: p.user_type || 'buyer',
    website_url: web,
    websiteUrl: web,
    verified: p.verified || false,
    profile_status: p.profile_status || 'active',
    profileStatus: p.profile_status || 'active',
    badges: p.badges || [],
    rating: p.rating || 0,
    total_reviews: p.total_reviews || 0,
    totalReviews: p.total_reviews || 0,
    years_experience: p.years_experience || 0,
    yearsExperience: p.years_experience || 0,
    created_at: p.created_at || null,
    createdAt: p.created_at || null,
    updated_at: p.updated_at || null,
    updatedAt: p.updated_at || null,
    account_visibility: accountVisibility,
    account_private: false,
    ...trustSignalsForProfile(p),
  };
}

/** Logged-out or non–followers of a private account — minimal profile shell. */
function shapePrivateProfilePreview(p: any) {
  if (!p) return null;
  const priv = parsePrivacySettingsObject(p.privacy_settings);
  return {
    id: p.id,
    username: p.username || null,
    full_name: null,
    fullName: null,
    bio: null,
    avatar_url: p.avatar_url || null,
    avatarUrl: p.avatar_url || null,
    location: null,
    user_type: p.user_type || 'buyer',
    userType: p.user_type || 'buyer',
    website_url: null,
    websiteUrl: null,
    verified: p.verified || false,
    profile_status: p.profile_status || 'active',
    profileStatus: p.profile_status || 'active',
    badges: p.badges || [],
    rating: p.rating || 0,
    total_reviews: p.total_reviews || 0,
    totalReviews: p.total_reviews || 0,
    years_experience: p.years_experience || 0,
    yearsExperience: p.years_experience || 0,
    created_at: p.created_at || null,
    createdAt: p.created_at || null,
    updated_at: p.updated_at || null,
    updatedAt: p.updated_at || null,
    account_visibility: (priv.account_visibility as string) || 'private',
    account_private: true,
    ...trustSignalsForProfile(p),
  };
}

async function resolveProfilePayload(req: Request, profile: any) {
  if (!profile) return null;
  if (viewerSeesFullProfile(req, profile.id)) {
    return shapeProfile(profile);
  }
  const priv = parsePrivacySettingsObject(profile.privacy_settings);
  const accountVisibility = (priv.account_visibility as string) || 'public';
  if (accountVisibility === 'private') {
    const viewerId = req.user?.id as string | undefined;
    if (!viewerId) {
      return shapePrivateProfilePreview(profile);
    }
    const allowed = await userFollows(viewerId, profile.id);
    if (!allowed) {
      return shapePrivateProfilePreview(profile);
    }
  }
  return shapePublicProfile(profile);
}

function shapeProfile(p: any) {
  if (!p) return null;
  return {
    id: p.id,
    username: p.username || null,
    full_name: p.full_name || null,
    fullName: p.full_name || null,
    email: p.email || null,
    bio: p.bio || null,
    avatar_url: p.avatar_url || null,
    avatarUrl: p.avatar_url || null,
    phone: p.phone || null,
    address: p.address || null,
    city: p.city || null,
    state: p.state || null,
    zip_code: p.zip_code || null,
    zipCode: p.zip_code || null,
    location: p.location || null,
    user_type: p.user_type || 'buyer',
    userType: p.user_type || 'buyer',
    website_url: p.website_url || null,
    websiteUrl: p.website_url || null,
    verified: p.verified || false,
    verification_document: p.verification_document || null,
    breeder_license: p.breeder_license || null,
    fraud_score: p.fraud_score || 0,
    profile_status: p.profile_status || 'active',
    profileStatus: p.profile_status || 'active',
    is_admin: p.is_admin || false,
    isAdmin: p.is_admin || false,
    badges: p.badges || [],
    stripe_account_id: p.stripe_account_id || null,
    stripeAccountId: p.stripe_account_id || null,
    stripe_connected: p.stripe_connected || false,
    stripeConnected: p.stripe_connected || false,
    rating: p.rating || 0,
    total_reviews: p.total_reviews || 0,
    totalReviews: p.total_reviews || 0,
    years_experience: p.years_experience || 0,
    yearsExperience: p.years_experience || 0,
    two_factor_enabled: p.two_factor_enabled || false,
    twoFactorEnabled: p.two_factor_enabled || false,
    privacy_settings: p.privacy_settings || null,
    privacySettings: p.privacy_settings || null,
    social_providers: p.social_providers || null,
    socialProviders: p.social_providers || null,
    created_at: p.created_at || null,
    createdAt: p.created_at || null,
    updated_at: p.updated_at || null,
    updatedAt: p.updated_at || null,
    last_login_at: p.last_login_at || null,
    lastLoginAt: p.last_login_at || null,
    ...trustSignalsForProfile(p),
  };
}

function syncDebugEnabled(req: Request): boolean {
  if (req.query.sync_debug === '1' || req.query.sync_debug === 'true') return true;
  return debugApiEnabled();
}

function buildSyncDebugPayload(
  req: Request,
  queriedProfileId: string,
  result: { profile: { id: string; username?: string | null }; created: boolean; hadExisting: boolean },
  dbError: string | null = null,
) {
  return {
    authUserId: req.user?.id ?? null,
    queriedProfileId,
    profileFound: true,
    profileRowId: result.profile.id,
    idsMatch: req.user?.id === result.profile.id,
    ensured: true,
    created: result.created,
    hadExisting: result.hadExisting,
    username: result.profile.username ?? null,
    dbError,
  };
}

function viewerSeesFullProfile(req: Request, profileUserId: string): boolean {
  if (!req.user?.id) return false;
  if (req.user.id === profileUserId) return true;
  if (req.user.is_admin) return true;
  return false;
}

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  const authUserId = req.user?.id;
  let step = 'ensureProfileDetailed';
  try {
    if (!authUserId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const u = req.user;
    const result = await ensureProfileDetailed({
      id: authUserId,
      email: u?.email || null,
      username: u?.username || null,
      full_name: u?.full_name || u?.name || null,
      avatar_url: u?.avatar_url || null,
    });
    debugApiLog('[PROOF:PROFILES]', JSON.stringify({ route: 'GET /me', userId: result.profile.id, created: result.created }));
    step = 'shapeProfile';
    const payload = shapeProfile(result.profile);
    if (syncDebugEnabled(req)) {
      return res.json({
        ...payload,
        _syncDebug: buildSyncDebugPayload(req, authUserId, result),
      });
    }
    res.json(payload);
  } catch (error: unknown) {
    const pg = postgresErrorMeta(error);
    debugApiLog('[PROOF:PROFILES]', JSON.stringify({ route: 'GET /me', userId: authUserId, ensured: false, step, error: pg.message }));
    const extra: Record<string, unknown> = {};
    if (syncDebugEnabled(req)) {
      extra._syncDebug = {
        authUserId: authUserId ?? null,
        queriedProfileId: authUserId ?? null,
        profileFound: false,
        ensured: false,
        step,
        dbError: pg.message || (error instanceof Error ? error.message : 'unknown'),
      };
    }
    sendRouteError(
      req,
      res,
      500,
      'Internal server error',
      'PROFILES_ME_FAILED',
      error,
      buildRouteCtx(req, 'GET /api/profiles/me', step, 'profiles', res),
      extra,
    );
  }
});

router.patch('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid profile update payload',
        details: parsed.error.flatten(),
      });
    }

    const updates: Record<string, unknown> = { ...parsed.data, updated_at: new Date() };
    if (Object.keys(parsed.data).length === 0) {
      return res.status(400).json({ error: 'No valid updatable fields provided' });
    }

    if (parsed.data.username !== undefined) {
      const check = validateUsername(parsed.data.username);
      if (!check.ok) {
        return res.status(400).json({ error: check.error });
      }
      const taken = await storage.getProfileByUsername(check.username);
      if (taken && taken.id !== req.user.id) {
        return res.status(409).json({ error: 'Username is already taken' });
      }
      updates.username = check.username;
    }

    if (parsed.data.privacy_settings !== undefined && parsed.data.privacy_settings !== null) {
      const current = await storage.getProfile(req.user.id);
      let patchObj: Record<string, unknown> = {};
      const raw = parsed.data.privacy_settings;
      try {
        patchObj =
          typeof raw === 'string' ? (JSON.parse(raw) as Record<string, unknown>) : { ...(raw as object) };
      } catch {
        patchObj = {};
      }
      updates.privacy_settings = mergePrivacySettingsJson(current?.privacy_settings ?? null, patchObj);
    }

    const profile = await storage.updateProfile(req.user.id, updates as any);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(shapeProfile(profile));
  } catch (error) {
    sendRouteError(
      req,
      res,
      500,
      'Internal server error',
      'PROFILES_PATCH_ME_FAILED',
      error,
      buildRouteCtx(req, 'PATCH /api/profiles/me', 'updateProfile', 'profiles', res),
    );
  }
});

router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || '';
    if (!q || q.length < 1) {
      return res.json([]);
    }
    const userType = req.query.user_type as string | undefined;
    const verifiedOnly = req.query.verified === 'true';
    const limit = parseInt(req.query.limit as string) || 20;
    const results = await storage.searchProfiles(q, { userType, verifiedOnly, limit });

    const actorId = req.user?.id;
    let filtered = results;
    if (actorId) {
      const blockedIds = await getBlockedUserIds(actorId);
      if (blockedIds.length > 0) {
        const blockedSet = new Set(blockedIds);
        const before = filtered.length;
        filtered = results.filter((p: any) => !blockedSet.has(p.id));
        const filteredCount = before - filtered.length;
        if (filteredCount > 0) {
          debugApiLog('[PROOF:BLOCK:READ]', JSON.stringify({ actorUserId: actorId, filteredCount, domain: 'profile-search', ts: Date.now() }));
        }
      }
    }

    debugApiLog('[PROOF:SEARCH]', JSON.stringify({ q, count: filtered.length, topUsernames: filtered.slice(0, 5).map((r: any) => r.username) }));
    res.json(filtered.map(shapePublicProfile));
  } catch (error: any) {
    debugApiLog('[PROOF:SEARCH:ERR]', JSON.stringify({ q: req.query.q, error: error?.message, stack: error?.stack }));
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/username-available', async (req: Request, res: Response) => {
  try {
    const raw = (req.query.u as string) || '';
    const validated = validateUsername(raw);
    if (!validated.ok) {
      return res.json({ available: false, reason: validated.error });
    }
    const taken = await storage.getProfileByUsername(validated.username);
    if (taken) {
      return res.json({ available: false, reason: 'Username is already taken' });
    }
    return res.json({ available: true, username: validated.username });
  } catch (error) {
    console.error('Error checking username availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/username/:username', async (req: Request, res: Response) => {
  try {
    const profile = await storage.getProfileByUsername(req.params.username);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    const payload = await resolveProfilePayload(req, profile);
    res.json(payload);
  } catch (error) {
    console.error('Error fetching profile by username:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// authMiddleware attaches req.user from Bearer JWT (non-blocking when absent) so
// GET /:id can ensureProfile for "my profile" the same way as GET /me.
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  let step = req.user?.id === req.params.id ? 'ensureProfileDetailed' : 'getProfile';
  try {
    let profile;
    let ensured = false;
    let syncResult: Awaited<ReturnType<typeof ensureProfileDetailed>> | null = null;
    if (req.user?.id === req.params.id) {
      syncResult = await ensureProfileDetailed({
        id: req.user.id,
        email: req.user.email || null,
        username: req.user.username || null,
        full_name: req.user.full_name || req.user.name || null,
        avatar_url: req.user.avatar_url || null,
      });
      profile = syncResult.profile;
      ensured = true;
    } else {
      profile = await storage.getProfile(req.params.id);
    }

    if (!profile) {
      if (syncDebugEnabled(req)) {
        return res.status(404).json({
          error: 'Profile not found',
          _syncDebug: {
            authUserId: req.user?.id ?? null,
            queriedProfileId: req.params.id,
            profileFound: false,
            ensured: false,
            dbError: null,
          },
        });
      }
      return res.status(404).json({ error: 'Profile not found' });
    }
    debugApiLog('[PROOF:PROFILES]', JSON.stringify({ route: 'GET /:id', userId: req.params.id, ensured }));
    step = 'resolveProfilePayload';
    const payload = await resolveProfilePayload(req, profile);
    if (syncDebugEnabled(req) && syncResult) {
      return res.json({
        ...payload,
        _syncDebug: buildSyncDebugPayload(req, req.params.id, syncResult),
      });
    }
    res.json(payload);
  } catch (error: unknown) {
    const pg = postgresErrorMeta(error);
    debugApiLog('[PROOF:PROFILES]', JSON.stringify({ route: 'GET /:id', userId: req.params.id, step, error: pg.message }));
    sendRouteError(
      req,
      res,
      500,
      'Internal server error',
      'PROFILES_GET_ID_FAILED',
      error,
      buildRouteCtx(req, 'GET /api/profiles/:id', step, 'profiles', res),
    );
  }
});

export default router;
