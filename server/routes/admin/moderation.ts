import { Router } from 'express';
import { db } from '../../db';
import { reports, profiles, posts, comments, dogListings, mediaAssets, blocks } from '@shared/schema';
import { eq, and, or, desc, sql, lt, isNull, not, inArray } from 'drizzle-orm';
import { requireAdmin } from '../../middleware/requireAdmin';
import { authMiddleware } from '../../middleware/auth';
import { getRateLimitStats } from '../../middleware/perUserRateLimit';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

const router = Router();

router.use(authMiddleware);
router.use(requireAdmin);

router.get('/reports', async (req, res) => {
  try {
    const status = (req.query.status as string) || 'open';
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const cursor = req.query.cursor as string | undefined;

    const filters: any[] = [];
    if (status !== 'all') {
      filters.push(eq(reports.status, status));
    }
    if (cursor) {
      filters.push(lt(reports.created_at, new Date(cursor)));
    }

    const rows = await db
      .select({
        id: reports.id,
        reporter_id: reports.reporter_id,
        target_id: reports.target_id,
        target_type: reports.target_type,
        reason: reports.reason,
        description: reports.description,
        status: reports.status,
        resolved_by: reports.resolved_by,
        resolved_at: reports.resolved_at,
        resolution_note: reports.resolution_note,
        created_at: reports.created_at,
        reporter_username: profiles.username,
        reporter_name: profiles.full_name,
        reporter_avatar: profiles.avatar_url,
      })
      .from(reports)
      .leftJoin(profiles, eq(reports.reporter_id, profiles.id))
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(reports.created_at))
      .limit(limit);

    const nextCursor = rows.length === limit ? rows[rows.length - 1].created_at?.toISOString() : null;

    console.log('[PROOF:ADMIN:REPORTS:LIST]', JSON.stringify({ status, count: rows.length, ts: Date.now() }));

    res.json({ ok: true, reports: rows, nextCursor });
  } catch (error) {
    console.error('[PROOF:ADMIN:REPORTS:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch reports' });
  }
});

router.get('/reports/:id', async (req, res) => {
  try {
    const [report] = await db
      .select({
        id: reports.id,
        reporter_id: reports.reporter_id,
        target_id: reports.target_id,
        target_type: reports.target_type,
        reason: reports.reason,
        description: reports.description,
        status: reports.status,
        resolved_by: reports.resolved_by,
        resolved_at: reports.resolved_at,
        resolution_note: reports.resolution_note,
        created_at: reports.created_at,
        reporter_username: profiles.username,
        reporter_name: profiles.full_name,
      })
      .from(reports)
      .leftJoin(profiles, eq(reports.reporter_id, profiles.id))
      .where(eq(reports.id, req.params.id));

    if (!report) {
      return res.status(404).json({ ok: false, error: 'Report not found' });
    }

    let targetPreview: any = null;
    if (report.target_type === 'post') {
      const [p] = await db.select({ id: posts.id, content: posts.content, status: posts.status, user_id: posts.user_id }).from(posts).where(eq(posts.id, report.target_id));
      targetPreview = p;
    } else if (report.target_type === 'listing') {
      const [l] = await db.select({ id: dogListings.id, dog_name: dogListings.dog_name, status: dogListings.status, user_id: dogListings.user_id, breed: dogListings.breed }).from(dogListings).where(eq(dogListings.id, report.target_id));
      targetPreview = l;
    } else if (report.target_type === 'comment') {
      const [c] = await db.select({ id: comments.id, content: comments.content, user_id: comments.user_id }).from(comments).where(eq(comments.id, report.target_id));
      targetPreview = c;
    } else if (report.target_type === 'user') {
      const [u] = await db.select({ id: profiles.id, username: profiles.username, full_name: profiles.full_name, is_suspended: profiles.is_suspended }).from(profiles).where(eq(profiles.id, report.target_id));
      targetPreview = u;
    }

    res.json({ ok: true, report, targetPreview });
  } catch (error) {
    console.error('[PROOF:ADMIN:REPORTS:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch report' });
  }
});

router.patch('/reports/:id', async (req, res) => {
  try {
    const { status, resolution_note } = req.body;
    const adminId = (req as any).user?.id;

    if (!['open', 'reviewing', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ ok: false, error: 'Invalid status' });
    }

    const updateData: any = { status };
    if (status === 'resolved' || status === 'dismissed') {
      updateData.resolved_by = adminId;
      updateData.resolved_at = new Date();
    }
    if (resolution_note !== undefined) {
      updateData.resolution_note = resolution_note;
    }

    const [updated] = await db
      .update(reports)
      .set(updateData)
      .where(eq(reports.id, req.params.id))
      .returning();

    if (!updated) {
      return res.status(404).json({ ok: false, error: 'Report not found' });
    }

    console.log('[PROOF:ADMIN:REPORTS:UPDATE]', JSON.stringify({ reportId: req.params.id, status, adminId, ts: Date.now() }));

    res.json({ ok: true, report: updated });
  } catch (error) {
    console.error('[PROOF:ADMIN:REPORTS:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to update report' });
  }
});

router.post('/reports/:id/resolve', async (req, res) => {
  try {
    const { action, note } = req.body;
    const adminId = (req as any).user?.id;
    const reportId = req.params.id;

    const validActions = ['dismiss', 'warn', 'remove_post', 'remove_listing', 'ban_user'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ ok: false, error: `Invalid action. Must be one of: ${validActions.join(', ')}` });
    }

    const [report] = await db.select().from(reports).where(eq(reports.id, reportId));
    if (!report) {
      return res.status(404).json({ ok: false, error: 'Report not found' });
    }

    if (action === 'remove_post') {
      if (report.target_type !== 'post') {
        return res.status(400).json({ ok: false, error: 'remove_post only valid for post reports' });
      }
      await db.update(posts).set({ status: 'removed' }).where(eq(posts.id, report.target_id));
      await db.delete(mediaAssets).where(and(eq(mediaAssets.parent_type, 'post'), eq(mediaAssets.parent_id, report.target_id))).catch(() => {});
    } else if (action === 'remove_listing') {
      if (report.target_type !== 'listing') {
        return res.status(400).json({ ok: false, error: 'remove_listing only valid for listing reports' });
      }
      await db.update(dogListings).set({ status: 'removed' }).where(eq(dogListings.id, report.target_id));
      await db.delete(mediaAssets).where(and(eq(mediaAssets.parent_type, 'listing'), eq(mediaAssets.parent_id, report.target_id))).catch(() => {});
    } else if (action === 'ban_user') {
      if (report.target_type !== 'user') {
        return res.status(400).json({ ok: false, error: 'ban_user only valid for user reports' });
      }
      await db.update(profiles).set({
        is_suspended: true,
        suspended_reason: note || 'Banned via report resolution',
        suspended_at: new Date(),
      }).where(eq(profiles.id, report.target_id));
      console.log('[PROOF:SUSPEND]', JSON.stringify({ userId: report.target_id, suspended: true, via: 'report_resolve', ts: Date.now() }));
    } else if (action === 'warn') {
      console.log('[PROOF:ADMIN:WARN]', JSON.stringify({ reportId, targetType: report.target_type, targetId: report.target_id, adminId, note, ts: Date.now() }));
    }

    const resolvedStatus = action === 'dismiss' ? 'dismissed' : 'resolved';
    const [updated] = await db.update(reports).set({
      status: resolvedStatus,
      resolved_by: adminId,
      resolved_at: new Date(),
      resolution_note: note || `Action: ${action}`,
    }).where(eq(reports.id, reportId)).returning();

    console.log('[PROOF:ADMIN:REPORTS:RESOLVE]', JSON.stringify({ reportId, action, adminId, ts: Date.now() }));

    res.json({ ok: true, report: updated });
  } catch (error) {
    console.error('[PROOF:ADMIN:REPORTS:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to resolve report' });
  }
});

router.post('/actions/remove', async (req, res) => {
  try {
    const { target_type, target_id, reason } = req.body;
    const adminId = (req as any).user?.id;

    if (!target_type || !target_id) {
      return res.status(400).json({ ok: false, error: 'target_type and target_id are required' });
    }

    if (target_type === 'post') {
      const [updated] = await db.update(posts).set({ status: 'removed' }).where(eq(posts.id, target_id)).returning();
      if (!updated) return res.status(404).json({ ok: false, error: 'Post not found' });
      await db.delete(mediaAssets).where(and(eq(mediaAssets.parent_type, 'post'), eq(mediaAssets.parent_id, target_id))).catch(() => {});
    } else if (target_type === 'listing') {
      const [updated] = await db.update(dogListings).set({ status: 'removed' }).where(eq(dogListings.id, target_id)).returning();
      if (!updated) return res.status(404).json({ ok: false, error: 'Listing not found' });
      await db.delete(mediaAssets).where(and(eq(mediaAssets.parent_type, 'listing'), eq(mediaAssets.parent_id, target_id))).catch(() => {});
    } else if (target_type === 'comment') {
      const [deleted] = await db.delete(comments).where(eq(comments.id, target_id)).returning();
      if (!deleted) return res.status(404).json({ ok: false, error: 'Comment not found' });
    } else {
      return res.status(400).json({ ok: false, error: 'Invalid target_type' });
    }

    console.log('[PROOF:ADMIN:ACTION]', JSON.stringify({ adminId, action: 'remove', targetType: target_type, targetId: target_id, reason, ts: Date.now() }));

    res.json({ ok: true, message: `${target_type} removed successfully` });
  } catch (error) {
    console.error('[PROOF:ADMIN:ACTION:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to remove content' });
  }
});

router.post('/actions/suspend-user', async (req, res) => {
  try {
    const { user_id, reason } = req.body;
    const adminId = (req as any).user?.id;

    if (!user_id) {
      return res.status(400).json({ ok: false, error: 'user_id is required' });
    }

    const [updated] = await db
      .update(profiles)
      .set({
        is_suspended: true,
        suspended_reason: reason || 'Suspended by admin',
        suspended_at: new Date(),
      })
      .where(eq(profiles.id, user_id))
      .returning();

    if (!updated) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    console.log('[PROOF:ADMIN:ACTION]', JSON.stringify({ adminId, action: 'suspend', targetType: 'user', targetId: user_id, reason, ts: Date.now() }));
    console.log('[PROOF:SUSPEND]', JSON.stringify({ userId: user_id, suspended: true, ts: Date.now() }));

    res.json({ ok: true, message: 'User suspended' });
  } catch (error) {
    console.error('[PROOF:ADMIN:ACTION:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to suspend user' });
  }
});

router.post('/actions/unsuspend-user', async (req, res) => {
  try {
    const { user_id } = req.body;
    const adminId = (req as any).user?.id;

    if (!user_id) {
      return res.status(400).json({ ok: false, error: 'user_id is required' });
    }

    const [updated] = await db
      .update(profiles)
      .set({
        is_suspended: false,
        suspended_reason: null,
        suspended_at: null,
      })
      .where(eq(profiles.id, user_id))
      .returning();

    if (!updated) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    console.log('[PROOF:ADMIN:ACTION]', JSON.stringify({ adminId, action: 'unsuspend', targetType: 'user', targetId: user_id, ts: Date.now() }));
    console.log('[PROOF:SUSPEND]', JSON.stringify({ userId: user_id, suspended: false, ts: Date.now() }));

    res.json({ ok: true, message: 'User unsuspended' });
  } catch (error) {
    console.error('[PROOF:ADMIN:ACTION:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to unsuspend user' });
  }
});

router.get('/blocks', async (req, res) => {
  try {
    const userId = req.query.userId as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;

    let blockedByUser: any[] = [];
    let blockedByOthers: any[] = [];

    if (userId) {
      const reporterAlias = profiles;
      blockedByUser = await db
        .select({
          id: blocks.id,
          blocker_id: blocks.blocker_id,
          blocked_id: blocks.blocked_id,
          created_at: blocks.created_at,
          blocked_username: profiles.username,
          blocked_name: profiles.full_name,
        })
        .from(blocks)
        .leftJoin(profiles, eq(blocks.blocked_id, profiles.id))
        .where(eq(blocks.blocker_id, userId))
        .orderBy(desc(blocks.created_at))
        .limit(limit)
        .offset(offset);

      blockedByOthers = await db
        .select({
          id: blocks.id,
          blocker_id: blocks.blocker_id,
          blocked_id: blocks.blocked_id,
          created_at: blocks.created_at,
          blocker_username: profiles.username,
          blocker_name: profiles.full_name,
        })
        .from(blocks)
        .leftJoin(profiles, eq(blocks.blocker_id, profiles.id))
        .where(eq(blocks.blocked_id, userId))
        .orderBy(desc(blocks.created_at))
        .limit(limit)
        .offset(offset);
    } else {
      blockedByUser = await db
        .select({
          id: blocks.id,
          blocker_id: blocks.blocker_id,
          blocked_id: blocks.blocked_id,
          created_at: blocks.created_at,
        })
        .from(blocks)
        .orderBy(desc(blocks.created_at))
        .limit(limit)
        .offset(offset);
    }

    console.log('[PROOF:ADMIN:BLOCKS]', JSON.stringify({
      action: 'list',
      userId: userId || 'all',
      blockedByUserCount: blockedByUser.length,
      blockedByOthersCount: blockedByOthers.length,
      ts: Date.now(),
    }));

    res.json({ ok: true, blockedByUser, blockedByOthers });
  } catch (error) {
    console.error('[PROOF:ADMIN:BLOCKS:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch blocks' });
  }
});

router.post('/blocks/unblock', async (req, res) => {
  try {
    const { blockerId, blockedId } = req.body;
    const adminId = (req as any).user?.id;

    if (!blockerId || !blockedId) {
      return res.status(400).json({ ok: false, error: 'blockerId and blockedId are required' });
    }

    const [deleted] = await db
      .delete(blocks)
      .where(and(eq(blocks.blocker_id, blockerId), eq(blocks.blocked_id, blockedId)))
      .returning();

    if (!deleted) {
      return res.status(404).json({ ok: false, error: 'Block relationship not found' });
    }

    console.log('[PROOF:ADMIN:BLOCKS]', JSON.stringify({
      action: 'unblock',
      blockerId,
      blockedId,
      adminId,
      ts: Date.now(),
    }));

    res.json({ ok: true, message: 'Block removed' });
  } catch (error) {
    console.error('[PROOF:ADMIN:BLOCKS:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to unblock' });
  }
});

router.get('/rate-limits', async (_req, res) => {
  try {
    const stats = getRateLimitStats();
    const keys = Object.keys(stats);

    console.log('[PROOF:ADMIN:RATE_LIMITS]', JSON.stringify({ keys, ts: Date.now() }));

    res.json({ ok: true, rateLimits: stats });
  } catch (error) {
    console.error('[PROOF:ADMIN:RATE_LIMITS:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch rate limits' });
  }
});

router.get('/media/orphans', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 200, 500);

    const allMedia = await db
      .select({
        id: mediaAssets.id,
        owner_id: mediaAssets.owner_id,
        parent_type: mediaAssets.parent_type,
        parent_id: mediaAssets.parent_id,
        path: mediaAssets.path,
        bucket: mediaAssets.bucket,
        size_bytes: mediaAssets.size_bytes,
        created_at: mediaAssets.created_at,
      })
      .from(mediaAssets)
      .limit(limit);

    const orphans: any[] = [];

    for (const asset of allMedia) {
      let parentExists = false;

      if (!asset.parent_type || !asset.parent_id) {
        orphans.push({ ...asset, reason: 'no_parent_ref' });
        continue;
      }

      if (asset.parent_type === 'post') {
        const [p] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, asset.parent_id));
        parentExists = !!p;
      } else if (asset.parent_type === 'listing') {
        const [l] = await db.select({ id: dogListings.id }).from(dogListings).where(eq(dogListings.id, asset.parent_id));
        parentExists = !!l;
      } else if (asset.parent_type === 'comment') {
        const [c] = await db.select({ id: comments.id }).from(comments).where(eq(comments.id, asset.parent_id));
        parentExists = !!c;
      } else if (asset.parent_type === 'profile') {
        const [pr] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, asset.parent_id));
        parentExists = !!pr;
      }

      if (!parentExists) {
        orphans.push({ ...asset, reason: 'parent_missing' });
        continue;
      }

      if (supabaseAdmin) {
        try {
          const { data } = await supabaseAdmin.storage.from(asset.bucket).createSignedUrl(asset.path, 5);
          if (!data?.signedUrl) {
            orphans.push({ ...asset, reason: 'storage_missing' });
          }
        } catch {
          orphans.push({ ...asset, reason: 'storage_check_failed' });
        }
      }
    }

    console.log('[PROOF:ADMIN:MEDIA:ORPHANS]', JSON.stringify({ found: orphans.length, scanned: allMedia.length, ts: Date.now() }));

    res.json({ ok: true, orphans, scanned: allMedia.length });
  } catch (error) {
    console.error('[PROOF:ADMIN:MEDIA:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to scan for orphans' });
  }
});

router.post('/media/sweep-orphans', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 200, 500);

    const allMedia = await db
      .select({
        id: mediaAssets.id,
        parent_type: mediaAssets.parent_type,
        parent_id: mediaAssets.parent_id,
        path: mediaAssets.path,
        bucket: mediaAssets.bucket,
      })
      .from(mediaAssets)
      .limit(limit);

    const orphanIds: string[] = [];
    const storagePaths: { bucket: string; path: string }[] = [];

    for (const asset of allMedia) {
      let parentExists = false;

      if (!asset.parent_type || !asset.parent_id) {
        orphanIds.push(asset.id);
        storagePaths.push({ bucket: asset.bucket, path: asset.path });
        continue;
      }

      if (asset.parent_type === 'post') {
        const [p] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, asset.parent_id));
        parentExists = !!p;
      } else if (asset.parent_type === 'listing') {
        const [l] = await db.select({ id: dogListings.id }).from(dogListings).where(eq(dogListings.id, asset.parent_id));
        parentExists = !!l;
      } else if (asset.parent_type === 'comment') {
        const [c] = await db.select({ id: comments.id }).from(comments).where(eq(comments.id, asset.parent_id));
        parentExists = !!c;
      } else if (asset.parent_type === 'profile') {
        const [pr] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, asset.parent_id));
        parentExists = !!pr;
      }

      if (!parentExists) {
        orphanIds.push(asset.id);
        storagePaths.push({ bucket: asset.bucket, path: asset.path });
      }
    }

    let deletedDb = 0;
    let deletedStorage = 0;

    if (orphanIds.length > 0) {
      const deleted = await db.delete(mediaAssets).where(inArray(mediaAssets.id, orphanIds)).returning();
      deletedDb = deleted.length;

      for (const sp of storagePaths) {
        try {
          if (supabaseAdmin) {
            const { error } = await supabaseAdmin.storage.from(sp.bucket).remove([sp.path]);
            if (!error) deletedStorage++;
          }
        } catch {
        }
      }
    }

    console.log('[PROOF:ADMIN:MEDIA:SWEEP]', JSON.stringify({ deletedDb, deletedStorage, ts: Date.now() }));

    res.json({ ok: true, deletedDb, deletedStorage });
  } catch (error) {
    console.error('[PROOF:ADMIN:MEDIA:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to sweep orphans' });
  }
});

// ── Trash management ──────────────────────────────────────────────

router.get('/trash', async (req, res) => {
  try {
    const type = (req.query.type as string) || 'all';
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);

    let trashedPosts: any[] = [];
    let trashedListings: any[] = [];
    let trashedMedia: any[] = [];

    if (type === 'all' || type === 'posts') {
      trashedPosts = await db
        .select({
          id: posts.id,
          title: posts.title,
          content: posts.content,
          user_id: posts.user_id,
          deleted_at: posts.deleted_at,
          deleted_by: posts.deleted_by,
          delete_reason: posts.delete_reason,
          created_at: posts.created_at,
          username: profiles.username,
        })
        .from(posts)
        .leftJoin(profiles, eq(posts.user_id, profiles.id))
        .where(sql`${posts.deleted_at} IS NOT NULL`)
        .orderBy(desc(posts.deleted_at))
        .limit(limit);
    }

    if (type === 'all' || type === 'listings') {
      trashedListings = await db
        .select({
          id: dogListings.id,
          dog_name: dogListings.dog_name,
          breed: dogListings.breed,
          price: dogListings.price,
          user_id: dogListings.user_id,
          deleted_at: dogListings.deleted_at,
          deleted_by: dogListings.deleted_by,
          delete_reason: dogListings.delete_reason,
          created_at: dogListings.created_at,
          username: profiles.username,
        })
        .from(dogListings)
        .leftJoin(profiles, eq(dogListings.user_id, profiles.id))
        .where(sql`${dogListings.deleted_at} IS NOT NULL`)
        .orderBy(desc(dogListings.deleted_at))
        .limit(limit);
    }

    if (type === 'all' || type === 'media') {
      trashedMedia = await db
        .select()
        .from(mediaAssets)
        .where(sql`${mediaAssets.deleted_at} IS NOT NULL`)
        .orderBy(desc(mediaAssets.deleted_at))
        .limit(limit);
    }

    console.log('[PROOF:ADMIN:TRASH:LIST]', JSON.stringify({ type, postCount: trashedPosts.length, listingCount: trashedListings.length, mediaCount: trashedMedia.length, ts: Date.now() }));

    res.json({
      posts: trashedPosts,
      listings: trashedListings,
      media: trashedMedia,
    });
  } catch (error) {
    console.error('[PROOF:ADMIN:TRASH:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch trash' });
  }
});

router.get('/trash/stats', async (req, res) => {
  try {
    const [postCount] = await db.select({ count: sql<number>`count(*)` }).from(posts).where(sql`${posts.deleted_at} IS NOT NULL`);
    const [listingCount] = await db.select({ count: sql<number>`count(*)` }).from(dogListings).where(sql`${dogListings.deleted_at} IS NOT NULL`);
    const [mediaCount] = await db.select({ count: sql<number>`count(*)` }).from(mediaAssets).where(sql`${mediaAssets.deleted_at} IS NOT NULL`);
    const [expiredMedia] = await db.select({ count: sql<number>`count(*)` }).from(mediaAssets).where(and(
      sql`${mediaAssets.deleted_at} IS NOT NULL`,
      sql`${mediaAssets.purge_after} IS NOT NULL`,
      sql`${mediaAssets.purge_after} < NOW()`
    ));

    res.json({
      posts: Number(postCount?.count || 0),
      listings: Number(listingCount?.count || 0),
      media: Number(mediaCount?.count || 0),
      expiredMedia: Number(expiredMedia?.count || 0),
    });
  } catch (error) {
    console.error('[PROOF:ADMIN:TRASH:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch trash stats' });
  }
});

router.post('/trash/purge', async (req, res) => {
  try {
    const { type, ids } = req.body;
    const adminId = req.user?.id;
    let purgedPosts = 0, purgedListings = 0, purgedMedia = 0;

    if (type === 'expired-media' || type === 'all-media') {
      const condition = type === 'expired-media'
        ? and(sql`${mediaAssets.deleted_at} IS NOT NULL`, sql`${mediaAssets.purge_after} IS NOT NULL`, sql`${mediaAssets.purge_after} < NOW()`)
        : sql`${mediaAssets.deleted_at} IS NOT NULL`;

      const toDelete = await db.select({ id: mediaAssets.id, path: mediaAssets.path, bucket: mediaAssets.bucket }).from(mediaAssets).where(condition);

      for (const m of toDelete) {
        try {
          if (supabaseAdmin && m.path && m.bucket) {
            await supabaseAdmin.storage.from(m.bucket).remove([m.path]);
          }
        } catch {}
      }

      if (toDelete.length > 0) {
        const deleted = await db.delete(mediaAssets).where(inArray(mediaAssets.id, toDelete.map(m => m.id)));
        purgedMedia = deleted.rowCount ?? 0;
      }
    }

    if (type === 'posts' && ids?.length) {
      const deleted = await db.delete(posts).where(and(inArray(posts.id, ids), sql`${posts.deleted_at} IS NOT NULL`));
      purgedPosts = deleted.rowCount ?? 0;
    }

    if (type === 'listings' && ids?.length) {
      const deleted = await db.delete(dogListings).where(and(inArray(dogListings.id, ids), sql`${dogListings.deleted_at} IS NOT NULL`));
      purgedListings = deleted.rowCount ?? 0;
    }

    if (type === 'all') {
      const dp = await db.delete(posts).where(sql`${posts.deleted_at} IS NOT NULL`);
      purgedPosts = dp.rowCount ?? 0;
      const dl = await db.delete(dogListings).where(sql`${dogListings.deleted_at} IS NOT NULL`);
      purgedListings = dl.rowCount ?? 0;

      const toDeleteMedia = await db.select({ id: mediaAssets.id, path: mediaAssets.path, bucket: mediaAssets.bucket }).from(mediaAssets).where(sql`${mediaAssets.deleted_at} IS NOT NULL`);
      for (const m of toDeleteMedia) {
        try {
          if (supabaseAdmin && m.path && m.bucket) {
            await supabaseAdmin.storage.from(m.bucket).remove([m.path]);
          }
        } catch {}
      }
      if (toDeleteMedia.length > 0) {
        const dm = await db.delete(mediaAssets).where(inArray(mediaAssets.id, toDeleteMedia.map(m => m.id)));
        purgedMedia = dm.rowCount ?? 0;
      }
    }

    console.log('[PROOF:ADMIN:TRASH:PURGE]', JSON.stringify({ adminId, type, purgedPosts, purgedListings, purgedMedia, ts: Date.now() }));
    res.json({ ok: true, purgedPosts, purgedListings, purgedMedia });
  } catch (error) {
    console.error('[PROOF:ADMIN:TRASH:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to purge trash' });
  }
});

router.post('/trash/restore', async (req, res) => {
  try {
    const { type, ids } = req.body;
    const adminId = req.user?.id;
    let restoredCount = 0;

    if (type === 'posts' && ids?.length) {
      const result = await db.update(posts).set({ deleted_at: null, deleted_by: null, delete_reason: null }).where(and(inArray(posts.id, ids), sql`${posts.deleted_at} IS NOT NULL`));
      restoredCount = result.rowCount ?? 0;
      await db.update(mediaAssets).set({ deleted_at: null, deleted_by: null, purge_after: null }).where(and(
        eq(mediaAssets.parent_type, 'post'),
        inArray(mediaAssets.parent_id, ids),
        sql`${mediaAssets.deleted_at} IS NOT NULL`
      ));
    }

    if (type === 'listings' && ids?.length) {
      const result = await db.update(dogListings).set({ deleted_at: null, deleted_by: null, delete_reason: null }).where(and(inArray(dogListings.id, ids), sql`${dogListings.deleted_at} IS NOT NULL`));
      restoredCount = result.rowCount ?? 0;
      await db.update(mediaAssets).set({ deleted_at: null, deleted_by: null, purge_after: null }).where(and(
        eq(mediaAssets.parent_type, 'listing'),
        inArray(mediaAssets.parent_id, ids),
        sql`${mediaAssets.deleted_at} IS NOT NULL`
      ));
    }

    console.log('[PROOF:ADMIN:TRASH:RESTORE]', JSON.stringify({ adminId, type, ids, restoredCount, ts: Date.now() }));
    res.json({ ok: true, restoredCount });
  } catch (error) {
    console.error('[PROOF:ADMIN:TRASH:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to restore from trash' });
  }
});

export default router;
