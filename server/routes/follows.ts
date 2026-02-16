import { Router } from 'express';
import { db } from '../db';
import { follows, profiles } from '@shared/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { storage } from '../storage';
import type { Request, Response } from 'express';

const router = Router();

router.post('/', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { followed_id } = req.body;
    const userId = req.user!.id;

    if (!followed_id) {
      return res.status(400).json({ message: 'User ID to follow is required', code: 'MISSING_FOLLOWED_ID' });
    }

    if (followed_id === userId) {
      return res.status(400).json({ message: 'Cannot follow yourself', code: 'SELF_FOLLOW' });
    }

    const [followerProfile, targetUser] = await Promise.all([
      storage.getProfile(userId),
      db.select().from(profiles).where(eq(profiles.id, followed_id)).then(r => r[0]),
    ]);

    if (!followerProfile) {
      console.error('[FOLLOWS] Follower profile missing in Neon:', userId);
      return res.status(400).json({ message: 'Your profile is not initialized. Please reload the page.', code: 'FOLLOWER_MISSING' });
    }

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found', code: 'TARGET_NOT_FOUND' });
    }

    const [existingFollow] = await db
      .select()
      .from(follows)
      .where(and(
        eq(follows.follower_id, userId),
        eq(follows.followed_id, followed_id)
      ));

    if (existingFollow) {
      return res.status(200).json({ success: true, isFollowing: true, message: 'Already following this user' });
    }

    const [follow] = await db
      .insert(follows)
      .values({
        follower_id: userId,
        followed_id: followed_id
      })
      .returning();

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
      stack: error?.stack?.split('\n').slice(0, 5),
      userId: req.user?.id,
      body: req.body,
    });
    if (error?.code === '23505') {
      return res.status(200).json({ success: true, isFollowing: true, message: 'Already following' });
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

    await db
      .delete(follows)
      .where(and(
        eq(follows.follower_id, req.user!.id),
        eq(follows.followed_id, userId)
      ));

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