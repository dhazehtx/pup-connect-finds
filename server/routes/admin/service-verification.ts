import { Router } from "express";
import { z } from "zod";
import { db } from "../../db";
import { userServices, profiles } from "../../../shared/schema";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/requireAdmin";
import { getServiceVerificationInfo } from "../../../shared/serviceVerification";
import { applyAdminServiceVerification } from "../../lib/userServiceVerification";

const router = Router();

router.use(authMiddleware);
router.use(requireAdmin);

/** Pending per-service verifications (admin queue) */
router.get("/pending", async (_req, res) => {
  try {
    const rows = await db
      .select({
        id: userServices.id,
        user_id: userServices.user_id,
        service_type: userServices.service_type,
        verified: userServices.verified,
        review_status: userServices.review_status,
        reviewed_at: userServices.reviewed_at,
        updated_at: userServices.updated_at,
        username: profiles.username,
        full_name: profiles.full_name,
        avatar_url: profiles.avatar_url,
      })
      .from(userServices)
      .innerJoin(profiles, eq(userServices.user_id, profiles.id))
      .where(eq(userServices.review_status, "pending"))
      .orderBy(desc(userServices.updated_at));

    const data = rows.map((r) => ({
      ...r,
      badge_label: getServiceVerificationInfo(r.service_type).badgeLabel,
    }));

    res.json({ success: true, data });
  } catch (e) {
    console.error("[admin/service-verification/pending]", e);
    res.status(500).json({ success: false, error: "Failed to load queue" });
  }
});

const reviewSchema = z.object({
  user_id: z.string().uuid(),
  service_type: z.string().min(1),
  action: z.enum(["approve", "reject"]),
});

router.post("/review", async (req, res) => {
  try {
    const body = reviewSchema.parse(req.body);
    const adminId = req.user?.id ?? null;

    await applyAdminServiceVerification({
      userId: body.user_id,
      serviceType: body.service_type,
      approved: body.action === "approve",
      adminUserId: adminId,
    });

    res.json({
      success: true,
      message: "VERIFICATION SYSTEM COMPLETE",
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Validation failed", details: e.errors });
    }
    console.error("[admin/service-verification/review]", e);
    res.status(500).json({ success: false, error: "Failed to update verification" });
  }
});

const assignBadgeSchema = z.object({
  user_id: z.string().uuid(),
  service_type: z.string().min(1),
});

/**
 * Explicit badge assignment action from admin queue.
 * For MVP this is equivalent to approve+verify for the service row.
 */
router.post("/assign-badge", async (req, res) => {
  try {
    const body = assignBadgeSchema.parse(req.body);
    const adminId = req.user?.id ?? null;

    await applyAdminServiceVerification({
      userId: body.user_id,
      serviceType: body.service_type,
      approved: true,
      adminUserId: adminId,
    });

    res.json({
      success: true,
      message: "Badge assigned",
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Validation failed", details: e.errors });
    }
    console.error("[admin/service-verification/assign-badge]", e);
    res.status(500).json({ success: false, error: "Failed to assign badge" });
  }
});

export default router;
