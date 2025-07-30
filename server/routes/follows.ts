import { Router } from 'express';
import { db } from '../db';
import { follows, profiles } from '@shared/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import type { Request, Response } from 'express';

const router = Router();

// Follow a user
router.post('/', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { followed_id } = req.body;
    
    if (!followed_id) {
      return res.status(400).json({ message: 'User ID to follow is required' });
    }

    // Can't follow yourself
    if (followed_id === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if target user exists
    const [targetUser] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, followed_id));

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    const [existingFollow] = await db
      .select()
      .from(follows)
      .where(and(
        eq(follows.follower_id, req.user.id),
        eq(follows.followed_id, followed_id)
      ));

    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Create follow relationship
    const [follow] = await db
      .insert(follows)
      .values({
        follower_id: req.user.id,
        followed_id: followed_id
      })
      .returning();

    res.status(201).json({
      message: 'User followed successfully',
      follow
    });

  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Unfollow a user
router.delete('/:userId', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { userId } = req.params;

    const deletedRows = await db
      .delete(follows)
      .where(and(
        eq(follows.follower_id, req.user.id),
        eq(follows.followed_id, userId)
      ));

    if (deletedRows.rowCount === 0) {
      return res.status(404).json({ message: 'Follow relationship not found' });
    }

    res.json({ message: 'User unfollowed successfully' });

  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Internal server error' });
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
        eq(follows.follower_id, req.user.id),
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