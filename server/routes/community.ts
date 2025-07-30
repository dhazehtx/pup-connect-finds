import { Router } from 'express';
import { db } from '../db';
import { 
  communityGroups, 
  groupMemberships, 
  groupPosts, 
  groupPostComments,
  groupPostLikes,
  groupCommentLikes,
  profiles 
} from '@shared/schema';
import { eq, and, desc, count, sql, ilike, or, inArray } from 'drizzle-orm';
import type { Request, Response } from 'express';

const router = Router();

// Get all community groups with search and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      search = '', 
      breed_tag = '', 
      region = '', 
      page = '1', 
      limit = '12',
      sort = 'members' // 'newest', 'members', 'activity', 'posts'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build filters
    const filters = [eq(communityGroups.is_active, true)];
    
    if (search) {
      filters.push(
        or(
          ilike(communityGroups.name, `%${search}%`),
          ilike(communityGroups.description, `%${search}%`)
        )!
      );
    }
    
    if (breed_tag) {
      filters.push(eq(communityGroups.breed_tag, breed_tag as string));
    }
    
    if (region) {
      filters.push(eq(communityGroups.region, region as string));
    }

    // Determine sort order
    let orderBy;
    switch (sort) {
      case 'newest':
        orderBy = desc(communityGroups.created_at);
        break;
      case 'posts':
        orderBy = desc(communityGroups.post_count);
        break;
      case 'activity':
        orderBy = desc(communityGroups.updated_at);
        break;
      default: // 'members'
        orderBy = desc(communityGroups.member_count);
    }

    // Get groups with creator info
    const groups = await db
      .select({
        id: communityGroups.id,
        name: communityGroups.name,
        description: communityGroups.description,
        breed_tag: communityGroups.breed_tag,
        region: communityGroups.region,
        privacy: communityGroups.privacy,
        cover_image: communityGroups.cover_image,
        group_icon: communityGroups.group_icon,
        member_count: communityGroups.member_count,
        post_count: communityGroups.post_count,
        is_verified: communityGroups.is_verified,
        tags: communityGroups.tags,
        created_at: communityGroups.created_at,
        creator_name: profiles.full_name,
        creator_username: profiles.username,
        creator_avatar: profiles.avatar_url
      })
      .from(communityGroups)
      .leftJoin(profiles, eq(communityGroups.creator_id, profiles.id))
      .where(and(...filters))
      .orderBy(orderBy)
      .limit(limitNum)
      .offset(offset);

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(communityGroups)
      .where(and(...filters));

    res.json({
      groups,
      total: totalResult.count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalResult.count / limitNum)
    });

  } catch (error) {
    console.error('Error fetching community groups:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new community group
router.post('/', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const {
      name,
      description,
      breed_tag,
      region,
      privacy = 'public',
      cover_image,
      group_icon,
      rules,
      tags = []
    } = req.body;

    // Check if group name already exists
    const [existingGroup] = await db
      .select()
      .from(communityGroups)
      .where(eq(communityGroups.name, name))
      .limit(1);

    if (existingGroup) {
      return res.status(400).json({ message: 'A group with this name already exists' });
    }

    // Create the group
    const [newGroup] = await db
      .insert(communityGroups)
      .values({
        name,
        description,
        breed_tag,
        region,
        privacy,
        cover_image,
        group_icon,
        creator_id: req.user.id,
        rules,
        tags
      })
      .returning();

    // Add creator as admin member
    await db
      .insert(groupMemberships)
      .values({
        group_id: newGroup.id,
        user_id: req.user.id,
        role: 'admin',
        status: 'active'
      });

    res.status(201).json({
      message: 'Community group created successfully',
      group: newGroup
    });

  } catch (error) {
    console.error('Error creating community group:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get group details with membership info
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    // Get group details with creator info
    const [group] = await db
      .select({
        id: communityGroups.id,
        name: communityGroups.name,
        description: communityGroups.description,
        breed_tag: communityGroups.breed_tag,
        region: communityGroups.region,
        privacy: communityGroups.privacy,
        cover_image: communityGroups.cover_image,
        group_icon: communityGroups.group_icon,
        member_count: communityGroups.member_count,
        post_count: communityGroups.post_count,
        is_verified: communityGroups.is_verified,
        rules: communityGroups.rules,
        tags: communityGroups.tags,
        created_at: communityGroups.created_at,
        creator_id: communityGroups.creator_id,
        creator_name: profiles.full_name,
        creator_username: profiles.username,
        creator_avatar: profiles.avatar_url
      })
      .from(communityGroups)
      .leftJoin(profiles, eq(communityGroups.creator_id, profiles.id))
      .where(eq(communityGroups.id, groupId))
      .limit(1);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check user membership if authenticated
    let userMembership = null;
    if (req.isAuthenticated()) {
      const [membership] = await db
        .select()
        .from(groupMemberships)
        .where(and(
          eq(groupMemberships.group_id, groupId),
          eq(groupMemberships.user_id, req.user.id)
        ))
        .limit(1);
      
      userMembership = membership || null;
    }

    res.json({
      group,
      userMembership
    });

  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Join a group
router.post('/:groupId/join', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { groupId } = req.params;

    // Check if group exists
    const [group] = await db
      .select()
      .from(communityGroups)
      .where(eq(communityGroups.id, groupId))
      .limit(1);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is already a member
    const [existingMembership] = await db
      .select()
      .from(groupMemberships)
      .where(and(
        eq(groupMemberships.group_id, groupId),
        eq(groupMemberships.user_id, req.user.id)
      ))
      .limit(1);

    if (existingMembership) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    // Add membership
    const [newMembership] = await db
      .insert(groupMemberships)
      .values({
        group_id: groupId,
        user_id: req.user.id,
        role: 'member',
        status: group.privacy === 'private' ? 'pending' : 'active'
      })
      .returning();

    // Update group member count (only for active memberships)
    if (newMembership.status === 'active') {
      await db
        .update(communityGroups)
        .set({
          member_count: sql`${communityGroups.member_count} + 1`,
          updated_at: new Date()
        })
        .where(eq(communityGroups.id, groupId));
    }

    res.json({
      message: group.privacy === 'private' ? 'Join request sent' : 'Successfully joined group',
      membership: newMembership
    });

  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Leave a group
router.post('/:groupId/leave', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { groupId } = req.params;

    // Check if user is a member
    const [membership] = await db
      .select()
      .from(groupMemberships)
      .where(and(
        eq(groupMemberships.group_id, groupId),
        eq(groupMemberships.user_id, req.user.id)
      ))
      .limit(1);

    if (!membership) {
      return res.status(404).json({ message: 'Not a member of this group' });
    }

    // Don't allow group creator to leave if they're the only admin
    if (membership.role === 'admin') {
      const [adminCount] = await db
        .select({ count: count() })
        .from(groupMemberships)
        .where(and(
          eq(groupMemberships.group_id, groupId),
          eq(groupMemberships.role, 'admin'),
          eq(groupMemberships.status, 'active')
        ));

      if (adminCount.count <= 1) {
        return res.status(400).json({ 
          message: 'Cannot leave group as the only admin. Transfer admin rights first.' 
        });
      }
    }

    // Remove membership
    await db
      .delete(groupMemberships)
      .where(and(
        eq(groupMemberships.group_id, groupId),
        eq(groupMemberships.user_id, req.user.id)
      ));

    // Update group member count (only for active memberships)
    if (membership.status === 'active') {
      await db
        .update(communityGroups)
        .set({
          member_count: sql`${communityGroups.member_count} - 1`,
          updated_at: new Date()
        })
        .where(eq(communityGroups.id, groupId));
    }

    res.json({ message: 'Successfully left the group' });

  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's joined groups
router.get('/user/joined', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const userGroups = await db
      .select({
        id: communityGroups.id,
        name: communityGroups.name,
        description: communityGroups.description,
        breed_tag: communityGroups.breed_tag,
        region: communityGroups.region,
        cover_image: communityGroups.cover_image,
        group_icon: communityGroups.group_icon,
        member_count: communityGroups.member_count,
        post_count: communityGroups.post_count,
        is_verified: communityGroups.is_verified,
        role: groupMemberships.role,
        joined_at: groupMemberships.joined_at
      })
      .from(groupMemberships)
      .innerJoin(communityGroups, eq(groupMemberships.group_id, communityGroups.id))
      .where(and(
        eq(groupMemberships.user_id, req.user.id),
        eq(groupMemberships.status, 'active')
      ))
      .orderBy(desc(groupMemberships.joined_at));

    res.json({ groups: userGroups });

  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;