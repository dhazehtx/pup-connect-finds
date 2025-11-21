import { Router } from "express";
import { db } from "../db";
import { 
  profiles, 
  reports, 
  dogListings, 
  products, 
  orders, 
  platformSettings,
  posts
} from "../../shared/schema";
import { eq, and, desc, count, sql, ilike, or, gte } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Admin middleware
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(requireAdmin);

// ===== DASHBOARD METRICS =====

// Get top-level dashboard metrics
router.get("/metrics", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Active users who logged in within last 30 days
    const [{ count: activeUsersCount }] = await db
      .select({ count: count() })
      .from(profiles)
      .where(gte(profiles.last_login_at, thirtyDaysAgo));

    // Total users
    const [{ count: totalUsersCount }] = await db
      .select({ count: count() })
      .from(profiles);

    // Pending reports
    const [{ count: pendingReportsCount }] = await db
      .select({ count: count() })
      .from(reports)
      .where(eq(reports.status, "pending"));

    // Total reports
    const [{ count: totalReportsCount }] = await db
      .select({ count: count() })
      .from(reports);

    // Active listings
    const [{ count: activeListingsCount }] = await db
      .select({ count: count() })
      .from(dogListings)
      .where(eq(dogListings.status, "active"));

    // Total listings
    const [{ count: totalListingsCount }] = await db
      .select({ count: count() })
      .from(dogListings);

    // Total products
    const [{ count: totalProductsCount }] = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.is_active, true));

    // Total orders
    const [{ count: totalOrdersCount }] = await db
      .select({ count: count() })
      .from(orders);

    // Orders this month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const [{ count: monthlyOrdersCount }] = await db
      .select({ count: count() })
      .from(orders)
      .where(gte(orders.created_at, firstDayOfMonth));

    res.json({
      ok: true,
      data: {
        activeUsers: Number(activeUsersCount),
        totalUsers: Number(totalUsersCount),
        pendingReports: Number(pendingReportsCount),
        totalReports: Number(totalReportsCount),
        activeListings: Number(activeListingsCount),
        totalListings: Number(totalListingsCount),
        totalProducts: Number(totalProductsCount),
        totalOrders: Number(totalOrdersCount),
        monthlyOrders: Number(monthlyOrdersCount),
      },
    });
  } catch (error) {
    console.error("[ADMIN] Error fetching dashboard metrics:", error);
    res.status(500).json({ ok: false, error: "Failed to fetch metrics" });
  }
});

// ===== USER MANAGEMENT =====

// Get paginated users with search
router.get("/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || "";
    const offset = (page - 1) * limit;

    // Build search condition
    const searchCondition = search
      ? or(
          ilike(profiles.username, `%${search}%`),
          ilike(profiles.full_name, `%${search}%`),
          ilike(profiles.email, `%${search}%`)
        )
      : undefined;

    // Get users with pagination
    let usersQuery = db
      .select({
        id: profiles.id,
        username: profiles.username,
        full_name: profiles.full_name,
        email: profiles.email,
        avatar_url: profiles.avatar_url,
        verified: profiles.verified,
        is_admin: profiles.is_admin,
        created_at: profiles.created_at,
        last_login_ip: profiles.last_login_ip,
      })
      .from(profiles);

    if (searchCondition) {
      usersQuery = usersQuery.where(searchCondition);
    }

    const users = await usersQuery
      .orderBy(desc(profiles.created_at))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    let countQuery = db.select({ count: count() }).from(profiles);
    
    if (searchCondition) {
      countQuery = countQuery.where(searchCondition);
    }
    
    const [{ count: totalCount }] = await countQuery;

    res.json({
      ok: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total: Number(totalCount),
          pages: Math.ceil(Number(totalCount) / limit),
        },
      },
    });
  } catch (error) {
    console.error("[ADMIN] Error fetching users:", error);
    res.status(500).json({ ok: false, error: "Failed to fetch users" });
  }
});

// ===== STORE MANAGEMENT =====

// Get all orders with user details
router.get("/orders", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const offset = (page - 1) * limit;

    // Build status filter
    const statusCondition = status ? eq(orders.status, status) : undefined;

    // Get orders with user details
    let ordersQuery = db
      .select({
        id: orders.id,
        user_id: orders.user_id,
        amount_total: orders.amount_total,
        status: orders.status,
        is_subscription: orders.is_subscription,
        shipping_address: orders.shipping_address,
        tracking_number: orders.tracking_number,
        carrier: orders.carrier,
        is_shipped: orders.is_shipped,
        shipped_at: orders.shipped_at,
        created_at: orders.created_at,
        // User details
        username: profiles.username,
        full_name: profiles.full_name,
        email: profiles.email,
      })
      .from(orders)
      .leftJoin(profiles, eq(orders.user_id, profiles.id));

    if (statusCondition) {
      ordersQuery = ordersQuery.where(statusCondition);
    }

    const ordersList = await ordersQuery
      .orderBy(desc(orders.created_at))
      .limit(limit)
      .offset(offset);

    // Get total count
    let countQuery = db.select({ count: count() }).from(orders);
    
    if (statusCondition) {
      countQuery = countQuery.where(statusCondition);
    }
    
    const [{ count: totalCount }] = await countQuery;

    res.json({
      ok: true,
      data: {
        orders: ordersList,
        pagination: {
          page,
          limit,
          total: Number(totalCount),
          pages: Math.ceil(Number(totalCount) / limit),
        },
      },
    });
  } catch (error) {
    console.error("[ADMIN] Error fetching orders:", error);
    res.status(500).json({ ok: false, error: "Failed to fetch orders" });
  }
});

// ===== ANALYTICS =====

// Get time-series analytics data
router.get("/analytics/timeseries", async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily new users
    const newUsersData = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM profiles
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Daily new listings
    const newListingsData = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM dog_listings
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Daily new posts
    const newPostsData = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM posts
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json({
      ok: true,
      data: {
        newUsers: newUsersData.rows,
        newListings: newListingsData.rows,
        newPosts: newPostsData.rows,
      },
    });
  } catch (error) {
    console.error("[ADMIN] Error fetching analytics:", error);
    res.status(500).json({ ok: false, error: "Failed to fetch analytics" });
  }
});

// ===== PLATFORM SETTINGS =====

// Get all platform settings
router.get("/settings", async (req, res) => {
  try {
    const settings = await db
      .select()
      .from(platformSettings)
      .orderBy(platformSettings.key);

    res.json({
      ok: true,
      data: settings,
    });
  } catch (error) {
    console.error("[ADMIN] Error fetching settings:", error);
    res.status(500).json({ ok: false, error: "Failed to fetch settings" });
  }
});

// Get single setting by key
router.get("/settings/:key", async (req, res) => {
  try {
    const { key } = req.params;

    const [setting] = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, key));

    if (!setting) {
      return res.status(404).json({ ok: false, error: "Setting not found" });
    }

    res.json({
      ok: true,
      data: setting,
    });
  } catch (error) {
    console.error("[ADMIN] Error fetching setting:", error);
    res.status(500).json({ ok: false, error: "Failed to fetch setting" });
  }
});

// Create or update platform setting
router.put("/settings/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    if (!value) {
      return res.status(400).json({ ok: false, error: "Value is required" });
    }

    const adminId = req.user?.id || null;

    // Upsert the setting
    const [setting] = await db
      .insert(platformSettings)
      .values({
        key,
        value,
        description: description || null,
        updated_by: adminId,
        updated_at: new Date(),
      })
      .onConflictDoUpdate({
        target: platformSettings.key,
        set: {
          value,
          description: description || null,
          updated_by: adminId,
          updated_at: new Date(),
        },
      })
      .returning();

    res.json({
      ok: true,
      data: setting,
    });
  } catch (error) {
    console.error("[ADMIN] Error updating setting:", error);
    res.status(500).json({ ok: false, error: "Failed to update setting" });
  }
});

// Delete platform setting
router.delete("/settings/:key", async (req, res) => {
  try {
    const { key } = req.params;

    const [deleted] = await db
      .delete(platformSettings)
      .where(eq(platformSettings.key, key))
      .returning();

    if (!deleted) {
      return res.status(404).json({ ok: false, error: "Setting not found" });
    }

    res.json({
      ok: true,
      message: "Setting deleted successfully",
    });
  } catch (error) {
    console.error("[ADMIN] Error deleting setting:", error);
    res.status(500).json({ ok: false, error: "Failed to delete setting" });
  }
});

export default router;
