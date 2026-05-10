/**
 * When a new lost or found alert is posted with a photo, compare CLIP embeddings
 * to the opposite alert type and notify owners if similarity is high enough.
 * Requires HF_TOKEN; no-ops silently if unavailable or on any error.
 */

// @ts-nocheck
import { db } from '../db';
import { lostPetAlerts, dogEmbeddings } from '@shared/schema';
import { eq, and, ne, desc } from 'drizzle-orm';
import { getImageEmbeddingFromUrl, cosineSimilarity } from './imageEmbedding';
import { getEmbeddingMatchNotifyMinScore } from './aiMatchConfig';
import { createNotification } from './createNotification';

const MAX_OTHER_ALERTS_TO_CHECK = 25;

function getToken(): boolean {
  return !!(process.env.HF_TOKEN ?? process.env.HUGGINGFACE_API_KEY)?.trim();
}

async function getOrCreateEmbedding(alertId: string, imageUrl: string | null): Promise<number[] | null> {
  if (!imageUrl?.trim()) return null;
  try {
    const [existing] = await db
      .select({ embedding_vector: dogEmbeddings.embedding_vector })
      .from(dogEmbeddings)
      .where(eq(dogEmbeddings.dog_id, alertId))
      .limit(1);
    if (existing?.embedding_vector && Array.isArray(existing.embedding_vector)) {
      const v = existing.embedding_vector as number[];
      if (v.length > 0) return v;
    }
  } catch {
    // table missing
  }
  const vec = await getImageEmbeddingFromUrl(imageUrl);
  if (!vec?.length) return null;
  try {
    await db.insert(dogEmbeddings).values({ dog_id: alertId, embedding_vector: vec });
  } catch {
    // duplicate or missing table
  }
  return vec;
}

/**
 * Fire-and-forget: compare new alert photo to opposite-type alerts; notify on strong match.
 */
export function notifyEmbeddingMatchesForNewAlert(alert: any): void {
  if (!getToken()) return;
  if (!alert?.id || !alert?.image_url?.trim() || alert.status !== 'active') return;

  void (async () => {
    try {
      const similarityThreshold = getEmbeddingMatchNotifyMinScore();
      const newVec = await getOrCreateEmbedding(alert.id, alert.image_url);
      if (!newVec?.length) return;

      const oppositeType = alert.alert_type === 'found' ? 'lost' : 'found';
      let others: any[] = [];
      try {
        others = await db
          .select()
          .from(lostPetAlerts)
          .where(
            and(
              eq(lostPetAlerts.status, 'active'),
              eq(lostPetAlerts.alert_type, oppositeType),
              ne(lostPetAlerts.user_id, alert.user_id)
            )
          )
          .orderBy(desc(lostPetAlerts.created_at))
          .limit(MAX_OTHER_ALERTS_TO_CHECK);
      } catch {
        return;
      }

      const notified = new Set<string>();

      for (const other of others) {
        if (!other.image_url?.trim()) continue;
        const otherVec = await getOrCreateEmbedding(other.id, other.image_url);
        if (!otherVec?.length) continue;

        let score = 0;
        try {
          score = cosineSimilarity(newVec, otherVec);
        } catch {
          continue;
        }
        if (score < similarityThreshold) continue;

        const notifyUserId = other.user_id;
        const pairKey = [alert.id, other.id].sort().join(':');
        if (notified.has(pairKey)) continue;
        notified.add(pairKey);

        const title = 'Possible photo match on Lost & Found';
        const message =
          alert.alert_type === 'found'
            ? `A found dog listing may match your lost dog alert. Open to compare photos.`
            : `A lost dog listing may match your found dog post. Open to compare photos.`;

        await createNotification({
          toUserId: notifyUserId,
          fromUserId: alert.user_id,
          type: 'lost_found_photo_match',
          title,
          message,
          relatedId: alert.id,
          targetUrl: `/lost-and-found?alert=${alert.id}`,
        });
      }
    } catch (e) {
      console.error('[embeddingMatchNotify]', (e as Error)?.message);
    }
  })();
}
