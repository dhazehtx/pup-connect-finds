import { Router } from "express";
import { db } from "../db";
import { mediaAssets, profiles, posts, dogListings } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
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

    const [asset] = await db
      .insert(mediaAssets)
      .values({
        owner_id: userId,
        bucket,
        path,
        mime_type: mimeType || null,
        size_bytes: sizeBytes || null,
        width: width || null,
        height: height || null,
        duration_seconds: durationSeconds || null,
      })
      .returning();

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = urlData?.publicUrl || null;

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

    console.log('[PROOF:MEDIA:COMMIT]', JSON.stringify({ actorUserId: userId, assetId: asset.id, kind, parentId: parentId || null, ts: Date.now() }));

    res.json({
      ok: true,
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

    const { error: storageError } = await supabase.storage.from(asset.bucket).remove([asset.path]);

    if (storageError) {
      console.error('[PROOF:MEDIA:DELETE:STORAGE_ERR]', JSON.stringify({ assetId, error: storageError.message, ts: Date.now() }));
    }

    await db.delete(mediaAssets).where(eq(mediaAssets.id, assetId));

    console.log('[PROOF:MEDIA:DELETE]', JSON.stringify({ actorUserId: userId, assetId, ok: true, ts: Date.now() }));

    res.json({ ok: true, assetId });
  } catch (error: any) {
    console.error('[PROOF:MEDIA:DELETE:ERR]', JSON.stringify({ error: error?.message, ts: Date.now() }));
    res.status(500).json({ error: "Failed to delete media" });
  }
});

export default router;
