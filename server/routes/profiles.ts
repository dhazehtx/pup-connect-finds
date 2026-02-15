import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { authMiddleware } from '../middleware/auth';

const router = Router();

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
  };
}

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const profile = await storage.getProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(shapeProfile(profile));
  } catch (error) {
    console.error('Error fetching own profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const updates = req.body;
    updates.updated_at = new Date();
    const profile = await storage.updateProfile(req.user.id, updates);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(shapeProfile(profile));
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    res.json(results.map(shapeProfile));
  } catch (error) {
    console.error('Error searching profiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/username/:username', async (req: Request, res: Response) => {
  try {
    const profile = await storage.getProfileByUsername(req.params.username);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(shapeProfile(profile));
  } catch (error) {
    console.error('Error fetching profile by username:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const profile = await storage.getProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(shapeProfile(profile));
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
