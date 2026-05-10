// @ts-nocheck
import { debugApiLog, debugApiWarn } from '../lib/debugApi';
import { Router } from "express";
import { db } from "../db";
import { qaBugReports, profiles } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { insertQaBugReportSchema } from "@shared/schema";

const router = Router();

// POST /api/qa/bug-report - Submit a bug report
router.post("/bug-report", async (req, res) => {
  try {
    const { user_id, route, description, severity } = req.body;

    // Validate input
    const validData = insertQaBugReportSchema.parse({
      user_id,
      route,
      description,
      severity,
    });

    const [bugReport] = await db
      .insert(qaBugReports)
      .values(validData)
      .returning();

    res.json({
      success: true,
      data: bugReport,
    });
  } catch (error) {
    console.error("Error submitting bug report:", error);
    res.status(500).json({ error: "Failed to submit bug report" });
  }
});

// GET /api/qa/bug-reports - Get all bug reports (admin only)
router.get("/bug-reports", async (req, res) => {
  try {
    const { status, severity } = req.query;

    let query = db
      .select({
        id: qaBugReports.id,
        route: qaBugReports.route,
        description: qaBugReports.description,
        severity: qaBugReports.severity,
        status: qaBugReports.status,
        created_at: qaBugReports.created_at,
        updated_at: qaBugReports.updated_at,
        user: {
          id: profiles.id,
          username: profiles.username,
          full_name: profiles.full_name,
          avatar_url: profiles.avatar_url,
        },
      })
      .from(qaBugReports)
      .leftJoin(profiles, eq(qaBugReports.user_id, profiles.id));

    // Apply filters
    const conditions = [];

    if (status) {
      conditions.push(eq(qaBugReports.status, status as string));
    }

    if (severity) {
      conditions.push(eq(qaBugReports.severity, severity as string));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const reports = await query.orderBy(desc(qaBugReports.created_at));

    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Error fetching bug reports:", error);
    res.status(500).json({ error: "Failed to fetch bug reports" });
  }
});

// PATCH /api/qa/bug-report/:id - Update bug report status
router.patch("/bug-report/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [updatedReport] = await db
      .update(qaBugReports)
      .set({ 
        status, 
        updated_at: new Date()
      })
      .where(eq(qaBugReports.id, id))
      .returning();

    res.json({
      success: true,
      data: updatedReport,
    });
  } catch (error) {
    console.error("Error updating bug report:", error);
    res.status(500).json({ error: "Failed to update bug report" });
  }
});

router.post("/seed-test-data", async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    debugApiLog('[PROOF:SEED]', JSON.stringify({ ran: false, env: process.env.NODE_ENV, reason: 'blocked_in_production' }));
    return res.status(403).json({ error: "Seeding is disabled in production" });
  }
  try {
    debugApiLog('[PROOF:SEED]', JSON.stringify({ ran: true, env: process.env.NODE_ENV || 'development' }));
    res.json({
      success: true,
      message: "Test data seeding functionality will be added",
    });
  } catch (error) {
    console.error("Error seeding test data:", error);
    res.status(500).json({ error: "Failed to seed test data" });
  }
});

export default router;