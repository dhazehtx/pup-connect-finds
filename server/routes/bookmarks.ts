import { Router } from 'express';
import { db } from '../db';
import { bookmarks, posts, dogListings, profiles } from '@shared/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import type { Request, Response } from 'express';

const router = Router();

// Add bookmark
router.post('/', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const userId = req.user!.id;
    const { content_id, content_type } = req.body;
    
    if (!content_id || !content_type) {
      return res.status(400).json({ message: 'Content ID and type are required' });
    }

    if (!['post', 'listing'].includes(content_type)) {
      return res.status(400).json({ message: 'Invalid content type' });
    }

    // Check if content exists
    if (content_type === 'post') {
      const [existingPost] = await db
        .select()
        .from(posts)
        .where(eq(posts.id, content_id));

      if (!existingPost) {
        return res.status(404).json({ message: 'Post not found' });
      }
    } else if (content_type === 'listing') {
      const [existingListing] = await db
        .select()
        .from(dogListings)
        .where(eq(dogListings.id, content_id));

      if (!existingListing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
    }

    // Check if already bookmarked
    const [existingBookmark] = await db
      .select()
      .from(bookmarks)
      .where(and(
        eq(bookmarks.user_id, userId),
        eq(bookmarks.content_id, content_id),
        eq(bookmarks.content_type, content_type)
      ));

    if (existingBookmark) {
      return res.status(400).json({ message: 'Content already bookmarked' });
    }

    // Create bookmark
    const [bookmark] = await db
      .insert(bookmarks)
      .values({
        user_id: userId,
        content_id: content_id,
        content_type: content_type
      })
      .returning();

    res.status(201).json({
      message: 'Content bookmarked successfully',
      bookmark
    });

  } catch (error) {
    console.error('Error creating bookmark:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove bookmark
router.delete('/:contentId/:contentType', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const userId = req.user!.id;
    const { contentId, contentType } = req.params;

    const deletedRows = await db
      .delete(bookmarks)
      .where(and(
        eq(bookmarks.user_id, userId),
        eq(bookmarks.content_id, contentId),
        eq(bookmarks.content_type, contentType)
      ));

    if (deletedRows.rowCount === 0) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    res.json({ message: 'Bookmark removed successfully' });

  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Check if content is bookmarked
router.get('/check/:contentId/:contentType', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.json({ isBookmarked: false });
  }

  try {
    const userId = req.user!.id;
    const { contentId, contentType } = req.params;

    const [bookmark] = await db
      .select()
      .from(bookmarks)
      .where(and(
        eq(bookmarks.user_id, userId),
        eq(bookmarks.content_id, contentId),
        eq(bookmarks.content_type, contentType)
      ));

    res.json({ isBookmarked: !!bookmark });

  } catch (error) {
    console.error('Error checking bookmark:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's bookmarks
router.get('/', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const userId = req.user!.id;
    const { 
      page = '1', 
      limit = '20', 
      type = 'all' 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build type filter
    let typeFilter;
    if (type === 'posts') {
      typeFilter = eq(bookmarks.content_type, 'post');
    } else if (type === 'listings') {
      typeFilter = eq(bookmarks.content_type, 'listing');
    }

    // Get bookmarks with content details
    const userBookmarks = await db
      .select({
        id: bookmarks.id,
        content_id: bookmarks.content_id,
        content_type: bookmarks.content_type,
        created_at: bookmarks.created_at,
      })
      .from(bookmarks)
      .where(and(
        eq(bookmarks.user_id, userId),
        typeFilter
      ))
      .orderBy(desc(bookmarks.created_at))
      .limit(limitNum)
      .offset(offset);

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(bookmarks)
      .where(and(
        eq(bookmarks.user_id, userId),
        typeFilter
      ));

    res.json({
      bookmarks: userBookmarks,
      total: totalResult.count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalResult.count / limitNum)
    });

  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;