import { Router } from 'express';
import { db } from '../db';
import { savedPosts, posts, profiles } from '@shared/schema';
import { eq, and, desc, asc, count, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Save a post
router.post('/', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { post_id } = req.body;
    
    if (!post_id) {
      return res.status(400).json({ message: 'Post ID is required' });
    }

    // Check if post exists
    const [existingPost] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, post_id));

    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already saved
    const [existingSave] = await db
      .select()
      .from(savedPosts)
      .where(and(
        eq(savedPosts.user_id, req.user.id),
        eq(savedPosts.post_id, post_id)
      ));

    if (existingSave) {
      return res.status(400).json({ message: 'Post already saved' });
    }

    // Save the post
    const [savedPost] = await db
      .insert(savedPosts)
      .values({
        user_id: req.user.id,
        post_id: post_id
      })
      .returning();

    res.status(201).json({
      message: 'Post saved successfully',
      savedPost
    });

  } catch (error) {
    console.error('Error saving post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Unsave a post
router.delete('/:postId', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { postId } = req.params;

    const deletedRows = await db
      .delete(savedPosts)
      .where(and(
        eq(savedPosts.user_id, req.user.id),
        eq(savedPosts.post_id, postId)
      ));

    if (deletedRows.rowCount === 0) {
      return res.status(404).json({ message: 'Saved post not found' });
    }

    res.json({ message: 'Post unsaved successfully' });

  } catch (error) {
    console.error('Error unsaving post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Check if a post is saved
router.get('/check/:postId', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.json({ isSaved: false });
  }

  try {
    const { postId } = req.params;

    const [savedPost] = await db
      .select()
      .from(savedPosts)
      .where(and(
        eq(savedPosts.user_id, req.user.id),
        eq(savedPosts.post_id, postId)
      ));

    res.json({ isSaved: !!savedPost });

  } catch (error) {
    console.error('Error checking saved post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's saved posts with pagination and filtering
router.get('/', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { 
      page = '1', 
      limit = '20', 
      sort = 'newest', 
      filter = 'all' 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build query conditions
    let orderBy;
    switch (sort) {
      case 'oldest':
        orderBy = asc(savedPosts.created_at);
        break;
      case 'most_liked':
        orderBy = desc(posts.likes_count);
        break;
      default:
        orderBy = desc(savedPosts.created_at);
    }

    let postTypeFilter;
    if (filter !== 'all') {
      switch (filter) {
        case 'images':
          postTypeFilter = eq(posts.post_type, 'image');
          break;
        case 'videos':
          postTypeFilter = eq(posts.post_type, 'video');
          break;
        case 'text':
          postTypeFilter = eq(posts.post_type, 'text');
          break;
      }
    }

    // Get saved posts with post details
    const query = db
      .select({
        id: posts.id,
        user_id: posts.user_id,
        title: posts.title,
        content: posts.content,
        caption: posts.caption,
        images: posts.images,
        video_url: posts.video_url,
        post_type: posts.post_type,
        hashtags: posts.hashtags,
        likes_count: posts.likes_count,
        comments_count: posts.comments_count,
        shares_count: posts.shares_count,
        views_count: posts.views_count,
        created_at: posts.created_at,
        saved_at: savedPosts.created_at,
        profiles: {
          id: profiles.id,
          full_name: profiles.full_name,
          username: profiles.username,
          avatar_url: profiles.avatar_url,
          verified: profiles.verified
        }
      })
      .from(savedPosts)
      .innerJoin(posts, eq(savedPosts.post_id, posts.id))
      .leftJoin(profiles, eq(posts.user_id, profiles.id))
      .where(and(
        eq(savedPosts.user_id, req.user.id),
        postTypeFilter
      ))
      .orderBy(orderBy)
      .limit(limitNum)
      .offset(offset);

    const savedPostsResults = await query;

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(savedPosts)
      .innerJoin(posts, eq(savedPosts.post_id, posts.id))
      .where(and(
        eq(savedPosts.user_id, req.user.id),
        postTypeFilter
      ));

    // Get stats
    const [statsResult] = await db
      .select({
        totalLikes: sql<number>`SUM(${posts.likes_count})`,
        totalComments: sql<number>`SUM(${posts.comments_count})`,
        thisWeek: sql<number>`COUNT(CASE WHEN ${savedPosts.created_at} >= NOW() - INTERVAL '7 days' THEN 1 END)`
      })
      .from(savedPosts)
      .innerJoin(posts, eq(savedPosts.post_id, posts.id))
      .where(eq(savedPosts.user_id, req.user.id));

    res.json({
      posts: savedPostsResults,
      total: totalResult.count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalResult.count / limitNum),
      totalLikes: statsResult.totalLikes || 0,
      totalComments: statsResult.totalComments || 0,
      thisWeek: statsResult.thisWeek || 0
    });

  } catch (error) {
    console.error('Error fetching saved posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;