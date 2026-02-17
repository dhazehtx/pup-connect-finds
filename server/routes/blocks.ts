import { Router } from "express";
import { db } from "../db";
import { blocks, profiles } from "@shared/schema";
import { eq, and, or, sql } from "drizzle-orm";

const router = Router();

router.post("/:blockedId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required", code: "AUTH_REQUIRED" });
  }

  try {
    const { blockedId } = req.params;
    const blockerId = req.user!.id;

    if (blockerId === blockedId) {
      return res.status(400).json({ error: "Cannot block yourself" });
    }

    const [targetUser] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, blockedId));
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const [existing] = await db
      .select()
      .from(blocks)
      .where(and(eq(blocks.blocker_id, blockerId), eq(blocks.blocked_id, blockedId)));

    if (existing) {
      await db.delete(blocks).where(eq(blocks.id, existing.id));
      console.log('[PROOF:BLOCK]', JSON.stringify({ actorUserId: blockerId, blockedId, action: 'unblock', ts: Date.now() }));
      return res.json({ ok: true, action: 'unblocked', blocked: false });
    }

    await db.insert(blocks).values({ blocker_id: blockerId, blocked_id: blockedId });
    console.log('[PROOF:BLOCK]', JSON.stringify({ actorUserId: blockerId, blockedId, action: 'block', ts: Date.now() }));
    res.json({ ok: true, action: 'blocked', blocked: true });
  } catch (error: any) {
    console.error('[PROOF:BLOCK:ERR]', JSON.stringify({ error: error?.message, ts: Date.now() }));
    res.status(500).json({ error: "Failed to toggle block" });
  }
});

router.get("/status/:userId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required", code: "AUTH_REQUIRED" });
  }

  try {
    const { userId } = req.params;
    const currentUserId = req.user!.id;

    const [block] = await db
      .select()
      .from(blocks)
      .where(
        or(
          and(eq(blocks.blocker_id, currentUserId), eq(blocks.blocked_id, userId)),
          and(eq(blocks.blocker_id, userId), eq(blocks.blocked_id, currentUserId))
        )
      );

    res.json({
      blocked: !!block,
      blockedByMe: block?.blocker_id === currentUserId,
      blockedByThem: block?.blocker_id === userId
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to check block status" });
  }
});

router.get("/list", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required", code: "AUTH_REQUIRED" });
  }

  try {
    const userId = req.user!.id;

    const blockedUsers = await db
      .select({
        id: blocks.id,
        blocked_id: blocks.blocked_id,
        created_at: blocks.created_at,
        username: profiles.username,
        full_name: profiles.full_name,
        avatar_url: profiles.avatar_url,
      })
      .from(blocks)
      .leftJoin(profiles, eq(blocks.blocked_id, profiles.id))
      .where(eq(blocks.blocker_id, userId));

    res.json(blockedUsers);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to list blocked users" });
  }
});

export default router;
