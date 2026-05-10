// @ts-nocheck
import { db } from '../db';
import { dogListings, listingEmbeddings } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { getImageEmbeddingFromUrl } from './imageEmbedding';

export function primaryListingImageUrl(listing: {
  image_url?: string | null;
  images?: string[] | null;
}): string | null {
  const u = listing.image_url?.trim();
  if (u) return u;
  const imgs = listing.images;
  if (Array.isArray(imgs)) {
    const first = imgs.find((x) => typeof x === 'string' && x.trim().length > 0);
    if (first) return first.trim();
  }
  return null;
}

async function refreshListingEmbeddingNow(listingId: string): Promise<void> {
  const token = process.env.HF_TOKEN ?? process.env.HUGGINGFACE_API_KEY;
  if (!token?.trim()) return;

  const [row] = await db.select().from(dogListings).where(eq(dogListings.id, listingId)).limit(1);
  if (!row || row.deleted_at) {
    try {
      await db.delete(listingEmbeddings).where(eq(listingEmbeddings.listing_id, listingId));
    } catch {
      /* missing table */
    }
    return;
  }

  const url = primaryListingImageUrl(row);
  if (!url) {
    try {
      await db.delete(listingEmbeddings).where(eq(listingEmbeddings.listing_id, listingId));
    } catch {
      /* missing table */
    }
    return;
  }

  let vec: number[] | null = null;
  try {
    vec = await getImageEmbeddingFromUrl(url);
  } catch {
    vec = null;
  }
  if (!vec?.length) return;

  try {
    await db
      .insert(listingEmbeddings)
      .values({ listing_id: listingId, embedding_vector: vec })
      .onConflictDoUpdate({
        target: listingEmbeddings.listing_id,
        set: { embedding_vector: vec, updated_at: new Date() },
      });
  } catch {
    /* missing table or conflict */
  }
}

/** Non-blocking: embed primary listing photo for AI Match (HF_TOKEN required). */
export function scheduleListingEmbeddingRefresh(listingId: string): void {
  setImmediate(() => {
    void refreshListingEmbeddingNow(listingId).catch(() => {});
  });
}
