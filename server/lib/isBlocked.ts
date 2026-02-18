import { db } from "../db";
import { blocks } from "@shared/schema";
import { eq, and, or } from "drizzle-orm";

export async function isBlocked(actorId: string, targetId: string): Promise<boolean> {
  if (!actorId || !targetId || actorId === targetId) return false;

  const [block] = await db
    .select({ id: blocks.id })
    .from(blocks)
    .where(
      or(
        and(eq(blocks.blocker_id, actorId), eq(blocks.blocked_id, targetId)),
        and(eq(blocks.blocker_id, targetId), eq(blocks.blocked_id, actorId))
      )
    );

  return !!block;
}

export async function getBlockedUserIds(userId: string): Promise<string[]> {
  if (!userId) return [];

  const rows = await db
    .select({ blocker_id: blocks.blocker_id, blocked_id: blocks.blocked_id })
    .from(blocks)
    .where(or(eq(blocks.blocker_id, userId), eq(blocks.blocked_id, userId)));

  const ids = new Set<string>();
  for (const r of rows) {
    if (r.blocker_id !== userId) ids.add(r.blocker_id);
    if (r.blocked_id !== userId) ids.add(r.blocked_id);
  }
  return Array.from(ids);
}

export function blockedResponse(res: any) {
  return res.status(403).json({ ok: false, code: "BLOCKED", error: "interaction blocked" });
}
