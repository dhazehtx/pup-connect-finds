import { debugApiLog, debugApiWarn } from '../lib/debugApi';
import { Router } from "express";
import { db } from "../db";
import { mediaAssets, profiles, posts, dogListings } from "@shared/schema";
import { eq, and, isNull, notInArray, sql } from "drizzle-orm";
import { supabase } from "../lib/supabase";
import { validateMediaUpload, ALL_ALLOWED_TYPES } from "../lib/mediaHelpers";
import { isSupabaseDegraded, runSupabaseWithRetry } from "../lib/supabaseResilience";
import { postgresErrorMeta } from "../lib/pgErrorMeta";

const router = Router();

const ALLOWED_BUCKETS = ['avatars', 'posts', 'listings', 'provider-id-docs'];

function requireMediaSupabase(res: import("express").Response): boolean {
  if (!supabase) {
    res.status(503).json({
      error: "Media storage is not configured",
      code: "SUPABASE_UNCONFIGURED",
      message: "Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server.",
    });
    return false;
  }
  return true;
}

router.post("/sign", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required", code: "AUTH_REQUIRED" });
  }

  try {
    if (isSupabaseDegraded()) {
      return res.status(503).json({
        error: "Media upload temporarily unavailable",
        code: "SUPABASE_DEGRADED",
        message: "Storage/auth service is degraded. Please retry shortly.",
      });
    }
    if (!requireMediaSupabase(res)) return;
    const { bucket, fileName, mimeType, kind, sizeBytes, parentId } = req.body;
    const userId = req.user!.id;

    if (!bucket || !fileName || !mimeType || !kind) {
      return res.status(400).json({ error: "bucket, fileName, mimeType, and kind are required" });
    }

    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return res.status(400).json({ error: "Invalid bucket", code: "INVALID_BUCKET" });
    }

    let existingCount = 0;
    if (parentId && (kind === 'listing' || kind === 'post')) {
      const existing = await db.select({ id: mediaAssets.id }).from(mediaAssets).where(
        and(eq(mediaAssets.parent_type, kind), eq(mediaAssets.parent_id, parentId), eq(mediaAssets.variant, 'original'))
      );
      existingCount = existing.length;
    }

    const validation = validateMediaUpload(mimeType, sizeBytes, kind, existingCount);
    if (!validation.valid) {
      debugApiLog('[PROOF:MEDIA:VALIDATION]', JSON.stringify({ actorUserId: userId, code: validation.code, kind, mimeType, sizeBytes, ts: Date.now() }));
      return res.status(400).json({ error: validation.message, code: validation.code });
    }

    const ext = fileName.split('.').pop() || 'jpg';
    const uniqueName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `${kind}/${uniqueName}`;

    const { data, error } = await runSupabaseWithRetry(
      () => supabase.storage.from(bucket).createSignedUploadUrl(path),
      { opName: "media.sign.createSignedUploadUrl" },
    );

    if (error) {
      debugApiLog('[PROOF:MEDIA:SIGN:ERR]', JSON.stringify({ userId, bucket, error: error.message, ts: Date.now() }));
      return res.status(500).json({ error: "Failed to create upload URL" });
    }

    debugApiLog('[PROOF:MEDIA:SIGN]', JSON.stringify({ actorUserId: userId, bucket, path, kind, ts: Date.now() }));

    res.json({
      ok: true,
      uploadUrl: data.signedUrl,
      token: data.token,
      path,
      bucket
    });
  } catch (error: any) {
    debugApiLog('[PROOF:MEDIA:SIGN:ERR]', JSON.stringify({ error: error?.message, ts: Date.now() }));
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/commit", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required", code: "AUTH_REQUIRED" });
  }

  try {
    if (isSupabaseDegraded()) {
      return res.status(503).json({
        error: "Media commit temporarily unavailable",
        code: "SUPABASE_DEGRADED",
        message: "Storage service is degraded. Please retry shortly.",
      });
    }
    if (!requireMediaSupabase(res)) return;
    const { bucket, path, mimeType, sizeBytes, width, height, durationSeconds, kind, parentId } = req.body;
    const userId = req.user!.id;

    if (!bucket || !path || !kind) {
      return res.status(400).json({ error: "bucket, path, and kind are required" });
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = urlData?.publicUrl || null;

    const parentType = kind === 'avatar' ? 'avatar' : kind === 'post' ? 'post' : kind === 'listing' ? 'listing' : kind;

    const [asset] = await db
      .insert(mediaAssets)
      .values({
        owner_id: userId,
        parent_type: parentType,
        parent_id: parentId || null,
        bucket,
        path,
        mime_type: mimeType || null,
        size_bytes: sizeBytes || null,
        width: width || null,
        height: height || null,
        duration_seconds: durationSeconds || null,
        variant: 'original',
        public_url: publicUrl,
      })
      .returning();

    let thumbAsset = null;
    if (mimeType && mimeType.startsWith('image/')) {
      const thumbPath = path.replace(/\.([^.]+)$/, '_thumb.$1');
      const { data: thumbUrlData } = supabase.storage.from(bucket).getPublicUrl(thumbPath);
      const thumbPublicUrl = thumbUrlData?.publicUrl || (publicUrl ? publicUrl + '?width=480' : null);

      [thumbAsset] = await db
        .insert(mediaAssets)
        .values({
          owner_id: userId,
          parent_type: parentType,
          parent_id: parentId || null,
          bucket,
          path: thumbPath,
          mime_type: mimeType,
          size_bytes: null,
          width: 480,
          height: null,
          variant: 'thumb',
          public_url: thumbPublicUrl,
          is_thumb: true,
          parent_asset_id: asset.id,
        })
        .returning();

      debugApiLog('[PROOF:MEDIA:THUMB]', JSON.stringify({ parentType: parentType, parentId: parentId || null, originalPath: path, thumbPath: thumbPath, originalId: asset.id, thumbId: thumbAsset.id, ts: Date.now() }));
    }

    if (kind === 'avatar' && publicUrl) {
      const oldAvatarAssets = await db.select().from(mediaAssets).where(
        and(
          eq(mediaAssets.owner_id, userId),
          eq(mediaAssets.parent_type, 'avatar'),
          sql`${mediaAssets.id} != ${asset.id}`,
          sql`COALESCE(${mediaAssets.parent_asset_id}::text, '') != ${asset.id}`
        )
      );
      if (oldAvatarAssets.length > 0) {
        const oldPaths = oldAvatarAssets.map(a => a.path);
        const oldBuckets = Array.from(new Set(oldAvatarAssets.map(a => a.bucket)));
        for (const b of oldBuckets) {
          await supabase.storage.from(b).remove(oldPaths.filter(p => oldAvatarAssets.find(a => a.path === p && a.bucket === b)));
        }
        const oldIds = oldAvatarAssets.map(a => a.id);
        await db.delete(mediaAssets).where(sql`${mediaAssets.id} = ANY(${oldIds})`);
        debugApiLog('[PROOF:MEDIA:DELETE]', JSON.stringify({ parentType: 'avatar', parentId: userId, deletedCount: oldAvatarAssets.length, ts: Date.now() }));
      }
      await db.update(profiles).set({ avatar_url: publicUrl }).where(eq(profiles.id, userId));
    }

    if (kind === 'post' && parentId) {
      const [existingPost] = await db.select({ images: posts.images }).from(posts).where(eq(posts.id, parentId));
      if (existingPost) {
        const currentImages = existingPost.images || [];
        await db.update(posts).set({
          images: [...currentImages, publicUrl || ''],
          image_url: currentImages.length === 0 ? (publicUrl || '') : (existingPost.images?.[0] || publicUrl || '')
        }).where(eq(posts.id, parentId));
      }
    }

    if (kind === 'listing' && parentId) {
      const [existingListing] = await db.select({ images: dogListings.images }).from(dogListings).where(eq(dogListings.id, parentId));
      if (existingListing) {
        const currentImages = existingListing.images || [];
        await db.update(dogListings).set({
          images: [...currentImages, publicUrl || ''],
          image_url: currentImages.length === 0 ? (publicUrl || '') : (existingListing.images?.[0] || publicUrl || '')
        }).where(eq(dogListings.id, parentId));
      }
    }

    debugApiLog('[PROOF:MEDIA:COMMIT]', JSON.stringify({
      actorUserId: userId,
      assetId: asset.id,
      kind,
      parentId: parentId || null,
      variant: 'original',
      hasThumb: !!thumbAsset,
      ts: Date.now()
    }));

    res.json({
      ok: true,
      asset: {
        id: asset.id,
        publicUrl: asset.public_url,
        variant: asset.variant,
        mime: asset.mime_type,
        sizeBytes: asset.size_bytes,
        parentType: asset.parent_type,
        parentId: asset.parent_id,
      },
      thumbUrl: thumbAsset?.public_url || null,
      assetId: asset.id,
      url: publicUrl,
      path,
      bucket
    });
  } catch (error: unknown) {
    const pg = postgresErrorMeta(error);
    const message = error instanceof Error ? error.message : String(error);
    console.error('[MEDIA:COMMIT:ERR]', message, pg.code ? pg : '');
    debugApiLog('[PROOF:MEDIA:COMMIT:ERR]', JSON.stringify({ error: message, pg, ts: Date.now() }));
    const exposeDetail =
      process.env.NODE_ENV !== 'production' || process.env.DEBUG_API_ERRORS === '1';
    res.status(500).json({
      error: 'Failed to commit media',
      code: pg.code || 'MEDIA_COMMIT_FAILED',
      ...(exposeDetail && {
        detail: message.slice(0, 200),
        table: pg.table,
        hint: pg.hint,
      }),
    });
  }
});

router.delete("/:assetId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required", code: "AUTH_REQUIRED" });
  }

  try {
    if (isSupabaseDegraded()) {
      return res.status(503).json({
        error: "Media delete temporarily unavailable",
        code: "SUPABASE_DEGRADED",
        message: "Storage service is degraded. Please retry shortly.",
      });
    }
    if (!requireMediaSupabase(res)) return;
    const { assetId } = req.params;
    const userId = req.user!.id;

    const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, assetId));

    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    if (asset.owner_id !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this asset" });
    }

    const thumbs = await db.select().from(mediaAssets).where(eq(mediaAssets.parent_asset_id, assetId));
    const pathsToDelete = [asset.path, ...thumbs.map(t => t.path)];

    const { error: storageError } = await runSupabaseWithRetry(
      () => supabase.storage.from(asset.bucket).remove(pathsToDelete),
      { opName: "media.delete.storage.remove" },
    );

    if (storageError) {
      debugApiLog('[PROOF:MEDIA:DELETE:STORAGE_ERR]', JSON.stringify({ assetId, error: storageError.message, ts: Date.now() }));
    }

    if (thumbs.length > 0) {
      const thumbIds = thumbs.map(t => t.id);
      await db.delete(mediaAssets).where(
        sql`${mediaAssets.id} = ANY(${thumbIds})`
      );
    }
    await db.delete(mediaAssets).where(eq(mediaAssets.id, assetId));

    debugApiLog('[PROOF:MEDIA:DELETE]', JSON.stringify({ actorUserId: userId, assetId, thumbsDeleted: thumbs.length, ok: true, ts: Date.now() }));

    res.json({ ok: true, assetId, thumbsDeleted: thumbs.length });
  } catch (error: any) {
    debugApiLog('[PROOF:MEDIA:DELETE:ERR]', JSON.stringify({ error: error?.message, ts: Date.now() }));
    res.status(500).json({ error: "Failed to delete media" });
  }
});

router.post("/cleanup-parent", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required", code: "AUTH_REQUIRED" });
  }

  try {
    const { parentType, parentId } = req.body;
    const userId = req.user!.id;

    if (!parentType || !parentId) {
      return res.status(400).json({ error: "parentType and parentId required" });
    }

    if (!requireMediaSupabase(res)) return;

    const assets = await db.select().from(mediaAssets).where(
      and(
        eq(mediaAssets.parent_type, parentType),
        eq(mediaAssets.parent_id, parentId),
        eq(mediaAssets.owner_id, userId)
      )
    );

    if (assets.length === 0) {
      return res.json({ ok: true, deleted: 0 });
    }

    const allAssetIds = assets.map(a => a.id);
    const thumbs = await db.select().from(mediaAssets).where(
      sql`${mediaAssets.parent_asset_id} = ANY(${allAssetIds})`
    );

    const allPaths = [...assets.map(a => a.path), ...thumbs.map(t => t.path)];
    const buckets = Array.from(new Set(assets.map(a => a.bucket)));

    for (const bucket of buckets) {
      const bucketPaths = allPaths.filter(p => assets.find(a => a.path === p && a.bucket === bucket) || thumbs.find(t => t.path === p && t.bucket === bucket));
      if (bucketPaths.length > 0) {
        await supabase.storage.from(bucket).remove(bucketPaths);
      }
    }

    if (thumbs.length > 0) {
      await db.delete(mediaAssets).where(
        sql`${mediaAssets.parent_asset_id} = ANY(${allAssetIds})`
      );
    }
    await db.delete(mediaAssets).where(
      and(
        eq(mediaAssets.parent_type, parentType),
        eq(mediaAssets.parent_id, parentId),
        eq(mediaAssets.owner_id, userId)
      )
    );

    debugApiLog('[PROOF:MEDIA:CLEANUP]', JSON.stringify({ parentType, parentId, deleted: assets.length + thumbs.length, ts: Date.now() }));

    res.json({ ok: true, deleted: assets.length + thumbs.length });
  } catch (error: any) {
    debugApiLog('[PROOF:MEDIA:CLEANUP:ERR]', JSON.stringify({ error: error?.message, ts: Date.now() }));
    res.status(500).json({ error: "Failed to cleanup media" });
  }
});

router.post("/sweep-orphans", async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Dev endpoint disabled in production' });
  }
  try {
    if (!supabase) {
      return res.status(503).json({ error: "Media storage is not configured", code: "SUPABASE_UNCONFIGURED" });
    }
    const orphanPosts = await db.select().from(mediaAssets).where(
      and(
        eq(mediaAssets.parent_type, 'post'),
        eq(mediaAssets.variant, 'original'),
        sql`${mediaAssets.parent_id} IS NOT NULL`
      )
    );

    const orphanListings = await db.select().from(mediaAssets).where(
      and(
        eq(mediaAssets.parent_type, 'listing'),
        eq(mediaAssets.variant, 'original'),
        sql`${mediaAssets.parent_id} IS NOT NULL`
      )
    );

    let deletedCount = 0;

    const deleteOrphan = async (asset: typeof orphanPosts[0]) => {
      const thumbs = await db.select().from(mediaAssets).where(eq(mediaAssets.parent_asset_id, asset.id));
      const allPaths = [asset.path, ...thumbs.map(t => t.path)];
      await supabase.storage.from(asset.bucket).remove(allPaths);
      if (thumbs.length > 0) {
        const thumbIds = thumbs.map(t => t.id);
        await db.delete(mediaAssets).where(sql`${mediaAssets.id} = ANY(${thumbIds})`);
      }
      await db.delete(mediaAssets).where(eq(mediaAssets.id, asset.id));
      return 1 + thumbs.length;
    }

    for (const asset of orphanPosts) {
      if (asset.parent_id) {
        const [parentPost] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, asset.parent_id));
        if (!parentPost) {
          deletedCount += await deleteOrphan(asset);
        }
      }
    }

    for (const asset of orphanListings) {
      if (asset.parent_id) {
        const [parentListing] = await db.select({ id: dogListings.id }).from(dogListings).where(eq(dogListings.id, asset.parent_id));
        if (!parentListing) {
          deletedCount += await deleteOrphan(asset);
        }
      }
    }

    debugApiLog('[PROOF:MEDIA:SWEEP]', JSON.stringify({ deletedCount, ts: Date.now() }));

    res.json({ ok: true, deletedCount, ts: Date.now() });
  } catch (error: any) {
    debugApiLog('[PROOF:MEDIA:SWEEP:ERR]', JSON.stringify({ error: error?.message, ts: Date.now() }));
    res.status(500).json({ error: "Failed to sweep orphan media" });
  }
});

router.get("/by-parent/:parentType/:parentId", async (req, res) => {
  try {
    const { parentType, parentId } = req.params;

    const assets = await db.select().from(mediaAssets).where(
      and(
        eq(mediaAssets.parent_type, parentType),
        eq(mediaAssets.parent_id, parentId),
        eq(mediaAssets.variant, 'original')
      )
    );

    const thumbs = await db.select().from(mediaAssets).where(
      and(
        eq(mediaAssets.parent_type, parentType),
        eq(mediaAssets.parent_id, parentId),
        eq(mediaAssets.variant, 'thumb')
      )
    );

    const result = assets.map(a => ({
      id: a.id,
      publicUrl: a.public_url,
      thumbUrl: thumbs.find(t => t.parent_asset_id === a.id)?.public_url || a.public_url,
      mime: a.mime_type,
      sizeBytes: a.size_bytes,
      width: a.width,
      height: a.height,
      variant: a.variant,
    }));

    res.json({ ok: true, assets: result });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch media" });
  }
});

export default router;
