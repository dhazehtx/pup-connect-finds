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

export function blockedResponse(res: any) {
  return res.status(403).json({ ok: false, code: "BLOCKED", error: "interaction blocked" });
}
