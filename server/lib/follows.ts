import { db } from '../db';
import { follows } from '@shared/schema';
import { and, eq } from 'drizzle-orm';

/** True if `followerId` follows `followedId`. */
export async function userFollows(followerId: string, followedId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: follows.id })
    .from(follows)
    .where(and(eq(follows.follower_id, followerId), eq(follows.followed_id, followedId)))
    .limit(1);
  return !!row;
}
