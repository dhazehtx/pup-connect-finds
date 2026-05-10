import { Router } from 'express';
import { db } from '../db';
import { 
  groupPosts, 
  groupPostComments,
  groupPostLikes,
  groupCommentLikes,
  groupMemberships,
  communityGroups,
  profiles 
} from '@shared/schema';
import { eq, and, desc, count, sql, asc } from 'drizzle-orm';
import type { Request, Response } from 'express';

const router = Router();

// Get posts for a specific group
router.get('/:groupId/posts', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = '1', limit = '10', sort = 'newest' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Check if user has access to this group
    if (req.isAuthenticated()) {
      const userId = req.user!.id;
      const [membership] = await db
        .select()
        .from(groupMemberships)
        .where(and(
          eq(groupMemberships.group_id, groupId),
          eq(groupMemberships.user_id, userId),
          eq(groupMemberships.status, 'active')
        ))
        .limit(1);

      // For private groups, only members can view posts
      const [group] = await db
        .select({ privacy: communityGroups.privacy })
        .from(communityGroups)
        .where(eq(communityGroups.id, groupId))
        .limit(1);

      if (group?.privacy === 'private' && !membership) {
        return res.status(403).json({ message: 'Access denied to private group' });
      }
    }

    // Determine sort order
    let orderBy;
    switch (sort) {
      case 'popular':
        orderBy = desc(groupPosts.likes_count);
        break;
      case 'comments':
        orderBy = desc(groupPosts.comments_count);
        break;
      case 'oldest':
        orderBy = asc(groupPosts.created_at);
        break;
      default: // 'newest'
        orderBy = desc(groupPosts.created_at);
    }

    // Get posts with author info and user's like status
    const posts = await db
      .select({
        id: groupPosts.id,
        group_id: groupPosts.group_id,
        title: groupPosts.title,
        content: groupPosts.content,
        images: groupPosts.images,
        post_type: groupPosts.post_type,
        is_pinned: groupPosts.is_pinned,
        is_cross_posted: groupPosts.is_cross_posted,
        likes_count: groupPosts.likes_count,
        comments_count: groupPosts.comments_count,
        views_count: groupPosts.views_count,
        tags: groupPosts.tags,
        created_at: groupPosts.created_at,
        author_id: groupPosts.author_id,
        author_name: profiles.full_name,
        author_username: profiles.username,
        author_avatar: profiles.avatar_url
      })
      .from(groupPosts)
      .leftJoin(profiles, eq(groupPosts.author_id, profiles.id))
      .where(eq(groupPosts.group_id, groupId))
      .orderBy(desc(groupPosts.is_pinned), orderBy) // Pinned posts first
      .limit(limitNum)
      .offset(offset);

    // If user is authenticated, get their like status for each post
    let userLikes: string[] = [];
    if (req.isAuthenticated() && posts.length > 0) {
      const userId = req.user!.id;
      const postIds = posts.map(p => p.id);
      const likes = await db
        .select({ post_id: groupPostLikes.post_id })
        .from(groupPostLikes)
        .where(and(
          eq(groupPostLikes.user_id, userId),
          sql`${groupPostLikes.post_id} = ANY(${postIds})`
        ));
      
      userLikes = likes.map(l => l.post_id);
    }

    // Add user like status to posts
    const postsWithLikes = posts.map(post => ({
      ...post,
      isLikedByUser: userLikes.includes(post.id)
    }));

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(groupPosts)
      .where(eq(groupPosts.group_id, groupId));

    res.json({
      posts: postsWithLikes,
      total: totalResult.count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalResult.count / limitNum)
    });

  } catch (error) {
    console.error('Error fetching group posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new post in a group
router.post('/:groupId/posts', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const userId = req.user!.id;
    const { groupId } = req.params;
    const {
      title,
      content,
      images = [],
      post_type = 'discussion',
      is_cross_posted = false,
      tags = []
    } = req.body;

    // Check if user is a member of the group
    const [membership] = await db
      .select()
      .from(groupMemberships)
      .where(and(
        eq(groupMemberships.group_id, groupId),
        eq(groupMemberships.user_id, userId),
        eq(groupMemberships.status, 'active')
      ))
      .limit(1);

    if (!membership) {
      return res.status(403).json({ message: 'Must be a group member to post' });
    }

    // Create the post
    const [newPost] = await db
      .insert(groupPosts)
      .values({
        group_id: groupId,
        author_id: userId,
        title,
        content,
        images,
        post_type,
        is_cross_posted,
        tags
      })
      .returning();

    // Update group post count
    await db
      .update(communityGroups)
      .set({
        post_count: sql`${communityGroups.post_count} + 1`,
        updated_at: new Date()
      })
      .where(eq(communityGroups.id, groupId));

    // Update user's last activity in group
    await db
      .update(groupMemberships)
      .set({ last_activity: new Date() })
      .where(and(
        eq(groupMemberships.group_id, groupId),
        eq(groupMemberships.user_id, userId)
      ));

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });

  } catch (error) {
    console.error('Error creating group post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Like/unlike a group post
router.post('/posts/:postId/like', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const userId = req.user!.id;
    const { postId } = req.params;

    // Check if post exists and get group info
    const [post] = await db
      .select({ 
        id: groupPosts.id,
        group_id: groupPosts.group_id,
        author_id: groupPosts.author_id
      })
      .from(groupPosts)
      .where(eq(groupPosts.id, postId))
      .limit(1);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is a member of the group
    const [membership] = await db
      .select()
      .from(groupMemberships)
      .where(and(
        eq(groupMemberships.group_id, post.group_id),
        eq(groupMemberships.user_id, userId),
        eq(groupMemberships.status, 'active')
      ))
      .limit(1);

    if (!membership) {
      return res.status(403).json({ message: 'Must be a group member to like posts' });
    }

    // Check if user already liked this post
    const [existingLike] = await db
      .select()
      .from(groupPostLikes)
      .where(and(
        eq(groupPostLikes.post_id, postId),
        eq(groupPostLikes.user_id, userId)
      ))
      .limit(1);

    if (existingLike) {
      // Unlike the post
      await db
        .delete(groupPostLikes)
        .where(and(
          eq(groupPostLikes.post_id, postId),
          eq(groupPostLikes.user_id, userId)
        ));

      // Decrement like count
      await db
        .update(groupPosts)
        .set({
          likes_count: sql`${groupPosts.likes_count} - 1`,
          updated_at: new Date()
        })
        .where(eq(groupPosts.id, postId));

      res.json({ message: 'Post unliked', liked: false });
    } else {
      // Like the post
      await db
        .insert(groupPostLikes)
        .values({
          post_id: postId,
          user_id: userId
        });

      // Increment like count
      await db
        .update(groupPosts)
        .set({
          likes_count: sql`${groupPosts.likes_count} + 1`,
          updated_at: new Date()
        })
        .where(eq(groupPosts.id, postId));

      res.json({ message: 'Post liked', liked: true });
    }

  } catch (error) {
    console.error('Error toggling post like:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get comments for a group post
router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;

    // Get post and verify access
    const [post] = await db
      .select({ 
        group_id: groupPosts.group_id 
      })
      .from(groupPosts)
      .where(eq(groupPosts.id, postId))
      .limit(1);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check group access for authenticated users
    if (req.isAuthenticated()) {
      const userId = req.user!.id;
      const [membership] = await db
        .select()
        .from(groupMemberships)
        .where(and(
          eq(groupMemberships.group_id, post.group_id),
          eq(groupMemberships.user_id, userId),
          eq(groupMemberships.status, 'active')
        ))
        .limit(1);

      const [group] = await db
        .select({ privacy: communityGroups.privacy })
        .from(communityGroups)
        .where(eq(communityGroups.id, post.group_id))
        .limit(1);

      if (group?.privacy === 'private' && !membership) {
        return res.status(403).json({ message: 'Access denied to private group' });
      }
    }

    // Get comments with author info
    const comments = await db
      .select({
        id: groupPostComments.id,
        post_id: groupPostComments.post_id,
        content: groupPostComments.content,
        parent_comment_id: groupPostComments.parent_comment_id,
        likes_count: groupPostComments.likes_count,
        is_pinned: groupPostComments.is_pinned,
        created_at: groupPostComments.created_at,
        author_id: groupPostComments.author_id,
        author_name: profiles.full_name,
        author_username: profiles.username,
        author_avatar: profiles.avatar_url
      })
      .from(groupPostComments)
      .leftJoin(profiles, eq(groupPostComments.author_id, profiles.id))
      .where(eq(groupPostComments.post_id, postId))
      .orderBy(desc(groupPostComments.is_pinned), asc(groupPostComments.created_at));

    res.json({ comments });

  } catch (error) {
    console.error('Error fetching group post comments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add a comment to a group post
router.post('/posts/:postId/comments', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const userId = req.user!.id;
    const { postId } = req.params;
    const { content, parent_comment_id } = req.body;

    // Get post and verify access
    const [post] = await db
      .select({ 
        group_id: groupPosts.group_id 
      })
      .from(groupPosts)
      .where(eq(groupPosts.id, postId))
      .limit(1);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is a member of the group
    const [membership] = await db
      .select()
      .from(groupMemberships)
      .where(and(
        eq(groupMemberships.group_id, post.group_id),
        eq(groupMemberships.user_id, userId),
        eq(groupMemberships.status, 'active')
      ))
      .limit(1);

    if (!membership) {
      return res.status(403).json({ message: 'Must be a group member to comment' });
    }

    // Create the comment
    const [newComment] = await db
      .insert(groupPostComments)
      .values({
        post_id: postId,
        author_id: userId,
        content,
        parent_comment_id: parent_comment_id || null
      })
      .returning();

    // Update post comment count
    await db
      .update(groupPosts)
      .set({
        comments_count: sql`${groupPosts.comments_count} + 1`,
        updated_at: new Date()
      })
      .where(eq(groupPosts.id, postId));

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });

  } catch (error) {
    console.error('Error adding group post comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;