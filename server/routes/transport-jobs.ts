import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { orders, transportJobLogs, transportJobs } from "@shared/schema";
import { authMiddleware, requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

const TRANSPORT_STATUSES = [
  "pending",
  "assigned",
  "picked_up",
  "in_transit",
  "delivered",
  "flagged",
  "cancelled",
] as const;

type TransportStatus = (typeof TRANSPORT_STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<TransportStatus, TransportStatus[]> = {
  pending: ["assigned", "cancelled", "flagged"],
  assigned: ["picked_up", "cancelled", "flagged"],
  picked_up: ["in_transit", "flagged"],
  in_transit: ["delivered", "flagged"],
  delivered: [],
  flagged: ["assigned", "in_transit", "cancelled", "delivered"],
  cancelled: [],
};

function isTransportStatus(status: string): status is TransportStatus {
  return (TRANSPORT_STATUSES as readonly string[]).includes(status);
}

function stageTimestampPatch(status: TransportStatus): Partial<typeof transportJobs.$inferInsert> {
  const now = new Date();
  if (status === "assigned") return { assigned_at: now };
  if (status === "picked_up") return { picked_up_at: now };
  if (status === "in_transit") return { in_transit_at: now };
  if (status === "delivered") return { delivered_at: now };
  if (status === "flagged") return { flagged_at: now };
  if (status === "cancelled") return { cancelled_at: now };
  return {};
}

// Create transport job from an existing order (isolated extension layer)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { order_id, buyer_id, breeder_id, pickup_location, delivery_location, note } = req.body || {};

    if (!order_id || !buyer_id || !breeder_id || !pickup_location || !delivery_location) {
      return res.status(400).json({
        success: false,
        error:
          "order_id, buyer_id, breeder_id, pickup_location, and delivery_location are required",
      });
    }

    const [order] = await db.select().from(orders).where(eq(orders.id, order_id)).limit(1);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    if (order.status !== "completed") {
      return res.status(400).json({
        success: false,
        error: "Transport jobs can only be created for completed orders",
      });
    }

    const [job] = await db
      .insert(transportJobs)
      .values({
        order_id,
        buyer_id,
        breeder_id,
        pickup_location,
        delivery_location,
        status: "pending",
        notes: note ? [{ ts: Date.now(), type: "create", message: String(note) }] : [],
      })
      .returning();

    await db.insert(transportJobLogs).values({
      transport_job_id: job.id,
      from_status: null,
      to_status: "pending",
      action: "status_change",
      note: "Transport job created",
      triggered_by: req.user?.id || null,
    });

    return res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error("[TRANSPORT] create job error:", error);
    return res.status(500).json({ success: false, error: "Failed to create transport job" });
  }
});

// Admin list of all transport jobs
router.get("/", requireAdmin, async (_req, res) => {
  try {
    const jobs = await db.select().from(transportJobs).orderBy(desc(transportJobs.updated_at));
    return res.json({ success: true, data: jobs });
  } catch (error) {
    console.error("[TRANSPORT] list jobs error:", error);
    return res.status(500).json({ success: false, error: "Failed to list transport jobs" });
  }
});

// Job detail + activity logs (admin dashboard detail view)
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [job] = await db.select().from(transportJobs).where(eq(transportJobs.id, id)).limit(1);
    if (!job) {
      return res.status(404).json({ success: false, error: "Transport job not found" });
    }

    const logs = await db
      .select()
      .from(transportJobLogs)
      .where(eq(transportJobLogs.transport_job_id, id))
      .orderBy(desc(transportJobLogs.created_at));

    return res.json({ success: true, data: { job, logs } });
  } catch (error) {
    console.error("[TRANSPORT] get job detail error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch transport job" });
  }
});

// Update status with per-update activity logging
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, transporter_id, confirmDelivered, adminOverride } = req.body || {};

    if (!status || !isTransportStatus(status)) {
      return res.status(400).json({ success: false, error: "Invalid transport status" });
    }

    const [job] = await db.select().from(transportJobs).where(eq(transportJobs.id, id)).limit(1);
    if (!job) {
      return res.status(404).json({ success: false, error: "Transport job not found" });
    }

    const isAdmin = !!req.user?.is_admin;
    const actorId = req.user?.id || null;

    if (status === "delivered" && confirmDelivered !== true) {
      return res.status(400).json({
        success: false,
        error: "Delivery confirmation required before marking delivered",
      });
    }

    if (!isAdmin) {
      const isRelatedUser =
        actorId === job.buyer_id || actorId === job.breeder_id || actorId === job.transporter_id;
      if (!isRelatedUser) {
        return res.status(403).json({ success: false, error: "Not allowed for this transport job" });
      }
      if ((status === "picked_up" || status === "in_transit" || status === "delivered") && actorId !== job.transporter_id) {
        return res.status(403).json({
          success: false,
          error: "Only assigned transporter can perform transit status updates",
        });
      }
      const fromStatus = (job.status || "pending") as TransportStatus;
      if (!ALLOWED_TRANSITIONS[fromStatus].includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Transition ${fromStatus} -> ${status} is not allowed`,
        });
      }
    }

    const patch: Partial<typeof transportJobs.$inferInsert> = {
      status,
      ...stageTimestampPatch(status),
      updated_at: new Date(),
    };

    if (transporter_id !== undefined) {
      patch.transporter_id = transporter_id || null;
      if (transporter_id) {
        patch.assigned_at = patch.assigned_at || new Date();
        patch.status = "assigned";
      }
    }

    if (note) {
      const existingNotes = Array.isArray(job.notes) ? job.notes : [];
      patch.notes = [
        ...existingNotes,
        { ts: Date.now(), by: actorId, message: String(note), status },
      ];
    }

    const [updated] = await db
      .update(transportJobs)
      .set(patch as any)
      .where(eq(transportJobs.id, id))
      .returning();

    await db.insert(transportJobLogs).values({
      transport_job_id: id,
      from_status: job.status,
      to_status: updated.status || status,
      action: isAdmin && adminOverride ? "admin_override" : "status_change",
      note: note ? String(note) : null,
      triggered_by: actorId,
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("[TRANSPORT] update status error:", error);
    return res.status(500).json({ success: false, error: "Failed to update transport status" });
  }
});

// Explicit admin override endpoint (can force any status, still logs action)
router.patch("/:id/override-status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, confirmDelivered } = req.body || {};
    if (!status || !isTransportStatus(status)) {
      return res.status(400).json({ success: false, error: "Invalid transport status" });
    }
    if (status === "delivered" && confirmDelivered !== true) {
      return res.status(400).json({
        success: false,
        error: "Delivery confirmation required before marking delivered",
      });
    }
    const [job] = await db.select().from(transportJobs).where(eq(transportJobs.id, id)).limit(1);
    if (!job) {
      return res.status(404).json({ success: false, error: "Transport job not found" });
    }

    const patch: Partial<typeof transportJobs.$inferInsert> = {
      status,
      ...stageTimestampPatch(status),
      updated_at: new Date(),
    };

    if (note) {
      const existingNotes = Array.isArray(job.notes) ? job.notes : [];
      patch.notes = [
        ...existingNotes,
        { ts: Date.now(), by: req.user?.id || null, message: String(note), status, admin: true },
      ];
    }

    const [updated] = await db
      .update(transportJobs)
      .set(patch as any)
      .where(eq(transportJobs.id, id))
      .returning();

    await db.insert(transportJobLogs).values({
      transport_job_id: id,
      from_status: job.status,
      to_status: status,
      action: "admin_override",
      note: note ? String(note) : "Admin override",
      triggered_by: req.user?.id || null,
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("[TRANSPORT] override status error:", error);
    return res.status(500).json({ success: false, error: "Failed to override transport status" });
  }
});

export default router;
