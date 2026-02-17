import { Router } from "express";
import { db } from "../db";
import { mediaAssets, profiles, posts, dogListings } from "@shared/schema";
import { eq, and, isNull, notInArray, sql } from "drizzle-orm";
import { supabase } from "../lib/supabase";

const router = Router();

const ALLOWED_BUCKETS = ['avatars', 'posts', 'listings', 'provider-id-docs'];
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif',
  'video/mp4', 'video/quicktime', 'video/webm'
];

router.post("/sign", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required", code: "AUTH_REQUIRED" });
  }

  try {
    const { bucket, fileName, mimeType, kind } = req.body;
    const userId = req.user!.id;

    if (!bucket || !fileName || !mimeType || !kind) {
      return res.status(400).json({ error: "bucket, fileName, mimeType, and kind are required" });
    }

    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return res.status(400).json({ error: "Invalid bucket", code: "INVALID_BUCKET" });
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return res.status(400).json({ error: "Unsupported file type", code: "INVALID_MIME" });
    }

    const ext = fileName.split('.').pop() || 'jpg';
    const uniqueName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `${kind}/${uniqueName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error) {
      console.error('[PROOF:MEDIA:SIGN:ERR]', JSON.stringify({ userId, bucket, error: error.message, ts: Date.now() }));
      return res.status(500).json({ error: "Failed to create upload URL" });
    }

    console.log('[PROOF:MEDIA:SIGN]', JSON.stringify({ actorUserId: userId, bucket, path, kind, ts: Date.now() }));

    res.json({
      ok: true,
      uploadUrl: data.signedUrl,
      token: data.token,
      path,
      bucket
    });
  } catch (error: any) {
    console.error('[PROOF:MEDIA:SIGN:ERR]', JSON.stringify({ error: error?.message, ts: Date.now() }));
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/commit", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required", code: "AUTH_REQUIRED" });
  }

  try {
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

      console.log('[PROOF:MEDIA:THUMB]', JSON.stringify({ originalId: asset.id, thumbId: thumbAsset.id, ts: Date.now() }));
    }

    if (kind === 'avatar' && publicUrl) {
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

    console.log('[PROOF:MEDIA:COMMIT]', JSON.stringify({
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
  } catch (error: any) {
    console.error('[PROOF:MEDIA:COMMIT:ERR]', JSON.stringify({ error: error?.message, ts: Date.now() }));
    res.status(500).json({ error: "Failed to commit media" });
  }
});

router.delete("/:assetId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required", code: "AUTH_REQUIRED" });
  }

  try {
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

    const { error: storageError } = await supabase.storage.from(asset.bucket).remove(pathsToDelete);

    if (storageError) {
      console.error('[PROOF:MEDIA:DELETE:STORAGE_ERR]', JSON.stringify({ assetId, error: storageError.message, ts: Date.now() }));
    }

    if (thumbs.length > 0) {
      const thumbIds = thumbs.map(t => t.id);
      await db.delete(mediaAssets).where(
        sql`${mediaAssets.id} = ANY(${thumbIds})`
      );
    }
    await db.delete(mediaAssets).where(eq(mediaAssets.id, assetId));

    console.log('[PROOF:MEDIA:DELETE]', JSON.stringify({ actorUserId: userId, assetId, thumbsDeleted: thumbs.length, ok: true, ts: Date.now() }));

    res.json({ ok: true, assetId, thumbsDeleted: thumbs.length });
  } catch (error: any) {
    console.error('[PROOF:MEDIA:DELETE:ERR]', JSON.stringify({ error: error?.message, ts: Date.now() }));
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

    console.log('[PROOF:MEDIA:CLEANUP]', JSON.stringify({ parentType, parentId, deleted: assets.length + thumbs.length, ts: Date.now() }));

    res.json({ ok: true, deleted: assets.length + thumbs.length });
  } catch (error: any) {
    console.error('[PROOF:MEDIA:CLEANUP:ERR]', JSON.stringify({ error: error?.message, ts: Date.now() }));
    res.status(500).json({ error: "Failed to cleanup media" });
  }
});

router.post("/sweep-orphans", async (req, res) => {
  try {
    const orphanAvatars = await db.select().from(mediaAssets).where(
      and(
        eq(mediaAssets.parent_type, 'avatar'),
        eq(mediaAssets.variant, 'original')
      )
    );

    const orphanPosts = await db.select().from(mediaAssets).where(
      and(
        eq(mediaAssets.parent_type, 'post'),
        sql`${mediaAssets.parent_id} IS NOT NULL`
      )
    );

    const orphanListings = await db.select().from(mediaAssets).where(
      and(
        eq(mediaAssets.parent_type, 'listing'),
        sql`${mediaAssets.parent_id} IS NOT NULL`
      )
    );

    let deletedCount = 0;

    for (const asset of orphanPosts) {
      if (asset.parent_id) {
        const [parentPost] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, asset.parent_id));
        if (!parentPost) {
          await supabase.storage.from(asset.bucket).remove([asset.path]);
          await db.delete(mediaAssets).where(eq(mediaAssets.id, asset.id));
          deletedCount++;
        }
      }
    }

    for (const asset of orphanListings) {
      if (asset.parent_id) {
        const [parentListing] = await db.select({ id: dogListings.id }).from(dogListings).where(eq(dogListings.id, asset.parent_id));
        if (!parentListing) {
          await supabase.storage.from(asset.bucket).remove([asset.path]);
          await db.delete(mediaAssets).where(eq(mediaAssets.id, asset.id));
          deletedCount++;
        }
      }
    }

    console.log('[PROOF:MEDIA:SWEEP]', JSON.stringify({ deleted: deletedCount, ts: Date.now() }));

    res.json({ ok: true, deleted: deletedCount, ts: Date.now() });
  } catch (error: any) {
    console.error('[PROOF:MEDIA:SWEEP:ERR]', JSON.stringify({ error: error?.message, ts: Date.now() }));
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
