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

export default router;