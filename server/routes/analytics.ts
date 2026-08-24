import { Router } from "express";
import { storage } from "../storage";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Admin middleware to check admin status
const adminMiddleware = (req: any, res: any, next: any) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Get admin analytics
router.get('/', async (req, res) => {
  try {
    const analytics = await storage.getAdminAnalytics();
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * Admin-authorized subscription analytics. Replaces the previous browser→Supabase
 * anon read of `subscription_analytics`; the table's public/anon access is removed
 * by migration 20260824000000, and this endpoint reads it server-side with the
 * service role (this router is already gated by authMiddleware + adminMiddleware).
 */
router.get('/subscriptions', async (req, res) => {
  try {
    const { supabaseAdmin } = await import('../lib/supabaseAdmin');
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Analytics service not configured' });
    }
    const days = Math.min(365, Math.max(1, parseInt(String(req.query.days ?? '30'), 10) || 30));
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const { data, error } = await supabaseAdmin
      .from('subscription_analytics')
      .select('*')
      .gte('date', start.toISOString().split('T')[0])
      .lte('date', end.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching subscription analytics:', error);
      return res.status(500).json({ error: 'Failed to fetch subscription analytics' });
    }
    res.json({ success: true, data: data ?? [] });
  } catch (error) {
    console.error('Error fetching subscription analytics:', error);
    res.status(500).json({ error: 'Failed to fetch subscription analytics' });
  }
});

export default router;