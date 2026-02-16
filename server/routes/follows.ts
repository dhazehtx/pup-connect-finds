import { Router } from 'express';
import { db } from '../db';
import { follows, profiles } from '@shared/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { storage } from '../storage';
import { ensureProfile } from '../lib/ensureProfile';
import type { Request, Response } from 'express';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const router = Router();

router.post('/', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const userId = req.user!.id;
  const { followed_id } = req.body || {};

  console.log('[FOLLOWS] POST / request:', { userId, followed_id, body: req.body });

  try {
    if (!followed_id || typeof followed_id !== 'string') {
      return res.status(400).json({ message: 'followed_id is required and must be a string', code: 'MISSING_FOLLOWED_ID' });
    }

    if (!UUID_RE.test(followed_id)) {
      return res.status(400).json({ message: 'followed_id must be a valid UUID', code: 'INVALID_UUID' });
    }

    if (followed_id === userId) {
      return res.status(400).json({ message: 'Cannot follow yourself', code: 'SELF_FOLLOW' });
    }

    let followerProfile;
    try {
      followerProfile = await ensureProfile({
        id: userId,
        email: req.user!.email || null,
        username: req.user!.username || null,
      });
      console.log('[FOLLOWS] Follower profile ensured:', followerProfile.id, followerProfile.username);
    } catch (err) {
      console.error('[FOLLOWS] ensureProfile failed for follower:', userId, err);
      return res.status(400).json({ message: 'Your profile is not initialized. Please reload the page.', code: 'FOLLOWER_MISSING' });
    }

    const [targetUser] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, followed_id));

    if (!targetUser) {
      console.log('[FOLLOWS] Target profile not found:', followed_id);
      return res.status(404).json({ message: 'Target profile not found in database', code: 'TARGET_NOT_FOUND' });
    }

    const [existingFollow] = await db
      .select()
      .from(follows)
      .where(and(
        eq(follows.follower_id, userId),
        eq(follows.followed_id, followed_id)
      ));

    if (existingFollow) {
      console.log('[FOLLOWS] Already following:', userId, '->', followed_id);
      return res.status(200).json({ success: true, isFollowing: true, message: 'Already following this user' });
    }

    const [follow] = await db
      .insert(follows)
      .values({
        follower_id: userId,
        followed_id: followed_id
      })
      .returning();

    console.log('[FOLLOWS] Follow created:', userId, '->', followed_id);
    res.status(201).json({
      success: true,
      isFollowing: true,
      message: 'User followed successfully',
      follow
    });

  } catch (error: any) {
    console.error('[FOLLOWS] POST / error:', {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      stack: error?.stack,
      userId,
      followed_id,
    });
    if (error?.code === '23505') {
      return res.status(200).json({ success: true, isFollowing: true, message: 'Already following' });
    }
    if (error?.code === '23503') {
      return res.status(404).json({ message: 'Target profile not found (foreign key)', code: 'FK_VIOLATION' });
    }
    res.status(500).json({ message: 'Internal server error', code: 'FOLLOW_ERROR' });
  }
});

router.delete('/:userId', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { userId } = req.params;

    if (!userId || !UUID_RE.test(userId)) {
      return res.status(400).json({ message: 'Valid user ID is required', code: 'INVALID_UUID' });
    }

    console.log('[FOLLOWS] DELETE /', req.user!.id, '->', userId);

    await db
      .delete(follows)
      .where(and(
        eq(follows.follower_id, req.user!.id),
        eq(follows.followed_id, userId)
      ));

    console.log('[FOLLOWS] Unfollow completed:', req.user!.id, '->', userId);
    res.json({ success: true, isFollowing: false, message: 'User unfollowed successfully' });

  } catch (error: any) {
    console.error('[FOLLOWS] DELETE error:', {
      message: error?.message,
      code: error?.code,
      userId: req.user?.id,
      targetId: req.params.userId,
    });
    res.status(500).json({ message: 'Internal server error', code: 'UNFOLLOW_ERROR' });
  }
});

// Check if following a user
router.get('/check/:userId', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.json({ isFollowing: false });
  }

  try {
    const { userId } = req.params;

    const [follow] = await db
      .select()
      .from(follows)
      .where(and(
        eq(follows.follower_id, req.user!.id),
        eq(follows.followed_id, userId)
      ));

    res.json({ isFollowing: !!follow });

  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's followers
router.get('/followers/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Get followers
    const followers = await db
      .select({
        id: profiles.id,
        username: profiles.username,
        full_name: profiles.full_name,
        avatar_url: profiles.avatar_url,
        verified: profiles.verified,
        followed_at: follows.created_at
      })
      .from(follows)
      .innerJoin(profiles, eq(follows.follower_id, profiles.id))
      .where(eq(follows.followed_id, userId))
      .orderBy(desc(follows.created_at))
      .limit(limitNum)
      .offset(offset);

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followed_id, userId));

    res.json({
      followers,
      total: totalResult.count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalResult.count / limitNum)
    });

  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get users that a user is following
router.get('/following/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Get following
    const following = await db
      .select({
        id: profiles.id,
        username: profiles.username,
        full_name: profiles.full_name,
        avatar_url: profiles.avatar_url,
        verified: profiles.verified,
        followed_at: follows.created_at
      })
      .from(follows)
      .innerJoin(profiles, eq(follows.followed_id, profiles.id))
      .where(eq(follows.follower_id, userId))
      .orderBy(desc(follows.created_at))
      .limit(limitNum)
      .offset(offset);

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.follower_id, userId));

    res.json({
      following,
      total: totalResult.count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalResult.count / limitNum)
    });

  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get follow stats for a user
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get follower count
    const [followerCount] = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followed_id, userId));

    // Get following count
    const [followingCount] = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.follower_id, userId));

    res.json({
      followers: followerCount.count,
      following: followingCount.count
    });

  } catch (error) {
    console.error('Error fetching follow stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;